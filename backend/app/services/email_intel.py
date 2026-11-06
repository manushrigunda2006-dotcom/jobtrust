import re
import dns.resolver
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from app.models import CompanyRecord
from app.schemas import FindingSchema

FREE_WEBMAIL_DOMAINS = {
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "live.com",
    "aol.com", "icloud.com", "zoho.com", "proton.me", "protonmail.com", "gmx.com", "mail.com"
}

DISPOSABLE_DOMAINS = {
    "mailinator.com", "tempmail.com", "guerrillamail.com", "10minutemail.com",
    "throwawaymail.com", "fakeinbox.com", "yopmail.com", "trashmail.com",
    "dispostable.com", "temp-mail.org", "sharklasers.com", "getairmail.com"
}

def analyze_email_address(
    email: str,
    claimed_company: Optional[str] = None,
    db: Optional[Session] = None
) -> Tuple[List[FindingSchema], str, bool, bool, bool, bool]:
    """
    Analyzes recruiter email address for disposable domains, free webmail spoofing, and DNS MX existence.
    Returns: (findings, domain, is_free, is_disposable, has_mx, domain_mismatch_flag)
    """
    findings: List[FindingSchema] = []
    email_clean = email.strip().lower()

    # Syntax check
    email_pattern = r"^[\w\.-]+@([\w\.-]+\.[a-zA-Z]{2,})$"
    match = re.match(email_pattern, email_clean)
    if not match:
        findings.append(FindingSchema(
            finding_type="INVALID_EMAIL_SYNTAX",
            severity="HIGH",
            explanation=f"'{email}' is not a syntactically valid email address.",
            evidence_source="RFC Email Format Validator",
            confidence=0.99
        ))
        return findings, "", False, False, False, False

    domain = match.group(1)
    is_free = domain in FREE_WEBMAIL_DOMAINS
    is_disposable = domain in DISPOSABLE_DOMAINS
    domain_mismatch_flag = False

    # Check disposable domain
    if is_disposable:
        findings.append(FindingSchema(
            finding_type="DISPOSABLE_EMAIL_DOMAIN",
            severity="CRITICAL",
            explanation=f"Domain '@{domain}' is a known temporary/disposable mailbox service. Legitimate recruiters never use anonymous disposable inboxes.",
            evidence_source="Disposable Email Threat Intelligence Feed",
            confidence=0.99
        ))

    # Check DNS MX record
    has_mx = False
    try:
        resolver = dns.resolver.Resolver()
        resolver.timeout = 2.0
        resolver.lifetime = 2.0
        mx_answers = resolver.resolve(domain, 'MX')
        if len(mx_answers) > 0:
            has_mx = True
    except Exception:
        has_mx = False

    if not has_mx and not is_free and not is_disposable:
        findings.append(FindingSchema(
            finding_type="MISSING_MX_RECORDS",
            severity="HIGH",
            explanation=f"Domain '@{domain}' does not have active MX (Mail Exchange) records configured in DNS. It cannot legitimately receive business emails.",
            evidence_source="DNS MX Resolver",
            confidence=0.88
        ))

    # Compare with claimed company if provided
    if claimed_company and db:
        comp_record = db.query(CompanyRecord).filter(
            CompanyRecord.company_name.ilike(f"%{claimed_company.strip()}%")
        ).first()

        if comp_record:
            official_domain = comp_record.official_domain
            if is_free:
                domain_mismatch_flag = True
                findings.append(FindingSchema(
                    finding_type="RECRUITER_PUBLIC_MAIL_IMPERSONATION",
                    severity="CRITICAL",
                    explanation=f"Sender claims to recruit for '{comp_record.company_name}' ({official_domain}) but contacted from public webmail domain '@{domain}'. This is a prime impersonation signature.",
                    evidence_source="Recruiter Identity Intelligence",
                    confidence=0.95
                ))
            elif domain != official_domain:
                domain_mismatch_flag = True
                findings.append(FindingSchema(
                    finding_type="UNVERIFIED_EMAIL_DOMAIN",
                    severity="HIGH",
                    explanation=f"Sender domain '@{domain}' does not match official corporate domain '@{official_domain}' for '{comp_record.company_name}'.",
                    evidence_source="Recruiter Corporate Registry Cross-Check",
                    confidence=0.92
                ))
        elif is_free:
            findings.append(FindingSchema(
                finding_type="PUBLIC_WEBMAIL_RECRUITER",
                severity="MEDIUM",
                explanation=f"Recruiter uses free webmail domain '@{domain}' while claiming to represent '{claimed_company}'.",
                evidence_source="Email Domain Classification",
                confidence=0.85
            ))

    if not findings:
        findings.append(FindingSchema(
            finding_type="CORPORATE_MAIL_DOMAIN_VALIDATED",
            severity="INFO",
            explanation=f"Email uses custom corporate domain '@{domain}' with active mail exchange records.",
            evidence_source="Email Infrastructure Scanner",
            confidence=0.85
        ))

    return findings, domain, is_free, is_disposable, has_mx, domain_mismatch_flag
