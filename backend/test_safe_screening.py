import json
import sys
from pathlib import Path


# ==========================================
# PROJECT ROOT
# ==========================================

PROJECT_ROOT = Path(
    __file__
).resolve().parents[1]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(
        0,
        str(PROJECT_ROOT)
    )


from backend.safety.pipeline import (
    safe_screen_patient
)


# ==========================================
# FILES
# ==========================================

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


# ==========================================
# TEST
# ==========================================

def main():

    print("=" * 65)
    print("PRIVACY-FIRST CLINICAL TRIAL SCREENING")
    print("=" * 65)

    # --------------------------------------
    # Load criteria
    # --------------------------------------

    criteria = load_json(
        CRITERIA_FILE
    )

    print(
        "\n✓ Lyzr criteria loaded"
    )

    # --------------------------------------
    # Find patients
    # --------------------------------------

    patient_files = sorted(
        PATIENTS_DIR.glob(
            "patient_*.json"
        )
    )

    # --------------------------------------
    # Screen patients
    # --------------------------------------

    for patient_file in patient_files:

        patient = load_json(
            patient_file
        )

        result = safe_screen_patient(
            patient,
            criteria
        )

        print("\n" + "-" * 65)

        print(
            f"Patient: "
            f"{result['patient_id']}"
        )

        print(
            f"Privacy status: "
            f"{result['privacy']['status']}"
        )

        print(
            f"PII detected: "
            f"{result['privacy']['pii_detected']}"
        )

        print(
            f"Decision: "
            f"{result['decision']}"
        )

        print(
            f"Evidence completeness: "
            f"{result['evidence_completeness']:.2f}"
        )

        print(
            f"Passed: "
            f"{result['summary']['passed']}"
        )

        print(
            f"Failed: "
            f"{result['summary']['failed']}"
        )

        print(
            f"Unknown: "
            f"{result['summary']['unknown']}"
        )

    print("\n" + "=" * 65)
    print("PRIVACY-FIRST SCREENING COMPLETE")
    print("=" * 65)


if __name__ == "__main__":
    main()