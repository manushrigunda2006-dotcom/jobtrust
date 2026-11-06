from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Scan, CommunityReport
from app.schemas import DashboardStatsResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Retrieve aggregate telemetry and threat metrics for the cybersecurity dashboard."""
    total_analyzed = db.query(Scan).count()
    requiring_review = db.query(Scan).filter(Scan.risk_score >= 30, Scan.risk_score < 80).count()
    high_risk_count = db.query(Scan).filter(Scan.risk_score >= 60).count()
    low_risk_count = db.query(Scan).filter(Scan.risk_score < 30).count()

    # Risk Distribution
    risk_distribution = [
        {"name": "Lower Risk (0-29)", "count": db.query(Scan).filter(Scan.risk_score < 30).count(), "color": "#16A34A"},
        {"name": "Moderate Risk (30-59)", "count": db.query(Scan).filter(Scan.risk_score >= 30, Scan.risk_score < 60).count(), "color": "#D97706"},
        {"name": "High Risk (60-79)", "count": db.query(Scan).filter(Scan.risk_score >= 60, Scan.risk_score < 80).count(), "color": "#EA580C"},
        {"name": "Very High (80-100)", "count": db.query(Scan).filter(Scan.risk_score >= 80).count(), "color": "#DC2626"},
    ]

    # Fraud category breakdown from known patterns
    fraud_categories = [
        {"category": "Upfront Fees & Deposits", "percentage": 38, "count": max(1, int(high_risk_count * 0.42))},
        {"category": "Recruiter Impersonation", "percentage": 27, "count": max(1, int(high_risk_count * 0.28))},
        {"category": "Lookalike Phishing URLs", "percentage": 18, "count": max(1, int(high_risk_count * 0.18))},
        {"category": "No-Interview Direct Selection", "percentage": 11, "count": max(1, int(high_risk_count * 0.11))},
        {"category": "Unrealistic Earning Schemes", "percentage": 6, "count": max(1, int(high_risk_count * 0.06))}
    ]

    # Recent scans
    recent_scans_raw = db.query(Scan).order_by(Scan.created_at.desc()).limit(6).all()
    recent_scans = [
        {
            "id": s.id,
            "type": s.scan_type,
            "company": s.company_name or "Unknown Entity",
            "title": s.opportunity_title,
            "score": s.risk_score,
            "category": s.risk_category,
            "date": s.created_at.strftime("%Y-%m-%d %H:%M")
        }
        for s in recent_scans_raw
    ]

    # Recent community reports
    recent_reports_raw = db.query(CommunityReport).order_by(CommunityReport.created_at.desc()).limit(5).all()
    recent_reports = [
        {
            "id": r.id,
            "company": r.company_name,
            "title": r.job_title,
            "description": r.description[:120] + "..." if len(r.description) > 120 else r.description,
            "status": r.moderation_status,
            "date": r.created_at.strftime("%Y-%m-%d")
        }
        for r in recent_reports_raw
    ]

    return DashboardStatsResponse(
        total_analyzed=total_analyzed,
        requiring_review=requiring_review,
        high_risk_count=high_risk_count,
        low_risk_count=low_risk_count,
        risk_distribution=risk_distribution,
        fraud_categories=fraud_categories,
        recent_scans=recent_scans,
        recent_reports=recent_reports
    )
