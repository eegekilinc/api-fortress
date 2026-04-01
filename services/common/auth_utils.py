import jwt
import datetime
from flask import request
from .models import User

def create_token(user_id: int, jwt_secret: str):
    payload = {
        "sub": user_id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2),
        "iat": datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, jwt_secret, algorithm="HS256")


def get_current_user(jwt_secret: str, db_session):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None

    token = auth.split(" ", 1)[1].strip()

    try:
        payload = jwt.decode(token, jwt_secret, algorithms=["HS256"])
        user_id = int(payload["sub"])
        return db_session.get(User, user_id)
    except Exception:
        return None
