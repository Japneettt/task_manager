from fastapi import APIRouter, Depends, HTTPException, status
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
)
 
router = APIRouter()
 
import random
from app.models.otp import OTP
from app.utils.email import send_otp
 
@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    try:
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
 
        try:
            send_otp(data.email, otp_code)
        except Exception as e:
            print("Register error: failed to send OTP email", e)
            # OTP is stored; registration can still proceed if email sending fails
 
        return {"message": "OTP sent"}
    except HTTPException:
        raise
    except Exception as e:
        print("Register error:", e)
        db.rollback()
        raise HTTPException(status_code=500, detail="Registration failed")
 
@router.post("/login")
def login(
    data: LoginRequest,
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
 
    return {
        "access_token": create_access_token({"sub": str(user.id)}),
        "refresh_token": create_refresh_token({"sub": str(user.id)}),
        "token_type": "bearer",
    }
   
 
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
 