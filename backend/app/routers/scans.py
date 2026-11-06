from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Scan, ScanFinding
from app.schemas import ScanHistoryItem, RiskAssessmentSchema, FindingSchema
from app.services.risk_engine import generate_recommendations

router = APIRouter(prefix="/scans", tags=["Scans"])

@router.get("/history", response_model=List[ScanHistoryItem])
def get_scan_history(
    limit: int = Query(30, ge=1, le=100),
    scan_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieve historical verification scans."""
    query = db.query(Scan).order_by(Scan.created_at.desc())
    if scan_type:
        query = query.filter(Scan.scan_type == scan_type)
    
    scans = query.limit(limit).all()

    result = []
    for s in scans:
        result.append(ScanHistoryItem(
            id=s.id,
            scan_type=s.scan_type,
            company_name=s.company_name,
            opportunity_title=s.opportunity_title,
            risk_score=s.risk_score,
            risk_category=s.risk_category,
            created_at=s.created_at,
            findings_count=len(s.findings)
        ))
    return result

@router.get("/{scan_id}")
def get_scan_details(scan_id: str, db: Session = Depends(get_db)):
    """Retrieve full details, findings, and recommendations for a specific scan."""
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

    color = "green"
    if scan.risk_score >= 80:
        color = "red"
    elif scan.risk_score >= 60:
        color = "orange"
    elif scan.risk_score >= 30:
        color = "amber"

    recommendations = generate_recommendations(findings_list, scan.risk_score)

    risk_assessment = RiskAssessmentSchema(
        score=scan.risk_score,
        category=scan.risk_category,
        color=color,
        findings=findings_list,
        recommended_actions=recommendations
    )

    return {
        "id": scan.id,
        "scan_type": scan.scan_type,
        "company_name": scan.company_name,
        "opportunity_title": scan.opportunity_title,
        "submitted_content": scan.submitted_content,
        "created_at": scan.created_at,
        "risk_assessment": risk_assessment
    }
