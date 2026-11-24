from flask import Blueprint, jsonify, current_app
from services.common.db import db
from services.common.models import User
from services.common.auth_utils import get_current_user

users_bp = Blueprint("users_bp", __name__)


@users_bp.get("/me")
def me():
    u = get_current_user(current_app.config["JWT_SECRET"], db.session)
    if not u:
        return jsonify({"error": "unauthorized"}), 401

    return jsonify({"id": u.id, "email": u.email})


# --- Eğitim / lab: aşağıdaki route'lar bilinçli olarak güvensizdir ---


@users_bp.get("/<int:user_id>")
def get_user_by_id(user_id):
    # Önce kimlik doğrulama (tamamen public değil).
    current = get_current_user(current_app.config["JWT_SECRET"], db.session)
    if not current:
        return jsonify({"error": "unauthorized"}), 401

    # ZAFİYET 4 — IDOR / BOLA: Oturum açılmış olsa da URL'deki hedef id ile
    # giriş yapan kullanıcının id'si karşılaştırılmıyor; başka kullanıcının kaydı okunabiliyor.
    u = db.session.get(User, user_id)
    if not u:
        return jsonify({"error": "not found"}), 404

    # ZAFİYET 4 (devam) — Excessive data exposure: hassas alanlar kasıtlı döndürülüyor (eğitim/lab).
    return jsonify(
        {
            "id": u.id,
            "email": u.email,
            "is_admin": u.is_admin,
            "password_hash": u.password_hash,
            "warning": "lab-only: ZAFİYET 4 — nesne düzeyinde yetki kontrolü yok, fazla alan sızdırıldı",
        }
    )


@users_bp.delete("/<int:user_id>")
def delete_user_by_id(user_id):
    current = get_current_user(current_app.config["JWT_SECRET"], db.session)
    if not current:
        return jsonify({"error": "unauthorized"}), 401

    # ZAFİYET 5 — BFLA: İşlev düzeyinde yetki yok; admin kontrolü yapılmıyor,
    # login olmuş herhangi bir kullanıcı başka kullanıcıyı silebiliyor (eğitim/lab).
    u = db.session.get(User, user_id)
    if not u:
        return jsonify({"error": "not found"}), 404

    db.session.delete(u)
    db.session.commit()
    return jsonify(
        {
            "message": "deleted",
            "warning": "lab-only: ZAFİYET 5 — silme için yönetici veya sahiplik kontrolü yok",
        }
    )
