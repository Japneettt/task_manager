"""merge heads

Revision ID: 755f8b589b33
Revises: 19b4ef141920, add_badge_to_cards
Create Date: 2026-05-29 11:50:07.753676

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '755f8b589b33'
down_revision: Union[str, Sequence[str], None] = ('19b4ef141920', 'add_badge_to_cards')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
