import re
from typing import Any


# ============================================================
# PII / PHI PATTERNS
# ============================================================

PATTERNS = {

    # Email
    "email": re.compile(
        r"\b[A-Za-z0-9._%+-]+@"
        r"[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"
    ),

    # Indian / international phone numbers
    "phone": re.compile(
        r"(?<!\d)"
        r"(?:\+?\d{1,3}[\s.-]?)?"
        r"(?:\d{10}|\d{5}[\s.-]\d{5})"
        r"(?!\d)"
    ),

    # DOB / Date of Birth
    "date_of_birth": re.compile(
        r"\b(?:DOB|Date of Birth|Birth Date)"
        r"\s*[:\-]?\s*"
        r"\d{1,4}[-/]\d{1,2}[-/]\d{1,4}\b",
        re.IGNORECASE
    ),

    # Aadhaar-like 12 digit number
    "aadhaar": re.compile(
        r"(?<!\d)"
        r"\d{4}\s?\d{4}\s?\d{4}"
        r"(?!\d)"
    ),

    # Patient identifiers
    "patient_identifier": re.compile(
        r"\b(?:patient\s*id|patient\s*identifier|"
        r"medical\s*record\s*(?:number|no|#)|MRN)"
        r"\s*[:#\-]?\s*[A-Za-z0-9\-]+\b",
        re.IGNORECASE
    ),

    # Name
    "name": re.compile(
        r"\b(?:Name|Patient Name|Full Name)"
        r"\s*[:\-]\s*"
        r"[A-Za-z]+(?:\s+[A-Za-z]+){0,3}",
        re.IGNORECASE
    ),

    # Address
    "address": re.compile(
        r"\b(?:Address|Home Address|Residential Address)"
        r"\s*[:\-]\s*"
        r"[^\n]+",
        re.IGNORECASE
    )
}


# ============================================================
# SENSITIVE FIELD NAMES
# ============================================================

SENSITIVE_FIELDS = {

    "name":
        "[REDACTED_NAME]",

    "patient_name":
        "[REDACTED_NAME]",

    "full_name":
        "[REDACTED_NAME]",

    "email":
        "[REDACTED_EMAIL]",

    "phone":
        "[REDACTED_PHONE]",

    "phone_number":
        "[REDACTED_PHONE]",

    "mobile":
        "[REDACTED_PHONE]",

    "mobile_number":
        "[REDACTED_PHONE]",

    "dob":
        "[REDACTED_DATE_OF_BIRTH]",

    "date_of_birth":
        "[REDACTED_DATE_OF_BIRTH]",

    "birth_date":
        "[REDACTED_DATE_OF_BIRTH]",

    "address":
        "[REDACTED_ADDRESS]",

    "home_address":
        "[REDACTED_ADDRESS]",

    "residential_address":
        "[REDACTED_ADDRESS]",

    "patient_id":
        "[REDACTED_PATIENT_ID]",

    "patient_identifier":
        "[REDACTED_PATIENT_IDENTIFIER]",

    "medical_record_number":
        "[REDACTED_MRN]",

    "mrn":
        "[REDACTED_MRN]"
}


# ============================================================
# TEXT SCRUBBING
# ============================================================

def scrub_text(text: str):

    detected = []

    scrubbed = text

    for category, pattern in PATTERNS.items():

        if pattern.search(scrubbed):

            detected.append(category)

            scrubbed = pattern.sub(
                f"[REDACTED_{category.upper()}]",
                scrubbed
            )

    return scrubbed, detected


# ============================================================
# JSON SCRUBBING
# ============================================================

def scrub_value(
    value: Any,
    detected: list
):

    # ----------------------------------------
    # String
    # ----------------------------------------

    if isinstance(value, str):

        scrubbed, found = scrub_text(
            value
        )

        for category in found:

            if category not in detected:
                detected.append(category)

        return scrubbed

    # ----------------------------------------
    # Dictionary
    # ----------------------------------------

    if isinstance(value, dict):

        cleaned = {}

        for key, item in value.items():

            normalized_key = (
                str(key)
                .strip()
                .lower()
                .replace(" ", "_")
            )

            # Sensitive field detected
            if normalized_key in SENSITIVE_FIELDS:

                replacement = SENSITIVE_FIELDS[
                    normalized_key
                ]

                cleaned[key] = replacement

                # Record category
                if (
                    normalized_key
                    not in detected
                ):
                    detected.append(
                        normalized_key
                    )

            else:

                cleaned[key] = scrub_value(
                    item,
                    detected
                )

        return cleaned

    # ----------------------------------------
    # Lists
    # ----------------------------------------

    if isinstance(value, list):

        return [
            scrub_value(
                item,
                detected
            )
            for item in value
        ]

    # ----------------------------------------
    # Numbers / booleans / None
    # ----------------------------------------

    return value


# ============================================================
# PUBLIC FUNCTION
# ============================================================

def scrub_patient_record(
    patient: dict
) -> dict:

    detected = []

    scrubbed_patient = scrub_value(
        patient,
        detected
    )

    return {

        "scrubbed_patient":
            scrubbed_patient,

        "privacy": {

            "pii_detected":
                len(detected) > 0,

            "detected_categories":
                detected,

            "redaction_count":
                len(detected),

            "status": (
                "SCRUBBED"
                if detected
                else "NO_PII_DETECTED"
            )
        }
    }