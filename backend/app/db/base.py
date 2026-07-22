from app.db.session import Base

# Import the backward compatible models we updated
from app.models.document import Document
from app.models.project import Project
from app.models.user import User
from app.models.rfq import RFQ
from app.models.purchase_order import PurchaseOrder
from app.models.procurement import ProcurementItem
from app.models.timeline import Milestone

# Import all other generated models that didn't have previous placeholders
from app.models.models_generated_reference import (
    Organization,
    Vendor,
    Proposal,
    Quotation,
    ShipmentUpdate,
    BoqItem,
    DocumentChunk,
    ExtractedEntity,
    KgRelationship,
    AgentFinding,
    VendorScore,
    RiskPrediction,
    SchedulePrediction,
    ProjectHealthScore,
    CopilotConversation,
    CopilotMessage
)
