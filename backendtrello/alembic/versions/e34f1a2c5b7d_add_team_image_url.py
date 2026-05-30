"""Add team image_url column

Revision ID: e34f1a2c5b7d
Revises: 15a1111f496a
Create Date: 2026-05-29 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'e34f1a2c5b7d'
down_revision: Union[str, Sequence[str], None] = '15a1111f496a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('teams', sa.Column('image_url', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('teams', 'image_url')
