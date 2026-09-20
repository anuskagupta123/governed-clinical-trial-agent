import sys
from pathlib import Path
import json

PROJECT_ROOT = Path(__file__).resolve().parents[1]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


from agents.protocol_agent import extract_protocol_criteria
from backend.pdf_parser import extract_pdf_text
from backend.screening.normalizer import normalize_criteria


protocol_path = (
    PROJECT_ROOT
    / "data"
    / "protocols"
    / "diabetes_trial.pdf"
)


print("======================================")
print("LYZR PROTOCOL AGENT TEST")
print("======================================")

print("\n1. Reading protocol...")

protocol_text = extract_pdf_text(
    str(protocol_path)
)

print(
    f"✓ Protocol extracted: "
    f"{len(protocol_text)} characters"
)


print("\n2. Sending protocol to Lyzr...")

criteria = extract_protocol_criteria(
    protocol_text
)

print("✓ Lyzr extraction successful")


print("\n3. Normalizing criteria...")

normalized = normalize_criteria(
    criteria
)

print("✓ Criteria normalized")


print("\n======================================")
print("NORMALIZED CRITERIA")
print("======================================")

print(
    json.dumps(
        normalized,
        indent=2
    )
)


output_path = (
    PROJECT_ROOT
    / "data"
    / "criteria_from_lyzr.json"
)

with open(
    output_path,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        normalized,
        file,
        indent=2
    )


print("\n✓ Saved to:")
print(output_path)