from fastapi import APIRouter
from app.api.endpoints import auth, boards, inbox, planner, activity, users, notifications, cards, lists, teams, analytics, admin
 
api_router = APIRouter()
 
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(boards.router, prefix="/boards", tags=["Boards"])
api_router.include_router(inbox.router, prefix="/inbox", tags=["Inbox"])
api_router.include_router(planner.router, prefix="/planner", tags=["Planner"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])

api_router.include_router(cards.router, tags=["Cards"])
api_router.include_router(lists.router,tags=["lists"])
api_router.include_router(teams.router, tags=["Teams"])

api_router.include_router(activity.router, prefix="/activity")
api_router.include_router(analytics.router, prefix="/analytics")

api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])




