import fitz  # PyMuPDF
import pdfplumber
import logging

logger = logging.getLogger(__name__)

class ExtractionService:
    @staticmethod
    def extract_text_from_pdf(file_path: str) -> str:
        """
        Extracts text from a PDF file.
        Uses PyMuPDF (fitz) primarily. If no text is found (or on failure), falls back to pdfplumber.
        """
        text = ExtractionService._extract_with_pymupdf(file_path)
        
        # If PyMuPDF returned effectively nothing, try pdfplumber as a fallback
        if not text.strip():
            logger.info(f"PyMuPDF yielded no text for {file_path}, falling back to pdfplumber.")
            text = ExtractionService._extract_with_pdfplumber(file_path)
            
        return text.strip()

    @staticmethod
    def _extract_with_pymupdf(file_path: str) -> str:
        try:
            full_text = []
            with fitz.open(file_path) as doc:
                for page in doc:
                    page_text = page.get_text()
                    if page_text:
                        full_text.append(page_text)
            return "\n".join(full_text)
        except Exception as e:
            logger.error(f"PyMuPDF extraction failed for {file_path}: {e}")
            return ""

    @staticmethod
    def _extract_with_pdfplumber(file_path: str) -> str:
        try:
            full_text = []
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        full_text.append(page_text)
            return "\n".join(full_text)
        except Exception as e:
            logger.error(f"pdfplumber extraction failed for {file_path}: {e}")
            return ""
