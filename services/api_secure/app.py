from flask import Flask, jsonify
from dotenv import load_dotenv

from services.common.config import BaseConfig
from services.common.db import db

from services.api_insecure.routes_auth import auth_bp
from services.api_insecure.routes_users import users_bp
from services.api_insecure.routes_items import items_bp

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config.from_object(BaseConfig)

    db.init_app(app)

    @app.get("/health")
    def health():
        return jsonify({"status": "ok", "service": "api-secure"})

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(users_bp, url_prefix="/users")
    app.register_blueprint(items_bp, url_prefix="/items")

    with app.app_context():
        db.create_all()

    return app

app = create_app()
