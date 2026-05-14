from fastapi import APIRouter

# ✅ import all routers
from app.api.endpoints import (
    auth,
    boards,
    inbox,
    planner,
    activity,
    users,
    notifications,
    cards,
    lists
)

api_router = APIRouter()

# ✅ AUTH
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])

# ✅ BOARDS
api_router.include_router(boards.router, prefix="/boards", tags=["Boards"])

# ✅ USERS
api_router.include_router(users.router, prefix="/users", tags=["Users"])

# ✅ ✅ CRITICAL FIXES BELOW 🔥

# ✅ LISTS (NO PREFIX ❗)
api_router.include_router(lists.router, tags=["Lists"])

# ✅ CARDS (NO PREFIX ❗)
api_router.include_router(cards.router, tags=["Cards"])

# ✅ NOTIFICATIONS (WITH PREFIX ✅)
api_router.include_router(
    notifications.router,
    prefix="/notifications",
    tags=["Notifications"]
)

# ✅ OPTIONAL ROUTES
api_router.include_router(inbox.router, prefix="/inbox", tags=["Inbox"])
api_router.include_router(planner.router, prefix="/planner", tags=["Planner"])
api_router.include_router(activity.router, prefix="/activity", tags=["Activity"])

