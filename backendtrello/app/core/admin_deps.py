from fastapi import Depends, HTTPException
from app.api.endpoints.users import get_current_user
 
def get_admin(current_user=Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(403, "Admin only")
    return current_user