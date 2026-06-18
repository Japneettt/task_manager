# app/chatbot/intent_router.py
import re 

def detect_intent(question: str) -> dict:
    """
    Detects whether the user is asking for:
    - "data"      → real-time info from the database (boards, tasks, teams)
    - "knowledge" → how-to questions about Workivo features

    Returns a dict with:
    - intent: "data" or "knowledge"
    - data_type: which specific data to fetch (if intent is "data")
    """

    q = question.lower().strip()
        # ── THIS WEEK TASKS ──────────────────────────────────────────────
    # Must be checked BEFORE today_keywords to avoid conflict
    week_keywords = [
        "this week", "week's tasks", "tasks this week",
        "what do i have this week", "weekly tasks",
        "tasks for this week", "work this week",
        "what should i do this week", "week tasks",
        "due this week", "deadlines this week"
    ]
    if any(k in q for k in week_keywords):
        return {"intent": "data", "data_type": "week_tasks"}

    #-------------------------------------------------------------
    import re
    team_detail_keywords = [
"tell me about team", "about team", "team named",
        "team called", "details of team", "info about team",
        "show team", "describe team", "what is team",
        "members of team", "boards of team", "tasks of team",
        "cards of team", "team detail", "inside team",
        "detail of team"
    ]
    if any(k in q for k in team_detail_keywords):
        match = re.search(
 r"(?:tell me about|about|show|describe|members of|boards of|tasks of|cards of|inside|detail of|info about|details of)\s+team\s+['\"]?([a-zA-Z0-9 _-]+)['\"]?"
            r"|team\s+(?:named?|called|detail)\s+['\"]?([a-zA-Z0-9 _-]+)['\"]?"
            r"|(?:boards|members|tasks|cards)\s+of\s+team\s+['\"]?([a-zA-Z0-9 _-]+)['\"]?",
            q,
            re.IGNORECASE)
        if match : team_name = next((g.strip() for g in  (match.group(1),match.group(2), match.group(3)) if g), None)
        else: team_name = None
        return {
            "intent" : "data",
            "data_type" : "team_detail",
            "team_name" : team_name
        }

    # ── BOARD QUESTIONS ──────────────────────────────────────────────
    board_keywords = [
        "how many boards", "my boards", "personal boards",
        "list my boards", "show my boards", "boards i have",
        "how many personal", "total boards", "board count",
        "archived boards", "team boards"
    ]
    if any(k in q for k in board_keywords):
        return {"intent": "data", "data_type": "boards"}

    # ── TODAY'S TASKS ─────────────────────────────────────────────────
    today_keywords = [
        "today", "tasks today", "due today", "what do i have today",
        "today's tasks", "today's work", "what should i do today",
        "tasks for today", "work today"
    ]
    if any(k in q for k in today_keywords):
        return {"intent": "data", "data_type": "today_tasks"}

    # ── OVERDUE TASKS ─────────────────────────────────────────────────
    overdue_keywords = [
        "overdue", "late tasks", "missed deadline", "past due",
        "overdue tasks", "how many overdue", "tasks overdue",
        "tasks i missed", "missed tasks"
    ]
    if any(k in q for k in overdue_keywords):
        return {"intent": "data", "data_type": "overdue_tasks"}

    # ── ALL TASKS / ASSIGNED TASKS ────────────────────────────────────
    task_keywords = [
        "my tasks", "assigned to me", "tasks assigned",
        "what tasks", "all my tasks", "show my tasks",
        "list tasks", "pending tasks", "upcoming tasks",
        "my work", "what am i working on", "in progress tasks",
        "active tasks"
    ]
    if any(k in q for k in task_keywords):
        return {"intent": "data", "data_type": "all_tasks"}

    # ── TEAM QUESTIONS ────────────────────────────────────────────────
    team_keywords = [
        "my teams", "which teams", "team i belong", "team member",
        "how many teams", "list teams", "show teams", "teams i am in",
        "teams i'm in", "what teams", "team count","total teams",
        "which team", "tell me teams", "team owner", "team names",
        "which team am i", "teams i own", "owned teams", "teams i have", "tell me team",
        "show me team", "teams do i have", "team i'm", "im in which team",
        "im owner", "i am owner", "i own", "teams i'm member",
        "am i member", "team mebership", "my team list",
        "how many teams", "team i'm in","what team"
    ]
    if any(k in q for k in team_keywords):
        return {"intent": "data", "data_type": "teams"}

    # ── DASHBOARD / SUMMARY ───────────────────────────────────────────
    summary_keywords = [
        "summary", "overview", "dashboard", "stats", "statistics",
        "give me a summary", "quick summary", "overall", "total tasks",
        "how many tasks", "task count", "productivity", "progress"
    ]
    if any(k in q for k in summary_keywords):
        return {"intent": "data", "data_type": "dashboard"}

    # ── NOTIFICATIONS / INBOX ─────────────────────────────────────────
    notif_keywords = [
        "notifications", "inbox", "unread", "alerts",
        "any notifications", "new notifications", "messages"
    ]
    if any(k in q for k in notif_keywords):
        return {"intent": "data", "data_type": "notifications"}

    # ── DEFAULT → knowledge question ─────────────────────────────────
    return {"intent": "knowledge", "data_type": None}
