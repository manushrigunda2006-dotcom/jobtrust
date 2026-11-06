import re
from urllib.parse import urlparse
import tldextract
import httpx
from typing import Dict, Any, List, Tuple, Optional
from app.config import settings
from app.schemas import FindingSchema

URL_SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly",
    "rb.gy", "ow.ly", "rebrand.ly", "shorturl.at", "bl.ink"
}

PHISHING_PATH_KEYWORDS = [
    "login", "verify", "signin", "auth", "credential",
    "banking", "kyc", "deposit", "payment", "account-update",
    "secure-portal", "job-deposit"
]

SUSPICIOUS_TLDS = {
    "xyz", "top", "work", "loan", "click", "rest", "fit", "gq", "ml", "cf", "tk", "site", "online"
}

def analyze_url_security(url: str, claimed_company: Optional[str] = None) -> Tuple[List[FindingSchema], Dict[str, Any]]:
    """
    Performs safe static and heuristic URL analysis without triggering arbitrary server-side requests.
    """
    findings: List[FindingSchema] = []
    url_clean = url.strip()

    # Prepend scheme if missing for parsing
    if not url_clean.startswith("http://") and not url_clean.startswith("https://"):
        url_clean = "https://" + url_clean

    parsed = urlparse(url_clean)
    host = parsed.netloc.lower().split(":")[0]  # strip port
    path = parsed.path.lower()
    query = parsed.query.lower()

    extracted = tldextract.extract(url_clean)
    registered_domain = f"{extracted.domain}.{extracted.suffix}" if extracted.suffix else extracted.domain
    subdomain = extracted.subdomain.lower()

    is_shortener = host in URL_SHORTENERS or registered_domain in URL_SHORTENERS
    is_ip = bool(re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", host))

    # 1. URL Shortener Flag
    if is_shortener:
        findings.append(FindingSchema(
            finding_type="URL_SHORTENER_DETECTED",
            severity="HIGH",
            explanation=f"The link uses a URL shortener service ({host}) which hides the real target destination. Scammers frequently use shortened links to bypass corporate security filters.",
            evidence_source="URL Architecture Inspection",
            confidence=0.92
        ))

    # 2. Raw IP Address Flag
    if is_ip:
        findings.append(FindingSchema(
            finding_type="IP_BASED_HOST",
            severity="CRITICAL",
            explanation=f"The URL targets a raw IP address ({host}) rather than a registered corporate domain name. Legitimate corporate recruitment systems always use registered domain names with SSL certificates.",
            evidence_source="Host Resolution Analysis",
            confidence=0.98
        ))

    # 3. Excessive Subdomains / Brand Impersonation in Subdomain
    sub_parts = subdomain.split(".") if subdomain else []
    if len(sub_parts) >= 3:
        findings.append(FindingSchema(
            finding_type="EXCESSIVE_SUBDOMAINS",
            severity="MEDIUM",
            explanation=f"The URL has deeply nested subdomains ('{subdomain}'), a tactic used in phishing campaigns to display brand names in the URL while routing to unrelated hosts.",
            evidence_source="Domain Syntax Heuristics",
            confidence=0.85
        ))

    # Check if a claimed company or known brand is spoofed in subdomain
    if claimed_company:
        clean_company = claimed_company.lower().replace(" ", "")
        if clean_company in subdomain and clean_company not in extracted.domain.lower():
            findings.append(FindingSchema(
                finding_type="SUBDOMAIN_BRAND_SPOOFING",
                severity="CRITICAL",
                explanation=f"The subdomain contains '{claimed_company}', but the actual registered destination domain is '{registered_domain}'. This is an intentional phishing attempt to mislead victims.",
                evidence_source="Domain Hierarchy Cross-Check",
                confidence=0.96
            ))

    # 4. Phishing Keywords in URL Path
    keywords_found = []
    for kw in PHISHING_PATH_KEYWORDS:
        if kw in path or kw in query:
            keywords_found.append(kw)

    if keywords_found:
        findings.append(FindingSchema(
            finding_type="PHISHING_PATH_KEYWORDS",
            severity="MEDIUM",
            explanation=f"The URL path contains credential-harvesting or payment keywords ({', '.join(keywords_found)}).",
            evidence_source="URL Path Analysis",
            confidence=0.80
        ))

    # 5. Suspicious generic top-level domains frequently abused for low-cost spam
    if extracted.suffix in SUSPICIOUS_TLDS:
        findings.append(FindingSchema(
            finding_type="HIGH_RISK_TLD",
            severity="LOW",
            explanation=f"The domain uses top-level domain '.{extracted.suffix}', which has elevated statistical abuse rates in disposable phishing campaigns.",
            evidence_source="TLD Threat Intelligence",
            confidence=0.75
        ))

    # 6. Punycode / IDN homograph check
    if "xn--" in host:
        findings.append(FindingSchema(
            finding_type="PUNYCODE_HOMOGRAPH_DETECTED",
            severity="CRITICAL",
            explanation=f"The host '{host}' contains Punycode ('xn--'), indicating non-ASCII characters designed to visually imitate a legitimate domain name.",
            evidence_source="IDN Homograph Security Scanner",
            confidence=0.98
        ))

    # 7. Threat Intelligence Check (Google Safe Browsing or Fallback Heuristic)
    threat_intel_result = "CLEAN / NO KNOWN THREATS"
    threat_intel_source = "Local Heuristic Database"

    if settings.GOOGLE_SAFE_BROWSING_KEY:
        try:
            # Safe Browsing API v4 call
            api_url = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={settings.GOOGLE_SAFE_BROWSING_KEY}"
            payload = {
                "client": {"clientId": "jobtrust-engine", "clientVersion": "1.0.0"},
                "threatInfo": {
                    "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
                    "platformTypes": ["ANY_PLATFORM"],
                    "threatEntryTypes": ["URL"],
                    "threatEntries": [{"url": url_clean}]
                }
            }
            resp = httpx.post(api_url, json=payload, timeout=3.0)
            if resp.status_code == 200:
                data = resp.json()
                if "matches" in data and len(data["matches"]) > 0:
                    threat_intel_result = "FLAGGED AS MALICIOUS / SOCIAL ENGINEERING"
                    threat_intel_source = "Google Safe Browsing API v4"
                    findings.append(FindingSchema(
                        finding_type="SAFE_BROWSING_MALICIOUS_FLAG",
                        severity="CRITICAL",
                        explanation="This URL is confirmed malicious in the Google Safe Browsing global threat intelligence database.",
                        evidence_source="Google Safe Browsing API",
                        confidence=0.99
                    ))
                else:
                    threat_intel_result = "NO THREAT MATCHES FOUND"
                    threat_intel_source = "Google Safe Browsing API v4"
        except Exception:
            threat_intel_result = "API TIMEOUT / LOCAL FALLBACK ACTIVE"
            threat_intel_source = "Local Threat Heuristics (API Unreachable)"
    else:
        threat_intel_source = "Local Heuristic Intelligence (API key not configured)"
        if any(f.severity in ["CRITICAL", "HIGH"] for f in findings):
            threat_intel_result = "SUSPICIOUS / ELEVATED RISK PATTERNS DETECTED"
        else:
            threat_intel_result = "NO SUSPICIOUS PATTERNS OBSERVED"

    if not findings:
        findings.append(FindingSchema(
            finding_type="URL_STRUCTURE_STANDARD",
            severity="INFO",
            explanation="The URL uses a standard domain hierarchy without known shorteners, raw IP destinations, or credential phishing keywords.",
            evidence_source="URL Static Inspection",
            confidence=0.85
        ))

    details = {
        "domain": registered_domain,
        "is_shortener": is_shortener,
        "is_ip_address": is_ip,
        "suspicious_keywords_found": keywords_found,
        "threat_intel_result": threat_intel_result,
        "threat_intel_source": threat_intel_source
    }

    return findings, details
