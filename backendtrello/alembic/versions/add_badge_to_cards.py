"""add badge field to cards

Revision ID: add_badge_to_cards
Revises: 15a1111f496a
Create Date: 2026-05-29 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_badge_to_cards'
down_revision = '15a1111f496a'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ✅ Add badge column to cards table
    op.add_column('cards', sa.Column('badge', sa.String(), nullable=True))


def downgrade() -> None:
    # ✅ Remove badge column from cards table
    op.drop_column('cards', 'badge')
