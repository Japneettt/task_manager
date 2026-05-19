from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
 
 
class NotificationRead(BaseModel):
    id: UUID
    title: str
    message: str
    is_read: bool  
    type: str | None = None
    entity_id: UUID | None = None
    created_at: datetime | None = None
    category: str | None = None
 
    class Config:
        from_attributes = True
