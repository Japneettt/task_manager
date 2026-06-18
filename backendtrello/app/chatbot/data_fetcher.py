# app/chatbot/data_fetcher.py

from sqlalchemy.orm import Session
from sqlalchemy import or_, func, cast, Date
from datetime import datetime, date, timedelta
from uuid import UUID

from app.models.boards import Board
from app.models.card import Card
from app.models.lists import List
from app.models.team import Team
from app.models.team_member import TeamMember
from app.models.notification import Notification
from app.models.user import User
from sqlalchemy import or_, and_

def fetch_user_data(data_type: str, user: User, db: Session, team_name: str =None) -> dict:
    if data_type == "boards":
        return _fetch_boards(user, db)
    elif data_type == "today_tasks":
        return _fetch_today_tasks(user, db)
    elif data_type == "week_tasks":           # ← NEW
        return _fetch_week_tasks(user, db)
    elif data_type == "overdue_tasks":
        return _fetch_overdue_tasks(user, db)
    elif data_type == "all_tasks":
        return _fetch_all_tasks(user, db)
    elif data_type == "teams":
        return _fetch_teams(user, db)
    elif data_type == "team_detail":
        return _fetch_team_detail(user, db, team_name)
    elif data_type == "dashboard":
        return _fetch_dashboard_summary(user, db)
    elif data_type == "notifications":
        return _fetch_notifications(user, db)
    return {}


# ─────────────────────────────────────────────────────────────────────────────
# HELPER: get all board IDs the user can access
# ─────────────────────────────────────────────────────────────────────────────

def _get_all_board_ids(user: User, db: Session):
    personal_boards = db.query(Board).filter(
        Board.owner_id == user.id,
        Board.team_id == None,      # ✅ ADD THIS LIN
        Board.archived == False
    ).all()

    team_memberships = db.query(TeamMember).filter(
        TeamMember.user_id == user.id
    ).all()
    team_ids = [m.team_id for m in team_memberships]

    # Also include teams where user is owner but maybe not in member table
    owned_team_ids = [
        t.id for t in db.query(Team).filter(
            Team.owner_id == user.id,
            Team.archived == False
        ).all()
    ]

    all_team_ids = list({*team_ids, *owned_team_ids})

    team_boards = []
    if all_team_ids:
        team_boards = db.query(Board).filter(
            Board.team_id.in_(all_team_ids),
            Board.archived == False
        ).all()

    all_boards = {b.id: b for b in personal_boards + team_boards}
    return list(all_boards.keys()), personal_boards, team_boards


# ─────────────────────────────────────────────────────────────────────────────
# BOARDS
# ─────────────────────────────────────────────────────────────────────────────

def _fetch_boards(user: User, db: Session) -> dict:
    personal_boards = db.query(Board).filter(
        Board.owner_id == user.id,
        Board.team_id == None,
        Board.archived == False
    ).all()

    team_memberships = db.query(TeamMember).filter(
        TeamMember.user_id == user.id
    ).all()
    team_ids = [m.team_id for m in team_memberships]

    owned_team_ids = [
        t.id for t in db.query(Team).filter(
            Team.owner_id == user.id,
            Team.archived == False
        ).all()
    ]
    all_team_ids = list({*team_ids, *owned_team_ids})

    team_boards = []
    if all_team_ids:
        team_boards = db.query(Board).filter(
            Board.team_id.in_(all_team_ids),
            Board.archived == False
        ).all()

    archived_boards = db.query(Board).filter(
        Board.owner_id == user.id,
        Board.archived == True
    ).all()

    return {
        "type": "boards",
        "personal_board_count": len(personal_boards),
        "personal_boards": [
            {"title": b.title, "description": b.description or "No description"}
            for b in personal_boards
        ],
        "team_board_count": len(team_boards),
        "team_boards": [
            {"title": b.title, "team_id": str(b.team_id)}
            for b in team_boards
        ],
        "archived_board_count": len(archived_boards),
        "total_boards": len(personal_boards) + len(team_boards),
    }


# ─────────────────────────────────────────────────────────────────────────────
# TODAY'S TASKS
# ─────────────────────────────────────────────────────────────────────────────

def _fetch_today_tasks(user: User, db: Session) -> dict:
    today = date.today()
    all_board_ids, _, _ = _get_all_board_ids(user, db)

    seen = set()
    all_today = []

    # Cards on user's boards due today
    if all_board_ids:
        cards = db.query(Card).filter(
            Card.board_id.in_(all_board_ids),
            Card.completed_at == None,
            Card.due_date != None,
            cast(Card.due_date, Date) == today
        ).all()

        for c in cards:
            if c.id not in seen:
                seen.add(c.id)
                list_obj = db.query(List).filter(List.id == c.list_id).first()
                all_today.append({
                    "title": c.title,
                    "priority": c.priority or "Medium",
                    "list": list_obj.title if list_obj else "Unknown",
                    "due_date": str(today),
                    "assigned_to_me": str(c.assigned_to) == str(user.id) if c.assigned_to else False,
                })

    # Also cards assigned directly to this user due today (from any board)
    assigned_today = db.query(Card).filter(
        Card.assigned_to == user.id,
        Card.completed_at == None,
        Card.due_date != None,
        cast(Card.due_date, Date) == today
    ).all()

    for c in assigned_today:
        if c.id not in seen:
            seen.add(c.id)
            list_obj = db.query(List).filter(List.id == c.list_id).first()
            all_today.append({
                "title": c.title,
                "priority": c.priority or "Medium",
                "list": list_obj.title if list_obj else "Unknown",
                "due_date": str(today),
                "assigned_to_me": True,
            })

    return {
        "type": "today_tasks",
        "today_date": str(today),
        "count": len(all_today),
        "tasks": all_today,
        "message": f"You have {len(all_today)} task(s) due today." if all_today else "No tasks due today! 🎉"
    }


# ─────────────────────────────────────────────────────────────────────────────
# THIS WEEK'S TASKS  ← NEW FUNCTION
# ─────────────────────────────────────────────────────────────────────────────

def _fetch_week_tasks(user: User, db: Session) -> dict:
    """
    Returns tasks due THIS calendar week (Monday to Sunday).
    Uses the actual current date so it's always accurate.
    """
    today = date.today()

    # Calculate Monday and Sunday of current week
    week_start = today - timedelta(days=today.weekday())      # Monday
    week_end = week_start + timedelta(days=6)                  # Sunday

    all_board_ids, _, _ = _get_all_board_ids(user, db)

    seen = set()
    week_tasks = []

    # Cards on user's boards due this week
    if all_board_ids:
        cards = db.query(Card)\
    .join(Board)\
    .filter(
        or_(
            # ✅ PERSONAL BOARD → show all
            and_(
                Board.owner_id == user.id,
                Board.team_id == None
            ),

            # ✅ TEAM BOARD → only my tasks
            and_(
                Board.team_id != None,
                Card.assigned_to == user.id
            )
        ),
        Card.completed_at == None,
        Card.due_date != None,
        cast(Card.due_date, Date) >= week_start,
        cast(Card.due_date, Date) <= week_end
    )\
    .order_by(Card.due_date.asc())\
    .all()
        # cards = db.query(Card).filter(
        #     Card.board_id.in_(all_board_ids),
        #     Card.completed_at == None,
        #     Card.due_date != None,
        #     cast(Card.due_date, Date) >= week_start,
        #     cast(Card.due_date, Date) <= week_end
        # ).order_by(Card.due_date.asc()).all()

        for c in cards:
            if c.id not in seen:
                seen.add(c.id)
                list_obj = db.query(List).filter(List.id == c.list_id).first()
                due = c.due_date
                if hasattr(due, 'date'):
                    due = due.date()
                week_tasks.append({
                    "title": c.title,
                    "priority": c.priority or "Medium",
                    "list": list_obj.title if list_obj else "Unknown",
                    "due_date": str(due),
                    "due_day": due.strftime("%A"),   # e.g. "Monday", "Tuesday"
                    "assigned_to_me": str(c.assigned_to) == str(user.id) if c.assigned_to else False,
                    "is_today": due == today,
                    "is_overdue": due < today,
                })

    # Also cards directly assigned to user due this week
    assigned_week = db.query(Card).filter(
        Card.assigned_to == user.id,
        Card.completed_at == None,
        Card.due_date != None,
        cast(Card.due_date, Date) >= week_start,
        cast(Card.due_date, Date) <= week_end
    ).all()

    for c in assigned_week:
        if c.id not in seen:
            seen.add(c.id)
            list_obj = db.query(List).filter(List.id == c.list_id).first()
            due = c.due_date
            if hasattr(due, 'date'):
                due = due.date()
            week_tasks.append({
                "title": c.title,
                "priority": c.priority or "Medium",
                "list": list_obj.title if list_obj else "Unknown",
                "due_date": str(due),
                "due_day": due.strftime("%A"),
                "assigned_to_me": True,
                "is_today": due == today,
                "is_overdue": due < today,
            })

    # Group by day for cleaner response
    by_day = {}
    for task in week_tasks:
        day = task["due_day"]
        if day not in by_day:
            by_day[day] = []
        by_day[day].append(task["title"])

    return {
        "type": "week_tasks",
        "week_start": str(week_start),
        "week_end": str(week_end),
        "today": str(today),
        "total_count": len(week_tasks),
        "tasks": week_tasks,
        "tasks_by_day": by_day,
        "message": (
            f"You have {len(week_tasks)} task(s) due this week "
            f"({week_start.strftime('%b %d')} – {week_end.strftime('%b %d')})."
            if week_tasks else
            "No tasks due this week! 🎉"
        )
    }


# ─────────────────────────────────────────────────────────────────────────────
# OVERDUE TASKS
# ─────────────────────────────────────────────────────────────────────────────

def _fetch_overdue_tasks(user: User, db: Session) -> dict:
    today = date.today()
    all_board_ids, _, _ = _get_all_board_ids(user, db)

    seen = set()
    all_overdue = []

    if all_board_ids:
        overdue_cards = db.query(Card).filter(
            Card.board_id.in_(all_board_ids),
            Card.completed_at == None,
            Card.due_date != None,
            cast(Card.due_date, Date) < today
        ).order_by(Card.due_date.asc()).all()

        for c in overdue_cards:
            if c.id not in seen:
                seen.add(c.id)
                list_obj = db.query(List).filter(List.id == c.list_id).first()
                due = c.due_date
                if hasattr(due, 'date'):
                    due = due.date()
                days_late = (today - due).days if due else 0
                all_overdue.append({
                    "title": c.title,
                    "priority": c.priority or "Medium",
                    "list": list_obj.title if list_obj else "Unknown",
                    "due_date": str(due),
                    "days_overdue": days_late,
                })

    assigned_overdue = db.query(Card).filter(
        Card.assigned_to == user.id,
        Card.completed_at == None,
        Card.due_date != None,
        cast(Card.due_date, Date) < today
    ).all()

    for c in assigned_overdue:
        if c.id not in seen:
            seen.add(c.id)
            list_obj = db.query(List).filter(List.id == c.list_id).first()
            due = c.due_date
            if hasattr(due, 'date'):
                due = due.date()
            days_late = (today - due).days if due else 0
            all_overdue.append({
                "title": c.title,
                "priority": c.priority or "Medium",
                "list": list_obj.title if list_obj else "Unknown",
                "due_date": str(due),
                "days_overdue": days_late,
            })

    return {
        "type": "overdue_tasks",
        "count": len(all_overdue),
        "tasks": all_overdue,
        "message": f"You have {len(all_overdue)} overdue task(s)." if all_overdue else "No overdue tasks! ✅"
    }


# ─────────────────────────────────────────────────────────────────────────────
# ALL TASKS
# ─────────────────────────────────────────────────────────────────────────────

def _fetch_all_tasks(user: User, db: Session) -> dict:
    all_board_ids, _, _ = _get_all_board_ids(user, db)

    seen = set()
    all_tasks = []

    if all_board_ids:
        cards = db.query(Card).filter(
            Card.board_id.in_(all_board_ids),
            Card.completed_at == None,
            Card.is_archived == False
        ).order_by(Card.due_date.asc().nullslast()).all()

        for c in cards:
            if c.id not in seen:
                seen.add(c.id)
                list_obj = db.query(List).filter(List.id == c.list_id).first()
                due = None
                if c.due_date:
                    due = c.due_date.date() if hasattr(c.due_date, 'date') else c.due_date
                all_tasks.append({
                    "title": c.title,
                    "priority": c.priority or "Medium",
                    "list": list_obj.title if list_obj else "Unknown",
                    "due_date": str(due) if due else "No due date",
                    "assigned_to_me": str(c.assigned_to) == str(user.id) if c.assigned_to else False,
                })

    assigned_to_me = db.query(Card).filter(
        Card.assigned_to == user.id,
        Card.completed_at == None
    ).all()

    for c in assigned_to_me:
        if c.id not in seen:
            seen.add(c.id)
            list_obj = db.query(List).filter(List.id == c.list_id).first()
            due = None
            if c.due_date:
                due = c.due_date.date() if hasattr(c.due_date, 'date') else c.due_date
            all_tasks.append({
                "title": c.title,
                "priority": c.priority or "Medium",
                "list": list_obj.title if list_obj else "Unknown",
                "due_date": str(due) if due else "No due date",
                "assigned_to_me": True,
            })

    high = sum(1 for t in all_tasks if t["priority"] == "High")
    medium = sum(1 for t in all_tasks if t["priority"] == "Medium")
    low = sum(1 for t in all_tasks if t["priority"] == "Low")

    return {
        "type": "all_tasks",
        "total_count": len(all_tasks),
        "high_priority": high,
        "medium_priority": medium,
        "low_priority": low,
        "tasks": all_tasks[:15],
    }


# ─────────────────────────────────────────────────────────────────────────────
# TEAMS — completely rewritten to fix wrong counts and hallucinated names
# ─────────────────────────────────────────────────────────────────────────────
from sqlalchemy import or_
#this is cluade one
# def _fetch_teams(user: User, db: Session) -> dict:
#     """
#     Fetches teams with full details: board names + member names.
#     """

#     # Step 1: teams from team_members table
#     member_rows = db.query(TeamMember).filter(
#         TeamMember.user_id == user.id
#     ).all()
#     member_team_map = {str(m.team_id): m.role for m in member_rows}
#     member_team_ids = set(member_team_map.keys())

#     # Step 2: teams owned directly via teams.owner_id
#     directly_owned = db.query(Team).filter(
#         Team.owner_id == user.id,
#         Team.archived == False
#     ).all()
#     directly_owned_ids = {str(t.id) for t in directly_owned}

#     # Step 3: union of both
#     all_team_id_strings = member_team_ids | directly_owned_ids

#     teams_i_own = []
#     teams_i_am_member_of = []
#     all_teams_detail = []

#     for team_id_str in all_team_id_strings:
#         team = db.query(Team).filter(
#             Team.id == team_id_str,
#             Team.archived == False
#         ).first()

#         if not team:
#             continue

#         # ── Role determination ──
#         role_in_table = member_team_map.get(team_id_str, None)
#         is_owner_by_id = (str(team.owner_id) == str(user.id))

#         if role_in_table == "owner" or is_owner_by_id:
#             final_role = "owner"
#             is_owner = True
#         elif role_in_table == "admin":
#             final_role = "admin"
#             is_owner = False
#         else:
#             final_role = role_in_table or "member"
#             is_owner = False

#         # ── Get ALL members with their names ──
#         member_rows_for_team = db.query(TeamMember).filter(
#             TeamMember.team_id == team.id
#         ).all()

#         members_detail = []
#         for m in member_rows_for_team:
#             member_user = db.query(User).filter(User.id == m.user_id).first()
#             if member_user:
#                 members_detail.append({
#                     "name": f"{member_user.first_name} {member_user.last_name}",
#                     "email": member_user.email,
#                     "role": m.role,
#                 })

#         # ── Get ALL boards with their names ──
#         team_boards = db.query(Board).filter(
#             Board.team_id == team.id,
#             Board.archived == False
#         ).all()

#         boards_detail = []
#         for b in team_boards:
#             # Get card count for each board
#             card_count = db.query(Card).filter(
#                 Card.board_id == b.id,
#                 Card.completed_at == None
#             ).count()
#             boards_detail.append({
#                 "name": b.title,
#                 "active_cards": card_count,
#             })

#         team_info = {
#             "name": team.name,
#             "type": team.type or "N/A",
#             "your_role": final_role,
#             "is_owner": is_owner,
#             "total_members": len(members_detail),
#             "members": members_detail,           # ← full member list with names
#             "total_boards": len(boards_detail),
#             "boards": boards_detail,             # ← full board list with names
#         }
#         all_teams_detail.append(team_info)

#         if is_owner:
#             teams_i_own.append(team.name)
#         else:
#             teams_i_am_member_of.append(team.name)

#     total = len(all_teams_detail)

#     return {
#         "type": "teams",
#         "total_teams": total,
#         "owned_team_count": len(teams_i_own),
#         "member_team_count": len(teams_i_am_member_of),
#         "teams_you_own": teams_i_own,
#         "teams_you_are_member_of": teams_i_am_member_of,
#         "all_teams": all_teams_detail,
#         "_instruction": (
#             f"The user has exactly {total} teams total. "
#             f"They OWN {len(teams_i_own)} team(s): {teams_i_own}. "
#             f"They are a MEMBER/ADMIN of {len(teams_i_am_member_of)} team(s): {teams_i_am_member_of}. "
#             f"For EACH team in 'all_teams', show: team name, type, your role, "
#             f"list ALL member names with their roles, list ALL board names. "
#             f"Use ONLY these exact values from the data. Do NOT invent anything."
#         )
#     }

#this is normal working 
# def _fetch_teams(user: User, db: Session) -> dict:
#     """
#     Fetches teams directly from the database.
#     Combines owned teams + member teams without any duplicates.
#     Never hallucinates — only returns what's actually in the DB.
#     """

#     # Step 1: Get all team IDs where user is in team_members table
#     member_rows = db.query(TeamMember).filter(
#         TeamMember.user_id == user.id
#     ).all()
#     member_team_ids = {m.team_id: m.role for m in member_rows}

#     # Step 2: Get all teams the user owns directly
#     owned_teams_query = db.query(Team).filter(
#         Team.owner_id == user.id,
#         Team.archived == False
#     ).all()
#     owned_team_ids = {t.id for t in owned_teams_query}

#     # Step 3: Merge all team IDs without duplicates
#     all_team_ids = set(member_team_ids.keys()) | owned_team_ids

#     teams_i_own = []
#     teams_i_am_member_of = []
#     all_teams_detail = []

#     for team_id in all_team_ids:
#         team = db.query(Team).filter(
#             Team.id == team_id,
#             Team.archived == False
#         ).first()

#         if not team:
#             continue  # skip archived or deleted teams

#         # is_owner = (str(team.owner_id) == str(user.id))
#         is_owner = (team.owner_id == user.id)

#         # Role from member table, fallback to "owner" if they own it
#         if is_owner:
#             role = "owner"
#         else:
#             role = member_team_ids.get(team_id, "member")

#         member_count = db.query(TeamMember).filter(
#             TeamMember.team_id == team.id
#         ).count()

#         board_count = db.query(Board).filter(
#             Board.team_id == team.id,
#             Board.archived == False
#         ).count()

#         team_info = {
#             "name": team.name,          # REAL name from DB
#             "type": team.type or "N/A",
#             "role": role,
#             "member_count": member_count,
#             "board_count": board_count,
#             "is_owner": is_owner,
#         }
#         all_teams_detail.append(team_info)

#         if is_owner:
#             teams_i_own.append(team.name)
#         else:
#             teams_i_am_member_of.append(team.name)

#     total = len(all_teams_detail)

#     return {
#         "type": "teams",
#         # ← These are the exact numbers and names from YOUR database
#         "total_teams": total,
#         "owned_team_count": len(teams_i_own),
#         "member_team_count": len(teams_i_am_member_of),
#         "teams_you_own": teams_i_own,           # real names only
#         "teams_you_are_member_of": teams_i_am_member_of,  # real names only
#         "all_teams": all_teams_detail,
#         # Instruction for LLM — do not invent names
#         "_instruction": (
#             f"User has exactly {total} teams total. "
#             f"They OWN {len(teams_i_own)} team(s): {teams_i_own}. "
#             f"They are a MEMBER of {len(teams_i_am_member_of)} team(s): {teams_i_am_member_of}. "
#             f"Use ONLY these real names. Do NOT invent team names."
#         )
#     }

#this is copilot
def _fetch_teams(user: User, db: Session) -> dict:
    """
    Fetch teams with FULL real details (members + boards + tasks)
    WITHOUT hallucination.
    """

    # ✅ Step 1: memberships
    member_rows = db.query(TeamMember).filter(
        TeamMember.user_id == user.id
    ).all()
    member_team_map = {m.team_id: m.role for m in member_rows}

    # ✅ Step 2: owned teams
    owned_teams = db.query(Team).filter(
        Team.owner_id == user.id,
        Team.archived == False
    ).all()
    owned_team_ids = {t.id for t in owned_teams}

    # ✅ Step 3: merge
    all_team_ids = set(member_team_map.keys()) | owned_team_ids

    teams_i_own = []
    teams_i_member = []
    all_teams_detail = []

    for team_id in all_team_ids:

        team = db.query(Team).filter(
            Team.id == team_id,
            Team.archived == False
        ).first()
        if not team:
            continue

        # ✅ ✅ ROLE (NO fake "admin")
        is_owner = (team.owner_id == user.id)
        role = "owner" if is_owner else member_team_map.get(team_id, "member")

        # ✅ ✅ MEMBERS (REAL ONLY)
        member_rows_for_team = db.query(TeamMember).filter(
            TeamMember.team_id == team.id
        ).all()

        members_detail = []

        for m in member_rows_for_team:
            member_user = db.query(User).filter(User.id == m.user_id).first()
            if member_user:
                members_detail.append({
                    "name": f"{member_user.first_name} {member_user.last_name}",
                    "email": member_user.email,
                    "role": "owner" if member_user.id == team.owner_id else "member"
                })

        # ✅ ✅ BOARDS + TASKS (REAL ONLY)
        team_boards = db.query(Board).filter(
            Board.team_id == team.id,
            Board.archived == False
        ).all()

        boards_detail = []

        for b in team_boards:

            cards = db.query(Card).filter(
                Card.board_id == b.id,
                Card.completed_at == None
            ).all()

            boards_detail.append({
                "name": b.title,
                "tasks": [c.title for c in cards]   # ✅ real task names
            })

        team_info = {
            "name": team.name,
            "type": team.type or "N/A",
            "role": role,
            "is_owner": is_owner,
            "members": members_detail,
            "boards": boards_detail
        }

        all_teams_detail.append(team_info)

        if is_owner:
            teams_i_own.append(team.name)
        else:
            teams_i_member.append(team.name)

    return {
        "type": "teams",
        "total_teams": len(all_teams_detail),
        "teams_you_own": teams_i_own,
        "teams_you_are_member_of": teams_i_member,
        "all_teams": all_teams_detail,

        # ✅ ✅ STRICT INSTRUCTION (VERY IMPORTANT)
        "_instruction": """
        IMPORTANT RULES:
        - Use ONLY the provided data
        - DO NOT create fake team names (like Project Planning)
        - DO NOT add fake roles like admin1
        - OWNER is the only special role
        - If no boards → say no boards
        - If no tasks → say no tasks
        - Show:
          team name,
          team type,
          owner,
          members,
          boards,
          tasks inside each board
        """
    }


#-------------------------------------------------------------

def _fetch_team_detail(user: User, db: Session, team_name: str = None) -> dict:
    """
    Fetches full detail for a specific team by name:
    - Team info
    - All members with their names/emails/roles
    - All boards in the team
    - All cards inside each board (with list grouping)
    """

    # Find the team by name (case-insensitive, fuzzy match)
    from sqlalchemy import func

    member_rows = db.query(TeamMember).filter(TeamMember.user_id == user.id).all()
    member_team_ids = {m.team_id for m in member_rows}
    owned_team_ids = {
        t.id for t in db.query(Team).filter(
            Team.owner_id == user.id, Team.archived == False
        ).all()
    }
    all_team_ids = member_team_ids | owned_team_ids

    # Find matching team by name
    team = None
    if team_name:
        team = db.query(Team).filter(
            Team.id.in_(all_team_ids),
            func.lower(Team.name).contains(team_name.lower()),
            Team.archived == False
        ).first()

    if not team:
        return {
            "type": "team_detail",
            "found": False,
            "message": f"No team found matching '{team_name}'. Use 'teams' intent to list all teams."
        }

    # ── Members ──────────────────────────────────────────────────────────────
    member_rows = db.query(TeamMember).filter(TeamMember.team_id == team.id).all()
    members_data = []
    for m in member_rows:
        u = db.query(User).filter(User.id == m.user_id).first()
        if u:
            members_data.append({
                "name": f"{u.first_name} {u.last_name}",
                "email": u.email,
                "role": "owner" if u.id == team.owner_id else m.role,
            })

    # ── Boards + Lists + Cards ────────────────────────────────────────────────
    boards = db.query(Board).filter(
        Board.team_id == team.id,
        Board.archived == False
    ).all()

    boards_data = []
    for board in boards:
        lists = db.query(List).filter(List.board_id == board.id).order_by(List.position).all()
        lists_data = []

        for lst in lists:
            cards = db.query(Card).filter(
                Card.list_id == lst.id,
                Card.completed_at == None,
            ).all()

            cards_data = []
            for c in cards:
                due = c.due_date
                if due and hasattr(due, 'date'):
                    due = due.date()

                # Resolve assigned user name
                assigned_name = None
                if c.assigned_to:
                    assigned_user = db.query(User).filter(User.id == c.assigned_to).first()
                    if assigned_user:
                        assigned_name = f"{assigned_user.first_name} {assigned_user.last_name}"

                cards_data.append({
                    "title": c.title,
                    "priority": c.priority or "Medium",
                    "due_date": str(due) if due else "No due date",
                    "assigned_to": assigned_name or "Unassigned",
                })

            lists_data.append({
                "list_name": lst.title,
                "card_count": len(cards_data),
                "cards": cards_data,
            })

        boards_data.append({
            "board_name": board.title,
            "description": board.description or "No description",
            "list_count": len(lists_data),
            "lists": lists_data,
        })

    return {
        "type": "team_detail",
        "found": True,
        "team_name": team.name,
        "team_type": team.type or "N/A",
        "description": team.description or "No description",
        "member_count": len(members_data),
        "members": members_data,
        "board_count": len(boards_data),
        "boards": boards_data,
        "_instruction": (
            f"The user asked about team '{team.name}'. "
            f"It has {len(members_data)} member(s) and {len(boards_data)} board(s). "
            f"Show team members with their roles, then list each board with its lists and cards. "
            f"Use ONLY this real data. Do NOT invent any names, cards, or members."
        )
    }
# ─────────────────────────────────────────────────────────────────────────────
# DASHBOARD SUMMARY
# ─────────────────────────────────────────────────────────────────────────────

def _fetch_dashboard_summary(user: User, db: Session) -> dict:
    today = date.today()
    all_board_ids, personal_boards, team_boards = _get_all_board_ids(user, db)

    all_cards = []
    if all_board_ids:
        all_cards = db.query(Card)\
    .join(List)\
    .join(Board)\
    .filter(
        or_(
            # ✅ PERSONAL → all tasks
            and_(
                Board.owner_id == user.id,
                Board.team_id == None
            ),
            # ✅ TEAM → only my tasks
            and_(
                Board.team_id != None,
                Card.assigned_to == user.id
            )
        )
    ).all()
        # all_cards = db.query(Card).join(List).filter(
        #     Card.board_id.in_(all_board_ids)
        # ).all()

    todo = in_progress = done = completed = overdue = due_today = 0

    for c in all_cards:
        list_obj = db.query(List).filter(List.id == c.list_id).first()
        list_name = list_obj.title.lower() if list_obj else ""

        if c.completed_at:
            completed += 1
            continue

        due = None
        if c.due_date:
            due = c.due_date.date() if hasattr(c.due_date, 'date') else c.due_date

        if due:
            if due == today:
                due_today += 1
            elif due < today:
                overdue += 1

        if "done" in list_name or "completed" in list_name:
            done += 1
        elif "progress" in list_name:
            in_progress += 1
        else:
            todo += 1

    # Team count using same fixed logic
    member_team_ids = {
        m.team_id for m in db.query(TeamMember).filter(
            TeamMember.user_id == user.id
        ).all()
    }
    owned_team_ids = {
        t.id for t in db.query(Team).filter(
            Team.owner_id == user.id,
            Team.archived == False
        ).all()
    }
    teams_count = len(member_team_ids | owned_team_ids)

    return {
        "type": "dashboard",
        "user_name": f"{user.first_name} {user.last_name}",
        "personal_boards": len(personal_boards),
        "team_boards": len(team_boards),
        "total_active_tasks": len(all_cards),
        "todo": todo,
        "in_progress": in_progress,
        "done": done,
        "completed_tasks": completed,
        "overdue_tasks": overdue,
        "tasks_due_today": due_today,
        "teams_count": teams_count,
    }


# ─────────────────────────────────────────────────────────────────────────────
# NOTIFICATIONS
# ─────────────────────────────────────────────────────────────────────────────

def _fetch_notifications(user: User, db: Session) -> dict:
    notifications = db.query(Notification).filter(
        Notification.user_id == user.id,
        Notification.is_read == False
    ).order_by(Notification.created_at.desc()).limit(10).all()

    unread_count = db.query(Notification).filter(
        Notification.user_id == user.id,
        Notification.is_read == False
    ).count()

    return {
        "type": "notifications",
        "unread_count": unread_count,
        "notifications": [
            {
                "title": n.title,
                "message": n.message,
                "category": n.category or "personal",
                "created_at": n.created_at.isoformat() if n.created_at else "N/A",
            }
            for n in notifications
        ],
        "message": f"You have {unread_count} unread notification(s)." if unread_count else "No unread notifications."
    }
