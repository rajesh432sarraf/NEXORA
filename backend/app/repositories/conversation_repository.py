import json
import os
import logging
from typing import Optional
from abc import ABC, abstractmethod
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import Depends
from app.db.session import get_db
from app.schemas.copilot import SessionContext
from app.models.ai_report import AIReport

logger = logging.getLogger(__name__)

class ConversationRepository(ABC):
    """Abstract interface for Copilot conversation history storage."""
    
    @abstractmethod
    async def save_session(self, session: SessionContext) -> None:
        pass
        
    @abstractmethod
    async def get_session(self, session_id: str) -> Optional[SessionContext]:
        pass

    @abstractmethod
    async def delete_session(self, session_id: str) -> bool:
        pass

class JsonConversationRepository(ConversationRepository):
    """JSON-file based implementation of the conversation storage."""
    
    def __init__(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        self.file_path = os.path.join(base_dir, "storage", "conversation_history.json")
        self._ensure_file_exists()
        
    def _ensure_file_exists(self):
        if not os.path.exists(self.file_path):
            os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump({}, f)
                
    def _load_data(self) -> dict:
        try:
            with open(self.file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error reading {self.file_path}: {e}")
            return {}

    def _save_data(self, data: dict):
        try:
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Error writing to {self.file_path}: {e}")

    async def save_session(self, session: SessionContext) -> None:
        data = self._load_data()
        data[session.session_id] = session.model_dump()
        self._save_data(data)

    async def get_session(self, session_id: str) -> Optional[SessionContext]:
        data = self._load_data()
        if session_id in data:
            return SessionContext(**data[session_id])
        return None

    async def delete_session(self, session_id: str) -> bool:
        data = self._load_data()
        if session_id in data:
            del data[session_id]
            self._save_data(data)
            return True
        return False

class PostgresConversationRepository(ConversationRepository):
    """PostgreSQL implementation of the conversation storage."""
    
    def __init__(self, db: AsyncSession):
        self.db = db

    async def save_session(self, session: SessionContext) -> None:
        stmt = select(AIReport).where(AIReport.report_id == session.session_id, AIReport.report_type == "conversation")
        result = await self.db.execute(stmt)
        existing_report = result.scalars().first()
        
        report_dict = session.model_dump(mode='json')
        if existing_report:
            existing_report.report_data = report_dict
        else:
            new_report = AIReport(
                report_id=session.session_id,
                report_type="conversation",
                report_data=report_dict
            )
            self.db.add(new_report)
            
        await self.db.commit()

    async def get_session(self, session_id: str) -> Optional[SessionContext]:
        stmt = select(AIReport).where(AIReport.report_id == session_id, AIReport.report_type == "conversation")
        result = await self.db.execute(stmt)
        record = result.scalars().first()
        if record:
            return SessionContext(**record.report_data)
        return None

    async def delete_session(self, session_id: str) -> bool:
        stmt = select(AIReport).where(AIReport.report_id == session_id, AIReport.report_type == "conversation")
        result = await self.db.execute(stmt)
        record = result.scalars().first()
        if record:
            await self.db.delete(record)
            await self.db.commit()
            return True
        return False


def get_conversation_repository(db: AsyncSession = Depends(get_db)) -> ConversationRepository:
    return PostgresConversationRepository(db)
