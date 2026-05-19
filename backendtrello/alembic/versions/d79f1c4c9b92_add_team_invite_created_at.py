"""Add created_at to team_invites

Revision ID: d79f1c4c9b92
Revises: 9e5c06a1b951
Create Date: 2026-05-18 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'd79f1c4c9b92'
down_revision = '9e5c06a1b951'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'team_invites',
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False)
    )


def downgrade() -> None:
    op.drop_column('team_invites', 'created_at')
