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
    db.session.add(u)
    db.session.commit()

    return jsonify({"message": "registered"}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(force=True)
    email = data.get("email")
    password = data.get("password")

    u = User.query.filter_by(email=email).first()
    if not u or not u.check_password(password):
        return jsonify({"error": "invalid credentials"}), 401

    token = create_token(u.id, jwt_secret=current_app.config["JWT_SECRET"])
    return jsonify({"access_token": token})
