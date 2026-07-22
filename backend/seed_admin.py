import asyncio
from app.db.session import AsyncSessionLocal
from app.services.user_service import UserService
from app.schemas.user import UserCreate

async def seed():
    async with AsyncSessionLocal() as db:
        user = await UserService.get_user_by_email(db, "admin@nexora-epc.com")
        if not user:
            new_user = UserCreate(
                email="admin@nexora-epc.com",
                password="Password123!",
                full_name="Rajesh Sarraf (Executive)",
                role="PROJECT_MANAGER"
            )
            await UserService.create_user(db, new_user)
            print("Successfully created default admin user: admin@nexora-epc.com / Password123!")
        else:
            print("Admin user already exists.")

if __name__ == "__main__":
    asyncio.run(seed())
