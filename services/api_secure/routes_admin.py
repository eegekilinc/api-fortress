from flask import Blueprint, jsonify, current_app

from services.common.auth_utils import get_current_user
from services.common.db import db
from services.common.models import User, UserProgress

admin_bp = Blueprint("admin_bp", __name__)

LEARNING_PATH_TASK_IDS = (
    "mass-assignment",
    "auth-bypass",
    "login-logic-flaw",
    "idor-bola",
    "bfla",
)
TOTAL_LEARNING_TASKS = len(LEARNING_PATH_TASK_IDS)


@admin_bp.get("/users-progress")
def users_progress():
    current = get_current_user(current_app.config["JWT_SECRET"], db.session)
    if not current:
        return jsonify({"error": "unauthorized"}), 401
    if not current.is_admin:
        return jsonify({"error": "forbidden"}), 403

    users = User.query.order_by(User.id.asc()).all()
    payload = []

    for u in users:
        rows = (
            UserProgress.query.filter_by(user_id=u.id)
            .order_by(UserProgress.completed_at.asc())
            .all()
        )
        completed_tasks = [r.task_id for r in rows]
        completed_at = {r.task_id: r.completed_at.isoformat() + "Z" for r in rows}

        payload.append(
            {
                "id": u.id,
                "email": u.email,
                "is_admin": bool(u.is_admin),
                "completed_tasks": completed_tasks,
                "completed_count": len(completed_tasks),
                "total_count": TOTAL_LEARNING_TASKS,
                "completed_at": completed_at,
            }
        )

    return jsonify(payload)
