import re
import tldextract
import dns.resolver
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models import CompanyRecord
from app.schemas import FindingSchema, DomainSecurityInfo

# Homoglyphs and visual confusion map
CONFUSABLES = {
    'o': ['0', 'o'],
    '0': ['o', '0'],
    'l': ['1', 'i', 'l'],
    '1': ['l', 'i', '1'],
    'i': ['1', 'l', 'i'],
    'm': ['rn', 'm'],
    'w': ['vv', 'w']
}

def clean_domain(url_or_domain: str) -> str:
    """Extract registered domain and suffix cleanly."""
    if not url_or_domain:
        return ""
    url_or_domain = url_or_domain.strip().lower()
    if not url_or_domain.startswith("http://") and not url_or_domain.startswith("https://"):
        url_or_domain = "https://" + url_or_domain
    extracted = tldextract.extract(url_or_domain)
    if extracted.suffix:
        return f"{extracted.domain}.{extracted.suffix}"
    return extracted.domain

def calculate_levenshtein(s1: str, s2: str) -> int:
    """Calculate edit distance between two strings."""
    if len(s1) < len(s2):
        return calculate_levenshtein(s2, s1)
    if len(s2) == 0:
        return len(s1)

    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]

def normalize_brand_homoglyphs(name: str) -> str:
    """Normalize common typosquatting homoglyphs."""
    return name.replace("0", "o").replace("1", "l").replace("rn", "m").replace("vv", "w")

def detect_lookalike(domain: str, trusted_domain: str) -> Tuple[bool, float]:
    """
    Detect if domain is a lookalike/typosquatted version of a trusted domain.
    E.g. micros0ft.com vs microsoft.com, micros0ft-careers.com vs microsoft.com
    """
    d1 = tldextract.extract(domain).domain.lower()
    d2 = tldextract.extract(trusted_domain).domain.lower()

    if d1 == d2:
        return False, 1.0  # Exact match

    d1_norm = normalize_brand_homoglyphs(d1)
    d2_norm = normalize_brand_homoglyphs(d2)

    # Check tokens split by hyphens/underscores (e.g. micros0ft-careers -> ['microsoft', 'careers'])
    tokens = re.split(r"[-_.]", d1_norm)
    for token in tokens:
        if token == d2_norm:
            return True, 0.95
        token_dist = calculate_levenshtein(token, d2_norm)
        token_max = max(len(token), len(d2_norm))
        if token_dist <= 2 and token_max > 0 and (1.0 - (token_dist / token_max)) >= 0.70:
            return True, round(1.0 - (token_dist / token_max), 2)

    # Check prefix/suffix spoofing with homoglyphs normalized (e.g., microsoft-jobs, amazon-verify)
    if d2_norm in d1_norm and d1_norm != d2_norm:
        return True, 0.88

    # Check edit distance on full string
    dist = calculate_levenshtein(d1_norm, d2_norm)
    max_len = max(len(d1_norm), len(d2_norm))
    similarity = 1.0 - (dist / max_len)

    # 1 or 2 edits on brand name is a classic lookalike indicator
    if dist <= 2 and similarity >= 0.75:
        return True, round(similarity, 2)

    return False, round(similarity, 2)

def check_dns(domain: str) -> Tuple[bool, bool]:
    """Check if domain has active A (web) and MX (mail) records."""
    has_a = False
    has_mx = False
    try:
        resolver = dns.resolver.Resolver()
        resolver.timeout = 2.0
        resolver.lifetime = 2.0
        
        # Check A record
        try:
            answers_a = resolver.resolve(domain, 'A')
            if len(answers_a) > 0:
                has_a = True
        except Exception:
            pass

        # Check MX record
        try:
            answers_mx = resolver.resolve(domain, 'MX')
            if len(answers_mx) > 0:
                has_mx = True
        except Exception:
            pass
    except Exception:
        # Resolver failure or network restriction
        pass

    return has_a, has_mx

def verify_company(
    db: Session,
    company_name: str,
    website: Optional[str] = None,
    recruiter_email: Optional[str] = None
) -> Tuple[List[FindingSchema], bool, Optional[str], Optional[DomainSecurityInfo]]:
    """
    Verifies company authenticity against trusted registry and analyzes website/email domains.
    """
    findings: List[FindingSchema] = []
    cleaned_web_domain = clean_domain(website) if website else None
    
    # 1. Lookup in trusted registry
    trusted_record = None
    if company_name:
        # Case-insensitive query
        trusted_record = db.query(CompanyRecord).filter(
            CompanyRecord.company_name.ilike(f"%{company_name.strip()}%")
        ).first()

    is_in_registry = trusted_record is not None
    trusted_domain = trusted_record.official_domain if trusted_record else None

    domain_sec_info = None

    # 2. Analyze website domain if provided
    if cleaned_web_domain:
        has_https = bool(website and website.strip().lower().startswith("https://"))
        has_a, has_mx = check_dns(cleaned_web_domain)

        is_lookalike = False
        target_brand = None
        sim_score = 0.0

        # Check against trusted record or all trusted companies
        if trusted_domain:
            is_lookalike, sim_score = detect_lookalike(cleaned_web_domain, trusted_domain)
            target_brand = trusted_domain
        else:
            # Check if it looks like any known company in registry
            all_records = db.query(CompanyRecord).all()
            for rec in all_records:
                looks, score = detect_lookalike(cleaned_web_domain, rec.official_domain)
                if looks:
                    is_lookalike = True
                    target_brand = rec.official_domain
                    sim_score = score
                    break

        domain_sec_info = DomainSecurityInfo(
            domain=cleaned_web_domain,
            is_valid_syntax=True,
            has_https=has_https,
            has_dns_mx=has_mx,
            has_dns_a=has_a,
            is_lookalike=is_lookalike,
            target_legitimate_domain=target_brand,
            similarity_score=round(sim_score, 2)
        )

        # Flag Lookalike Domain
        if is_lookalike:
            findings.append(FindingSchema(
                finding_type="LOOKALIKE_DOMAIN_DETECTED",
                severity="CRITICAL",
                explanation=f"The domain '{cleaned_web_domain}' appears to impersonate the legitimate brand domain '{target_brand}'. This typosquatting tactic is standard in recruitment credential phishing and advance-fee schemes.",
                evidence_source="Typosquatting & Homoglyph Heuristic Scanner",
                confidence=0.94
            ))

        # Check official domain mismatch
        if is_in_registry and trusted_domain and cleaned_web_domain != trusted_domain and not is_lookalike:
            findings.append(FindingSchema(
                finding_type="DOMAIN_REGISTRY_MISMATCH",
                severity="HIGH",
                explanation=f"The claimed company '{trusted_record.company_name}' has an official registered domain of '{trusted_domain}', but the submitted website uses '{cleaned_web_domain}'.",
                evidence_source="Verified Corporate Registry Check",
                confidence=0.90
            ))

        # Check HTTPS
        if not has_https:
            findings.append(FindingSchema(
                finding_type="INSECURE_HTTP_PROTOCOL",
                severity="MEDIUM",
                explanation=f"The submitted website URL '{website}' does not enforce HTTPS encryption. Note: While HTTPS is necessary, HTTPS alone never proves a company is legitimate.",
                evidence_source="TLS / Transport Layer Verification",
                confidence=0.85
            ))

    # 3. Check Recruiter Email consistency if provided
    if recruiter_email:
        email_clean = recruiter_email.strip().lower()
        if "@" in email_clean:
            email_domain = email_clean.split("@")[-1]
            
            # Free webmail for verified company
            if email_domain in ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"]:
                findings.append(FindingSchema(
                    finding_type="PUBLIC_WEBMAIL_RECRUITER",
                    severity="HIGH",
                    explanation=f"Recruiter email '{recruiter_email}' uses a public webmail domain (@{email_domain}). Verified corporations exclusively use authorized corporate enterprise email accounts for official hiring.",
                    evidence_source="Recruiter Email Analysis",
                    confidence=0.93
                ))
            elif trusted_domain and email_domain != trusted_domain:
                # Email domain doesn't match official corporate domain
                findings.append(FindingSchema(
                    finding_type="RECRUITER_EMAIL_DOMAIN_MISMATCH",
                    severity="CRITICAL",
                    explanation=f"Recruiter email domain '@{email_domain}' does NOT match the verified corporate domain '@{trusted_domain}' for {trusted_record.company_name}.",
                    evidence_source="Recruiter Trust Cross-Verification",
                    confidence=0.96
                ))

    # Positive findings if matched with registry
    if is_in_registry and not findings:
        findings.append(FindingSchema(
            finding_type="VERIFIED_CORPORATE_IDENTITY",
            severity="INFO",
            explanation=f"The company '{trusted_record.company_name}' is in our trusted registry ({trusted_record.verification_source}). Official domain: {trusted_record.official_domain}.",
            evidence_source="Trusted Corporate Registry",
            confidence=0.98
        ))

    return findings, is_in_registry, trusted_domain, domain_sec_info
