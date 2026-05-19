"""merge heads

Revision ID: 44b53c6c2c6b
Revises: 7d4e635d8045, d79f1c4c9b92
Create Date: 2026-05-18 20:16:08.730567

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '44b53c6c2c6b'
down_revision: Union[str, Sequence[str], None] = ('7d4e635d8045', 'd79f1c4c9b92')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
