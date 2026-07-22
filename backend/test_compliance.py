import asyncio
import uuid
import json
from datetime import datetime

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

import app.db.base
from app.models.document import Document
from app.schemas.compliance import ComplianceComparisonRequest
from app.services.compliance.compliance_engine import ComplianceEngine
from app.repositories.compliance_repository import PostgresComplianceRepository
from app.db.session import AsyncSessionLocal


async def test_compliance():
    # 1. Setup DB directly with Postgres session maker
    async_session = AsyncSessionLocal
    
    spec_id = str(uuid.uuid4())
    vendor_id = str(uuid.uuid4())
    
    spec_metadata = {
        "equipment": ["HVAC Unit Type A", "Backup Generator 500kW", "Transformer 1MVA"],
        "certifications": ["ISO 9001", "CE"],
        "warranty": "5 years comprehensive",
        "delivery_time": "12 weeks"
    }
    
    vendor_metadata = {
        "equipment": ["HVAC Unit Type A", "Backup Generator 600kW"],
        "certifications": ["ISO 9001"],
        "warranty": "3 years limited",
        "delivery_time": "10 weeks",
        "quoted_price": "$120,000"
    }
    
    async with async_session() as db:
        # Create dummy spec
        spec_doc = Document(
            id=spec_id, file_name="spec.pdf", file_mime_type="application/pdf", file_size_bytes=100, file_storage_url="dummy"
        )
        # Create dummy vendor
        vendor_doc = Document(
            id=vendor_id, file_name="vendor.pdf", file_mime_type="application/pdf", file_size_bytes=100, file_storage_url="dummy"
        )
        db.add_all([spec_doc, vendor_doc])
        await db.commit()
        
    print(f"Created Spec Document: {spec_id}")
    print(f"Created Vendor Document: {vendor_id}")
    
    # 2. Run Compliance Engine
    print("\nRunning Compliance Engine...")
    async with async_session() as db:
        repo = PostgresComplianceRepository(db)
        engine_svc = ComplianceEngine(repo)
        report = await engine_svc.generate_compliance_report(spec_id, vendor_id, db)
        
    print("\nReport Generated Successfully!")
    print(f"Overall Score: {report.overall_score}")
    print(f"Status: {report.status}")
    print(f"\nMissing Items: {[m.item for m in report.missing_requirements]}")
    print(f"Partial Matches: {[m.item for m in report.partial_matches]}")
    
    print("\nChecking History Repository...")
    async with async_session() as db:
        repo = PostgresComplianceRepository(db)
        history = await repo.get_all_reports()
    print(f"Total reports in repository: {len(history)}")

if __name__ == "__main__":
    asyncio.run(test_compliance())
