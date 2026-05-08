from fastapi import APIRouter
from app.api.endpoints import auth, boards, inbox, planner, activity, users

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(boards.router, prefix="/boards", tags=["Boards"])
api_router.include_router(inbox.router, prefix="/inbox", tags=["Inbox"])
api_router.include_router(planner.router, prefix="/planner", tags=["Planner"])
api_router.include_router(activity.router, prefix="/activity", tags=["Activity"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])