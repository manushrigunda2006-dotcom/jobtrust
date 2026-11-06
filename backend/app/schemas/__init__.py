from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class FindingSchema(BaseModel):
    finding_type: str
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW, INFO
    explanation: str
    evidence_source: str
    confidence: float = 0.85

class RiskAssessmentSchema(BaseModel):
    score: float = Field(..., ge=0, le=100)
    category: str  # 'Lower observed risk', 'Moderate risk indicators', 'High risk indicators', 'Very high risk indicators'
    color: str    # green, amber, orange, red
    findings: List[FindingSchema] = []
    recommended_actions: List[str] = []
    disclaimer: str = (
        "Automated risk scores indicate probabilistic anomaly flags. "
        "They do not establish definitive legal fraud or replace human due diligence."
    )

# 1. Job Description Schemas
class JobAnalysisRequest(BaseModel):
    job_text: str = Field(..., min_length=20, description="Raw job description or vacancy text")
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    source_url: Optional[str] = None

class JobExtractedEntities(BaseModel):
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    salary_mentioned: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    experience_level: Optional[str] = None
    registration_or_fee: Optional[str] = None
    contact_email: Optional[str] = None
    application_channel: Optional[str] = None

class JobAnalysisResponse(BaseModel):
    scan_id: str
    extracted_entities: JobExtractedEntities
    nlp_model_score: float
    risk_assessment: RiskAssessmentSchema
    created_at: datetime

# 2. Company Analysis Schemas
class CompanyAnalysisRequest(BaseModel):
    company_name: str
    company_website: Optional[str] = None
    recruiter_email: Optional[str] = None

class DomainSecurityInfo(BaseModel):
    domain: str
    is_valid_syntax: bool = True
    has_https: bool = False
    has_dns_mx: bool = False
    has_dns_a: bool = False
    is_lookalike: bool = False
    target_legitimate_domain: Optional[str] = None
    similarity_score: float = 0.0

class CompanyAnalysisResponse(BaseModel):
    scan_id: str
    company_name: str
    is_in_trusted_registry: bool
    trusted_domain: Optional[str] = None
    domain_security: Optional[DomainSecurityInfo] = None
    email_domain_match: Optional[bool] = None
    risk_assessment: RiskAssessmentSchema
    created_at: datetime

# 3. Email Analysis Schemas
class EmailAnalysisRequest(BaseModel):
    email: str
    claimed_company: Optional[str] = None

class EmailAnalysisResponse(BaseModel):
    scan_id: str
    email: str
    domain: str
    is_free_provider: bool
    is_disposable: bool
    has_mx_records: bool
    domain_mismatch_flag: bool
    risk_assessment: RiskAssessmentSchema
    created_at: datetime

# 4. URL Analysis Schemas
class UrlAnalysisRequest(BaseModel):
    url: str
    claimed_company: Optional[str] = None

class UrlAnalysisResponse(BaseModel):
    scan_id: str
    url: str
    domain: str
    is_shortener: bool
    is_ip_address: bool
    suspicious_keywords_found: List[str] = []
    threat_intel_result: str
    threat_intel_source: str
    risk_assessment: RiskAssessmentSchema
    created_at: datetime

# 5. Offer Letter Analysis Schemas
class OfferLetterExtractedData(BaseModel):
    candidate_name: Optional[str] = None
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    salary_offered: Optional[str] = None
    joining_date: Optional[str] = None
    hr_contact_name: Optional[str] = None
    hr_contact_email: Optional[str] = None
    offer_ref_number: Optional[str] = None
    payment_requested: Optional[str] = None
    raw_text_preview: Optional[str] = None

class OfferLetterAnalysisResponse(BaseModel):
    scan_id: str
    filename: str
    extracted_data: OfferLetterExtractedData
    risk_assessment: RiskAssessmentSchema
    created_at: datetime

# 6. Recruiter Trust Graph Schemas
class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # 'company', 'website', 'email', 'offer', 'warning'
    status: str # 'verified', 'suspicious', 'mismatch', 'neutral'
    metadata: Dict[str, Any] = {}

class GraphEdge(BaseModel):
    source: str
    target: str
    label: str
    status: str # 'valid', 'invalid', 'warning'

class RecruiterTrustGraphResponse(BaseModel):
    scan_id: str
    claimed_company: str
    trusted_official_domain: Optional[str] = None
    recruiter_email: Optional[str] = None
    website_domain: Optional[str] = None
    nodes: List[GraphNode] = []
    edges: List[GraphEdge] = []
    impersonation_detected: bool
    verdict_summary: str
    risk_assessment: RiskAssessmentSchema

# 7. Community Reports Schemas
class CommunityReportCreate(BaseModel):
    company_name: str
    job_title: Optional[str] = None
    description: str
    website: Optional[str] = None
    recruiter_contact: Optional[str] = None
    evidence_text: Optional[str] = None

class CommunityReportResponse(BaseModel):
    id: int
    company_name: str
    job_title: Optional[str] = None
    description: str
    website_domain: Optional[str] = None
    masked_contact: Optional[str] = None
    moderation_status: str
    created_at: datetime

# 8. Dashboard & History Schemas
class DashboardStatsResponse(BaseModel):
    total_analyzed: int
    requiring_review: int
    high_risk_count: int
    low_risk_count: int
    risk_distribution: List[Dict[str, Any]]
    fraud_categories: List[Dict[str, Any]]
    recent_scans: List[Dict[str, Any]]
    recent_reports: List[Dict[str, Any]]

class ScanHistoryItem(BaseModel):
    id: str
    scan_type: str
    company_name: Optional[str] = None
    opportunity_title: Optional[str] = None
    risk_score: float
    risk_category: str
    created_at: datetime
    findings_count: int
