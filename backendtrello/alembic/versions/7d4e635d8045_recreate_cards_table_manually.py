"""recreate cards table manually

Revision ID: 7d4e635d8045
Revises: 15a1111f496a
Create Date: 2026-05-18
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision: str = '7d4e635d8045'
down_revision: Union[str, Sequence[str], None] = '15a1111f496a'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ✅ CREATE CARDS TABLE
    op.create_table(
        'cards',

        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),

        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),

        sa.Column('position', sa.Integer(), nullable=False),

        sa.Column('list_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('board_id', postgresql.UUID(as_uuid=True), nullable=False),

        sa.Column('assigned_to', postgresql.UUID(as_uuid=True), nullable=True),

        sa.Column('priority', sa.String(), nullable=True),

        sa.Column('due_date', sa.DateTime(), nullable=True),

        sa.Column('is_archived', sa.Boolean(), default=False),

        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),

        sa.Column('depends_on', postgresql.UUID(as_uuid=True), nullable=True),
    )


def downgrade() -> None:
    # ✅ DROP TABLE IF ROLLBACK
    op.drop_table('cards')

