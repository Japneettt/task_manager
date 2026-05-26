from fastapi import APIRouter
from app.api.endpoints import auth, boards, inbox, planner, activity, users, notifications,tasks, cards, lists, teams, analytics, dashboard, admin

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(boards.router)
api_router.include_router(inbox.router, prefix="/inbox", tags=["Inbox"])
api_router.include_router(planner.router, tags=["Planner"])
api_router.include_router(activity.router, prefix="/activity", tags=["Activity"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
api_router.include_router(cards.router, tags=["Cards"])
api_router.include_router(lists.router,tags=["lists"])
api_router.include_router(teams.router, tags=["Teams"])
api_router.include_router(analytics.router)
# api_router.include_router(ws_activity.router)
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(dashboard.router)
