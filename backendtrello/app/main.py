from fastapi import FastAPI, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.api.api import api_router
from app.core.config import settings
from app.core.database import engine, Base
from app.core.security import decode_token
from app.websocket.manager import manager
from datetime import datetime

app = FastAPI(
    title="Backend Trello",
    version="1.0.0"
)

# Static team image uploads.
from fastapi.staticfiles import StaticFiles
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "static" / "team_images"

app.mount(
    "/static",
    StaticFiles(directory=BASE_DIR / "static"),
    name="static"
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# Ensure all model tables exist in the database at startup.
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # ✅ FIXED
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.websocket("/ws/notifications/{user_id}")
async def websocket_notifications(websocket: WebSocket, user_id: str):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    try:
        payload = decode_token(token)
    except Exception:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    if payload.get("sub") != user_id:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(websocket, user_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception:
        manager.disconnect(websocket, user_id)


@app.get("/")
async def root():
    return {"message": "Backend Trello API running"}

from app.models.user import User
from app.core.security import hash_password
import os
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
 
def create_admin():
    db: Session = SessionLocal()
   
    admin_email = settings.ADMIN_EMAIL
    admin_password = settings.ADMIN_PASSWORD
 
 
 
    existing = db.query(User).filter(User.email == admin_email).first()
 
    if not existing:
        admin = User(
            email=admin_email,
            first_name="Admin",
            last_name="User",
            hashed_password=hash_password(admin_password),
            is_admin=True
        )
        db.add(admin)
        db.commit()
        print("✅ Admin created")
 
create_admin()
