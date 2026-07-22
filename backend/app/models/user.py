from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    role = Column(String(30), default="org_user", nullable=False) # 'org_admin', 'org_user', 'vendor_admin', 'vendor_user'
    org_id = Column(String, ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Backward compatibility for existing service layers
    @property
    def hashed_password(self):
        return self.password_hash

    @hashed_password.setter
    def hashed_password(self, value):
        self.password_hash = value

    @property
    def full_name(self):
        return None

    @full_name.setter
    def full_name(self, value):
        pass

    @property
    def updated_at(self):
        return self.created_at
