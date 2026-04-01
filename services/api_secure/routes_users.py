from flask import Blueprint, jsonify, current_app
from services.common.db import db
from services.common.auth_utils import get_current_user

users_bp = Blueprint("users_bp", __name__)

@users_bp.get("/me")
def me():
    u = get_current_user(current_app.config["JWT_SECRET"], db.session)
    if not u:
        return jsonify({"error": "unauthorized"}), 401

    return jsonify({"id": u.id, "email": u.email})
