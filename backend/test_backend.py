import sys
print("Step 1: sys path set", flush=True)

try:
    from app.config import settings
    print("Step 2: config loaded", flush=True)
except Exception as e:
    print(f"Error in config: {e}", flush=True)

try:
    from app.database import engine, Base, SessionLocal
    print("Step 3: db imported", flush=True)
except Exception as e:
    print(f"Error in db: {e}", flush=True)

try:
    from app.models import User, Scan, CompanyRecord
    print("Step 4: models imported", flush=True)
except Exception as e:
    print(f"Error in models: {e}", flush=True)

try:
    from app.services.nlp_analyzer import analyze_job_text
    print("Step 5: nlp analyzer imported", flush=True)
except Exception as e:
    print(f"Error in nlp: {e}", flush=True)

try:
    from app.main import app
    print("Step 6: full app imported successfully!", flush=True)
except Exception as e:
    print(f"Error in main: {e}", flush=True)
