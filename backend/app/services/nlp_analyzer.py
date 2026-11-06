import re
from typing import Dict, Any, List, Tuple
from app.services.data_loader import train_or_load_nlp_model
from app.schemas import FindingSchema, JobExtractedEntities

# Initialize model
vectorizer, classifier = train_or_load_nlp_model()

# Regex rules for high-precision fraud indicator extraction
PAYMENT_PATTERNS = [
    (r"(registration\s*fee|training\s*fee|security\s*deposit|documentation\s*charge|caution\s*deposit|onboarding\s*fee|laptop\s*deposit)", "CRITICAL", "Upfront Fee Demand", "Legitimate employers never require candidates to pay registration, training, or equipment deposits."),
    (r"(pay\s*(rs\.?|inr|₹|\$)\s*[\d,]+|deposit\s*(rs\.?|inr|₹|\$)\s*[\d,]+)", "CRITICAL", "Monetary Deposit Request", "The text explicitly specifies an advance cash payment or deposit requirement."),
    (r"(refundable\s*deposit|refundable\s*security|refundable\s*fee)", "HIGH", "Misleading 'Refundable' Fee Tactic", "Scammers commonly claim deposits are '100% refundable' to lower victim skepticism before disappearing."),
    (r"(google\s*pay|phonepe|paytm|upi\s*id|crypto|wire\s*transfer)", "HIGH", "Direct P2P Payment Demand", "Demands payment via personal UPI, cryptocurrency, or wire transfer rather than corporate accounting channels.")
]

GUARANTEED_JOB_PATTERNS = [
    (r"(100%\s*guaranteed\s*(job|selection|placement)|guaranteed\s*selection|direct\s*joining|no\s*interview\s*(needed|required)?|appointment\s*letter\s*direct)", "HIGH", "Guaranteed Job Without Assessment", "Legitimate companies do not promise guaranteed employment without standard technical and behavioral evaluations."),
    (r"(immediate\s*appointment\s*letter|direct\s*selection\s*without\s*exam)", "HIGH", "Unverified Direct Appointment", "Offers immediate appointment without screening or credential verification.")
]

PRESSURE_PATTERNS = [
    (r"(offer\s*expires\s*in\s*\d+\s*(hours|hrs|minutes)|only\s*\d+\s*seats?\s*left|urgent\s*joining\s*today|act\s*fast\s*before\s*closing)", "MEDIUM", "Artificial Urgency & Pressure Tactics", "Scammers use manufactured time pressure to coerce victims into making impulsive financial transfers."),
    (r"(limited\s*slots?\s*available|last\s*chance\s*to\s*confirm)", "LOW", "Scarcity Pressure Phrase", "High-pressure urgency language designed to prevent candidates from verifying authenticity.")
]

UNREALISTIC_SALARY_PATTERNS = [
    (r"(earn\s*(rs\.?|inr|₹|\$)\s*[\d,]+\s*(per\s*day|daily|per\s*hour|hourly))", "HIGH", "Unrealistic Earning Claims", "Daily or hourly earning promises that drastically exceed industry standards for non-specialized roles."),
    (r"(earn\s*[\d,]+\s*daily\s*by\s*watching|copy\s*paste\s*work\s*earn)", "CRITICAL", "Task/Click Scam Pattern", "Classic recruitment scam pattern promising high daily income for superficial tasks like watching videos or copy-pasting.")
]

SUSPICIOUS_COMMUNICATION_PATTERNS = [
    (r"(contact\s*on\s*whatsapp|whatsapp\s*hr|telegram\s*(group|username|handle|id))", "MEDIUM", "Off-Platform Messaging Channel", "Recruitment conducted exclusively through encrypted consumer messaging apps like WhatsApp or Telegram rather than corporate applicant tracking systems.")
]

def extract_entities(text: str) -> JobExtractedEntities:
    """Extract key recruitment entities from text."""
    entities = JobExtractedEntities()
    
    # Extract Email
    email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
    if email_match:
        entities.contact_email = email_match.group(0)

    # Extract Salary
    salary_match = re.search(r"(₹|rs\.?|inr|\$)\s*[\d,]+(\s*-\s*[\d,]+)?(\s*(lpa|per\s*month|pm|per\s*annum|monthly|daily|per\s*day))?", text, re.IGNORECASE)
    if salary_match:
        entities.salary_mentioned = salary_match.group(0)

    # Extract Fee
    fee_match = re.search(r"(fee|deposit|charge)\s*(of|is)?\s*(₹|rs\.?|inr|\$)?\s*[\d,]+", text, re.IGNORECASE)
    if fee_match:
        entities.registration_or_fee = fee_match.group(0)

    # Detect Application channel
    if re.search(r"telegram", text, re.IGNORECASE):
        entities.application_channel = "Telegram Channel / Handle"
    elif re.search(r"whatsapp", text, re.IGNORECASE):
        entities.application_channel = "WhatsApp Direct Message"
    elif re.search(r"careers\.", text, re.IGNORECASE):
        entities.application_channel = "Official Careers Portal"

    # Employment type
    if re.search(r"intern(ship)?", text, re.IGNORECASE):
        entities.employment_type = "Internship"
    elif re.search(r"full[- ]time", text, re.IGNORECASE):
        entities.employment_type = "Full-Time"
    elif re.search(r"part[- ]time", text, re.IGNORECASE):
        entities.employment_type = "Part-Time / Remote"

    # Extract Title if prominent
    title_match = re.search(r"(role|job\s*title|position|designation)\s*[:\-]\s*([A-Za-z0-9\s]+)", text, re.IGNORECASE)
    if title_match:
        entities.job_title = title_match.group(2).strip()[:50]

    # Extract Company if stated
    comp_match = re.search(r"(company|organization|employer|at|firm)\s*[:\-]\s*([A-Za-z0-9\s]+)", text, re.IGNORECASE)
    if comp_match:
        entities.company_name = comp_match.group(2).strip()[:50]

    return entities

def analyze_job_text(text: str, claimed_company: str = None) -> Tuple[List[FindingSchema], float, JobExtractedEntities]:
    """
    Analyzes job description text using both NLP classification and rule-based heuristics.
    Returns: (findings, nlp_scam_probability, extracted_entities)
    """
    findings: List[FindingSchema] = []
    entities = extract_entities(text)

    # 1. Machine Learning Model Inference
    X_vec = vectorizer.transform([text])
    probabilities = classifier.predict_proba(X_vec)[0]
    nlp_scam_probability = float(probabilities[1]) * 100.0

    if nlp_scam_probability > 65.0:
        findings.append(FindingSchema(
            finding_type="ML_TEXT_ANOMALY",
            severity="HIGH" if nlp_scam_probability > 80 else "MEDIUM",
            explanation=f"Our trained NLP classification model flagged language patterns typical of recruitment fraud (Statistical scam probability: {nlp_scam_probability:.1f}%).",
            evidence_source="Trained TF-IDF + Logistic Regression NLP Engine",
            confidence=round(nlp_scam_probability / 100.0, 2)
        ))

    # 2. Rule-Based Heuristic Extraction
    # Check Advance Payment / Fee Demands
    for pattern, severity, label, explanation in PAYMENT_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            match_str = str(matches[0]) if isinstance(matches[0], str) else matches[0][0]
            findings.append(FindingSchema(
                finding_type="PAYMENT_DEMAND",
                severity=severity,
                explanation=f"{explanation} Detected phrase: '{match_str}'.",
                evidence_source="Job Description Text Analysis",
                confidence=0.95
            ))
            break # Flag highest severity once per category

    # Check Guaranteed Job Promises
    for pattern, severity, label, explanation in GUARANTEED_JOB_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            match_str = str(matches[0]) if isinstance(matches[0], str) else matches[0][0]
            findings.append(FindingSchema(
                finding_type="GUARANTEED_JOB_PROMISE",
                severity=severity,
                explanation=f"{explanation} Detected phrase: '{match_str}'.",
                evidence_source="Job Description Text Analysis",
                confidence=0.90
            ))
            break

    # Check Pressure Tactics
    for pattern, severity, label, explanation in PRESSURE_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            match_str = str(matches[0]) if isinstance(matches[0], str) else matches[0][0]
            findings.append(FindingSchema(
                finding_type="PRESSURE_TACTIC",
                severity=severity,
                explanation=f"{explanation} Detected phrase: '{match_str}'.",
                evidence_source="Job Description Text Analysis",
                confidence=0.85
            ))
            break

    # Check Unrealistic Salary Claims
    for pattern, severity, label, explanation in UNREALISTIC_SALARY_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            match_str = str(matches[0]) if isinstance(matches[0], str) else matches[0][0]
            findings.append(FindingSchema(
                finding_type="SALARY_ANOMALY",
                severity=severity,
                explanation=f"{explanation} Detected phrase: '{match_str}'.",
                evidence_source="Job Description Text Analysis",
                confidence=0.88
            ))
            break

    # Check Suspicious Communication
    for pattern, severity, label, explanation in SUSPICIOUS_COMMUNICATION_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            match_str = str(matches[0]) if isinstance(matches[0], str) else matches[0][0]
            findings.append(FindingSchema(
                finding_type="SUSPICIOUS_COMMUNICATION_CHANNEL",
                severity=severity,
                explanation=f"{explanation} Detected mention: '{match_str}'.",
                evidence_source="Job Description Text Analysis",
                confidence=0.82
            ))
            break

    # Check if contact email is a free provider while claiming a corporate identity
    if entities.contact_email and claimed_company:
        domain = entities.contact_email.split("@")[-1].lower()
        if domain in ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"]:
            findings.append(FindingSchema(
                finding_type="FREE_EMAIL_FOR_CORPORATION",
                severity="HIGH",
                explanation=f"The job listing claims to represent '{claimed_company}' but directs applicants to a public webmail address ({entities.contact_email}). Major corporations use official enterprise domains.",
                evidence_source="Contact Email Verification",
                confidence=0.92
            ))

    # Positive findings if legitimate signals are present
    if not findings:
        findings.append(FindingSchema(
            finding_type="NO_OBVIOUS_FRAUD_PATTERNS",
            severity="INFO",
            explanation="No upfront fees, guaranteed placement promises, or suspicious pressure tactics were identified in this job description.",
            evidence_source="NLP Rule-Engine & Lexical Scanner",
            confidence=0.80
        ))

    return findings, nlp_scam_probability, entities
