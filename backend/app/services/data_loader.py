import os
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sqlalchemy.orm import Session
from app.config import settings
from app.models import CompanyRecord, CommunityReport, Scan, ScanFinding

# Curated list of verified authentic corporate domains
TRUSTED_COMPANIES = [
    {"name": "Microsoft", "domain": "microsoft.com", "industry": "Technology", "source": "Fortune 500 Verified"},
    {"name": "Google", "domain": "google.com", "industry": "Technology", "source": "Fortune 500 Verified"},
    {"name": "Amazon", "domain": "amazon.com", "industry": "Technology & E-commerce", "source": "Fortune 500 Verified"},
    {"name": "Apple", "domain": "apple.com", "industry": "Consumer Tech", "source": "Fortune 500 Verified"},
    {"name": "Meta", "domain": "meta.com", "industry": "Technology", "source": "Fortune 500 Verified"},
    {"name": "Tata Consultancy Services", "domain": "tcs.com", "industry": "IT Services", "source": "NASSCOM Registered"},
    {"name": "Infosys", "domain": "infosys.com", "industry": "IT Services", "source": "NASSCOM Registered"},
    {"name": "Wipro", "domain": "wipro.com", "industry": "IT Services", "source": "NASSCOM Registered"},
    {"name": "HCL Technologies", "domain": "hcltech.com", "industry": "IT Services", "source": "NASSCOM Registered"},
    {"name": "IBM", "domain": "ibm.com", "industry": "Technology & Cloud", "source": "Fortune 500 Verified"},
    {"name": "Oracle", "domain": "oracle.com", "industry": "Database & Cloud", "source": "Fortune 500 Verified"},
    {"name": "Cisco", "domain": "cisco.com", "industry": "Networking", "source": "Fortune 500 Verified"},
    {"name": "Adobe", "domain": "adobe.com", "industry": "Software", "source": "Fortune 500 Verified"},
    {"name": "Intel", "domain": "intel.com", "industry": "Semiconductors", "source": "Fortune 500 Verified"},
    {"name": "NVIDIA", "domain": "nvidia.com", "industry": "AI & Hardware", "source": "Fortune 500 Verified"},
    {"name": "Deloitte", "domain": "deloitte.com", "industry": "Consulting", "source": "Big Four Accounting"},
    {"name": "PwC", "domain": "pwc.com", "industry": "Consulting", "source": "Big Four Accounting"},
    {"name": "EY", "domain": "ey.com", "industry": "Consulting", "source": "Big Four Accounting"},
    {"name": "KPMG", "domain": "kpmg.com", "industry": "Consulting", "source": "Big Four Accounting"},
    {"name": "Goldman Sachs", "domain": "goldmansachs.com", "industry": "Finance & Investment", "source": "Global Bank Registry"},
    {"name": "JPMorgan Chase", "domain": "jpmorganchase.com", "industry": "Finance & Investment", "source": "Global Bank Registry"},
    {"name": "Accenture", "domain": "accenture.com", "industry": "IT & Consulting", "source": "Fortune 500 Verified"},
    {"name": "Cognizant", "domain": "cognizant.com", "industry": "IT Services", "source": "Fortune 500 Verified"},
    {"name": "Capgemini", "domain": "capgemini.com", "industry": "IT Services", "source": "Global Tech Registry"},
]

# Baseline training dataset for recruitment fraud detection
TRAINING_DATA = [
    # Fraudulent / Scam recruitment samples
    ("URGENT HIRING: Guaranteed selection! Earn ₹50,000 per month from home. No interview needed. Just deposit a refundable registration fee of ₹1,500 for training materials. Contact immediately on WhatsApp 9876543210. Limited seats available!", 1),
    ("Congratulations! You are directly selected for Data Entry Executive at Microsoft. Package: 8.5 LPA. No prior experience required. Please pay a security deposit of Rs 2,500 for ID card and laptop delivery to Google Pay account.", 1),
    ("Work from home typing job! Earn $500 per day by copying text. 100% genuine guaranteed income. Registration charge $50 via crypto or wire transfer. Send resume to jobhr2026@gmail.com on telegram.", 1),
    ("Direct joining in Amazon warehouse. Immediate appointment letter. Candidate must pay compulsory documentation and background verification fee of ₹3,999. Salary 45,000 monthly. No test or interview.", 1),
    ("Exclusive student internship offer. Guaranteed stipend ₹60,000/month. To confirm your slot, pay registration fee ₹2,000 within 2 hours. Offer expires today! WhatsApp HR at +91-9988776655.", 1),
    ("Google India Hiring Drive! Direct selection without interview. Pay Rs 4,500 security deposit for company laptop dispatch. Contact careers-google-recruitment@yahoo.com.", 1),
    ("Online part time job. Earn 10,000 daily watching YouTube videos and submitting screenshots. Join Telegram group now. Initial investment of Rs 1,000 required for task allocation.", 1),
    ("Direct placement offer letter issued. You have been selected as Junior Software Engineer. Send refundable gate pass fee Rs 5,000 to HR UPI ID before 5 PM to receive onboarding kit.", 1),
    ("Urgent requirement: Back office assistant. Guaranteed job, no skills needed. Must pay training module fees of Rs 3,500. Salary 35,000 INR per month. Apply on WhatsApp.", 1),
    ("Earn huge passive income! Amazon affiliate direct operator. Daily payout guaranteed. Deposit Rs 1,200 security caution money. Only 3 slots left in your city.", 1),

    # Legitimate recruitment samples
    ("Software Engineer - Backend. We are looking for an experienced Python developer with strong skills in FastAPI, PostgreSQL, and distributed systems. 3+ years experience required. Responsibilities include building scalable APIs and database optimization. Apply via our official careers portal at careers.company.com. Competitive compensation based on interview performance. No application fees required.", 0),
    ("Frontend Developer Intern. 3-month summer internship for computer science students. Requirements: React, TypeScript, Tailwind CSS. Selection involves resume screening, a technical coding assessment, and two interview rounds. Monthly stipend: ₹25,000. Apply through our careers page.", 0),
    ("Associate Product Manager at Enterprise Solutions. Full-time position. You will work with engineering and design teams to deliver enterprise software. Requirements: Bachelor's degree, strong analytical skills. Comprehensive health insurance, 401(k), paid time off. We never ask for payments or deposits during recruitment.", 0),
    ("Data Analyst - Business Intelligence. Requirements: SQL, Python, Tableau. 2+ years experience. Conduct data audits, build executive dashboards. Competitive salary with performance bonus. The recruitment process includes technical evaluation and hiring manager interview. Apply on our verified portal.", 0),
    ("DevOps Engineer - Cloud Infrastructure. AWS, Kubernetes, Terraform experience required. Design CI/CD pipelines, ensure high availability. Equal opportunity employer. Selection based strictly on merit and technical assessment. No charges for interview or background verification.", 0),
    ("HR Generalist. Full-time role in Mumbai. Manage employee onboarding, policy compliance, and talent acquisition. Minimum 3 years in corporate human resources. Standard benefits package including medical coverage. Apply at careers.techcorp.com.", 0),
    ("Cybersecurity Analyst. Monitor security operations center, incident response, vulnerability assessments. Knowledge of SIEM, network protocols. 4-round technical evaluation. Generous annual salary and bonus structure.", 0),
    ("Machine Learning Intern. Work on NLP models and recommendation systems. Open to final year undergraduate and graduate students. Duration: 6 months. Generous monthly stipend, mentor support. Apply via LinkedIn or official careers email.", 0),
    ("Sales Executive - B2B SaaS. Drive enterprise software sales across EMEA region. 4+ years quota-carrying experience. Base salary plus uncapped commission. Clear hiring process with roleplay presentation.", 0),
    ("Quality Assurance Engineer. Manual and automated testing with Selenium, PyTest. Collaborate with agile development sprints. Full-time position with standard benefits and remote work options.", 0)
]

def seed_database(db: Session):
    """Seed trusted company records and demo community reports."""
    # Seed companies
    for comp in TRUSTED_COMPANIES:
        existing = db.query(CompanyRecord).filter(CompanyRecord.official_domain == comp["domain"]).first()
        if not existing:
            record = CompanyRecord(
                company_name=comp["name"],
                official_domain=comp["domain"],
                industry=comp.get("industry", "Technology"),
                verification_source=comp.get("source", "Official Corporate Registry"),
                verification_status="VERIFIED_AUTHENTIC",
                description=f"Verified corporate identity of {comp['name']}."
            )
            db.add(record)
    
    # Seed sample community reports if none exist
    if db.query(CommunityReport).count() == 0:
        reports = [
            CommunityReport(
                company_name="Apex Global Tech Solutions",
                job_title="Remote Data Entry Clerk",
                description="Promised ₹45,000/month for simple typing work. After submitting application, they demanded ₹2,500 via UPI for 'software license key' and then blocked my phone number.",
                website="apex-data-work.xyz",
                recruiter_contact="hr.apexsupport@gmail.com",
                evidence_text="Demanded ₹2,500 security fee; sent fake appointment letter on WhatsApp.",
                moderation_status="APPROVED"
            ),
            CommunityReport(
                company_name="Impersonated Infosys HR",
                job_title="Associate Software Engineer",
                description="Scammer claiming to be 'Infosys Talent Acquisition' sent an email from careers@infosys-hiring-portal.online offering direct selection without interview, asking for ₹4,999 training fee.",
                website="infosys-hiring-portal.online",
                recruiter_contact="careers@infosys-hiring-portal.online",
                evidence_text="Lookalike domain imitating Infosys. Demanded advance training kit payment.",
                moderation_status="APPROVED"
            ),
            CommunityReport(
                company_name="FastTrack Internships Hub",
                job_title="AI Research Intern",
                description="Guaranteed internship with top AI lab. Charged ₹1,200 'registration & certificate fee'. Never conducted any work or provided legitimate mentors.",
                website="fasttrack-interns.co",
                recruiter_contact="admissions@fasttrack-interns.co",
                evidence_text="Fee-charging internship scam targeting college 2nd year students.",
                moderation_status="APPROVED"
            )
        ]
        for rep in reports:
            db.add(rep)

    db.commit()

def train_or_load_nlp_model():
    """Train or load the baseline NLP classifier and TF-IDF vectorizer."""
    model_path = os.path.join(settings.DATA_DIR, "nlp_classifier.joblib")
    vectorizer_path = os.path.join(settings.DATA_DIR, "tfidf_vectorizer.joblib")

    if os.path.exists(model_path) and os.path.exists(vectorizer_path):
        vectorizer = joblib.load(vectorizer_path)
        classifier = joblib.load(model_path)
        return vectorizer, classifier

    # Train baseline model
    texts = [item[0] for item in TRAINING_DATA]
    labels = [item[1] for item in TRAINING_DATA]

    vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=1500, stop_words="english")
    X = vectorizer.fit_transform(texts)

    classifier = LogisticRegression(C=1.0, random_state=42)
    classifier.fit(X, labels)

    joblib.dump(vectorizer, vectorizer_path)
    joblib.dump(classifier, model_path)

    return vectorizer, classifier
