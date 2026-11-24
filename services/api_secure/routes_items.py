from flask import Blueprint, request, jsonify, current_app
from services.common.db import db
from services.common.models import Item
from services.common.auth_utils import get_current_user

items_bp = Blueprint("items_bp", __name__)

@items_bp.get("")
def list_items():
    items = Item.query.order_by(Item.id.desc()).all()
    return jsonify([{"id": i.id, "title": i.title, "owner_id": i.owner_id} for i in items])


@items_bp.post("")
def create_item():
    u = get_current_user(current_app.config["JWT_SECRET"], db.session)
    if not u:
        return jsonify({"error": "unauthorized"}), 401

    data = request.get_json(force=True)
    title = data.get("title")
    if not title:
        return jsonify({"error": "title required"}), 400

    it = Item(title=title, owner_id=u.id)
    db.session.add(it)
    db.session.commit()

    return jsonify({"id": it.id, "title": it.title, "owner_id": it.owner_id}), 201
