"""merge heads

Revision ID: c7662e4748f6
Revises: 755f8b589b33, e34f1a2c5b7d
Create Date: 2026-05-29 16:39:36.086787

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c7662e4748f6'
down_revision: Union[str, Sequence[str], None] = ('755f8b589b33', 'e34f1a2c5b7d')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
