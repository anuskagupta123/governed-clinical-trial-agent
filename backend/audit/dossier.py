import json
from datetime import datetime, timezone
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]

OUTPUT_DIR = (
    PROJECT_ROOT
    / "outputs"
    / "audit_dossiers"
)

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


def build_audit_dossier(
    patient: dict,
    screening_result: dict,
    criteria: dict
) -> dict:

    dossier = {
        "audit_metadata": {
            "generated_at": datetime.now(
                timezone.utc
            ).isoformat(),

            "system": "Governed Clinical Trial Screening Agent",

            "decision_engine":
                "Deterministic Rule Evaluator",

            "protocol_source":
                "Synthetic Clinical Trial Protocol",

            "patient_source":
                "Synthetic / De-identified EHR"
        },

        "trial": {
            "trial_id": criteria.get(
                "trial_id",
                ""
            ),

            "trial_name": criteria.get(
                "trial_name",
                ""
            )
        },

        "patient": {
            "patient_id": screening_result.get(
                "patient_id",
                patient.get("patient_id", "")
            )
        },

        "screening": {
            "decision": screening_result[
                "decision"
            ],

            "evidence_completeness":
                screening_result[
                    "evidence_completeness"
                ],

            "summary":
                screening_result[
                    "summary"
                ]
        },

        "criteria_evidence": []
    }

    for result in screening_result[
        "criteria_results"
    ]:

        dossier["criteria_evidence"].append({

            "criterion_id":
                result["criterion_id"],

            "criterion_type":
                result["criterion_type"],

            "description":
                result["description"],

            "field":
                result["field"],

            "operator":
                result["operator"],

            "expected_value":
                result["expected_value"],

            "patient_value":
                result["patient_value"],

            "result":
                result["result"],

            "source":
                result["source"],

            "citation":
                result["citation"]
        })

    return dossier


def save_audit_dossier(
    dossier: dict
) -> Path:

    patient_id = dossier[
        "patient"
    ]["patient_id"]

    output_file = (
        OUTPUT_DIR
        / f"{patient_id}_audit.json"
    )

    with open(
        output_file,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            dossier,
            file,
            indent=2,
            ensure_ascii=False
        )

    return output_file