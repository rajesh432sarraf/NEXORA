import asyncio
from app.db.session import AsyncSessionLocal
from app.services.user_service import UserService
from app.schemas.user import UserCreate

async def create_hardcoded_admin():
    async with AsyncSessionLocal() as db:
        admin_data = UserCreate(
            email="admin@nexora.com",
            password="password123",
            first_name="Admin",
            last_name="User",
            role="admin"
        )
        
        # Check if already exists
        existing = await UserService.get_user_by_email(db, email=admin_data.email)
        if not existing:
            user = await UserService.create_user(db=db, user_in=admin_data)
            print(f"✅ Hardcoded admin created! Email: {user.email}")
        else:
            print(f"✅ Admin already exists! Email: {existing.email}")

if __name__ == "__main__":
    asyncio.run(create_hardcoded_admin())
