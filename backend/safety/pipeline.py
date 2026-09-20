from backend.safety.pii_scrubber import (
    scrub_patient_record
)

from backend.screening.evaluator import (
    screen_patient
)


def safe_screen_patient(
    patient: dict,
    criteria: dict
) -> dict:
    """
    Privacy-first screening pipeline.

    1. Scrub PII/PHI.
    2. Screen only the scrubbed record.
    3. Return privacy metadata with the decision.
    """

    # ==========================================
    # STEP 1: PRIVACY SCRUBBING
    # ==========================================

    privacy_result = scrub_patient_record(
        patient
    )

    scrubbed_patient = privacy_result[
        "scrubbed_patient"
    ]

    privacy = privacy_result[
        "privacy"
    ]

    # ==========================================
    # STEP 2: DETERMINISTIC SCREENING
    # ==========================================

    screening_result = screen_patient(
        scrubbed_patient,
        criteria
    )

    # ==========================================
    # STEP 3: COMBINE RESULTS
    # ==========================================

    screening_result["privacy"] = privacy

    return screening_result