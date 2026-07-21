from typing import Tuple, List
from app.schemas.parsed_document import ParsedDocument
from app.schemas.compliance import MatchDetail
import logging

logger = logging.getLogger(__name__)

class ComparisonService:
    """
    Phase 1: Deterministic comparison of structured fields.
    """
    
    def compare_documents(self, spec: ParsedDocument, vendor: ParsedDocument) -> Tuple[List[MatchDetail], List[MatchDetail], List[MatchDetail], List[MatchDetail]]:
        matched = []
        partial = []
        missing = []
        extra = []
        
        self._compare_lists("Equipment", spec.equipment, vendor.equipment, matched, missing, extra)
        self._compare_lists("Certifications", spec.certifications, vendor.certifications, matched, missing, extra)
        
        self._compare_strings("Warranty", spec.warranty, vendor.warranty, matched, partial, missing)
        self._compare_strings("Delivery Timeline", spec.delivery_time, vendor.delivery_time, matched, partial, missing)
        
        return matched, partial, missing, extra

    def _compare_lists(self, category: str, spec_items: List[str], vendor_items: List[str], matched: List[MatchDetail], missing: List[MatchDetail], extra: List[MatchDetail]):
        spec_set = set(item.lower().strip() for item in (spec_items or []))
        vendor_set = set(item.lower().strip() for item in (vendor_items or []))
        
        if not spec_set and not vendor_set:
            return
            
        for spec_item in spec_set:
            if spec_item in vendor_set:
                matched.append(MatchDetail(item=f"[{category}] {spec_item}", status="Matched"))
            else:
                missing.append(MatchDetail(item=f"[{category}] {spec_item}", status="Missing", notes="Vendor did not provide this."))
                
        for vendor_item in vendor_set:
            if vendor_item not in spec_set:
                extra.append(MatchDetail(item=f"[{category}] {vendor_item}", status="Extra", notes="Vendor offered this extra item."))

    def _compare_strings(self, category: str, spec_str: str, vendor_str: str, matched: List[MatchDetail], partial: List[MatchDetail], missing: List[MatchDetail]):
        spec_val = (spec_str or "").lower().strip()
        vendor_val = (vendor_str or "").lower().strip()
        
        if not spec_val:
            return
            
        if not vendor_val:
            missing.append(MatchDetail(item=category, status="Missing", notes=f"Required: {spec_str}"))
        elif spec_val == vendor_val or spec_val in vendor_val:
            matched.append(MatchDetail(item=category, status="Matched", notes=f"Vendor: {vendor_str}"))
        else:
            partial.append(MatchDetail(item=category, status="Partial", notes=f"Spec: {spec_str} | Vendor: {vendor_str}"))
