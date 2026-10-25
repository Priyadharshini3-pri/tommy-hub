import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://tommyhub_user:changeme@localhost:3306/tommy_hub",
)

is_postgres = DATABASE_URL.startswith(("postgres://", "postgresql://", "postgresql+psycopg://"))
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

engine_kwargs = {"pool_pre_ping": True, "pool_recycle": 300}
if is_postgres:
    # Supabase transaction pooling does not support server-side prepared statements.
    engine_kwargs["connect_args"] = {"prepare_threshold": None}

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
