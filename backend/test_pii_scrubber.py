import json
import sys
from pathlib import Path


# ============================================================
# PROJECT ROOT
# ============================================================

PROJECT_ROOT = Path(
    __file__
).resolve().parents[1]

if str(PROJECT_ROOT) not in sys.path:

    sys.path.insert(
        0,
        str(PROJECT_ROOT)
    )


from backend.safety.pii_scrubber import (
    scrub_patient_record
)


# ============================================================
# TEST PATIENT
# ============================================================

test_patient = {

    "patient_id": "PAT-1001",

    "name": "Ananya Sharma",

    "email": "ananya.sharma@example.com",

    "phone": "+91 98765 43210",

    "dob": "DOB: 22/02/2006",

    "address": (
        "Address: 123 Main Street, "
        "Coimbatore, Tamil Nadu"
    ),

    "medical_record_number": "MRN-778899",

    "age": 45,

    "labs": {
        "egfr": 82,
        "hba1c": 7.2
    },

    "medical_history": [
        "Type 2 Diabetes"
    ],

    "recent_chemotherapy": False,

    "pregnant": False,

    "severe_hepatic_impairment": False
}


# ============================================================
# TEST
# ============================================================

def main():

    print("=" * 60)

    print(
        "LYZR GOVERNED CLINICAL TRIAL AGENT"
    )

    print(
        "PII / PHI SCRUBBER TEST"
    )

    print("=" * 60)

    print("\n1. RAW PATIENT RECORD")

    print(
        json.dumps(
            test_patient,
            indent=2
        )
    )

    # ----------------------------------------
    # Scrub
    # ----------------------------------------

    result = scrub_patient_record(
        test_patient
    )

    scrubbed_patient = result[
        "scrubbed_patient"
    ]

    privacy = result[
        "privacy"
    ]

    print("\n2. PRIVACY SCAN")

    print(
        f"PII detected: "
        f"{privacy['pii_detected']}"
    )

    print(
        f"Categories detected: "
        f"{privacy['detected_categories']}"
    )

    print(
        f"Status: "
        f"{privacy['status']}"
    )

    # ----------------------------------------
    # Scrubbed record
    # ----------------------------------------

    print("\n3. SCRUBBED PATIENT RECORD")

    print(
        json.dumps(
            scrubbed_patient,
            indent=2
        )
    )

    print("\n" + "=" * 60)

    print("PII / PHI SCRUBBING COMPLETE")

    print("=" * 60)


if __name__ == "__main__":

    main()