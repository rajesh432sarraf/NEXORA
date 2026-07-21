import logging
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
try:
    import google.generativeai as genai
except ImportError:
    genai = None

from app.core.config import settings
from app.models.document import Document
from app.models.project import Project
from app.services.embedding_service import embedding_service

logger = logging.getLogger(__name__)


if genai and settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)


class RAGService:
    @staticmethod
    async def search_and_answer(
        db: AsyncSession,
        query: str,
        project_id: Optional[str] = None,
        top_k: int = 5,
        generate_answer: bool = True
    ) -> Dict[str, Any]:
        """
        Executes vector similarity search across ingested PDFs and uses RAG to answer natural language queries.
        """
        # 1. Retrieve top matching vector chunks
        raw_results = embedding_service.search(query=query, project_id=project_id, top_k=top_k)

        # 2. Enrich results with Document & Project details from DB
        enriched_results = []
        doc_cache = {}
        project_cache = {}

        for item in raw_results:
            doc_id = item["document_id"]
            if doc_id not in doc_cache:
                stmt = select(Document).where(Document.id == doc_id)
                res = await db.execute(stmt)
                doc_cache[doc_id] = res.scalar_one_or_none()

            doc = doc_cache[doc_id]

            p_id = item.get("project_id") or (doc.project_id if doc else None)
            project_name = None
            if p_id:
                if p_id not in project_cache:
                    p_stmt = select(Project).where(Project.id == p_id)
                    p_res = await db.execute(p_stmt)
                    proj = p_res.scalar_one_or_none()
                    project_cache[p_id] = proj.project_name if proj else None
                project_name = project_cache[p_id]

            enriched_results.append({
                "document_id": doc_id,
                "filename": doc.filename if doc else "Unknown",
                "project_id": p_id,
                "project_name": project_name,
                "score": item["score"],
                "snippet": item["text"]
            })

        # 3. Generate RAG Answer using Gemini
        synthesized_answer = None
        if generate_answer:
            if enriched_results:
                context_blocks = "\n\n".join([
                    f"[Document: {item['filename']} | Project: {item['project_name'] or 'N/A'}]\n{item['snippet']}"
                    for item in enriched_results
                ])

                prompt = f"""
                You are NEXORA AI, an expert EPC Project Intelligence Assistant.
                Answer the user's question accurately based ONLY on the following extracted document context.
                If the context does not contain enough information, state clearly what is known and what is missing.

                Context from Ingested Documents:
                {context_blocks}

                User Question: {query}
                """

                is_valid_key = bool(genai and settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("your_"))
                if is_valid_key:
                    try:
                        model = genai.GenerativeModel('gemini-1.5-pro')
                        response = model.generate_content(prompt)
                        synthesized_answer = response.text.strip()
                    except Exception as e:
                        logger.error(f"Gemini RAG synthesis failed: {e}")
                        synthesized_answer = f"Found {len(enriched_results)} relevant document snippets matching your query."
                else:
                    top_snippet = enriched_results[0]["snippet"]
                    synthesized_answer = f"Based on document '{enriched_results[0]['filename']}': {top_snippet[:300]}"

            else:
                synthesized_answer = "No matching documents or relevant passages were found for your query."

        return {
            "query": query,
            "project_id": project_id,
            "answer": synthesized_answer,
            "total_matches": len(enriched_results),
            "results": enriched_results
        }
