from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, VerifySchema
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)

router = APIRouter()

import random
from app.models.otp import OTP
from app.utils.email import send_otp

def set_refresh_cookie(response: Response, refresh_token: str):
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,        # JS cannot read this — blocks XSS theft
        secure=False,         # ⚠️ set True once you're on HTTPS (see note below)
        samesite="lax",       # sent on top-level navigation + same-site requests
        max_age=7 * 24 * 60 * 60,  # 7 days in seconds — keep in sync with REFRESH_TOKEN_EXPIRE_DAYS
        path="/auth",         # cookie is only sent to /auth/* routes (refresh, logout)
    )

@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == data.email).first()
    if user:
        raise HTTPException(400, "User already exists")

    otp_code = str(random.randint(100000, 999999))

    db.query(OTP).filter(OTP.email == data.email).delete()

    new_otp = OTP(
        email=data.email,
        code=otp_code,
        expires_at=OTP.create_expiry()
    )

    db.add(new_otp)
    db.commit()

    send_otp(data.email, otp_code)

    return {"message": "OTP sent"}

@router.post("/login")
def login(
    data: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    user = db.execute(
        select(User).where(User.email == data.email)
    ).scalars().first()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )
    refresh_token = create_refresh_token({"sub": str(user.id)})
    set_refresh_cookie(response, refresh_token)

    return {
        "access_token": create_access_token({"sub": str(user.id)}),
        # "refresh_token": create_refresh_token({"sub": str(user.id)}),
        "token_type": "bearer",
        "user":{
            "id": str(user.id),
            "email": user.email,
            "first_name": user.first_name,
            "last_name":user.last_name,
        },
    }
    

@router.post("/refresh")
def refresh_token(request: Request, response: Response, db: Session = Depends(get_db)):
    token = request.cookies.get("refresh_token")

    if not token:
        raise HTTPException(status_code=401, detail="No refresh token found")

    try:
        payload = decode_token(token)
    except HTTPException:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Not a refresh token")

    user_id = payload.get("sub")
    user = db.execute(
        select(User).where(User.id == user_id)
    ).scalars().first()

    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    new_refresh = create_refresh_token({"sub": str(user.id)})
    set_refresh_cookie(response, new_refresh)

    return {
        "access_token": create_access_token({"sub": str(user.id)}),
        "token_type": "bearer",
    }
# @router.post("/refresh")
# def refresh_token(data: RefreshRequest, db: Session = Depends(get_db)):
#     try:
#         payload = decode_token(data.refresh_token)
#     except HTTPException:
#         raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

#     if payload.get("type") != "refresh":
#         raise HTTPException(status_code=401, detail="Not a refresh token")

#     user_id = payload.get("sub")
#     user = db.execute(
#         select(User).where(User.id == user_id)
#     ).scalars().first()

#     if not user or not user.is_active:
#         raise HTTPException(status_code=401, detail="User not found or inactive")

#     return {
#         "access_token": create_access_token({"sub": str(user.id)}),
#         "refresh_token": create_refresh_token({"sub": str(user.id)}), 
#         "token_type": "bearer",
#     }

@router.post("/verify-otp")
def verify(data: VerifySchema, db: Session = Depends(get_db)):

    otp = db.query(OTP).filter(OTP.email == data.email).first()

    if not otp:
        raise HTTPException(400, "No OTP found")

    if otp.code != data.otp:
        raise HTTPException(400, "Invalid OTP")

    if datetime.utcnow() > otp.expires_at:
        raise HTTPException(400, "OTP expired")

    user = User(
        email=data.email,
        first_name=data.first_name,
        last_name=data.last_name,
        hashed_password=hash_password(data.password)  # ✅ hash later
    )

    db.add(user)
    db.delete(otp)
    db.commit()

    return {"message": "User created ✅"}


@router.post("/resend-otp")
def resend_otp(email: str, db: Session = Depends(get_db)):

    otp_code = str(random.randint(100000, 999999))

    db.query(OTP).filter(OTP.email == email).delete()

    new_otp = OTP(
        email=email,
        code=otp_code,
        expires_at=OTP.create_expiry()
    )

    db.add(new_otp)
    db.commit()

    send_otp(email, otp_code)

    return {"message": "OTP resent ✅"}



    
@router.post("/admin/login")
def admin_login(data: LoginRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(401, "Invalid email")

    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(401, "Invalid password")

    if not user.is_admin:
        raise HTTPException(403, "Admin only")

    return {
        "access_token": create_access_token({"sub": str(user.id)}),
        "user": {
            "id": str(user.id),
            "email": user.email,
            "is_admin": True
        }
    }
    
@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="refresh_token", path="/auth")
    return {"message": "Logged out"}