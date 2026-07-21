from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    dashboard,
    project,
    document,
    search,
    rfq,
    purchase_order,
    procurement,
    timeline,
    compliance,
    vendor_evaluation,
    risk,
    executive_insights
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(project.router, prefix="/projects", tags=["projects"])
api_router.include_router(document.router, prefix="/documents", tags=["documents"])
api_router.include_router(search.router, prefix="/search", tags=["search"])
api_router.include_router(rfq.router, prefix="/rfqs", tags=["rfqs"])
api_router.include_router(purchase_order.router, prefix="/purchase-orders", tags=["purchase-orders"])
api_router.include_router(procurement.router, prefix="/procurement", tags=["procurement"])
api_router.include_router(timeline.router, prefix="/timeline", tags=["timeline"])
api_router.include_router(compliance.router, prefix="/compliance", tags=["compliance"])
api_router.include_router(vendor_evaluation.router, prefix="/vendor-evaluation", tags=["vendor-evaluation"])
api_router.include_router(risk.router, prefix="/risk", tags=["risk"])
api_router.include_router(executive_insights.router, prefix="/executive-insights", tags=["executive-insights"])
