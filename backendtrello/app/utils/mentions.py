import re
from typing import List
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.team_member import TeamMember

# Matches @word — letters, numbers, dots, underscores after the @
MENTION_PATTERN = re.compile(r"@([A-Za-z0-9_.]+)")


def extract_mention_handles(content: str) -> List[str]:
    """
    Pulls out the raw text after every '@' in a message.
    '@japneet what update' -> ['japneet']
    '@japneet and @purwa please check' -> ['japneet', 'purwa']
    """
    return MENTION_PATTERN.findall(content)


def resolve_mentions_in_team(
    db: Session,
    team_id,
    content: str,
) -> List[User]:
    """
    Given message text and a team_id, find which team members were
    actually @mentioned. Matching is done by first_name (lowercased),
    so '@japneet' matches a user whose first_name is 'Japneet'.

    Only members who actually belong to this team can be matched —
    this stops someone from mentioning (and notifying) a random user
    who isn't even on the team.
    """
    handles = {h.lower() for h in extract_mention_handles(content)}
    if not handles:
        return []

    member_rows = (
        db.query(User)
        .join(TeamMember, TeamMember.user_id == User.id)
        .filter(TeamMember.team_id == team_id)
        .all()
    )

    matched = []
    for user in member_rows:
        first = (user.first_name or "").lower()
        full = f"{user.first_name or ''}{user.last_name or ''}".lower()
        if first in handles or full in handles:
            matched.append(user)

    return matched