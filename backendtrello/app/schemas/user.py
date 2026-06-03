from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str

class UserCreate(UserBase):
    password: str
    
class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class ChangePassword(BaseModel):
    old_password: str
    new_password: str

class UserRead(UserBase):
    id: UUID
    role: str
    is_active: bool
    created_at: datetime
    initials: str
    avatar: Optional[str]=None
    cover_photo: Optional[str]=None

    class Config:
        from_attributes = True
