from typing import List, Dict, Any, Tuple
from app.schemas import FindingSchema, RiskAssessmentSchema

# Severity base weights
SEVERITY_WEIGHTS = {
    "CRITICAL": 35.0,
    "HIGH": 20.0,
    "MEDIUM": 10.0,
    "LOW": 5.0,
    "INFO": 0.0
}

# Finding type specific modifiers to avoid double-counting
CATEGORY_LIMITS = {
    "PAYMENT": 40.0,
    "IMPERSONATION": 35.0,
    "PHISHING_URL": 30.0,
    "NLP_PATTERNS": 25.0,
    "DOCUMENT_ANOMALY": 30.0
}

def generate_recommendations(findings: List[FindingSchema], score: float) -> List[str]:
    """Generates targeted, protective next steps based on specific warning signals."""
    actions = []
    
    has_payment = any("PAYMENT" in f.finding_type or "FEE" in f.finding_type or "DEPOSIT" in f.explanation.upper() for f in findings)
    has_impersonation = any("IMPERSONATION" in f.finding_type or "MISMATCH" in f.finding_type or "LOOKALIKE" in f.finding_type for f in findings)
    has_free_mail = any("WEBMAIL" in f.finding_type or "PUBLIC_MAIL" in f.finding_type for f in findings)
    has_shortener = any("SHORTENER" in f.finding_type or "URL" in f.finding_type for f in findings)

    if has_payment:
        actions.append("DO NOT SEND ANY MONEY: Genuine employers, internships, and recruiters NEVER require fees for registration, training kits, background checks, or laptop dispatch.")
    
    if has_impersonation or has_free_mail:
        actions.append("Verify directly via official company careers portal (e.g., search for the job requisition ID on the company's verified domain, not via links sent in messages).")
        actions.append("Contact the company's official corporate HR or Talent Acquisition switchboard to verify whether the recruiter's name and email are genuine employees.")

    if has_shortener:
        actions.append("Avoid entering credentials, bank details, or personal identity numbers (Aadhaar, SSN, PAN) on unverified web forms or shortened links.")

    if score >= 60:
        actions.append("Report this recruiter/listing to your university placement cell and submit a community report on JOBTRUST to protect fellow students.")
    elif score >= 30:
        actions.append("Proceed with caution: Request a formal interview via official enterprise video conferencing (Teams, Meet, Zoom with corporate email invitations) before sharing sensitive personal records.")
    else:
        actions.append("Standard diligence: While risk indicators are low, always confirm official offer letters directly through the company's human resources department.")

    return actions

def calculate_risk_assessment(findings: List[FindingSchema]) -> RiskAssessmentSchema:
    """
    Fuses findings from all active modules into a transparent, bounded 0-100 risk score.
    """
    if not findings:
        return RiskAssessmentSchema(
            score=5.0,
            category="Lower observed risk",
            color="green",
            findings=[],
            recommended_actions=["Standard vigilance: Verify official offer letters through HR."]
        )

    # Accumulate scores grouped by high-level category to prevent unbounded double-counting
    cat_scores = {
        "PAYMENT": 0.0,
        "IMPERSONATION": 0.0,
        "PHISHING_URL": 0.0,
        "NLP_PATTERNS": 0.0,
        "DOCUMENT_ANOMALY": 0.0
    }

    critical_count = 0
    high_count = 0

    for f in findings:
        weight = SEVERITY_WEIGHTS.get(f.severity.upper(), 0.0)
        
        if f.severity == "CRITICAL":
            critical_count += 1
        elif f.severity == "HIGH":
            high_count += 1

        t = f.finding_type.upper()
        if "PAYMENT" in t or "FEE" in t or "DEPOSIT" in t:
            cat_scores["PAYMENT"] = min(CATEGORY_LIMITS["PAYMENT"], cat_scores["PAYMENT"] + weight)
        elif "LOOKALIKE" in t or "MISMATCH" in t or "IMPERSONATION" in t or "WEBMAIL" in t:
            cat_scores["IMPERSONATION"] = min(CATEGORY_LIMITS["IMPERSONATION"], cat_scores["IMPERSONATION"] + weight)
        elif "URL" in t or "PHISHING" in t or "IP_BASED" in t or "HOMOGRAPH" in t:
            cat_scores["PHISHING_URL"] = min(CATEGORY_LIMITS["PHISHING_URL"], cat_scores["PHISHING_URL"] + weight)
        elif "OFFER" in t or "PDF" in t or "DOCUMENT" in t:
            cat_scores["DOCUMENT_ANOMALY"] = min(CATEGORY_LIMITS["DOCUMENT_ANOMALY"], cat_scores["DOCUMENT_ANOMALY"] + weight)
        else:
            cat_scores["NLP_PATTERNS"] = min(CATEGORY_LIMITS["NLP_PATTERNS"], cat_scores["NLP_PATTERNS"] + weight)

    raw_sum = sum(cat_scores.values())

    # Compounding bonus for multiple independent high/critical signals
    synergy_factor = 1.0
    if critical_count >= 2:
        synergy_factor = 1.2
    elif critical_count >= 1 and high_count >= 1:
        synergy_factor = 1.1

    final_score = min(100.0, round(raw_sum * synergy_factor, 1))

    # Determine risk category & color
    if final_score >= 80.0:
        category = "Very high risk indicators"
        color = "red"
    elif final_score >= 60.0:
        category = "High risk indicators"
        color = "orange"
    elif final_score >= 30.0:
        category = "Moderate risk indicators"
        color = "amber"
    else:
        category = "Lower observed risk"
        color = "green"

    recommendations = generate_recommendations(findings, final_score)

    return RiskAssessmentSchema(
        score=final_score,
        category=category,
        color=color,
        findings=findings,
        recommended_actions=recommendations
    )
