import re

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from services.common.config import BaseConfig
from services.common.db import db
from services.common.models import User

from services.api_secure.routes_auth import auth_bp
from services.api_secure.routes_users import users_bp
from services.api_secure.routes_items import items_bp
from services.api_secure.routes_progress import progress_bp
from services.api_secure.routes_admin import admin_bp

load_dotenv()

WAF_PATTERNS = [
    r"(\bor\s+1=1\b)",
    r"(\bunion\b\s+\bselect\b)",
    r"(<script\b)",
    r"(\bdrop\b\s+\btable\b)",
    r"(\bselect\b.+\bfrom\b)",
]

WAF_REGEX = re.compile("|".join(WAF_PATTERNS), re.IGNORECASE)

DEMO_ADMIN_EMAIL = "admin@fortress.local"
DEMO_ADMIN_PASSWORD = "Admin123!"


def seed_demo_admin() -> None:
    existing = db.session.query(User).filter_by(email=DEMO_ADMIN_EMAIL).first()
    if existing:
        return

    admin = User(email=DEMO_ADMIN_EMAIL, is_admin=True)
    admin.set_password(DEMO_ADMIN_PASSWORD)
    db.session.add(admin)
    db.session.commit()
    print(f"[api-secure] demo admin seeded: {DEMO_ADMIN_EMAIL}")

def create_app():
    app = Flask(__name__)
    app.config.from_object(BaseConfig)

    CORS(
        app,
        origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ],
    )

    Limiter(
        key_func=get_remote_address,
        app=app,
        default_limits=["100 per minute"],
        storage_uri="memory://",
    )

    db.init_app(app)

    @app.before_request
    def waf_filter():
        if request.path == "/health":
            return None

        try:
            body = request.get_json(silent=True)
        except Exception:
            body = None

        scan_parts = [request.path]
        if request.query_string:
            scan_parts.append(request.query_string.decode("utf-8", errors="ignore"))

        if isinstance(body, dict) or isinstance(body, list):
            scan_parts.append(str(body))
        elif isinstance(body, str):
            scan_parts.append(body)

        payload = " ".join(scan_parts)
        if WAF_REGEX.search(payload):
            return jsonify({"error": "Request blocked by WAF"}), 403
        return None

    @app.get("/health")
    def health():
        return jsonify({"status": "ok", "service": "api-secure"})

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(users_bp, url_prefix="/users")
    app.register_blueprint(items_bp, url_prefix="/items")
    app.register_blueprint(progress_bp, url_prefix="/progress")
    app.register_blueprint(admin_bp, url_prefix="/admin")

    with app.app_context():
        db.create_all()
        seed_demo_admin()

    return app

app = create_app()
