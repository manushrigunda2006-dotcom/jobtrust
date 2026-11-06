import datetime
import uuid
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    scans = relationship("Scan", back_populates="user")
    community_reports = relationship("CommunityReport", back_populates="user")

class Scan(Base):
    __tablename__ = "scans"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    scan_type = Column(String(50), nullable=False, index=True) # job, company, email, url, offer_letter, trust_graph
    company_name = Column(String(255), nullable=True, index=True)
    opportunity_title = Column(String(255), nullable=True)
    submitted_content = Column(Text, nullable=True)
    risk_score = Column(Float, nullable=False, default=0.0)
    risk_category = Column(String(50), nullable=False) # Lower observed risk, Moderate risk indicators, High risk indicators, Very high risk indicators
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    user = relationship("User", back_populates="scans")
    findings = relationship("ScanFinding", back_populates="scan", cascade="all, delete-orphan")
    documents = relationship("UploadedDocument", back_populates="scan", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="scan", cascade="all, delete-orphan")

class CompanyRecord(Base):
    __tablename__ = "company_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_name = Column(String(255), index=True, nullable=False)
    official_domain = Column(String(255), unique=True, index=True, nullable=False)
    verification_source = Column(String(255), nullable=False, default="Official Corporate Registry")
    verification_status = Column(String(50), nullable=False, default="VERIFIED_AUTHENTIC") # VERIFIED_AUTHENTIC, FLAGGED, UNDER_REVIEW
    industry = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ScanFinding(Base):
    __tablename__ = "scan_findings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    scan_id = Column(String(36), ForeignKey("scans.id"), nullable=False, index=True)
    finding_type = Column(String(100), nullable=False)
    severity = Column(String(50), nullable=False) # CRITICAL, HIGH, MEDIUM, LOW, INFO
    explanation = Column(Text, nullable=False)
    evidence_source = Column(String(255), nullable=False)
    confidence = Column(Float, default=0.85)

    scan = relationship("Scan", back_populates="findings")

class UploadedDocument(Base):
    __tablename__ = "uploaded_documents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    scan_id = Column(String(36), ForeignKey("scans.id"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    extracted_text = Column(Text, nullable=True)
    storage_path = Column(String(512), nullable=False)
    file_type = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    scan = relationship("Scan", back_populates="documents")

class CommunityReport(Base):
    __tablename__ = "community_reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    company_name = Column(String(255), nullable=False, index=True)
    job_title = Column(String(255), nullable=True)
    description = Column(Text, nullable=False)
    website = Column(String(255), nullable=True)
    recruiter_contact = Column(String(255), nullable=True)
    evidence_text = Column(Text, nullable=True)
    moderation_status = Column(String(50), nullable=False, default="APPROVED") # PENDING, APPROVED, REJECTED
    report_hash = Column(String(64), nullable=True, index=True) # For duplicate detection
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    user = relationship("User", back_populates="community_reports")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    scan_id = Column(String(36), ForeignKey("scans.id"), nullable=False, index=True)
    report_path = Column(String(512), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    scan = relationship("Scan", back_populates="reports")
