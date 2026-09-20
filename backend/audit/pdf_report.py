from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak
)

PROJECT_ROOT = Path(__file__).resolve().parents[2]

OUTPUT_DIR = (
    PROJECT_ROOT
    / "outputs"
    / "audit_dossiers"
)


def generate_pdf(dossier: dict) -> Path:

    patient_id = dossier["patient"]["patient_id"]

    output_file = (
        OUTPUT_DIR
        / f"{patient_id}_audit.pdf"
    )

    doc = SimpleDocTemplate(
        str(output_file),
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "TitleCustom",
        parent=styles["Title"],
        alignment=TA_CENTER,
        fontSize=18,
        spaceAfter=20
    )

    heading_style = ParagraphStyle(
        "HeadingCustom",
        parent=styles["Heading2"],
        spaceBefore=12,
        spaceAfter=8
    )

    body_style = styles["BodyText"]

    story = []

    # -----------------------------
    # TITLE
    # -----------------------------

    story.append(
        Paragraph(
            "CLINICAL TRIAL SCREENING<br/>AUDIT DOSSIER",
            title_style
        )
    )

    story.append(Spacer(1, 10))

    # -----------------------------
    # TRIAL INFORMATION
    # -----------------------------

    story.append(
        Paragraph(
            "Trial Information",
            heading_style
        )
    )

    trial = dossier["trial"]

    trial_table = Table([
        ["Trial ID", trial["trial_id"]],
        ["Trial Name", trial["trial_name"]],
        [
            "Patient ID",
            dossier["patient"]["patient_id"]
        ],
        [
            "Generated",
            dossier["audit_metadata"]["generated_at"]
        ]
    ], colWidths=[130, 380])

    trial_table.setStyle(
        TableStyle([
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("BACKGROUND", (0, 0), (0, -1), colors.lightgrey),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ])
    )

    story.append(trial_table)

    story.append(Spacer(1, 15))

    # -----------------------------
    # FINAL DECISION
    # -----------------------------

    story.append(
        Paragraph(
            "Final Screening Decision",
            heading_style
        )
    )

    screening = dossier["screening"]

    decision = screening["decision"]

    decision_table = Table([
        ["Decision", decision],
        [
            "Evidence Completeness",
            f"{screening['evidence_completeness'] * 100:.0f}%"
        ],
        [
            "Total Criteria",
            screening["summary"]["total"]
        ],
        [
            "Passed",
            screening["summary"]["passed"]
        ],
        [
            "Failed",
            screening["summary"]["failed"]
        ],
        [
            "Unknown",
            screening["summary"]["unknown"]
        ]
    ], colWidths=[200, 310])

    decision_table.setStyle(
        TableStyle([
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("BACKGROUND", (0, 0), (0, -1), colors.lightgrey),
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTNAME", (1, 0), (1, 0), "Helvetica-Bold"),
            ("ALIGN", (1, 0), (1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ])
    )

    story.append(decision_table)

    story.append(Spacer(1, 15))

    # -----------------------------
    # GOVERNANCE NOTE
    # -----------------------------

    story.append(
        Paragraph(
            "<b>Governance Note:</b> "
            "Eligibility was determined using a deterministic "
            "rule evaluator. Missing or ambiguous evidence is "
            "not inferred.",
            body_style
        )
    )

    story.append(Spacer(1, 15))

    # -----------------------------
    # CRITERIA EVIDENCE
    # -----------------------------

    story.append(
        Paragraph(
            "Criterion-Level Evidence",
            heading_style
        )
    )

    for result in dossier["criteria_evidence"]:

        criterion_id = result["criterion_id"]

        criterion_type = result["criterion_type"]

        description = result["description"]

        patient_value = result["patient_value"]

        expected_value = result["expected_value"]

        result_status = result["result"]

        citation = result["citation"]

        source = result["source"]

        if patient_value is None:
            patient_display = "NOT AVAILABLE"
        else:
            patient_display = str(patient_value)

        evidence_table = Table([
            ["Criterion", criterion_id],
            ["Type", criterion_type.upper()],
            ["Requirement", description],
            ["Patient Evidence", patient_display],
            ["Expected", str(expected_value)],
            ["Evaluation", result_status],
            ["Source", source],
            ["Citation", citation]
        ], colWidths=[130, 380])

        evidence_table.setStyle(
            TableStyle([
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("BACKGROUND", (0, 0), (0, -1), colors.lightgrey),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ])
        )

        story.append(evidence_table)
        story.append(Spacer(1, 12))

    # -----------------------------
    # DECISION BASIS
    # -----------------------------

    story.append(
        Paragraph(
            "Decision Basis",
            heading_style
        )
    )

    failed = [
        x for x in dossier["criteria_evidence"]
        if x["result"] == "FAIL"
    ]

    unknown = [
        x for x in dossier["criteria_evidence"]
        if x["result"] == "UNKNOWN"
    ]

    if failed:

        text = (
            "The patient was classified as "
            "<b>INELIGIBLE</b> because one or more "
            "trial criteria failed."
        )

    elif unknown:

        text = (
            "The patient requires "
            "<b>HUMAN OVERVIEW</b> because required "
            "evidence is missing or ambiguous. "
            "No missing medical value was inferred."
        )

    else:

        text = (
            "All required inclusion criteria passed "
            "and no exclusion conditions were triggered. "
            "The patient was classified as "
            "<b>ELIGIBLE</b>."
        )

    story.append(
        Paragraph(
            text,
            body_style
        )
    )

    story.append(Spacer(1, 20))

    story.append(
        Paragraph(
            "System: Governed Clinical Trial Screening Agent",
            body_style
        )
    )

    story.append(
        Paragraph(
            "Decision Engine: Deterministic Rule Evaluator",
            body_style
        )
    )

    doc.build(story)

    return output_file