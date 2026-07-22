# coding: utf-8
from sqlalchemy import Boolean, CheckConstraint, Column, Date, DateTime, ForeignKey, Integer, JSON, Numeric, String, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.db.session import Base

class Organization(Base):
    __tablename__ = 'organizations'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    legal_name = Column(String(200))
    tax_id = Column(String(50))
    address_json = Column(JSON)
    contact_email = Column(String(200))
    contact_phone = Column(String(50))
    created_at = Column(DateTime(True), nullable=False, server_default=text("now()"))

class Vendor(Base):
    __tablename__ = 'vendors'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(200), nullable=False)
    legal_name = Column(String(200))
    tax_id = Column(String(50))
    address_json = Column(JSON)
    contact_email = Column(String(200))
    contact_phone = Column(String(50))
    status = Column(String(20), nullable=False, server_default=text("'pending'::character varying"))
    created_at = Column(DateTime(True), nullable=False, server_default=text("now()"))

    organization = relationship('Organization')

class Proposal(Base):
    __tablename__ = 'proposals'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rfq_id = Column(UUID(as_uuid=True), ForeignKey('rfqs.id', ondelete='CASCADE'), nullable=False)
    vendor_id = Column(UUID(as_uuid=True), ForeignKey('vendors.id', ondelete='RESTRICT'), nullable=False)
    proposal_document_id = Column(UUID(as_uuid=True), ForeignKey('documents.id', ondelete='RESTRICT'), nullable=False)
    submitted_at = Column(DateTime(True))
    status = Column(String(20), nullable=False, server_default=text("'draft'::character varying"))
    created_at = Column(DateTime(True), nullable=False, server_default=text("now()"))
    updated_at = Column(DateTime(True), nullable=False, server_default=text("now()"))

    proposal_document = relationship('Document')
    rfq = relationship('RFQ')
    vendor = relationship('Vendor')

class BoqItem(Base):
    __tablename__ = 'boq_items'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey('documents.id', ondelete='CASCADE'), nullable=False)
    item_code = Column(String(100))
    description = Column(Text, nullable=False)
    unit = Column(String(30))
    quantity = Column(Numeric(14, 3), nullable=False, server_default=text("0"))
    unit_rate = Column(Numeric(14, 2))
    created_at = Column(DateTime(True), nullable=False, server_default=text("now()"))

    document = relationship('Document')

class DocumentChunk(Base):
    __tablename__ = 'document_chunks'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey('documents.id', ondelete='CASCADE'), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    chunk_text = Column(Text, nullable=False)
    vector_ref = Column(String(255))
    page_number = Column(Integer)
    created_at = Column(DateTime(True), nullable=False, server_default=text("now()"))

    document = relationship('Document')

class ExtractedEntity(Base):
    __tablename__ = 'extracted_entities'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey('documents.id', ondelete='CASCADE'), nullable=False)
    chunk_id = Column(UUID(as_uuid=True), ForeignKey('document_chunks.id', ondelete='SET NULL'))
    entity_type = Column(String(100), nullable=False)
    entity_value = Column(String(500), nullable=False)
    confidence = Column(Numeric(4, 3))
    created_at = Column(DateTime(True), nullable=False, server_default=text("now()"))

    chunk = relationship('DocumentChunk')
    document = relationship('Document')

class KgRelationship(Base):
    __tablename__ = 'kg_relationships'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_entity_id = Column(UUID(as_uuid=True), ForeignKey('extracted_entities.id', ondelete='CASCADE'), nullable=False)
    relationship_type = Column(String(100), nullable=False)
    target_entity_id = Column(UUID(as_uuid=True), ForeignKey('extracted_entities.id', ondelete='CASCADE'), nullable=False)
    created_at = Column(DateTime(True), nullable=False, server_default=text("now()"))

    source_entity = relationship('ExtractedEntity', primaryjoin='KgRelationship.source_entity_id == ExtractedEntity.id')
    target_entity = relationship('ExtractedEntity', primaryjoin='KgRelationship.target_entity_id == ExtractedEntity.id')

class AgentFinding(Base):
    __tablename__ = 'agent_findings'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.id', ondelete='CASCADE'), nullable=False)
    agent_type = Column(String(30), nullable=False)
    related_document_id = Column(UUID(as_uuid=True), ForeignKey('documents.id', ondelete='SET NULL'))
    related_proposal_id = Column(UUID(as_uuid=True), ForeignKey('proposals.id', ondelete='SET NULL'))
    severity = Column(String(10), nullable=False, server_default=text("'info'::character varying"))
    title = Column(String(255), nullable=False)
    detail = Column(Text)
    citation_ref = Column(String(255))
    status = Column(String(20), nullable=False, server_default=text("'open'::character varying"))
    created_at = Column(DateTime(True), nullable=False, server_default=text("now()"))
    resolved_at = Column(DateTime(True))

    project = relationship('Project')
    related_document = relationship('Document')
    related_proposal = relationship('Proposal')

class Quotation(Base):
    __tablename__ = 'quotations'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    proposal_id = Column(UUID(as_uuid=True), ForeignKey('proposals.id', ondelete='CASCADE'), nullable=False)
    quotation_document_id = Column(UUID(as_uuid=True), ForeignKey('documents.id', ondelete='RESTRICT'), nullable=False)
    amount = Column(Numeric(14, 2))
    currency = Column(String(10), nullable=False, server_default=text("'INR'::character varying"))
    valid_until = Column(Date)
    created_at = Column(DateTime(True), nullable=False, server_default=text("now()"))

    proposal = relationship('Proposal')
    quotation_document = relationship('Document')

class ShipmentUpdate(Base):
    __tablename__ = 'shipment_updates'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    proposal_id = Column(UUID(as_uuid=True), ForeignKey('proposals.id', ondelete='CASCADE'), nullable=False)
    status = Column(String(20), nullable=False)
    location_text = Column(String(255))
    eta_date = Column(Date)
    note = Column(Text)
    updated_by_user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'))
    created_at = Column(DateTime(True), nullable=False, server_default=text("now()"))

    proposal = relationship('Proposal')
    updated_by_user = relationship('User')

class VendorScore(Base):
    __tablename__ = 'vendor_scores'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vendor_id = Column(UUID(as_uuid=True), ForeignKey('vendors.id', ondelete='CASCADE'), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.id', ondelete='CASCADE'), nullable=False)
    score = Column(Numeric(5, 2), nullable=False)
    basis_json = Column(JSON)
    computed_at = Column(DateTime(True), nullable=False, server_default=text("now()"))

    project = relationship('Project')
    vendor = relationship('Vendor')

class RiskPrediction(Base):
    __tablename__ = 'risk_predictions'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.id', ondelete='CASCADE'), nullable=False)
    risk_type = Column(String(100), nullable=False)
    likelihood = Column(Numeric(4, 3))
    impact = Column(String(10), nullable=False, server_default=text("'medium'::character varying"))
    description = Column(Text)
    predicted_at = Column(DateTime(True), nullable=False, server_default=text("now()"))

    project = relationship('Project')

class SchedulePrediction(Base):
    __tablename__ = 'schedule_predictions'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.id', ondelete='CASCADE'), nullable=False)
    milestone_name = Column(String(200), nullable=False)
    original_date = Column(Date)
    predicted_date = Column(Date)
    predicted_delay_days = Column(Integer, nullable=False, server_default=text("0"))
    reason = Column(Text)
    predicted_at = Column(DateTime(True), nullable=False, server_default=text("now()"))

    project = relationship('Project')

class ProjectHealthScore(Base):
    __tablename__ = 'project_health_scores'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.id', ondelete='CASCADE'), nullable=False)
    overall_score = Column(Numeric(5, 2), nullable=False)
    procurement_health = Column(Numeric(5, 2))
    schedule_health = Column(Numeric(5, 2))
    quality_health = Column(Numeric(5, 2))
    computed_at = Column(DateTime(True), nullable=False, server_default=text("now()"))

    project = relationship('Project')

class CopilotConversation(Base):
    __tablename__ = 'copilot_conversations'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.id', ondelete='CASCADE'), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = Column(String(255))
    created_at = Column(DateTime(True), nullable=False, server_default=text("now()"))

    project = relationship('Project')
    user = relationship('User')

class CopilotMessage(Base):
    __tablename__ = 'copilot_messages'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey('copilot_conversations.id', ondelete='CASCADE'), nullable=False)
    role = Column(String(10), nullable=False)
    content = Column(Text, nullable=False)
    citation_refs_json = Column(JSON)
    created_at = Column(DateTime(True), nullable=False, server_default=text("now()"))

    conversation = relationship('CopilotConversation')