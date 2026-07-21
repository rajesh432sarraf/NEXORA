from typing import List, Optional
from pydantic import BaseModel, Field

class ParsedDocument(BaseModel):
    document_type: Optional[str] = Field(None, description="Type of the document, e.g., RFQ, Technical Specification, BOQ, etc.")
    project_name: Optional[str] = Field(None, description="Name of the project")
    organization: Optional[str] = Field(None, description="Organization or client name")
    vendor_name: Optional[str] = Field(None, description="Vendor or supplier name")
    equipment: Optional[List[str]] = Field(default_factory=list, description="List of major equipment or items")
    quoted_price: Optional[str] = Field(None, description="Total quoted price or value")
    currency: Optional[str] = Field(None, description="Currency of the quoted price")
    delivery_time: Optional[str] = Field(None, description="Delivery time, schedule, or duration")
    warranty: Optional[str] = Field(None, description="Warranty period or terms")
    certifications: Optional[List[str]] = Field(default_factory=list, description="Required or provided certifications")
    important_dates: Optional[List[str]] = Field(default_factory=list, description="Important dates mentioned in the document")
    summary: Optional[str] = Field(None, description="A brief summary of the document")
    keywords: Optional[List[str]] = Field(default_factory=list, description="Key tags or keywords relevant to the document")
