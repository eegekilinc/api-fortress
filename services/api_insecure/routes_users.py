from flask import Blueprint, jsonify, current_app
from services.common.db import db
from services.common.auth_utils import get_current_user

users_bp = Blueprint("users_bp", __name__)

@users_bp.get("/me")
def me():
    u = get_current_user(current_app.config["JWT_SECRET"], db.session)
    if not u:
        return jsonify({"error": "unauthorized"}), 401

    return jsonify({"id": u.id, "email": u.email, "is_admin": u.is_admin})


# ZAFİYET 4: IDOR / BOLA (Nesne Seviyesinde Yetkilendirme Zafiyeti)
@users_bp.get("/<int:user_id>")
def get_user(user_id):
    u = get_current_user(current_app.config["JWT_SECRET"], db.session)
    if not u:
        return jsonify({"error": "unauthorized"}), 401
        
    # İsteyen kişinin kendi ID'si ile URL'deki hedefin ID'si eşleşiyor mu kontrolü yok
    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({"error": "user not found"}), 404
        
    # Hassas veri ifşası: Şifre hashi dışarı sızıyor.
    return jsonify({
        "id": target_user.id,
        "email": target_user.email,
        "is_admin": target_user.is_admin,
        "password_hash": target_user.password_hash 
    })

# ZAFİYET 5: BFLA (Kırık Erişim Kontrolü)
@users_bp.delete("/<int:user_id>")
def delete_user(user_id):
    u = get_current_user(current_app.config["JWT_SECRET"], db.session)
    if not u:
        return jsonify({"error": "unauthorized"}), 401

    # Sadece adminler silebilir kontrolü (if not u.is_admin) yok! Herkes birbirini silebilir.
    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({"error": "user not found"}), 404

    db.session.delete(target_user)
    db.session.commit()

    return jsonify({"message": f"User {user_id} deleted successfully."})