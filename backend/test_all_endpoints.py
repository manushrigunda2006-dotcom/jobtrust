import os
import sys
import os
import sys

# Force UTF-8 stdout
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

from fastapi.testclient import TestClient
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from app.main import app
from app.config import settings

client = TestClient(app)

print("=== Starting End-to-End Test Suite for JOBTRUST ===")

# 1. Health check
res = client.get("/api/health")
assert res.status_code == 200, f"Health check failed: {res.text}"
print("[PASS] 1. GET /api/health passed:", res.json())

# 2. Demo scenarios
res = client.get("/api/demo/scenarios")
assert res.status_code == 200, f"Demo scenarios failed: {res.text}"
scenarios = res.json()
assert len(scenarios) == 3, "Expected 3 demo scenarios"
print("[PASS] 2. GET /api/demo/scenarios passed (3 scenarios loaded)")

# 3. Analyze Job (Fraudulent Apex scenario with registration fee)
job_payload = {
    "job_text": "URGENT HIRING: Guaranteed selection! Earn ₹48,000 per month for copy paste work. No interview required. You must pay a refundable registration fee of ₹1,999 to HR on PhonePe to reserve your seat. Contact on WhatsApp 9876543210.",
    "company_name": "Apex Global",
    "job_title": "Data Entry Intern"
}
res = client.post("/api/analyze/job", json=job_payload)
assert res.status_code == 200, f"Job analysis failed: {res.text}"
data = res.json()
print(f"[PASS] 3. POST /api/analyze/job (Scam) passed -> Risk Score: {data['risk_assessment']['score']}/100, Category: {data['risk_assessment']['category']}")
assert data['risk_assessment']['score'] >= 60, "Expected high risk for upfront fee scam"
scan_id = data['scan_id']

# 4. Analyze Job (Legitimate TCS scenario)
legit_payload = {
    "job_text": "Tata Consultancy Services (TCS) invites applications for Summer Internship in Cloud Engineering. Stipend: ₹30,000 per month. Selection involves online coding test and technical interview. TCS never charges any registration fees or deposits at any stage.",
    "company_name": "Tata Consultancy Services",
    "job_title": "Cloud Engineering Intern"
}
res = client.post("/api/analyze/job", json=legit_payload)
assert res.status_code == 200, f"Legit job analysis failed: {res.text}"
data_legit = res.json()
print(f"[PASS] 4. POST /api/analyze/job (Legitimate) passed -> Risk Score: {data_legit['risk_assessment']['score']}/100, Category: {data_legit['risk_assessment']['category']}")
assert data_legit['risk_assessment']['score'] <= 35, "Expected low risk for legitimate job"

# 5. Analyze Company (Lookalike domain)
comp_payload = {
    "company_name": "Microsoft",
    "company_website": "https://micros0ft-careers.com",
    "recruiter_email": "careers.microsoft.jobs@gmail.com"
}
res = client.post("/api/analyze/company", json=comp_payload)
assert res.status_code == 200, f"Company analysis failed: {res.text}"
data_comp = res.json()
print(f"[PASS] 5. POST /api/analyze/company (Lookalike) passed -> Risk Score: {data_comp['risk_assessment']['score']}/100, Lookalike: {data_comp['domain_security']['is_lookalike']}")
assert data_comp['domain_security']['is_lookalike'] == True, "Expected lookalike flag for micros0ft-careers.com"

# 6. Analyze Email
email_payload = {
    "email": "hr.microsoft.recruiter@gmail.com",
    "claimed_company": "Microsoft"
}
res = client.post("/api/analyze/email", json=email_payload)
assert res.status_code == 200, f"Email analysis failed: {res.text}"
data_email = res.json()
print(f"[PASS] 6. POST /api/analyze/email passed -> Domain: {data_email['domain']}, Free Provider: {data_email['is_free_provider']}")

# 7. Analyze URL (Shortener + phishing keyword)
url_payload = {
    "url": "https://bit.ly/microsoft-deposit-verify",
    "claimed_company": "Microsoft"
}
res = client.post("/api/analyze/url", json=url_payload)
assert res.status_code == 200, f"URL analysis failed: {res.text}"
data_url = res.json()
print(f"[PASS] 7. POST /api/analyze/url passed -> Shortener: {data_url['is_shortener']}, Keywords: {data_url['suspicious_keywords_found']}")

# 8. Recruiter Trust Graph
trust_data = {
    "claimed_company": "Microsoft",
    "recruiter_email": "careers.microsoft.talent@gmail.com",
    "website": "https://micros0ft-careers-portal.site"
}
res = client.post("/api/analyze/trust-graph", data=trust_data)
assert res.status_code == 200, f"Trust graph failed: {res.text}"
data_graph = res.json()
print(f"[PASS] 8. POST /api/analyze/trust-graph passed -> Impersonation Detected: {data_graph['impersonation_detected']}, Nodes: {len(data_graph['nodes'])}, Edges: {len(data_graph['edges'])}")
assert data_graph['impersonation_detected'] == True, "Expected impersonation detected"

# 9. Offer Letter (Create a test PDF with deposit clause and upload)
sample_pdf_path = os.path.join(settings.UPLOAD_DIR, "sample_test_offer.pdf")
c = canvas.Canvas(sample_pdf_path, pagesize=letter)
c.drawString(100, 750, "OFFER LETTER - CONFIDENTIAL")
c.drawString(100, 720, "Company: Microsoft India Private Limited")
c.drawString(100, 700, "Candidate Name: Alex Johnson")
c.drawString(100, 680, "Designation: Associate Cloud Engineer")
c.drawString(100, 660, "Salary Offered: INR 18,00,000 LPA")
c.drawString(100, 640, "Date of Joining: 15 July 2026")
c.drawString(100, 620, "HR Contact: recruitment.team@gmail.com")
c.drawString(100, 600, "Ref ID: MSFT/2026/OFFER/9821")
c.drawString(100, 560, "SPECIAL CLAUSE: Candidate must deposit a refundable laptop caution deposit of Rs 15,000")
c.drawString(100, 540, "prior to dispatch of work equipment.")
c.save()

with open(sample_pdf_path, "rb") as f:
    res = client.post("/api/analyze/offer-letter", files={"file": ("sample_test_offer.pdf", f, "application/pdf")})
assert res.status_code == 200, f"Offer letter analysis failed: {res.text}"
data_offer = res.json()
print(f"[PASS] 9. POST /api/analyze/offer-letter passed -> Fee Flagged: '{data_offer['extracted_data']['payment_requested']}', Risk Score: {data_offer['risk_assessment']['score']}/100")
assert data_offer['extracted_data']['payment_requested'] is not None, "Expected payment fee clause extracted from PDF"

# 10. Dashboard Stats
res = client.get("/api/dashboard/stats")
assert res.status_code == 200, f"Dashboard stats failed: {res.text}"
data_dash = res.json()
print(f"[PASS] 10. GET /api/dashboard/stats passed -> Total Analyzed: {data_dash['total_analyzed']}, High Risk: {data_dash['high_risk_count']}")

# 11. Community Report & Duplicate Detection
rep_payload = {
    "company_name": "Apex Fraud Co",
    "job_title": "Fake Data Operator",
    "description": "Asked for registration fee of 1500 rupees on google pay then blocked me.",
    "website": "apex-fraud.xyz",
    "recruiter_contact": "+91-9876543210"
}
res = client.post("/api/reports/submit", json=rep_payload)
assert res.status_code == 200, f"Community report failed: {res.text}"
rep_data = res.json()
print(f"[PASS] 11. POST /api/reports/submit passed -> Masked contact: '{rep_data['masked_contact']}'")
assert "***" in rep_data['masked_contact'], "Expected PII masking in contact"

# Duplicate test
res_dup = client.post("/api/reports/submit", json=rep_payload)
assert res_dup.status_code == 409, "Expected 409 for duplicate community report"
print("[PASS] 12. Duplicate report prevention passed (HTTP 409 returned)")

# 12. PDF Report Download
res_pdf = client.get(f"/api/reports/{scan_id}/pdf")
assert res_pdf.status_code == 200, f"PDF report download failed: {res_pdf.text}"
assert res_pdf.headers["content-type"] == "application/pdf", "Expected application/pdf content type"
print(f"[PASS] 13. GET /api/reports/{scan_id}/pdf passed (Downloaded valid PDF, {len(res_pdf.content)} bytes)")

# 13. History
res_hist = client.get("/api/scans/history")
assert res_hist.status_code == 200, f"Scan history failed: {res_hist.text}"
print(f"[PASS] 14. GET /api/scans/history passed ({len(res_hist.json())} history items)")

print("\n=== ALL 14 END-TO-END TESTS PASSED WITH 100% SUCCESS! ===")

