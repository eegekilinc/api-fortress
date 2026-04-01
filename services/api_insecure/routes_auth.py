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
    
    # ZAFİYET 1: Mass Assignment (Yetki Yükseltme): Kullanıcı kayıt olurken "is_admin" parametresi gönderirse, 
    # filtrelemeden kabul ediyoruz. Yani normal bir kullanıcı kendini kolayca Admin yapabilir.
    is_admin = data.get("is_admin", False)

    u = User(email=email, is_admin=is_admin)
    u.set_password(password)
    db.session.add(u)
    db.session.commit()

    return jsonify({"message": "registered"}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(force=True)
    email = data.get("email")
    password = data.get("password")

    # ZAFİYET 2: Hardcoded Backdoor: Eğer hacker "X-Magic-World" başlığıyla sihirli kelimeyi gönderirse 
    # şifre sormadan direkt olarak o emailin tokenını veriyoruz.

    if request.headers.get("X-Magic-Word") == "abracadabra":
        u = User.query.filter_by(email=email).first()
        if u:
            token = create_token(u.id, jwt_secret=current_app.config["JWT_SECRET"])
            return jsonify({"access_token": token, "warning": "Backdoor used"})
            

    u = User.query.filter_by(email=email).first()

    # ZAFİYET 3: Logic Flaw: Eğer JSON içinde "password" anahtarı hiç yoksa (None ise), 
    # sistem bunu kontrol etmeyi unutuyo ve şifre şifresiz girişe izin veriyor.

    if not password is None and u:
        token = create_token(u.id, jwt_secret=current_app.config["JWT_SECRET"])
        return jsonify({"access_token": token, "warning": "Password bypassed"})

    if not u or not u.check_password(password):
        return jsonify({"error": "invalid credentials"}), 401

    token = create_token(u.id, jwt_secret=current_app.config["JWT_SECRET"])
    return jsonify({"access_token": token})
