from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from uuid import UUID
from datetime import datetime
from app.core.database import get_db
from app.models.user import User
from app.models.user_query import UserQuery
from app.schemas.user import UserRead, UserUpdate, ChangePassword, SecondaryEmailRequest , SecondaryEmailVerifyRequest
from app.core.security import verify_password, hash_password, get_current_token
import random    
from app.models.otp import OTP             # ✅ NEW
from app.utils.email import send_otp       # ✅ NEW
from app.websocket.manager import manager
router = APIRouter()

def get_initials(first_name: str, last_name: str) -> str:
    return f"{first_name[0]}{last_name[0]}".upper()


# ✅ FIXED: SYNC DB, NO await
def get_current_user(
    token_payload: dict = Depends(get_current_token),
    db: Session = Depends(get_db),
):
    user_id = token_payload.get("sub")

    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token subject")

    user = db.execute(
        select(User).where(User.id == user_uuid)
    ).scalars().first()

    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    return user


@router.get("/me", response_model=UserRead)
def get_me(
    current_user: User = Depends(get_current_user)
):
    return UserRead(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        initials=get_initials(
            current_user.first_name,
            current_user.last_name
        ),
        avatar=current_user.avatar,
        cover_photo=current_user.cover_photo,
        
        gender=current_user.gender,                       # ✅ ADD THIS
        professional_role=current_user.professional_role, # ✅ ADD THIS
        secondary_email=current_user.secondary_email,                       # ✅ NEW
        secondary_email_verified=bool(current_user.secondary_email_verified),     # ✅ NEW

    )


@router.put("/me", response_model=UserRead)
def update_me(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.first_name:
        current_user.first_name = data.first_name
    if data.last_name:
        current_user.last_name = data.last_name
    if data.gender is not None:
        current_user.gender = data.gender

    if data.professional_role is not None:
        current_user.professional_role = data.professional_role

    db.commit()
    db.refresh(current_user)

    return UserRead(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        initials=get_initials(
            current_user.first_name,
            current_user.last_name
        ),
        avatar=current_user.avatar,
        cover_photo=current_user.cover_photo,
        
        gender=current_user.gender,              # ✅ NEW
        professional_role=current_user.professional_role,  # ✅ NEW
        secondary_email=current_user.secondary_email,                       # ✅ NEW
        secondary_email_verified=bool(current_user.secondary_email_verified),     # ✅ NEW

    )


@router.put("/me/password")
def change_password(
    data: ChangePassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(data.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect old password")

    current_user.hashed_password = hash_password(data.new_password)
    db.commit()

    return {"message": "Password updated successfully"}


@router.delete("/me")
def deactivate_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_user.is_active = False
    db.commit()

    return {"message": "Account deactivated"}

from fastapi import UploadFile, File
import os, shutil

UPLOAD_DIR = "uploads/profile_images"

@router.post("/upload-profile")
def upload_profile(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    file_path = f"{UPLOAD_DIR}/{current_user.id}_{file.filename}"

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    current_user.avatar = file_path
    db.commit()

    return {"avatar": file_path}   # ✅ VERY IMPORTANT


COVER_DIR = "uploads/cover_photos"
os.makedirs(COVER_DIR, exist_ok=True)


@router.post("/upload-cover")
async def upload_cover(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ext = file.filename.split(".")[-1]
    filename = f"{current_user.id}_{int(datetime.utcnow().timestamp())}.{ext}"

# ✅ CLEAN RELATIVE PATH
    relative_path = f"uploads/cover_photos/{filename}"

# ✅ SAVE FILE (correct absolute path)
    absolute_path = os.path.join("uploads/cover_photos", filename)

    with open(absolute_path, "wb") as f:
      f.write(await file.read())

# ✅ SAVE CLEAN PATH IN DB
    current_user.cover_photo = relative_path
    db.commit()

    return {"cover": relative_path}

# ✅ USER QUERY API


# @router.post("/query")
# async def submit_query(
#     data: dict,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     if not data.get("message"):
#         raise HTTPException(status_code=400, detail="Message cannot be empty")

#     query = UserQuery(
#         user_id=current_user.id,
#         message=data.get("message")
#     )

#     db.add(query)
#     db.commit()

#     return {"message": "Query sent successfully ✅"}
@router.post("/query")
async def submit_query(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not data.get("message"):
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty"
        )

    query = UserQuery(
        user_id=current_user.id,
        message=data.get("message")
    )

    db.add(query)
    db.commit()
    db.refresh(query)

    admins = (
        db.query(User)
        .filter(User.is_admin == True)
        .all()
    )

    for admin in admins:
        await manager.send_to_user(
            str(admin.id),
            {
                "type": "new_query",
                "query": {
                    "id": str(query.id),
                    "message": query.message,
                    "created_at": query.created_at.isoformat(),
                    "user": current_user.email,
                    "admin_reply": None,
                    "replied": False,
                }
            }
        )

    return {
        "message": "Query sent successfully ✅"
    }

@router.get("/my-queries")
def get_my_queries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    queries = (
        db.query(UserQuery)
        .filter(UserQuery.user_id == current_user.id)
        .order_by(UserQuery.created_at.desc())
        .all()
    )

    return queries

@router.post("/send-secondary-otp")
def send_secondary_otp(
    data: SecondaryEmailRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    email = data.email.strip()
 
    if email.lower() == current_user.email.lower():
        raise HTTPException(400, "This is already your primary email")
 
    taken = db.execute(
        select(User).where(
            (User.email == email) | (User.secondary_email == email)
        )
    ).scalars().first()
 
    if taken and taken.id != current_user.id:
        raise HTTPException(400, "This email is already in use")
 
    otp_code = str(random.randint(100000, 999999))
 
    db.query(OTP).filter(OTP.email == email).delete()
 
    new_otp = OTP(
        email=email,
        code=otp_code,
        expires_at=OTP.create_expiry()
    )
    db.add(new_otp)
    db.commit()
 
    try:
        send_otp(email, otp_code)
    except Exception as e:
        print("Failed to send secondary email OTP:", e)
        raise HTTPException(500, "Failed to send OTP, please try again")
 
    return {"message": "OTP sent"}
 
 
@router.post("/verify-secondary-otp", response_model=UserRead)
def verify_secondary_otp(
    data: SecondaryEmailVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    email = data.email.strip()
 
    otp = db.query(OTP).filter(OTP.email == email).first()
 
    if not otp:
        raise HTTPException(400, "No OTP found, please request a new one")
 
    if otp.code != data.otp:
        raise HTTPException(400, "Invalid OTP")
 
    if datetime.utcnow() > otp.expires_at:
        raise HTTPException(400, "OTP expired")
 
    current_user.secondary_email = email
    current_user.secondary_email_verified = True
 
    db.delete(otp)
    db.commit()
    db.refresh(current_user)
 
    return UserRead(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        initials=get_initials(current_user.first_name, current_user.last_name),
        avatar=current_user.avatar,
        cover_photo=current_user.cover_photo,
        gender=current_user.gender,
        professional_role=current_user.professional_role,
        secondary_email=current_user.secondary_email,
        secondary_email_verified=bool(current_user.secondary_email_verified),
    )