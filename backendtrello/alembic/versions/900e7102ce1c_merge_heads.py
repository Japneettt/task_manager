"""merge heads

Revision ID: 900e7102ce1c
Revises: 2c5ccb9e2ee6, 9ce196cab2a6
Create Date: 2026-05-13 23:14:39.005656

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '900e7102ce1c'
down_revision: Union[str, Sequence[str], None] = ('2c5ccb9e2ee6', '9ce196cab2a6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
