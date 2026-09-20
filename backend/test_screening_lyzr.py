import json
from pathlib import Path
import sys


# Add project root to Python path
PROJECT_ROOT = Path(__file__).resolve().parents[1]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


from backend.screening.evaluator import screen_patient


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
    print("LYZR CRITERIA → DETERMINISTIC SCREENING TEST")
    print("=" * 60)

    # --------------------------------
    # Load Lyzr-generated criteria
    # --------------------------------

    print("\n1. Loading Lyzr criteria...")

    criteria = load_json(
        CRITERIA_FILE
    )

    print(
        f"✓ Trial: {criteria['trial_id']}"
    )

    print(
        f"✓ Inclusion criteria: "
        f"{len(criteria['inclusion_criteria'])}"
    )

    print(
        f"✓ Exclusion criteria: "
        f"{len(criteria['exclusion_criteria'])}"
    )

    # --------------------------------
    # Screen patients
    # --------------------------------

    print("\n2. Screening patients...")

    patient_files = sorted(
        PATIENTS_DIR.glob("patient_*.json")
    )

    if not patient_files:
        print("No patient files found.")
        return

    for patient_file in patient_files:

        patient = load_json(
            patient_file
        )

        result = screen_patient(
            patient,
            criteria
        )

        print("\n" + "-" * 60)

        print(
            f"Patient: "
            f"{result['patient_id']}"
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

        print("\nCriteria:")

        for criterion in result[
            "criteria_results"
        ]:

            print(
                f"  {criterion['criterion_id']}: "
                f"{criterion['result']} | "
                f"{criterion['field']} | "
                f"patient={criterion['patient_value']}"
            )

    print("\n" + "=" * 60)
    print("SCREENING COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    main()