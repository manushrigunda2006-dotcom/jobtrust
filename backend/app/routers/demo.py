from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter(prefix="/demo", tags=["Demo Scenarios"])

DEMO_SCENARIOS = [
    {
        "id": "scenario-1",
        "title": "Scenario 1: Legitimate Engineering Internship",
        "tag": "SYNTHETIC BENCHMARK - LEGITIMATE",
        "company": "Tata Consultancy Services",
        "role": "Cloud Infrastructure Intern",
        "email": "campus.recruitment@tcs.com",
        "website": "https://www.tcs.com/careers",
        "url": "https://www.tcs.com/careers/india/entry-level-hiring",
        "job_text": """Tata Consultancy Services (TCS) invites applications for our 6-month Summer Internship Program in Cloud Infrastructure and DevOps.
Role: Cloud Engineering Intern
Location: Hyderabad / Bengaluru (Hybrid)
Stipend: ₹30,000 per month
Eligibility: B.Tech / M.Tech in CS, IT, or ECE graduating in 2026/2027.
Selection Process:
1. Online Cognitive & Technical Assessment on the official TCS iON platform.
2. Technical Interview with Engineering Lead.
3. HR discussion.
Important Notice: TCS does not charge any registration fees, security deposits, or background verification charges at any stage of recruitment. Official communication is sent strictly from @tcs.com addresses.
Apply only through our verified portal at careers.tcs.com.""",
        "expected_risk": "Lower observed risk (0–29)",
        "expected_score_range": "0 - 15",
        "key_signals": [
            "Verified corporate registry match (tcs.com)",
            "Strict non-fee policy explicitly stated",
            "Clear technical assessment requirement",
            "Official corporate domain email address"
        ]
    },
    {
        "id": "scenario-2",
        "title": "Scenario 2: Advance-Fee Internship Scam",
        "tag": "SYNTHETIC BENCHMARK - FRAUDULENT",
        "company": "Apex Global Solutions",
        "role": "Data Entry & Python Intern",
        "email": "hr.apexgroup.jobs@gmail.com",
        "website": "http://apex-jobs-portal.xyz",
        "url": "http://apex-jobs-portal.xyz/pay-registration",
        "job_text": """URGENT REQUIREMENT: DIRECT HIRING WITHOUT EXAM OR INTERVIEW!
Position: Remote Python and Data Entry Intern
Salary / Stipend: ₹48,000 per month + daily cash incentives!
100% Guaranteed Selection! Immediate Appointment Letter will be issued today.
Simple copy-paste and basic spreadsheet tasks. Work only 2 hours daily from mobile.
MANDATORY REGISTRATION REQUIREMENT:
To confirm your reserved onboarding seat and receive the proprietary company software tool, candidate must transfer a refundable security registration fee of ₹1,999 to HR PhonePe / Google Pay within 2 hours.
Offer expires at 5:00 PM today. Only 2 slots remaining!
Contact immediately on WhatsApp: +91-9876543210.""",
        "expected_risk": "Very high risk indicators (80–100)",
        "expected_score_range": "85 - 95",
        "key_signals": [
            "Mandatory upfront fee demand (₹1,999)",
            "100% Guaranteed selection without technical interview",
            "Unrealistic salary (₹48,000/mo for 2hr daily copy-paste)",
            "Extreme urgency pressure tactic ('offer expires in 2 hours')",
            "Consumer webmail (@gmail.com) and insecure HTTP (.xyz) domain"
        ]
    },
    {
        "id": "scenario-3",
        "title": "Scenario 3: Corporate Brand Impersonation Attack",
        "tag": "SYNTHETIC BENCHMARK - IMPERSONATION",
        "company": "Microsoft",
        "role": "Associate AI Engineer",
        "email": "careers.microsoft.talent@gmail.com",
        "website": "https://micros0ft-careers-portal.site",
        "url": "https://micros0ft-careers-portal.site/offer-verification?login=true",
        "job_text": """Microsoft India Talent Acquisition Team
We are pleased to offer you the position of Associate AI Engineer at Microsoft Development Center.
Annual Compensation: ₹22,00,000 LPA.
Direct selection based on your LinkedIn profile screening. No coding test required.
To proceed with onboarding, please review your offer letter and submit the refundable laptop dispatch caution deposit of ₹12,500 to our logistics partner account.
Submit verification via our career portal: micros0ft-careers-portal.site or email HR directly at careers.microsoft.talent@gmail.com.""",
        "expected_risk": "Very high risk indicators (85–100)",
        "expected_score_range": "90 - 100",
        "key_signals": [
            "High-profile brand impersonation (Microsoft claimed)",
            "Typosquatted lookalike domain ('micros0ft-careers-portal.site')",
            "Recruiter email using free webmail (@gmail.com)",
            "Equipment caution deposit demand (₹12,500)",
            "Direct appointment without technical rounds"
        ]
    }
]

@router.get("/scenarios", response_model=List[Dict[str, Any]])
def get_demo_scenarios():
    """Retrieve pre-configured synthetic demo scenarios for live presentation."""
    return DEMO_SCENARIOS
