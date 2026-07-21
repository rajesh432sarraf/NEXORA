import json
import os
import logging
from typing import List, Optional
from abc import ABC, abstractmethod
from app.schemas.executive_insights import ExecutiveReport

logger = logging.getLogger(__name__)

class ExecutiveRepository(ABC):
    """Abstract interface for Executive Insights storage."""
    
    @abstractmethod
    async def save_report(self, report: ExecutiveReport) -> None:
        pass
        
    @abstractmethod
    async def get_report(self, report_id: str) -> Optional[ExecutiveReport]:
        pass
        
    @abstractmethod
    async def get_all_reports(self) -> List[ExecutiveReport]:
        pass

class JsonExecutiveRepository(ExecutiveRepository):
    """JSON-file based implementation of the Executive Insights storage."""
    
    def __init__(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        self.file_path = os.path.join(base_dir, "storage", "executive_insights.json")
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

    async def save_report(self, report: ExecutiveReport) -> None:
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

    async def get_report(self, report_id: str) -> Optional[ExecutiveReport]:
        data = self._load_data()
        for existing in data:
            if existing.get("report_id") == report_id:
                return ExecutiveReport(**existing)
        return None

    async def get_all_reports(self) -> List[ExecutiveReport]:
        data = self._load_data()
        return [ExecutiveReport(**r) for r in data]

def get_executive_repository() -> ExecutiveRepository:
    return JsonExecutiveRepository()
