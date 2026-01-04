"""
Authentication Service
Phase II - Todo Full-Stack Web Application

Handles user signup, signin, password hashing, and JWT token generation.
"""

from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from typing import Optional
import os
import uuid
from dotenv import load_dotenv

from models import User, SignupRequest, SigninRequest, UserResponse, AuthResponse

# Load environment variables
load_dotenv()

# Password hashing context (bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
BETTER_AUTH_SECRET = os.getenv("BETTER_AUTH_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_DAYS = int(os.getenv("JWT_EXPIRATION_DAYS", "7"))

if not BETTER_AUTH_SECRET:
    raise ValueError("BETTER_AUTH_SECRET environment variable is not set")


class AuthService:
    """
    Authentication service for user signup, signin, and token management.

    Methods:
        hash_password: Hash a plain-text password using bcrypt
        verify_password: Verify a password against its hash
        create_jwt_token: Generate a JWT token for a user
        signup: Create a new user account
        signin: Authenticate a user and issue a token
    """

    @staticmethod
    def hash_password(password: str) -> str:
        """
        Hash a plain-text password using bcrypt.

        Args:
            password: Plain-text password

        Returns:
            str: Bcrypt-hashed password

        Security:
            - Uses bcrypt with automatic salt generation
            - Hash is computationally expensive (prevents brute-force)
        """
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Verify a plain-text password against its hash.

        Args:
            plain_password: User-provided password
            hashed_password: Stored bcrypt hash

        Returns:
            bool: True if password matches, False otherwise

        Security:
            - Timing-safe comparison (prevents timing attacks)
        """
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def create_jwt_token(user_id: str, email: str) -> str:
        """
        Generate a JWT token for a user.

        Args:
            user_id: User's unique identifier
            email: User's email address

        Returns:
            str: JWT token string

        Token Payload:
            - sub: User ID (subject)
            - email: User's email
            - iat: Issued at timestamp
            - exp: Expiration timestamp (7 days from issuance)

        Security:
            - Signed with BETTER_AUTH_SECRET (HS256)
            - Fixed 7-day expiry (no automatic refresh in MVP)
        """
        now = datetime.utcnow()
        expiration = now + timedelta(days=JWT_EXPIRATION_DAYS)

        payload = {
            "sub": user_id,
            "email": email,
            "iat": now,
            "exp": expiration
        }

        return jwt.encode(payload, BETTER_AUTH_SECRET, algorithm=JWT_ALGORITHM)

    @staticmethod
    async def get_user_by_email(session: AsyncSession, email: str) -> Optional[User]:
        """
        Retrieve a user by email address.

        Args:
            session: Database session
            email: User's email address

        Returns:
            Optional[User]: User object if found, None otherwise
        """
        statement = select(User).where(User.email == email.lower())
        result = await session.execute(statement)
        return result.scalar_one_or_none()

    @staticmethod
    async def signup(
        session: AsyncSession,
        signup_data: SignupRequest
    ) -> AuthResponse:
        """
        Create a new user account and issue a JWT token.

        Args:
            session: Database session
            signup_data: User signup request (email, password, name)

        Returns:
            AuthResponse: User data and JWT token

        Raises:
            ValueError: If email is already registered

        Process:
            1. Check if email already exists (409 Conflict)
            2. Hash password with bcrypt
            3. Generate unique user ID (UUID)
            4. Create user record in database
            5. Generate JWT token (7-day expiry)
            6. Return user data and token

        Security:
            - Password is hashed before storage (never stored in plaintext)
            - Email is normalized to lowercase
            - User ID is a UUID v4 (unpredictable)
        """
        # Check if email already exists
        existing_user = await AuthService.get_user_by_email(session, signup_data.email)
        if existing_user:
            raise ValueError("Email already registered")

        # Hash password
        password_hash = AuthService.hash_password(signup_data.password)

        # Generate user ID
        user_id = str(uuid.uuid4())

        # Create user
        new_user = User(
            id=user_id,
            email=signup_data.email.lower(),
            password_hash=password_hash,
            name=signup_data.name,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        session.add(new_user)
        await session.commit()
        await session.refresh(new_user)

        # Generate JWT token
        token = AuthService.create_jwt_token(new_user.id, new_user.email)

        # Return response
        user_response = UserResponse(
            id=new_user.id,
            email=new_user.email,
            name=new_user.name,
            created_at=new_user.created_at
        )

        return AuthResponse(
            user=user_response,
            token=token,
            expires_in=JWT_EXPIRATION_DAYS * 24 * 60 * 60  # 7 days in seconds
        )

    @staticmethod
    async def signin(
        session: AsyncSession,
        signin_data: SigninRequest
    ) -> AuthResponse:
        """
        Authenticate a user and issue a JWT token.

        Args:
            session: Database session
            signin_data: User signin request (email, password)

        Returns:
            AuthResponse: User data and JWT token

        Raises:
            ValueError: If email doesn't exist or password is incorrect

        Process:
            1. Retrieve user by email
            2. Verify password against stored hash
            3. Generate JWT token (7-day expiry)
            4. Return user data and token

        Security:
            - Generic error message (don't reveal if email exists)
            - Timing-safe password comparison
            - Password hash never exposed in response
        """
        # Retrieve user
        user = await AuthService.get_user_by_email(session, signin_data.email)

        # Verify credentials
        if not user or not AuthService.verify_password(signin_data.password, user.password_hash):
            # Generic error message (don't reveal if email exists)
            raise ValueError("Invalid email or password")

        # Generate JWT token
        token = AuthService.create_jwt_token(user.id, user.email)

        # Return response
        user_response = UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            created_at=user.created_at
        )

        return AuthResponse(
            user=user_response,
            token=token,
            expires_in=JWT_EXPIRATION_DAYS * 24 * 60 * 60  # 7 days in seconds
        )
