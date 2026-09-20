import json
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from backend.pdf_parser import extract_pdf_text
from backend.safety.pipeline import safe_screen_patient
from backend.audit.dossier import (
    build_audit_dossier,
    save_audit_dossier
)
from backend.audit.pdf_report import generate_pdf


# ============================================================
# PROJECT PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[1]

PROTOCOL_DIR = (
    PROJECT_ROOT
    / "data"
    / "protocols"
)

PATIENT_DIR = (
    PROJECT_ROOT
    / "data"
    / "synthetic_patients"
)

CRITERIA_FILE = (
    PROJECT_ROOT
    / "data"
    / "criteria_from_lyzr.json"
)

AUDIT_DIR = (
    PROJECT_ROOT
    / "outputs"
    / "audit_dossiers"
)


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="Governed Clinical Trial Screening Agent",
    description=(
        "Privacy-first clinical trial patient "
        "screening and regulatory audit system."
    ),
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# HELPERS
# ============================================================

def load_json(path: Path):

    if not path.exists():

        raise HTTPException(
            status_code=404,
            detail=f"File not found: {path}"
        )

    with open(
        path,
        "r",
        encoding="utf-8"
    ) as file:

        return json.load(file)


def get_patient_file(patient_number: int) -> Path:

    patient_file = (
        PATIENT_DIR
        / f"patient_{patient_number:03d}.json"
    )

    if not patient_file.exists():

        raise HTTPException(
            status_code=404,
            detail=(
                f"Synthetic patient "
                f"SYN-{patient_number:03d} not found."
            )
        )

    return patient_file


def get_audit_patient_id(patient_number: int) -> str:

    return f"SYN-{patient_number:03d}"


def get_audit_pdf_path(patient_number: int) -> Path:

    patient_id = get_audit_patient_id(
        patient_number
    )

    return (
        AUDIT_DIR
        / f"{patient_id}_audit.pdf"
    )


def get_audit_json_path(patient_number: int) -> Path:

    patient_id = get_audit_patient_id(
        patient_number
    )

    return (
        AUDIT_DIR
        / f"{patient_id}_audit.json"
    )


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "application":
            "Governed Clinical Trial Screening Agent",

        "status":
            "running",

        "version":
            "1.0.0"
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


# ============================================================
# PROTOCOL
# ============================================================

@app.get("/protocol")
def get_protocol():

    protocol_file = (
        PROTOCOL_DIR
        / "diabetes_trial.pdf"
    )

    if not protocol_file.exists():

        raise HTTPException(
            status_code=404,
            detail="Clinical trial protocol not found."
        )

    text = extract_pdf_text(
        str(protocol_file)
    )

    return {
        "protocol_file":
            protocol_file.name,

        "characters":
            len(text),

        "text":
            text
    }


# ============================================================
# CRITERIA
# ============================================================

@app.get("/criteria")
def get_criteria():

    return load_json(
        CRITERIA_FILE
    )


# ============================================================
# PATIENT LIST
# ============================================================

@app.get("/patients")
def get_patients():

    patients = []

    for path in sorted(
        PATIENT_DIR.glob(
            "patient_*.json"
        )
    ):

        patient = load_json(path)

        patients.append({
            "patient_id":
                patient.get(
                    "patient_id",
                    patient.get("id", "")
                )
        })

    return {
        "count": len(patients),
        "patients": patients
    }


# ============================================================
# SCREEN PATIENT
# ============================================================

@app.get("/screen/{patient_number}")
def screen(
    patient_number: int
):

    patient_file = get_patient_file(
        patient_number
    )

    patient = load_json(
        patient_file
    )

    criteria = load_json(
        CRITERIA_FILE
    )

    # Privacy-first screening
    result = safe_screen_patient(
        patient,
        criteria
    )

    return result


# ============================================================
# GENERATE AUDIT DOSSIER
# ============================================================

@app.get("/audit/{patient_number}")
def audit(
    patient_number: int
):

    patient_file = get_patient_file(
        patient_number
    )

    patient = load_json(
        patient_file
    )

    criteria = load_json(
        CRITERIA_FILE
    )

    # --------------------------------------------------------
    # Screen through privacy layer
    # --------------------------------------------------------

    screening_result = safe_screen_patient(
        patient,
        criteria
    )

    # --------------------------------------------------------
    # Build audit dossier
    # --------------------------------------------------------

    dossier = build_audit_dossier(
        patient,
        screening_result,
        criteria
    )

    # --------------------------------------------------------
    # Save JSON
    # --------------------------------------------------------

    json_file = save_audit_dossier(
        dossier
    )

    # --------------------------------------------------------
    # Generate PDF
    # --------------------------------------------------------

    pdf_file = generate_pdf(
        dossier
    )

    return {
        "patient_id":
            screening_result["patient_id"],

        "decision":
            screening_result["decision"],

        "audit_json":
            str(json_file),

        "audit_pdf":
            str(pdf_file),

        "dossier":
            dossier
    }


# ============================================================
# VIEW / DOWNLOAD AUDIT PDF
# ============================================================

@app.get("/audit/{patient_number}/pdf")
def get_audit_pdf(
    patient_number: int
):

    pdf_file = get_audit_pdf_path(
        patient_number
    )

    # If the PDF doesn't exist, generate it first.
    if not pdf_file.exists():

        audit(
            patient_number
        )

    # Check again after generation.
    if not pdf_file.exists():

        raise HTTPException(
            status_code=404,
            detail=(
                f"Audit PDF for "
                f"SYN-{patient_number:03d} "
                f"could not be generated."
            )
        )

    return FileResponse(
        path=str(pdf_file),
        media_type="application/pdf",
        filename=pdf_file.name
    )


# ============================================================
# VIEW / DOWNLOAD AUDIT JSON
# ============================================================

@app.get("/audit/{patient_number}/json")
def get_audit_json(
    patient_number: int
):

    json_file = get_audit_json_path(
        patient_number
    )

    # If the JSON doesn't exist, generate it first.
    if not json_file.exists():

        audit(
            patient_number
        )

    # Check again after generation.
    if not json_file.exists():

        raise HTTPException(
            status_code=404,
            detail=(
                f"Audit JSON for "
                f"SYN-{patient_number:03d} "
                f"could not be generated."
            )
        )

    return FileResponse(
        path=str(json_file),
        media_type="application/json",
        filename=json_file.name
    )