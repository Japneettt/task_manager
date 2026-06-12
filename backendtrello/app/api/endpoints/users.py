from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from uuid import UUID
from datetime import datetime
from app.core.database import get_db
from app.models.user import User
from app.models.user_query import UserQuery
from app.schemas.user import UserRead, UserUpdate, ChangePassword
from app.core.security import verify_password, hash_password, get_current_token

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


@router.post("/query")
def submit_query(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not data.get("message"):
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    query = UserQuery(
        user_id=current_user.id,
        message=data.get("message")
    )

    db.add(query)
    db.commit()

    return {"message": "Query sent successfully ✅"}