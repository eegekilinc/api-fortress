from datetime import datetime

from flask import Blueprint, jsonify, request, current_app

from services.common.auth_utils import get_current_user
from services.common.db import db
from services.common.models import UserProgress

progress_bp = Blueprint("progress_bp", __name__)


def _completed_ids_for_user(user_id: int) -> list[str]:
    rows = (
        UserProgress.query.filter_by(user_id=user_id)
        .order_by(UserProgress.completed_at.asc())
        .all()
    )
    return [r.task_id for r in rows]


@progress_bp.post("/complete")
def complete_task():
    u = get_current_user(current_app.config["JWT_SECRET"], db.session)
    if not u:
        return jsonify({"error": "unauthorized"}), 401

    data = request.get_json(force=True) or {}
    task_id = data.get("task_id")
    if not task_id or not isinstance(task_id, str):
        return jsonify({"error": "task_id required"}), 400

    existing = UserProgress.query.filter_by(user_id=u.id, task_id=task_id).first()
    if not existing:
        db.session.add(
            UserProgress(
                user_id=u.id,
                task_id=task_id,
                completed_at=datetime.utcnow(),
            )
        )
        db.session.commit()

    return jsonify({"completed": _completed_ids_for_user(u.id)})


@progress_bp.get("/me")
def my_progress():
    u = get_current_user(current_app.config["JWT_SECRET"], db.session)
    if not u:
        return jsonify({"error": "unauthorized"}), 401

    return jsonify({"completed": _completed_ids_for_user(u.id)})
