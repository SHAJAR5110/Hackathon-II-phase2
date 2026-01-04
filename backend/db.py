"""
Database Configuration and Session Management
Phase II - Todo Full-Stack Web Application

Manages Neon PostgreSQL connection, async session factory, and database initialization.
"""

from sqlmodel import SQLModel, create_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine
from sqlalchemy.orm import sessionmaker
from typing import AsyncGenerator
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError(
        "DATABASE_URL environment variable is not set. "
        "Please configure it in the .env file with your Neon PostgreSQL connection string."
    )

# Convert postgresql:// to postgresql+asyncpg:// for async support
# Allow sqlite for testing purposes
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("sqlite"):
    # Allow SQLite for testing
    pass
elif not DATABASE_URL.startswith("postgresql+asyncpg://"):
    raise ValueError(
        "DATABASE_URL must use PostgreSQL. "
        "Expected format: postgresql://user:password@host/database or sqlite://... for testing"
    )

# Create async engine
# echo=True enables SQL query logging (disable in production)
# SQLite doesn't support connection pooling, so we conditionally set pool options
if DATABASE_URL.startswith("sqlite"):
    engine: AsyncEngine = create_async_engine(
        DATABASE_URL,
        echo=False,  # Disable SQL logging for tests
        future=True,
        connect_args={"check_same_thread": False}  # SQLite specific
    )
else:
    engine: AsyncEngine = create_async_engine(
        DATABASE_URL,
        echo=True,  # Log SQL queries for development
        future=True,
        pool_pre_ping=True,  # Verify connections before using them
        pool_size=10,  # Connection pool size
        max_overflow=20,  # Max overflow connections
    )

# Create async session maker
async_session_maker = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Allow access to objects after commit
    autocommit=False,
    autoflush=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency function that provides an async database session.

    Yields:
        AsyncSession: Database session for executing queries

    Usage:
        @router.get("/tasks")
        async def get_tasks(session: AsyncSession = Depends(get_session)):
            # Use session here
            pass

    The session is automatically committed and closed after the request.
    If an exception occurs, the session is rolled back.
    """
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """
    Initialize database tables.

    Creates all tables defined in SQLModel models if they don't already exist.
    This function should be called on application startup.

    Note: For production, use proper migration tools like Alembic instead of
    creating tables directly. This is for MVP development only.
    """
    from models import User, Task  # Import models to register them

    async with engine.begin() as conn:
        # Create all tables
        await conn.run_sync(SQLModel.metadata.create_all)

    print("✅ Database tables created successfully")


async def close_db() -> None:
    """
    Close database connections.

    Disposes of the engine and all connections in the pool.
    This function should be called on application shutdown.
    """
    await engine.dispose()
    print("✅ Database connections closed")


# Database health check
async def check_db_health() -> bool:
    """
    Check if database connection is healthy.

    Returns:
        bool: True if database is accessible, False otherwise

    Usage:
        health = await check_db_health()
        if not health:
            # Handle database connection error
    """
    try:
        async with async_session_maker() as session:
            # Execute a simple query to verify connection
            await session.execute("SELECT 1")
            return True
    except Exception as e:
        print(f"❌ Database health check failed: {e}")
        return False
