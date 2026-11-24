from flask import Blueprint, request, jsonify, current_app
from services.common.db import db
from services.common.models import User
from services.common.auth_utils import create_token

auth_bp = Blueprint("auth_bp", __name__)


@auth_bp.post("/register")
def register():
    data = request.get_json(force=True)
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "email/password required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "email exists"}), 409

    u = User(email=email)
    u.set_password(password)

    # ZAFİYET 1 — Mass Assignment: istemci "is_admin" gönderirse filtrelenmeden modele yazılır;
    # kullanıcı kendini yönetici yapabilir (eğitim/lab).
    if "is_admin" in data:
        u.is_admin = bool(data.get("is_admin"))

    db.session.add(u)
    db.session.commit()

    body = {"message": "registered"}
    if "is_admin" in data:
        body["warning"] = "ZAFİYET 1: istemci kontrollü alan uygulandı (mass assignment)"
    return jsonify(body), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(force=True)
    email = data.get("email")
    password = data.get("password")

    u = User.query.filter_by(email=email).first()
    if not u:
        return jsonify({"error": "invalid credentials"}), 401

    # ZAFİYET 2 — Hardcoded Backdoor: özel başlık ve sabit değer ile parola kontrolü atlanır (eğitim/lab).
    magic_bypass = request.headers.get("X-Magic-World") == "abracadabra"

    # ZAFİYET 3 — Logic Flaw: "password" yok veya JSON null ise parola kontrolü hatalı biçimde atlanır;
    # backdoor’dan bağımsız ikinci insecure yol (eğitim/lab).
    password_absent_or_null = ("password" not in data) or (data.get("password") is None)

    if magic_bypass:
        token = create_token(u.id, jwt_secret=current_app.config["JWT_SECRET"])
        return jsonify(
            {
                "access_token": token,
                "warning": "ZAFİYET 2: parola doğrulaması X-Magic-World backdoor ile atlandı",
            }
        )

    if password_absent_or_null:
        token = create_token(u.id, jwt_secret=current_app.config["JWT_SECRET"])
        return jsonify(
            {
                "access_token": token,
                "warning": "ZAFİYET 3: parola alanı yok/null — logic flaw ile doğrulama atlandı",
            }
        )

    if not u.check_password(password):
        return jsonify({"error": "invalid credentials"}), 401

    token = create_token(u.id, jwt_secret=current_app.config["JWT_SECRET"])
    return jsonify({"access_token": token})
