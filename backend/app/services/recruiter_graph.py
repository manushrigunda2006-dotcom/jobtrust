import uuid
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models import CompanyRecord
from app.schemas import (
    GraphNode, GraphEdge, RecruiterTrustGraphResponse, FindingSchema, RiskAssessmentSchema
)
from app.services.company_verifier import clean_domain, detect_lookalike
from app.services.risk_engine import calculate_risk_assessment

def build_recruiter_trust_graph(
    db: Session,
    claimed_company: str,
    recruiter_email: Optional[str] = None,
    website: Optional[str] = None
) -> RecruiterTrustGraphResponse:
    """
    Constructs an interactive Trust Graph comparing claimed corporate identity against
    official registries, email domains, and website portals.
    """
    scan_id = str(uuid.uuid4())
    findings: List[FindingSchema] = []
    
    # 1. Lookup verified company in registry
    trusted_record = db.query(CompanyRecord).filter(
        CompanyRecord.company_name.ilike(f"%{claimed_company.strip()}%")
    ).first()

    official_domain = trusted_record.official_domain if trusted_record else None
    
    clean_web = clean_domain(website) if website else None
    email_clean = recruiter_email.strip().lower() if recruiter_email else None
    email_domain = email_clean.split("@")[-1] if email_clean and "@" in email_clean else None

    # Graph elements
    nodes: List[GraphNode] = []
    edges: List[GraphEdge] = []

    # Node: Claimed Entity
    nodes.append(GraphNode(
        id="claimed_entity",
        label=f"Claimed: {claimed_company}",
        type="company",
        status="neutral",
        metadata={"name": claimed_company, "role": "Candidate Facing Employer"}
    ))

    # Node: Official Registry
    if trusted_record:
        nodes.append(GraphNode(
            id="official_domain",
            label=f"Official: {official_domain}",
            type="official_registry",
            status="verified",
            metadata={
                "domain": official_domain,
                "source": trusted_record.verification_source,
                "status": trusted_record.verification_status
            }
        ))
        edges.append(GraphEdge(
            source="claimed_entity",
            target="official_domain",
            label="Verified Corporate Identity",
            status="valid"
        ))
    else:
        nodes.append(GraphNode(
            id="official_domain",
            label="Registry: Unverified Entity",
            type="official_registry",
            status="warning",
            metadata={"domain": "None", "notes": "No official registry match"}
        ))
        edges.append(GraphEdge(
            source="claimed_entity",
            target="official_domain",
            label="Unlisted In Registry",
            status="warning"
        ))
        findings.append(FindingSchema(
            finding_type="UNLISTED_COMPANY_REGISTRY",
            severity="MEDIUM",
            explanation=f"'{claimed_company}' was not found in our curated verified enterprise registry. Independent manual verification recommended.",
            evidence_source="Curated Corporate Registry",
            confidence=0.80
        ))

    # Recruiter Email Analysis & Graph Node
    impersonation_flag = False
    if email_domain:
        is_free_mail = email_domain in ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"]
        
        email_status = "verified"
        edge_status = "valid"
        edge_label = "Domain Match"

        if is_free_mail:
            email_status = "mismatch"
            edge_status = "invalid"
            edge_label = f"Impersonation via @{email_domain}"
            impersonation_flag = True
            findings.append(FindingSchema(
                finding_type="RECRUITER_EMAIL_IMPERSONATION",
                severity="CRITICAL",
                explanation=f"Recruiter claims to represent '{claimed_company}' but sent emails from consumer webmail (@{email_domain}). Official recruiters never conduct enterprise hiring through personal free webmail.",
                evidence_source="Recruiter Trust Graph Engine",
                confidence=0.98
            ))
        elif official_domain and email_domain != official_domain:
            email_status = "mismatch"
            edge_status = "invalid"
            edge_label = f"Domain Mismatch (@{email_domain} != @{official_domain})"
            impersonation_flag = True
            findings.append(FindingSchema(
                finding_type="RECRUITER_DOMAIN_MISMATCH",
                severity="CRITICAL",
                explanation=f"Email domain '@{email_domain}' does not match official corporate domain '@{official_domain}'.",
                evidence_source="Recruiter Trust Graph Engine",
                confidence=0.96
            ))

        nodes.append(GraphNode(
            id="recruiter_email",
            label=f"Email: {email_domain}",
            type="email",
            status=email_status,
            metadata={"address": recruiter_email, "domain": email_domain, "is_free": is_free_mail}
        ))
        edges.append(GraphEdge(
            source="claimed_entity",
            target="recruiter_email",
            label=edge_label,
            status=edge_status
        ))

    # Website Domain Analysis & Graph Node
    if clean_web:
        web_status = "verified"
        web_edge_status = "valid"
        web_edge_label = "Official Portal"

        if official_domain:
            is_lookalike, sim = detect_lookalike(clean_web, official_domain)
            if is_lookalike:
                web_status = "suspicious"
                web_edge_status = "invalid"
                web_edge_label = f"Lookalike Typosquat ({sim*100:.0f}% sim)"
                impersonation_flag = True
                findings.append(FindingSchema(
                    finding_type="LOOKALIKE_WEBSITE_IMPERSONATION",
                    severity="CRITICAL",
                    explanation=f"Submitted website '{clean_web}' is a lookalike domain spoofing '{official_domain}'. Designed to deceive applicants during application or payment.",
                    evidence_source="Recruiter Trust Graph Engine",
                    confidence=0.97
                ))
            elif clean_web != official_domain:
                web_status = "warning"
                web_edge_status = "warning"
                web_edge_label = "Unassociated Domain"
                findings.append(FindingSchema(
                    finding_type="UNASSOCIATED_WEBSITE_DOMAIN",
                    severity="HIGH",
                    explanation=f"Submitted website '{clean_web}' does not match the official registered enterprise domain '{official_domain}'.",
                    evidence_source="Recruiter Trust Graph Engine",
                    confidence=0.91
                ))

        nodes.append(GraphNode(
            id="website_domain",
            label=f"Portal: {clean_web}",
            type="website",
            status=web_status,
            metadata={"domain": clean_web, "input_url": website}
        ))
        edges.append(GraphEdge(
            source="claimed_entity",
            target="website_domain",
            label=web_edge_label,
            status=web_edge_status
        ))

    # Cross edge: Recruiter Email <-> Website Domain
    if email_domain and clean_web:
        if email_domain == clean_web:
            edges.append(GraphEdge(
                source="recruiter_email",
                target="website_domain",
                label="Infrastructure Linked",
                status="valid"
            ))
        else:
            edges.append(GraphEdge(
                source="recruiter_email",
                target="website_domain",
                label="Different Infrastructure",
                status="warning"
            ))

    # Risk Assessment
    risk_assessment = calculate_risk_assessment(findings)

    # Verdict summary
    if impersonation_flag:
        verdict = f"HIGH CONFIDENCE IMPERSONATION: Evidence reveals conflicting domain identities between claimed organization '{claimed_company}' and recruiter communication infrastructure."
    elif not trusted_record:
        verdict = f"UNVERIFIED ENTITY: '{claimed_company}' is not registered in our high-trust enterprise directory. Further manual diligence required."
    else:
        verdict = f"CONSISTENT IDENTITY: Recruiter communication channels align with official corporate registry records for '{claimed_company}'."

    return RecruiterTrustGraphResponse(
        scan_id=scan_id,
        claimed_company=claimed_company,
        trusted_official_domain=official_domain,
        recruiter_email=recruiter_email,
        website_domain=clean_web,
        nodes=nodes,
        edges=edges,
        impersonation_detected=impersonation_flag,
        verdict_summary=verdict,
        risk_assessment=risk_assessment
    )
