"""
SQLite engine and session for Cafe 307 backend.

SQLAlchemy setup has three layers:
  engine       -- the low-level connection pool to the SQLite file
  SessionLocal -- a factory that creates new database sessions
  Base         -- the declarative base class all models inherit from
"""
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# DATA_DIR controls where the SQLite file lives on disk.
# In production on Render, this points to a persistent disk mount
# (e.g. /opt/render/project/data) so the database survives deploys.
# Locally it defaults to "." (the repo root).
DATA_DIR = os.environ.get("DATA_DIR", ".")
DB_PATH = os.path.join(DATA_DIR, "cafe307.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

# check_same_thread=False is required because SQLite normally only
# allows the thread that created a connection to use it. FastAPI
# handles requests across multiple threads, so we disable that
# check and let SQLAlchemy's session scoping manage safety instead.
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

# SessionLocal is a session factory, not an actual session. Each
# call to SessionLocal() creates an independent database session.
# autocommit=False means we control transactions explicitly.
# autoflush=False prevents surprise SQL before we're ready.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base is the declarative base that all ORM models inherit from.
# It provides the metaclass magic that maps Python classes to SQL
# tables. See models.py for the classes that extend it.
Base = declarative_base()


def get_db():
    """
    FastAPI dependency that yields a database session.

    This is a generator ("yield") dependency -- FastAPI calls next()
    to get the session, injects it into the route handler, then
    resumes the generator after the route returns so the finally
    block always closes the session. This guarantees connections
    are returned to the pool even if the route raises an exception.

    Usage in routes:  db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
