from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.document import Document
from app.models.project import Project
from app.schemas.document import DocumentResponse, DocumentUpdate
from app.schemas.parsed_document import ParsedDocument
from app.services.storage_service import StorageService
from app.services.document_service import DocumentService
from app.services.document_engine.parser_service import ParserService

router = APIRouter()
parser_service = ParserService()

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    project_id: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db)
):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    if project_id:
        p_stmt = select(Project).where(Project.id == project_id)
        p_res = await db.execute(p_stmt)
        if not p_res.scalar_one_or_none():
            raise HTTPException(status_code=404, detail=f"Project with ID '{project_id}' not found.")
        
    try:
        # Save file and get size
        file_path, file_size = await StorageService.save_upload_file(file)
        
        # Create DB record
        db_document = Document(
            filename=file.filename,
            content_type=file.content_type or "application/pdf",
            file_size=file_size,
            file_path=file_path,
            project_id=project_id,
            status="PENDING"
        )
        db.add(db_document)
        await db.commit()
        await db.refresh(db_document)
        
        # Process document synchronously to return text preview & vector embeddings
        await DocumentService.process_document_synchronously(db_document.id, db)
        await db.refresh(db_document)
        
        return db_document
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Document).where(Document.id == document_id)
    result = await db.execute(stmt)
    document = result.scalar_one_or_none()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
        
    return document

@router.put("/{document_id}", response_model=DocumentResponse, summary="Associate or update document project")
async def update_document(
    document_id: str,
    doc_in: DocumentUpdate,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Document).where(Document.id == document_id)
    result = await db.execute(stmt)
    document = result.scalar_one_or_none()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc_in.project_id:
        p_stmt = select(Project).where(Project.id == doc_in.project_id)
        p_res = await db.execute(p_stmt)
        if not p_res.scalar_one_or_none():
            raise HTTPException(status_code=404, detail=f"Project with ID '{doc_in.project_id}' not found.")

    document.project_id = doc_in.project_id
    await db.commit()
    await db.refresh(document)
    return document

@router.get("", response_model=List[DocumentResponse])
async def list_documents(
    project_id: Optional[str] = Query(None, description="Filter documents by associated project ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Document)
    if project_id:
        stmt = stmt.where(Document.project_id == project_id)
    stmt = stmt.offset(skip).limit(limit)
    result = await db.execute(stmt)
    documents = result.scalars().all()
    return documents

@router.post("/{document_id}/parse", response_model=ParsedDocument)
async def parse_document(
    document_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Parses the extracted text of a document into structured JSON using Gemini.
    """
    try:
        parsed_data = await parser_service.parse_document(document_id, db)
        return parsed_data
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


