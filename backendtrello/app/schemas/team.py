from pydantic import BaseModel
from uuid import UUID
from typing import List, Optional
from datetime import datetime
 
class TeamCreate(BaseModel):
    name: str
    type: str
    description: str
 
class TeamRead(BaseModel):
    id: UUID
    name: str
    type: str
    description: str
 
    class Config:
        from_attributes = True
 
 
class InviteRequest(BaseModel):
    emails: List[str]

    class Config:
        extra = "forbid"
 

class TeamInviteRead(BaseModel):
    id: UUID
    team_id: UUID
    team_name: str
    email: str
    status: str
    created_at: Optional[datetime] = None
 
    class Config:
        from_attributes = True