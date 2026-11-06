import os
import uuid
import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models import Scan, ScanFinding, UploadedDocument
from app.schemas import (
    JobAnalysisRequest, JobAnalysisResponse,
    CompanyAnalysisRequest, CompanyAnalysisResponse,
    EmailAnalysisRequest, EmailAnalysisResponse,
    UrlAnalysisRequest, UrlAnalysisResponse,
    OfferLetterAnalysisResponse,
    RecruiterTrustGraphResponse
)
from app.services.nlp_analyzer import analyze_job_text
from app.services.company_verifier import verify_company
from app.services.email_intel import analyze_email_address
from app.services.url_security import analyze_url_security
from app.services.offer_letter_forensics import analyze_offer_letter
from app.services.recruiter_graph import build_recruiter_trust_graph
from app.services.risk_engine import calculate_risk_assessment
from app.config import settings

router = APIRouter(prefix="/analyze", tags=["Analysis"])

@router.post("/job", response_model=JobAnalysisResponse)
def analyze_job(req: JobAnalysisRequest, db: Session = Depends(get_db)):
    """Analyze a pasted job description for scam indicators and upfront payment demands."""
    findings, nlp_score, entities = analyze_job_text(req.job_text, req.company_name)
    risk_assessment = calculate_risk_assessment(findings)

    company = req.company_name or entities.company_name or "Unspecified Entity"
    title = req.job_title or entities.job_title or "Job Opportunity"

    # Persist scan to database
    scan = Scan(
        scan_type="job",
        company_name=company,
        opportunity_title=title,
        submitted_content=req.job_text[:1000],
        risk_score=risk_assessment.score,
        risk_category=risk_assessment.category
    )
    db.add(scan)
    db.flush()

    for f in findings:
        finding_record = ScanFinding(
            scan_id=scan.id,
            finding_type=f.finding_type,
            severity=f.severity,
            explanation=f.explanation,
            evidence_source=f.evidence_source,
            confidence=f.confidence
        )
        db.add(finding_record)

    db.commit()
    db.refresh(scan)

    return JobAnalysisResponse(
        scan_id=scan.id,
        extracted_entities=entities,
        nlp_model_score=round(nlp_score, 1),
        risk_assessment=risk_assessment,
        created_at=scan.created_at
    )

@router.post("/company", response_model=CompanyAnalysisResponse)
def analyze_company(req: CompanyAnalysisRequest, db: Session = Depends(get_db)):
    """Verify company authenticity against trusted registry and inspect domain integrity."""
    findings, is_in_registry, trusted_domain, domain_sec = verify_company(
        db=db,
        company_name=req.company_name,
        website=req.company_website,
        recruiter_email=req.recruiter_email
    )
    risk_assessment = calculate_risk_assessment(findings)

    scan = Scan(
        scan_type="company",
        company_name=req.company_name,
        opportunity_title=f"Company Verification: {req.company_name}",
        submitted_content=json.dumps({"website": req.company_website, "email": req.recruiter_email}),
        risk_score=risk_assessment.score,
        risk_category=risk_assessment.category
    )
    db.add(scan)
    db.flush()

    for f in findings:
        db.add(ScanFinding(
            scan_id=scan.id,
            finding_type=f.finding_type,
            severity=f.severity,
            explanation=f.explanation,
            evidence_source=f.evidence_source,
            confidence=f.confidence
        ))

    db.commit()
    db.refresh(scan)

    # Check email match flag
    email_match = None
    if req.recruiter_email and trusted_domain:
        email_clean = req.recruiter_email.strip().lower()
        if "@" in email_clean:
            email_match = (email_clean.split("@")[-1] == trusted_domain)

    return CompanyAnalysisResponse(
        scan_id=scan.id,
        company_name=req.company_name,
        is_in_trusted_registry=is_in_registry,
        trusted_domain=trusted_domain,
        domain_security=domain_sec,
        email_domain_match=email_match,
        risk_assessment=risk_assessment,
        created_at=scan.created_at
    )

@router.post("/email", response_model=EmailAnalysisResponse)
def analyze_email(req: EmailAnalysisRequest, db: Session = Depends(get_db)):
    """Analyze recruiter email address for disposable mail, webmail spoofing, and DNS MX records."""
    findings, domain, is_free, is_disposable, has_mx, mismatch = analyze_email_address(
        email=req.email,
        claimed_company=req.claimed_company,
        db=db
    )
    risk_assessment = calculate_risk_assessment(findings)

    scan = Scan(
        scan_type="email",
        company_name=req.claimed_company or "Unknown Company",
        opportunity_title=f"Email Audit: {req.email}",
        submitted_content=req.email,
        risk_score=risk_assessment.score,
        risk_category=risk_assessment.category
    )
    db.add(scan)
    db.flush()

    for f in findings:
        db.add(ScanFinding(
            scan_id=scan.id,
            finding_type=f.finding_type,
            severity=f.severity,
            explanation=f.explanation,
            evidence_source=f.evidence_source,
            confidence=f.confidence
        ))

    db.commit()
    db.refresh(scan)

    return EmailAnalysisResponse(
        scan_id=scan.id,
        email=req.email,
        domain=domain,
        is_free_provider=is_free,
        is_disposable=is_disposable,
        has_mx_records=has_mx,
        domain_mismatch_flag=mismatch,
        risk_assessment=risk_assessment,
        created_at=scan.created_at
    )

@router.post("/url", response_model=UrlAnalysisResponse)
def analyze_url(req: UrlAnalysisRequest, db: Session = Depends(get_db)):
    """Analyze recruitment URL for shorteners, raw IP hosts, lookalike brands, and phishing patterns."""
    findings, details = analyze_url_security(req.url, req.claimed_company)
    risk_assessment = calculate_risk_assessment(findings)

    scan = Scan(
        scan_type="url",
        company_name=req.claimed_company or "URL Target",
        opportunity_title=f"URL Inspection: {details.get('domain', req.url)}",
        submitted_content=req.url,
        risk_score=risk_assessment.score,
        risk_category=risk_assessment.category
    )
    db.add(scan)
    db.flush()

    for f in findings:
        db.add(ScanFinding(
            scan_id=scan.id,
            finding_type=f.finding_type,
            severity=f.severity,
            explanation=f.explanation,
            evidence_source=f.evidence_source,
            confidence=f.confidence
        ))

    db.commit()
    db.refresh(scan)

    return UrlAnalysisResponse(
        scan_id=scan.id,
        url=req.url,
        domain=details.get("domain", ""),
        is_shortener=details.get("is_shortener", False),
        is_ip_address=details.get("is_ip_address", False),
        suspicious_keywords_found=details.get("suspicious_keywords_found", []),
        threat_intel_result=details.get("threat_intel_result", "Clean"),
        threat_intel_source=details.get("threat_intel_source", "JOBTRUST Local Engine"),
        risk_assessment=risk_assessment,
        created_at=scan.created_at
    )

@router.post("/offer-letter", response_model=OfferLetterAnalysisResponse)
async def analyze_offer_letter_upload(
    file: UploadFile = File(...),
    claimed_company: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """Upload and forensically analyze an offer letter (PDF, PNG, JPG)."""
    allowed_exts = [".pdf", ".png", ".jpg", ".jpeg"]
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail="Only PDF, PNG, and JPG files are supported.")

    # Save to disk with safe randomized name
    safe_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as f_out:
        content = await file.read()
        f_out.write(content)

    # Forensic analysis
    findings, extracted = analyze_offer_letter(file_path, claimed_company)
    risk_assessment = calculate_risk_assessment(findings)

    comp_name = extracted.company_name or claimed_company or "Unknown Entity"
    job_title = extracted.job_title or "Offered Role"

    scan = Scan(
        scan_type="offer_letter",
        company_name=comp_name,
        opportunity_title=f"Offer Letter: {comp_name} - {job_title}",
        submitted_content=f"Uploaded file: {file.filename}",
        risk_score=risk_assessment.score,
        risk_category=risk_assessment.category
    )
    db.add(scan)
    db.flush()

    # Save document record
    doc_record = UploadedDocument(
        scan_id=scan.id,
        filename=file.filename,
        extracted_text=extracted.raw_text_preview,
        storage_path=file_path,
        file_type=ext
    )
    db.add(doc_record)

    for f in findings:
        db.add(ScanFinding(
            scan_id=scan.id,
            finding_type=f.finding_type,
            severity=f.severity,
            explanation=f.explanation,
            evidence_source=f.evidence_source,
            confidence=f.confidence
        ))

    db.commit()
    db.refresh(scan)

    return OfferLetterAnalysisResponse(
        scan_id=scan.id,
        filename=file.filename,
        extracted_data=extracted,
        risk_assessment=risk_assessment,
        created_at=scan.created_at
    )

@router.post("/trust-graph", response_model=RecruiterTrustGraphResponse)
def analyze_trust_graph(
    claimed_company: str = Form(...),
    recruiter_email: Optional[str] = Form(None),
    website: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """Build the Recruiter Trust Graph comparing claimed company, email domains, and website portals."""
    graph_response = build_recruiter_trust_graph(
        db=db,
        claimed_company=claimed_company,
        recruiter_email=recruiter_email,
        website=website
    )

    # Persist scan
    scan = Scan(
        id=graph_response.scan_id,
        scan_type="trust_graph",
        company_name=claimed_company,
        opportunity_title=f"Trust Graph: {claimed_company}",
        submitted_content=json.dumps({"email": recruiter_email, "website": website}),
        risk_score=graph_response.risk_assessment.score,
        risk_category=graph_response.risk_assessment.category
    )
    db.add(scan)
    db.flush()

    for f in graph_response.risk_assessment.findings:
        db.add(ScanFinding(
            scan_id=scan.id,
            finding_type=f.finding_type,
            severity=f.severity,
            explanation=f.explanation,
            evidence_source=f.evidence_source,
            confidence=f.confidence
        ))

    db.commit()
    return graph_response
