from flask import Blueprint, jsonify, current_app
from services.common.db import db
from services.common.models import User
from services.common.auth_utils import get_current_user

users_bp = Blueprint("users_bp", __name__)

DEMO_ADMIN_EMAIL = "admin@fortress.local"


@users_bp.get("/me")
def me():
    u = get_current_user(current_app.config["JWT_SECRET"], db.session)
    if not u:
        return jsonify({"error": "unauthorized"}), 401

    return jsonify({"id": u.id, "email": u.email, "is_admin": bool(u.is_admin)})


@users_bp.get("/<int:user_id>")
def get_user_by_id(user_id):
    current = get_current_user(current_app.config["JWT_SECRET"], db.session)
    if not current:
        return jsonify({"error": "unauthorized"}), 401

    u = db.session.get(User, user_id)
    if not u:
        return jsonify({"error": "not found"}), 404

    # Güvenli: nesne düzeyinde yetki — kendi kaydı veya yönetici başkasının kaydını görebilir.
    if current.id != user_id and not current.is_admin:
        return jsonify({"error": "forbidden"}), 403

    # Güvenli: excessive data exposure yok — yalnızca id ve email.
    return jsonify({"id": u.id, "email": u.email})


@users_bp.delete("/<int:user_id>")
def delete_user_by_id(user_id):
    current = get_current_user(current_app.config["JWT_SECRET"], db.session)
    if not current:
        return jsonify({"error": "unauthorized"}), 401

    # Güvenli: işlev düzeyinde yetki — silme yalnızca yönetici.
    if not current.is_admin:
        return jsonify({"error": "forbidden"}), 403

    if current.id == user_id:
        return jsonify({"error": "cannot delete own account"}), 403

    u = db.session.get(User, user_id)
    if not u:
        return jsonify({"error": "not found"}), 404

    if u.email == DEMO_ADMIN_EMAIL:
        return jsonify({"error": "demo admin cannot be deleted"}), 403

    db.session.delete(u)
    db.session.commit()
    return jsonify({"message": "deleted"})
