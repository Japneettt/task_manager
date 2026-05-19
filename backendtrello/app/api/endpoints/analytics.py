from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.card import Card
from app.models.lists import List
from app.models.boards import Board
from app.models.team_member import TeamMember
from app.api.endpoints.users import get_current_user

router = APIRouter(tags=["Analytics"])

@router.get("/boards")
def board_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        personal_board_ids = [
            board.id for board in db.query(Board).filter(
                Board.owner_id == current_user.id,
                Board.team_id == None,
            ).all()
        ]

        team_ids = [
            membership.team_id for membership in db.query(TeamMember).filter(
                TeamMember.user_id == current_user.id
            ).all()
        ]

        team_board_ids = []
        if team_ids:
            team_board_ids = [
                board.id for board in db.query(Board).filter(Board.team_id.in_(team_ids)).all()
            ]

        def compute_performance(board_ids):
            if not board_ids:
                return 0.0

            cards = db.query(Card).join(List).filter(Card.board_id.in_(board_ids))
            total_cards = cards.count()
            if total_cards == 0:
                return 0.0

            completed_count = cards.filter(List.title == "Completed").count()
            in_progress_count = cards.filter(List.title == "Progress").count()
            performance = (completed_count + in_progress_count * 0.5) / total_cards

            return float(round(performance, 4))

        personal_performance = compute_performance(personal_board_ids)
        team_performance = compute_performance(team_board_ids)

        return {
            "personal": {
                "performance": personal_performance,
            },
            "team": {
                "performance": team_performance,
            },
        }

    except Exception as e:
        print("Analytics error:", e)
        return {
            "personal": {
                "performance": 0.0,
            },
            "team": {
                "performance": 0.0,
            },
        }
