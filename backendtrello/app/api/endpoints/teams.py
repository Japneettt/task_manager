 
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from uuid import UUID
from app.websocket.manager import manager
from app.utils.email import send_invite_email
from app.core.database import get_db
from app.api.endpoints.users import get_current_user
 
from app.models.team import Team
from app.models.team_member import TeamMember
from app.models.team_invite import TeamInvite
from app.models.user import User
from app.models.boards import Board
 
from app.schemas.team import TeamCreate, TeamRead, InviteRequest
from app.services.notification_service import create_notification
 
router = APIRouter()
 
# ✅ CREATE TEAM
@router.post("/teams", response_model=TeamRead)
def create_team(
    data: TeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = Team(
        name=data.name,
        type=data.type,
        description=data.description,
        owner_id=current_user.id
    )
 
    db.add(team)
    db.commit()
    db.refresh(team)
 
    member = TeamMember(
        team_id=team.id,
        user_id=current_user.id,
        role="admin"
    )
    db.add(member)
    db.commit()
 
    return team
 
 
# ✅ GET USER TEAMS
@router.get("/teams")
def get_user_teams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    member_teams = db.query(TeamMember.team_id).filter(
        TeamMember.user_id == current_user.id
    )
 
    teams = db.query(Team).filter(
        or_(
            Team.owner_id == current_user.id,
            Team.id.in_(member_teams)
        )
    ).all()
#     teams = db.query(Team).filter(
#     or_(
#         Team.owner_id == current_user.id,
#         Team.id.in_(member_teams)
#     ),
#     Team.archived == False   # ✅ ADD HERE
# ).all()
 
    return teams
 
 
# ✅ ✅ ✅ INVITE MEMBERS (MULTI EMAIL WORKING)
@router.post("/teams/{team_id}/invite")
async def invite_members(
    team_id: UUID,
    data: InviteRequest,
    db: Session = Depends(get_db)
):
 
    # ✅ COLLECT EMAILS PROPERLY (expecting data.emails: List[str])
    target_emails = data.emails or []

    if not target_emails:
        raise HTTPException(
            status_code=400,
            detail="At least one email is required"
        )
 
    success = []
    invalid = []
 
    for email in target_emails:
 
        email = email.strip().lower()
 
        user = db.query(User).filter(
            func.lower(User.email) == email
        ).first()
 
        # ✅ INVALID USER → SKIP (DON'T BREAK)
        if not user:
            invalid.append(email)
            continue
 
        existing = db.query(TeamInvite).filter(
            TeamInvite.team_id == team_id,
            TeamInvite.invited_email == email,
            TeamInvite.status == "pending"
        ).first()
 
        if existing:
            continue
 
        # ✅ CREATE INVITE
        invite = TeamInvite(
            team_id=team_id,
            invited_email=email,
            status="pending"
        )
        db.add(invite)
        db.flush()
 
        # ✅ SEND EMAIL
        link = f"http://localhost:5173/accept-invite/{invite.id}"
        send_invite_email(email, link)
 
        # ✅ CREATE NOTIFICATION
        team = db.query(Team).filter(Team.id == team_id).first()
 
        if team:
            create_notification(
                db=db,
                user_id=user.id,
                title="Team Invite",
                message=f"You were invited to {team.name}",
                type="invite",
                category="team",
                entity_id=invite.id
            )
 
            await manager.send_to_user(
                str(user.id),
                {
                    "type": "NEW_INVITE",
                    "message": "You have a new invite",
                    "team_id": str(team.id),
                    "invite_id": str(invite.id),
                }
            )
 
        success.append(email)
 
    db.commit()
 
    return {
        "message": "Invites processed ✅",
        "success": success,
        "invalid": invalid
    }
@router.get("/teams/invites")
def get_team_invites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        invites = db.query(TeamInvite).filter(
            func.lower(TeamInvite.invited_email) == current_user.email.lower(),
            TeamInvite.status == "pending"
        ).all()
 
        result = []
 
        for invite in invites:
            team = db.query(Team).filter(Team.id == invite.team_id).first()
 
            result.append({
                "id": str(invite.id),
                "team_id": str(invite.team_id),
                "team_name": team.name if team else "Unknown Team",
                "invited_email": invite.invited_email,
                "status": invite.status,
                "created_at": invite.created_at.isoformat() if invite.created_at else None,  # ✅ FIX
            })
 
        print("INVITES SENT:", result)  # ✅ DEBUG
 
        return result
 
    except Exception as e:
        print("ERROR IN /teams/invites:", e)  # ✅ IMPORTANT LOG
        raise HTTPException(status_code=500, detail=str(e))
 
 
# ✅ ACCEPT INVITE (BY ID - WORKS FOR BOTH EMAIL + INBOX ✅)
@router.patch("/teams/invites/{invite_id}/accept")
def accept_team_invite(
    invite_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    invite = db.query(TeamInvite).filter(
        TeamInvite.id == invite_id,
        func.lower(TeamInvite.invited_email) == current_user.email.lower(),
        TeamInvite.status == "pending"
    ).first()
 
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found")
 
    # ✅ prevent duplicate member
    existing = db.query(TeamMember).filter(
        TeamMember.team_id == invite.team_id,
        TeamMember.user_id == current_user.id
    ).first()
 
    if not existing:
        member = TeamMember(
            team_id=invite.team_id,
            user_id=current_user.id,
            role="member"
        )
        db.add(member)
       
        # ✅ NOTIFY TEAM OWNER WHEN USER JOINS
        team = db.query(Team).filter(Team.id == invite.team_id).first()
        if team:
            create_notification(
                db=db,
                user_id=team.owner_id,
                title="User Joined",
                message=f"{current_user.first_name} {current_user.last_name} joined {team.name}",
                type="member_joined",
                category="team",
                entity_id=team.id
            )
 
    invite.status = "accepted"
    db.commit()
    # ✅ notify team owner (or all members)
    team = db.query(Team).filter(Team.id == invite.team_id).first()
 
    members = db.query(TeamMember).filter(
    TeamMember.team_id == invite.team_id).all()
 
    # for m in members:
    #    asyncio.create_task(
    #         manager.send(
    #             str(m.user_id),
    #             {
    #                 "type": "team_update",
    #                 "payload": {
    #                     "team_id": str(invite.team_id),
    #                     "event": "member_joined",
    #                     "user": f"{current_user.first_name} {current_user.last_name}"
    #             }
    #         }
    #     )
    # )
 
    return {
        "message": "Invite accepted ✅",
        "team_id": invite.team_id
    }
 
 
# ✅ REJECT INVITE
@router.patch("/teams/invites/{invite_id}/reject")
def reject_team_invite(
    invite_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    invite = db.query(TeamInvite).filter(
        TeamInvite.id == invite_id,
        func.lower(TeamInvite.invited_email) == current_user.email.lower(),
        TeamInvite.status == "pending"
    ).first()
 
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found")
 
    invite.status = "rejected"
    db.commit()
 
    return {"message": "Invite rejected ❌"}
 
 
# ✅ GET TEAM DETAILS (FIXED BUG ✅)
@router.get("/teams/{team_id}")
def get_team(
    team_id: UUID,
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id).first()
 
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
 
    # ✅ MEMBERS
    members = db.query(TeamMember).filter(
        TeamMember.team_id == team_id
    ).all()
 
    member_data = []
 
    for m in members:
        user = db.query(User).filter(User.id == m.user_id).first()
 
        if user:
            member_data.append({
                "id": str(user.id),
                "name": f"{user.first_name} {user.last_name}",
                "email": user.email,
                "role": m.role
            })
 
    # ✅ FIXED INVITES (IMPORTANT 🔥)
    invites = db.query(TeamInvite).filter(
        TeamInvite.team_id == team_id,
        TeamInvite.status == "pending"
    ).all()
 
    invite_data = [
        {"email": i.invited_email}   # ✅ FIXED FIELD NAME
        for i in invites
    ]
 
    return {
        "id": str(team.id),
        "name": team.name,
        "type": team.type,
        "description": team.description,
        "members": member_data,
        "invites": invite_data
    }
   
@router.delete("/teams/{team_id}")
def delete_team(
    team_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    team = db.query(Team).filter(Team.id == team_id).first()
 
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
 
    if team.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
 
    # ✅ DELETE DEPENDENCIES FIRST
    db.query(Board).filter(Board.team_id == team_id).delete()
    db.query(TeamMember).filter(TeamMember.team_id == team_id).delete()
    db.query(TeamInvite).filter(TeamInvite.team_id == team_id).delete()
 
    # ✅ THEN DELETE TEAM
    db.delete(team)
    db.commit()
 
    return {"message": "Team deleted"}
 
 
@router.patch("/teams/{team_id}/archive")
def archive_team(
    team_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    team = db.query(Team).filter(Team.id == team_id).first()
 
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
 
    if team.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
 
    team.archived = True
    db.commit()
 
    return {"message": "Team archived"}
 
 
@router.get("/teams/archived")
def get_archived_teams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    teams = db.query(Team).filter(
        Team.owner_id == current_user.id,
        Team.archived == True
    ).all()
 
    return teams
 