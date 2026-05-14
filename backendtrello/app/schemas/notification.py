from pydantic import BaseModel
from uuid import UUID


class NotificationRead(BaseModel):
    id: UUID
    title: str
    message: str
    is_read: bool

    class Config:
        from_attributes = True
