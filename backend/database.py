from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv, find_dotenv
import os

load_dotenv(find_dotenv())

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/leadgen")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
