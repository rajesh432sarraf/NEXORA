import json
import os
import logging
from typing import List, Optional
from abc import ABC, abstractmethod
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import Depends
from app.db.session import get_db
from app.schemas.vendor_evaluation import EvaluationReport
from app.models.ai_report import AIReport

logger = logging.getLogger(__name__)

class VendorEvaluationRepository(ABC):
    """Abstract interface for Vendor Evaluation storage."""
    
    @abstractmethod
    async def save_report(self, report: EvaluationReport) -> None:
        pass
        
    @abstractmethod
    async def get_report(self, report_id: str) -> Optional[EvaluationReport]:
        pass
        
    @abstractmethod
    async def get_all_reports(self) -> List[EvaluationReport]:
        pass

class JsonVendorEvaluationRepository(VendorEvaluationRepository):
    """JSON-file based implementation of the Vendor Evaluation storage."""
    
    def __init__(self):
        # Store locally independent of PostgreSQL
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        self.file_path = os.path.join(base_dir, "storage", "vendor_evaluations.json")
        self._ensure_file_exists()
        
    def _ensure_file_exists(self):
        if not os.path.exists(self.file_path):
            os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump([], f)
                
    def _load_data(self) -> List[dict]:
        try:
            with open(self.file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error reading {self.file_path}: {e}")
            return []

    def _save_data(self, data: List[dict]):
        try:
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Error writing to {self.file_path}: {e}")

    async def save_report(self, report: EvaluationReport) -> None:
        data = self._load_data()
        
        updated = False
        report_dict = report.model_dump()
        for i, existing in enumerate(data):
            if existing.get("report_id") == report.report_id:
                data[i] = report_dict
                updated = True
                break
                
        if not updated:
            data.append(report_dict)
            
        self._save_data(data)

    async def get_report(self, report_id: str) -> Optional[EvaluationReport]:
        data = self._load_data()
        for existing in data:
            if existing.get("report_id") == report_id:
                return EvaluationReport(**existing)
        return None

    async def get_all_reports(self) -> List[EvaluationReport]:
        data = self._load_data()
        return [EvaluationReport(**r) for r in data]

class PostgresVendorEvaluationRepository(VendorEvaluationRepository):
    """PostgreSQL implementation of the Vendor Evaluation storage."""
    
    def __init__(self, db: AsyncSession):
        self.db = db

    async def save_report(self, report: EvaluationReport) -> None:
        stmt = select(AIReport).where(AIReport.report_id == report.report_id, AIReport.report_type == "vendor")
        result = await self.db.execute(stmt)
        existing_report = result.scalars().first()
        
        report_dict = report.model_dump(mode='json')
        if existing_report:
            existing_report.report_data = report_dict
        else:
            new_report = AIReport(
                report_id=report.report_id,
                report_type="vendor",
                report_data=report_dict
            )
            self.db.add(new_report)
            
        await self.db.commit()

    async def get_report(self, report_id: str) -> Optional[EvaluationReport]:
        stmt = select(AIReport).where(AIReport.report_id == report_id, AIReport.report_type == "vendor")
        result = await self.db.execute(stmt)
        record = result.scalars().first()
        if record:
            return EvaluationReport(**record.report_data)
        return None

    async def get_all_reports(self) -> List[EvaluationReport]:
        stmt = select(AIReport).where(AIReport.report_type == "vendor")
        result = await self.db.execute(stmt)
        records = result.scalars().all()
        return [EvaluationReport(**record.report_data) for record in records]

def get_vendor_repository(db: AsyncSession = Depends(get_db)) -> VendorEvaluationRepository:
    return PostgresVendorEvaluationRepository(db)
