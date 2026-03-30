"""
Migration 001: Add custom request + receipt email columns to dish_requests.

Adds three columns:
  - is_custom (BOOLEAN, default FALSE)
  - custom_note (TEXT, nullable)
  - receipt_email (VARCHAR(256), nullable)

Safe to run multiple times — checks if columns exist before adding.

Usage:
  python -m backend.migrate_001_custom_requests
"""
import os
import sqlite3

DATA_DIR = os.environ.get("DATA_DIR", ".")
DB_PATH = os.path.join(DATA_DIR, "cafe307.db")


def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Get existing columns
    cursor.execute("PRAGMA table_info(dish_requests)")
    existing = {row[1] for row in cursor.fetchall()}

    added = []

    if "is_custom" not in existing:
        cursor.execute("ALTER TABLE dish_requests ADD COLUMN is_custom BOOLEAN NOT NULL DEFAULT 0")
        added.append("is_custom")

    if "custom_note" not in existing:
        cursor.execute("ALTER TABLE dish_requests ADD COLUMN custom_note TEXT")
        added.append("custom_note")

    if "receipt_email" not in existing:
        cursor.execute("ALTER TABLE dish_requests ADD COLUMN receipt_email VARCHAR(256)")
        added.append("receipt_email")

    conn.commit()
    conn.close()

    if added:
        print(f"✅ Added columns: {', '.join(added)}")
    else:
        print("✅ All columns already exist — nothing to do.")


if __name__ == "__main__":
    migrate()
