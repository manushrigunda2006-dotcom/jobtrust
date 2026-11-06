import re
import hashlib
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import CommunityReport, Scan, Report
from app.schemas import CommunityReportCreate, CommunityReportResponse
from app.services.pdf_generator import generate_pdf_report
from app.services.risk_engine import generate_recommendations
from app.schemas import FindingSchema

router = APIRouter(prefix="/reports", tags=["Reports"])

def mask_pii(contact_str: str) -> str:
    """Mask phone numbers and email addresses to protect privacy."""
    if not contact_str:
        return ""
    # Mask email
    def mask_email(match):
        user, domain = match.group(1), match.group(2)
        masked_user = user[0] + "***" if len(user) > 1 else "***"
        return f"{masked_user}@{domain}"

    s = re.sub(r"([a-zA-Z0-9_.+-]+)@([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)", mask_email, contact_str)
    # Mask 10-digit phone
    s = re.sub(r"(\+?\d{1,3}[- ]?)?(\d{2})\d{4,6}(\d{2})", r"\1\2******\3", s)
    return s

@router.post("/submit", response_model=CommunityReportResponse)
def submit_community_report(payload: CommunityReportCreate, db: Session = Depends(get_db)):
    """Submit a suspicious recruitment opportunity to the community alert board."""
    # Compute report hash for duplicate detection
    raw_hash_input = f"{payload.company_name.lower().strip()}_{payload.description.lower().strip()[:100]}"
    report_hash = hashlib.sha256(raw_hash_input.encode("utf-8")).hexdigest()

    # Check for duplicate
    existing = db.query(CommunityReport).filter(CommunityReport.report_hash == report_hash).first()
    if existing:
        raise HTTPException(
            status_code=409,
            detail="A virtually identical community report has already been logged. Thank you for contributing to threat intelligence!"
        )

    # Sanitize contact
    masked_contact = mask_pii(payload.recruiter_contact) if payload.recruiter_contact else None

    report = CommunityReport(
        company_name=payload.company_name.strip(),
        job_title=payload.job_title.strip() if payload.job_title else "Recruitment Scam",
        description=payload.description.strip(),
        website=payload.website.strip() if payload.website else None,
        recruiter_contact=masked_contact,
        evidence_text=payload.evidence_text,
        moderation_status="APPROVED", # In demo, approved immediately
        report_hash=report_hash
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return CommunityReportResponse(
        id=report.id,
        company_name=report.company_name,
        job_title=report.job_title,
        description=report.description,
        website_domain=report.website,
        masked_contact=report.recruiter_contact,
        moderation_status=report.moderation_status,
        created_at=report.created_at
    )

@router.get("/community", response_model=List[CommunityReportResponse])
def get_community_reports(db: Session = Depends(get_db)):
    """Retrieve community-submitted recruitment fraud alerts (PII strictly masked)."""
    reports = db.query(CommunityReport).filter(
        CommunityReport.moderation_status == "APPROVED"
    ).order_by(CommunityReport.created_at.desc()).limit(50).all()

    return [
        CommunityReportResponse(
            id=r.id,
            company_name=r.company_name,
            job_title=r.job_title,
            description=r.description,
            website_domain=r.website,
            masked_contact=r.recruiter_contact,
            moderation_status=r.moderation_status,
            created_at=r.created_at
        )
        for r in reports
    ]

@router.get("/{scan_id}/pdf")
def download_pdf_report(scan_id: str, db: Session = Depends(get_db)):
    """Generate and download a branded JOBTRUST security audit PDF report."""
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found.")

    findings_list = [
        FindingSchema(
            finding_type=f.finding_type,
            severity=f.severity,
            explanation=f.explanation,
            evidence_source=f.evidence_source,
            confidence=f.confidence
        )
        for f in scan.findings
    ]
    recommendations = generate_recommendations(findings_list, scan.risk_score)

    pdf_path = generate_pdf_report(
        scan_id=scan.id,
        scan_type=scan.scan_type,
        company_name=scan.company_name or "Unknown Company",
        opportunity_title=scan.opportunity_title or "Employment Opportunity",
        risk_score=scan.risk_score,
        risk_category=scan.risk_category,
        findings=findings_list,
        recommendations=recommendations
    )

    # Record report
    report_record = Report(
        scan_id=scan.id,
        report_path=pdf_path
    )
    db.add(report_record)
    db.commit()

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"JOBTRUST_Audit_{scan.id[:8]}.pdf"
    )
