import re


def normalize_field(field: str) -> str:
    """
    Convert Lyzr's natural-language field names
    into the exact fields used by the patient JSON.
    """

    f = field.strip().lower()

    field_map = {
        # -------------------------
        # Demographics
        # -------------------------
        "age": "age",

        # -------------------------
        # Kidney function
        # -------------------------
        "egfr": "labs.egfr",
        "e-gfr": "labs.egfr",
        "estimated glomerular filtration rate": "labs.egfr",
        "estimated glomerular filtration rate (egfr)": "labs.egfr",
        "estimated glomerular filtration rate (e-gfr)": "labs.egfr",

        # -------------------------
        # HbA1c
        # -------------------------
        "hba1c": "labs.hba1c",
        "hba1c (%)": "labs.hba1c",
        "hemoglobin a1c": "labs.hba1c",
        "glycated hemoglobin": "labs.hba1c",

        # -------------------------
        # Type 2 Diabetes
        # -------------------------
        "medical_history": "medical_history",
        "medical history": "medical_history",
        "history of type 2 diabetes": "medical_history",
        "documented history of type 2 diabetes": "medical_history",
        "documented history of type 2 diabetes mellitus": "medical_history",
        "type 2 diabetes history": "medical_history",

        # -------------------------
        # Chemotherapy
        # -------------------------
        "recent_chemotherapy": "recent_chemotherapy",
        "recent chemotherapy": "recent_chemotherapy",
        "chemotherapy": "recent_chemotherapy",
        "recent chemotherapy within previous 6 months":
            "recent_chemotherapy",

        # -------------------------
        # Pregnancy
        # -------------------------
        "pregnant": "pregnant",
        "pregnancy": "pregnant",

        # -------------------------
        # Hepatic impairment
        # -------------------------
        "severe_hepatic_impairment":
            "severe_hepatic_impairment",

        "severe hepatic impairment":
            "severe_hepatic_impairment",

        "hepatic impairment":
            "severe_hepatic_impairment",

        "known severe hepatic impairment":
            "severe_hepatic_impairment",
    }

    return field_map.get(f, field)


def normalize_number(value):
    """
    Convert numeric strings such as:
        '60'
        '60 mL/min/1.73m²'
        '6.5%'
    into float values.
    """

    if isinstance(value, (int, float)):
        return float(value)

    if isinstance(value, str):
        match = re.search(
            r"-?\d+(?:\.\d+)?",
            value
        )

        if match:
            return float(match.group())

    return value


def normalize_value(operator: str, value):
    """
    Normalize criterion values according to the operator.
    """

    operator = operator.strip().lower()

    # -------------------------
    # BETWEEN
    # -------------------------
    if operator == "between":

        # Already a list
        if isinstance(value, list) and len(value) == 2:
            return [
                normalize_number(value[0]),
                normalize_number(value[1])
            ]

        # Example:
        # "18 to 65"
        # "6.5 - 9.0"
        if isinstance(value, str):

            numbers = re.findall(
                r"-?\d+(?:\.\d+)?",
                value
            )

            if len(numbers) >= 2:
                return [
                    float(numbers[0]),
                    float(numbers[1])
                ]

    # -------------------------
    # NUMERIC COMPARISONS
    # -------------------------
    if operator in [">", ">=", "<", "<="]:
        return normalize_number(value)

    return value


def normalize_criterion(
    criterion: dict,
    criterion_type: str
) -> dict:
    """
    Normalize one criterion extracted by Lyzr.
    """

    original_field = criterion.get(
        "field",
        ""
    )

    field = normalize_field(
        original_field
    )

    operator = criterion.get(
        "operator",
        "equals"
    )

    operator = operator.strip().lower()

    value = criterion.get(
        "value",
        ""
    )

    # =====================================================
    # SEMANTIC NORMALIZATION
    # =====================================================

    # -------------------------
    # Type 2 Diabetes
    # -------------------------
    #
    # Inclusion condition:
    # Patient must have Type 2 Diabetes.
    #
    # Patient JSON:
    # "medical_history": "Type 2 Diabetes"
    #
    if field == "medical_history":

        operator = "contains"

        value = "Type 2 Diabetes"

    # -------------------------
    # Recent chemotherapy
    # -------------------------
    #
    # This is an EXCLUSION condition.
    #
    # If:
    # recent_chemotherapy == True
    #
    # the patient is excluded.
    #
    elif field == "recent_chemotherapy":

        operator = "equals"

        value = True

    # -------------------------
    # Pregnancy
    # -------------------------
    #
    # If pregnant == True,
    # the patient is excluded.
    #
    elif field == "pregnant":

        operator = "equals"

        value = True

    # -------------------------
    # Severe hepatic impairment
    # -------------------------
    #
    # If severe_hepatic_impairment == True,
    # the patient is excluded.
    #
    elif field == "severe_hepatic_impairment":

        operator = "equals"

        value = True

    # -------------------------
    # Normalize numeric values
    # -------------------------
    value = normalize_value(
        operator,
        value
    )

    return {
        "id": criterion.get(
            "id",
            ""
        ),

        "description": criterion.get(
            "description",
            ""
        ),

        "field": field,

        "operator": operator,

        "value": value,

        "unit": criterion.get(
            "unit",
            ""
        ),

        "source": criterion.get(
            "source",
            "Protocol"
        ),

        "citation": criterion.get(
            "citation",
            ""
        ),

        "criterion_type": criterion_type
    }


def normalize_criteria(criteria: dict) -> dict:
    """
    Normalize the complete criteria object
    returned by the Lyzr protocol agent.
    """

    inclusion_criteria = criteria.get(
        "inclusion_criteria",
        []
    )

    exclusion_criteria = criteria.get(
        "exclusion_criteria",
        []
    )

    normalized_inclusion = [
        normalize_criterion(
            criterion,
            "inclusion"
        )
        for criterion in inclusion_criteria
    ]

    normalized_exclusion = [
        normalize_criterion(
            criterion,
            "exclusion"
        )
        for criterion in exclusion_criteria
    ]

    return {
        "trial_id": criteria.get(
            "trial_id",
            ""
        ),

        "trial_name": criteria.get(
            "trial_name",
            ""
        ),

        "inclusion_criteria":
            normalized_inclusion,

        "exclusion_criteria":
            normalized_exclusion
    }