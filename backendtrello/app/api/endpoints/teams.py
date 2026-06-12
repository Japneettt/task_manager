from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form ,Request
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from pathlib import Path
from uuid import UUID
import uuid
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

# Upload directory for team images (app/static/team_images)
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent

UPLOAD_DIR = BASE_DIR / "uploads" / "team_images"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def get_default_team_image():
    return f"https://source.unsplash.com/800x600/?team,abstract&sig={uuid.uuid4().hex}"

async def save_uploaded_team_image(image: UploadFile, request: Request) -> str:
    extension = Path(image.filename).suffix or ".jpg"
    filename = f"{uuid.uuid4().hex}{extension}"
    filepath = UPLOAD_DIR / filename

    # Read file content and write to disk
    content = await image.read()
    with open(filepath, "wb") as buffer:
        buffer.write(content)

    # Return a URL served by StaticFiles mount
    return f"/uploads/team_images/{filename}"
    # return str(request.url_for("static", path=f"team_images/{filename}"))

def _create_team(
    db: Session,
    current_user: User,
    name: str,
    team_type: str,
    description: str,
    image_url: str,
) -> Team:
    team = Team(
        name=name,
        type=team_type,
        description=description,
        owner_id=current_user.id,
        image_url=image_url
    )
    db.add(team)
    db.commit()
    db.refresh(team)
 
    member = TeamMember(
        team_id=team.id,
        user_id=current_user.id,
        # role="admin"
        role="owner"   # ✅ CHANGE HERE
    )
    db.add(member)
    db.commit()
 
    return team


# ✅ CREATE TEAM
@router.post("/teams", response_model=TeamRead)
async def create_team(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    content_type = request.headers.get("content-type", "")
    if "multipart/form-data" in content_type:
        form = await request.form()
        name = form.get("name")
        team_type = form.get("type")
        description = form.get("description") or ""
        image = form.get("image")

        if not name or not team_type:
            raise HTTPException(status_code=400, detail="Name and type are required")

        image_url = get_default_team_image()
        if image and hasattr(image, "filename") and image.filename:
          image_url = await save_uploaded_team_image(image, request)



        print("IMAGE RECEIVED:", image)
        print("FILENAME:", getattr(image, "filename", None))

        return _create_team(
            db,
            current_user,
            str(name),
            str(team_type),
            str(description),
            image_url,
        )

    body = await request.json()
    data = TeamCreate(**body)
    image_url = data.image_url or get_default_team_image()
    return _create_team(
        db,
        current_user,
        data.name,
        data.type,
        data.description,
        image_url,
    )
# @router.post("/teams", response_model=TeamRead)
# def create_team(
#     data: TeamCreate,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ):
#     team = Team(
#         name=data.name,
#         type=data.type,
#         description=data.description,
#         owner_id=current_user.id
#     )

#     db.add(team)
#     db.commit()
#     db.refresh(team)

#     member = TeamMember(
#         team_id=team.id,
#         user_id=current_user.id,
#         role="admin"
#     )
#     db.add(member)
#     db.commit()

#     return team


@router.post("/teams/upload", response_model=TeamRead)
async def create_team_with_image(
    request: Request,
    name: str = Form(...),
    type: str = Form(...),
    description: str = Form(""),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    image_url = get_default_team_image()

    if image:
        image_url = await save_uploaded_team_image(image, request)
    return _create_team(
        db,
        current_user,
        name,
        type,
        description,
        image_url,
    )
    
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
    ),
    # Team.archived == False   # ✅ ADD HERE
).all()

    # return teams
    return [
        {
            "id": str(team.id),
            "name": team.name,
            "type": team.type,
            "description": team.description,
            "image_url": team.image_url,
            "owner_id": str(team.owner_id) if team.owner_id else None,
        }
        for team in teams
    ]


# ✅ ✅ ✅ INVITE MEMBERS (MULTI EMAIL WORKING)
@router.post("/teams/{team_id}/invite")
def invite_members(
    team_id: UUID,
    data: InviteRequest,
    db: Session = Depends(get_db)
):

    # ✅ COLLECT EMAILS PROPERLY
    target_emails = []

    if data.emails:
        target_emails.extend(data.emails)

    if data.email:
        target_emails.append(data.email)

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
                "role": "owner" if user.id == team.owner_id else m.role,  # ✅ FIX HERE
                # "role": m.role,
                "avatar": user.avatar   # ✅ ADD THIS LINE
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
        "image_url": team.image_url,
        "members": member_data,
        "invites": invite_data
    }
    
from app.models.card import Card

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

    try:
        # ✅ GET ALL BOARDS FIRST
        boards = db.query(Board).filter(Board.team_id == team_id).all()

        for board in boards:
            # ✅ DELETE CARDS OF EACH BOARD
            db.query(Card).filter(Card.board_id == board.id).delete()

        # ✅ DELETE BOARDS
        db.query(Board).filter(Board.team_id == team_id).delete()

        # ✅ DELETE TEAM MEMBERS & INVITES
        db.query(TeamMember).filter(TeamMember.team_id == team_id).delete()
        db.query(TeamInvite).filter(TeamInvite.team_id == team_id).delete()

        # ✅ DELETE TEAM
        db.delete(team)

        db.commit()

        return {"message": "Team deleted ✅"}

    except Exception as e:
        db.rollback()
        print("❌ DELETE ERROR:", str(e))   # ✅ VERY IMPORTANT DEBUG
        raise HTTPException(status_code=500, detail="Delete failed")
# @router.delete("/teams/{team_id}")
# def delete_team(
#     team_id: UUID,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     team = db.query(Team).filter(Team.id == team_id).first()

#     if not team:
#         raise HTTPException(status_code=404, detail="Team not found")

#     if team.owner_id != current_user.id:
#         raise HTTPException(status_code=403, detail="Not allowed")

#     # ✅ DELETE DEPENDENCIES FIRST
#     db.query(Board).filter(Board.team_id == team_id).delete()
#     db.query(TeamMember).filter(TeamMember.team_id == team_id).delete()
#     db.query(TeamInvite).filter(TeamInvite.team_id == team_id).delete()

#     # ✅ THEN DELETE TEAM
#     db.delete(team)
#     db.commit()

#     return {"message": "Team deleted"}


@router.patch("/teams/{team_id}/archive")
def archive_team(
    team_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    team = db.query(Team).filter(Team.id == team_id).first()
 
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
 
    # allow owner or team admin member to archive
    allowed = False
    if team.owner_id == current_user.id:
        allowed = True
    else:
        member = db.query(TeamMember).filter(TeamMember.team_id == team_id, TeamMember.user_id == current_user.id).first()
        if member and getattr(member, "role", "") == "admin":
            allowed = True

    if not allowed:
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

import re

@router.get("/admin/teams")
def get_all_teams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    teams = db.query(Team).all()

    def clean_url(url: str):
        if not url:
            return None

        # ✅ remove HTML tags like <a ...>
        if "<a" in url:
            url = re.sub(r"<.*?>", "", url).strip()

        # ✅ final safety
        if not url.startswith("http"):
            return None

        return url

    return [
        {
            "id": str(team.id),
            "name": team.name,
            "type": team.type,
            "description": team.description,
            "image_url": clean_url(team.image_url),  # ✅ FIXED HERE
            "owner": str(team.owner_id),
            "members_count": db.query(TeamMember)
                .filter(TeamMember.team_id == team.id)
                .count()
        }
        for team in teams
    ]