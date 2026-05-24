"""Run this script to normalize existing list titles in the database to canonical names.

Usage: (from backendtrello folder)
    .\.venv\Scripts\Activate.ps1
    python scripts\normalize_list_titles.py

This will update rows in `lists` table mapping common variants to:
 - "To Do"
 - "In Progress"
 - "Done"

Be sure you have a DB backup or run inside a transaction in production.
"""

from app.core.database import engine
from sqlalchemy import text

queries = [
    ("UPDATE lists SET title = 'To Do' WHERE LOWER(title) IN ('todo','pending','to do')"),
    ("UPDATE lists SET title = 'In Progress' WHERE LOWER(title) IN ('progress','inprogress','in progress','doing')"),
    ("UPDATE lists SET title = 'Done' WHERE LOWER(title) IN ('done','completed')"),
]

with engine.connect() as conn:
    for q in queries:
        res = conn.execute(text(q))
        print(f"Executed: {q} -- rows affected: {res.rowcount}")
    conn.commit()

print("Normalization complete.")
