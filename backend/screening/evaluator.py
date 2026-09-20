from typing import Any


def get_nested_value(data: dict, field: str):
    """
    Get a value from a nested dictionary.

    Example:
        labs.egfr -> patient["labs"]["egfr"]
    """

    current = data

    for part in field.split("."):
        if not isinstance(current, dict):
            return None

        if part not in current:
            return None

        current = current[part]

    return current


def evaluate_condition(
    patient_value: Any,
    operator: str,
    expected_value: Any
) -> str:
    """
    Evaluate one condition.

    Returns:
        PASS
        FAIL
        UNKNOWN
    """

    # Missing evidence
    if patient_value is None:
        return "UNKNOWN"

    try:

        # -------------------------
        # EQUALS
        # -------------------------
        if operator == "equals":

            if patient_value == expected_value:
                return "PASS"

            return "FAIL"

        # -------------------------
        # GREATER THAN
        # -------------------------
        elif operator == ">":

            if patient_value > expected_value:
                return "PASS"

            return "FAIL"

        # -------------------------
        # GREATER THAN OR EQUAL
        # -------------------------
        elif operator == ">=":

            if patient_value >= expected_value:
                return "PASS"

            return "FAIL"

        # -------------------------
        # LESS THAN
        # -------------------------
        elif operator == "<":

            if patient_value < expected_value:
                return "PASS"

            return "FAIL"

        # -------------------------
        # LESS THAN OR EQUAL
        # -------------------------
        elif operator == "<=":

            if patient_value <= expected_value:
                return "PASS"

            return "FAIL"

        # -------------------------
        # BETWEEN
        # -------------------------
        elif operator == "between":

            if (
                isinstance(expected_value, list)
                and len(expected_value) == 2
            ):
                lower = expected_value[0]
                upper = expected_value[1]

                if lower <= patient_value <= upper:
                    return "PASS"

                return "FAIL"

        # -------------------------
        # CONTAINS
        # -------------------------
        elif operator == "contains":

            if isinstance(patient_value, list):

                if expected_value in patient_value:
                    return "PASS"

                return "FAIL"

            if isinstance(patient_value, str):

                if str(expected_value).lower() in patient_value.lower():
                    return "PASS"

                return "FAIL"

            return "FAIL"

        # -------------------------
        # EXISTS
        # -------------------------
        elif operator == "exists":

            if patient_value is not None:
                return "PASS"

            return "UNKNOWN"

        return "UNKNOWN"

    except (TypeError, ValueError):
        return "UNKNOWN"


def evaluate_criterion(
    patient: dict,
    criterion: dict
) -> dict:
    """
    Evaluate one inclusion/exclusion criterion.

    Important:
    Inclusion:
        PASS = good
        FAIL = patient excluded

    Exclusion:
        PASS from the underlying condition means
        the exclusion condition is present,
        therefore the patient FAILS the trial criterion.

        FAIL from the underlying condition means
        exclusion condition is absent,
        therefore the patient PASSES.
    """

    field = criterion["field"]
    operator = criterion["operator"]
    expected_value = criterion["value"]
    criterion_type = criterion["criterion_type"]

    patient_value = get_nested_value(
        patient,
        field
    )

    condition_result = evaluate_condition(
        patient_value,
        operator,
        expected_value
    )

    # --------------------------------
    # Missing / ambiguous evidence
    # --------------------------------
    if condition_result == "UNKNOWN":

        final_result = "UNKNOWN"

    # --------------------------------
    # Inclusion criterion
    # --------------------------------
    elif criterion_type == "inclusion":

        final_result = condition_result

    # --------------------------------
    # Exclusion criterion
    # --------------------------------
    elif criterion_type == "exclusion":

        if condition_result == "PASS":
            # Exclusion condition is TRUE.
            # Patient must be excluded.
            final_result = "FAIL"

        else:
            # Exclusion condition is FALSE.
            # Patient passes this exclusion criterion.
            final_result = "PASS"

    else:
        final_result = "UNKNOWN"

    return {
        "criterion_id": criterion["id"],
        "criterion_type": criterion_type,
        "description": criterion["description"],
        "field": field,
        "operator": operator,
        "expected_value": expected_value,
        "patient_value": patient_value,
        "result": final_result,
        "citation": criterion.get(
            "citation",
            ""
        ),
        "source": criterion.get(
            "source",
            "Protocol"
        )
    }


def screen_patient(
    patient: dict,
    criteria: dict
) -> dict:
    """
    Screen a patient against the normalized
    Lyzr-generated protocol criteria.
    """

    results = []

    # =====================================
    # INCLUSION CRITERIA
    # =====================================

    for criterion in criteria.get(
        "inclusion_criteria",
        []
    ):

        result = evaluate_criterion(
            patient,
            criterion
        )

        results.append(result)

    # =====================================
    # EXCLUSION CRITERIA
    # =====================================

    for criterion in criteria.get(
        "exclusion_criteria",
        []
    ):

        result = evaluate_criterion(
            patient,
            criterion
        )

        results.append(result)

    # =====================================
    # SUMMARY
    # =====================================

    total = len(results)

    passed = sum(
        1
        for result in results
        if result["result"] == "PASS"
    )

    failed = sum(
        1
        for result in results
        if result["result"] == "FAIL"
    )

    unknown = sum(
        1
        for result in results
        if result["result"] == "UNKNOWN"
    )

    # =====================================
    # FINAL DECISION
    # =====================================

    if failed > 0:

        decision = "INELIGIBLE"

    elif unknown > 0:

        decision = "REQUIRES_HUMAN_OVERVIEW"

    else:

        decision = "ELIGIBLE"

    # =====================================
    # EVIDENCE COMPLETENESS
    # =====================================

    if total > 0:
        evidence_completeness = round(
            (passed + failed) / total,
            2
        )
    else:
        evidence_completeness = 0.0

    return {
        "patient_id": patient.get(
            "patient_id",
            patient.get("id", "unknown")
        ),

        "decision": decision,

        "evidence_completeness":
            evidence_completeness,

        "summary": {
            "total": total,
            "passed": passed,
            "failed": failed,
            "unknown": unknown
        },

        "criteria_results": results
    }