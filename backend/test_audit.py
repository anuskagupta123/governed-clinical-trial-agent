import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


from backend.screening.evaluator import screen_patient
from backend.audit.dossier import (
    build_audit_dossier,
    save_audit_dossier
)

from backend.audit.pdf_report import generate_pdf

CRITERIA_FILE = (
    PROJECT_ROOT
    / "data"
    / "criteria_from_lyzr.json"
)

PATIENTS_DIR = (
    PROJECT_ROOT
    / "data"
    / "synthetic_patients"
)


def load_json(path):

    with open(
        path,
        "r",
        encoding="utf-8"
    ) as file:

        return json.load(file)


def main():

    print("=" * 60)
    print("AUDIT DOSSIER GENERATOR TEST")
    print("=" * 60)

    criteria = load_json(
        CRITERIA_FILE
    )

    patient_files = sorted(
        PATIENTS_DIR.glob(
            "patient_*.json"
        )
    )

    for patient_file in patient_files:

        patient = load_json(
            patient_file
        )

        screening_result = screen_patient(
            patient,
            criteria
        )

        dossier = build_audit_dossier(
            patient,
            screening_result,
            criteria
        )

        output_file = save_audit_dossier(
            dossier
        )

        pdf_file = generate_pdf(
            dossier
        )

        print(
            f"  PDF: {pdf_file}"
        )

        print(
            f"\n✓ {dossier['patient']['patient_id']}"
        )

        print(
            f"  Decision: "
            f"{dossier['screening']['decision']}"
        )

        print(
            f"  Saved: {output_file}"
        )

    print("\n" + "=" * 60)
    print("AUDIT DOSSIERS GENERATED")
    print("=" * 60)


if __name__ == "__main__":
    main()