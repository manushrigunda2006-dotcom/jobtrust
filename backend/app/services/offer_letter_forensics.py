import os
import re
import fitz  # PyMuPDF
from typing import Dict, Any, List, Tuple, Optional
from PIL import Image
from app.schemas import FindingSchema, OfferLetterExtractedData

FEE_DEMAND_PATTERNS = [
    (r"(laptop|equipment|hardware)\s*(security\s*deposit|dispatch\s*fee|caution\s*deposit)", "CRITICAL", "Hardware Security Deposit Clause", "Offer letter demands payment for laptop dispatch or equipment deposit."),
    (r"(training\s*fee|registration\s*charge|documentation\s*charge|onboarding\s*kit\s*fee)", "CRITICAL", "Mandatory Onboarding/Training Fee", "Legitimate employers never condition employment offers on paid training or registration kits."),
    (r"(pay\s*(rs\.?|inr|₹|\$)\s*[\d,]+|deposit\s*(rs\.?|inr|₹|\$)\s*[\d,]+)", "CRITICAL", "Direct Financial Payment Clause", "Offer letter stipulates monetary payment by the candidate."),
    (r"(refundable\s*caution\s*money|refundable\s*deposit|refundable\s*within\s*\d+\s*months?)", "HIGH", "Deceptive 'Refundable Deposit' Clause", "Common scam tactic promising reimbursement of advance deposits upon completion of probationary period.")
]

def extract_text_from_file(file_path: str) -> Tuple[str, Dict[str, Any]]:
    """Extract text and metadata from PDF or image file."""
    ext = os.path.splitext(file_path)[1].lower()
    text = ""
    metadata = {}

    if ext == ".pdf":
        try:
            doc = fitz.open(file_path)
            metadata = doc.metadata or {}
            for page in doc:
                text += page.get_text() + "\n"
            doc.close()
        except Exception as e:
            text = f"Error reading PDF: {str(e)}"
    elif ext in [".png", ".jpg", ".jpeg"]:
        try:
            # Load image and extract basic metadata
            img = Image.open(file_path)
            metadata = {"format": img.format, "size": img.size, "mode": img.mode}
            # If tesseract is available, we could do OCR, or fallback to structural inspection
            text = f"Image Document: {os.path.basename(file_path)} [{img.size[0]}x{img.size[1]} px]"
        except Exception as e:
            text = f"Error reading image: {str(e)}"
    else:
        text = "Unsupported file format."

    return text.strip(), metadata

def analyze_offer_letter(
    file_path: str,
    claimed_company: Optional[str] = None
) -> Tuple[List[FindingSchema], OfferLetterExtractedData]:
    """
    Forensically examines an offer letter for advance fee clauses, impersonation, and metadata inconsistencies.
    """
    findings: List[FindingSchema] = []
    text, meta = extract_text_from_file(file_path)
    
    extracted = OfferLetterExtractedData()
    extracted.raw_text_preview = text[:600] if text else "No extractable text found."

    # 1. Entity Extraction
    # Candidate name
    cand_match = re.search(r"(dear|to|candidate\s*name|name\s*of\s*candidate)\s*[:\-]?\s*([A-Za-z\s]{3,35})", text, re.IGNORECASE)
    if cand_match:
        extracted.candidate_name = cand_match.group(2).strip()

    # Company name
    comp_match = re.search(r"(company|organization|firm|employer)\s*[:\-]?\s*([A-Za-z0-9\s]{3,40})", text, re.IGNORECASE)
    if comp_match:
        extracted.company_name = comp_match.group(2).strip()
    elif claimed_company:
        extracted.company_name = claimed_company

    # Job title / Designation
    role_match = re.search(r"(designation|position|job\s*title|role)\s*[:\-]?\s*([A-Za-z0-9\s]{3,40})", text, re.IGNORECASE)
    if role_match:
        extracted.job_title = role_match.group(2).strip()

    # Salary / Compensation
    sal_match = re.search(r"(ctc|salary|stipend|compensation|remuneration)\s*[:\-]?\s*(₹|rs\.?|inr|\$)?\s*[\d,]+(\s*-\s*[\d,]+)?(\s*(lpa|per\s*month|pm|per\s*annum))?", text, re.IGNORECASE)
    if sal_match:
        extracted.salary_offered = sal_match.group(0).strip()

    # Joining date
    date_match = re.search(r"(date\s*of\s*joining|joining\s*date|commencement\s*date|start\s*date)\s*[:\-]?\s*([A-Za-z0-9\s,\/\.-]{5,25})", text, re.IGNORECASE)
    if date_match:
        extracted.joining_date = date_match.group(2).strip()

    # Reference / Offer Number
    ref_match = re.search(r"(ref(\.|erence)?\s*(no|number|id)|offer\s*id)\s*[:\-]?\s*([A-Za-z0-9\/\-_]+)", text, re.IGNORECASE)
    if ref_match:
        extracted.offer_ref_number = ref_match.group(4).strip()

    # HR email
    email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
    if email_match:
        extracted.hr_contact_email = email_match.group(0)

    # 2. Forensic Analysis & Checks
    # Check for upfront fee / security deposit demands
    fee_detected = False
    for pattern, severity, title, explanation in FEE_DEMAND_PATTERNS:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            fee_detected = True
            extracted.payment_requested = match.group(0)
            findings.append(FindingSchema(
                finding_type="OFFER_LETTER_PAYMENT_DEMAND",
                severity=severity,
                explanation=f"{explanation} Matched text: '{match.group(0)}'. Genuine employment offers do not include candidate payment clauses.",
                evidence_source="Offer Letter Text Forensics",
                confidence=0.98
            ))
            break

    # Check HR email domain
    if extracted.hr_contact_email:
        domain = extracted.hr_contact_email.split("@")[-1].lower()
        if domain in ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"]:
            findings.append(FindingSchema(
                finding_type="OFFER_LETTER_FREE_WEBMAIL",
                severity="HIGH",
                explanation=f"The offer letter lists HR contact email '{extracted.hr_contact_email}' using a public webmail domain (@{domain}) instead of a corporate domain.",
                evidence_source="Document Contact Verification",
                confidence=0.94
            ))

    # Check for urgency threats in offer
    if re.search(r"(within\s*24\s*hours|offer\s*will\s*be\s*cancelled|immediate\s*acceptance|forfeited)", text, re.IGNORECASE):
        findings.append(FindingSchema(
            finding_type="OFFER_EXPIRY_PRESSURE",
            severity="MEDIUM",
            explanation="The offer letter exerts aggressive time pressure, threatening immediate cancellation or forfeiture if candidate does not comply rapidly.",
            evidence_source="Document Lexical Forensics",
            confidence=0.86
        ))

    # PDF Metadata analysis
    creator = meta.get("creator", "").lower()
    producer = meta.get("producer", "").lower()
    if "canva" in creator or "ilovepdf" in producer or "smallpdf" in producer:
        findings.append(FindingSchema(
            finding_type="CASUAL_OR_EDITED_PDF_METADATA",
            severity="MEDIUM",
            explanation=f"PDF metadata reveals consumer editing tools ({producer or creator}) rather than corporate enterprise document generation systems.",
            evidence_source="PDF File Structure Metadata",
            confidence=0.82
        ))

    if not findings:
        findings.append(FindingSchema(
            finding_type="OFFER_LETTER_STRUCTURE_NORMAL",
            severity="INFO",
            explanation="No advance payment requests, suspicious consumer metadata, or coercive payment clauses detected in the document text.",
            evidence_source="Document Forensics Engine",
            confidence=0.85
        ))

    return findings, extracted
