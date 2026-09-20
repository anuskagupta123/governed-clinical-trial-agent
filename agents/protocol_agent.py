import os
import uuid
import json
import requests

from pathlib import Path
from dotenv import load_dotenv


# ==========================================
# LOAD .ENV FROM PROJECT ROOT
# ==========================================

PROJECT_ROOT = Path(__file__).resolve().parents[1]

ENV_FILE = PROJECT_ROOT / ".env"

load_dotenv(ENV_FILE)


# ==========================================
# LYZR CONFIGURATION
# ==========================================

LYZR_API_URL = os.getenv(
    "LYZR_API_URL",
    "https://agent-prod.studio.lyzr.ai/v3/inference/chat/"
)

LYZR_API_KEY = os.getenv("LYZR_API_KEY")

LYZR_AGENT_ID = os.getenv("LYZR_AGENT_ID")

LYZR_USER_ID = os.getenv("LYZR_USER_ID")


# ==========================================
# PROTOCOL CRITERIA AGENT
# ==========================================

def extract_protocol_criteria(protocol_text: str):

    # Check configuration
    if not LYZR_API_KEY:
        raise ValueError(
            "LYZR_API_KEY is missing from .env"
        )

    if not LYZR_AGENT_ID:
        raise ValueError(
            "LYZR_AGENT_ID is missing from .env"
        )

    if not LYZR_USER_ID:
        raise ValueError(
            "LYZR_USER_ID is missing from .env"
        )


    # Create unique session
    session_id = str(uuid.uuid4())


    # ==========================================
    # PROMPT
    # ==========================================

    prompt = f"""
Extract the inclusion and exclusion criteria from this
clinical trial protocol.

Return only the configured structured JSON output.

Important safety requirements:

- Preserve numerical thresholds exactly.
- Preserve units exactly.
- Preserve time windows exactly.
- Do not invent criteria.
- Do not invent numerical values.
- Do not make patient eligibility decisions.
- Do not infer patient information.
- Do not provide medical advice.
- Return only structured JSON.

Protocol:

{protocol_text}
"""


    # ==========================================
    # REQUEST HEADERS
    # ==========================================

    headers = {
        "Content-Type": "application/json",
        "x-api-key": LYZR_API_KEY
    }


    # ==========================================
    # REQUEST BODY
    # ==========================================

    payload = {
        "user_id": LYZR_USER_ID,
        "agent_id": LYZR_AGENT_ID,
        "session_id": session_id,
        "message": prompt
    }


    # ==========================================
    # CALL LYZR
    # ==========================================

    print("Calling Lyzr Agent API...")

    response = requests.post(
        LYZR_API_URL,
        headers=headers,
        json=payload,
        timeout=120
    )


    print(
        f"Lyzr HTTP status: "
        f"{response.status_code}"
    )


    # ==========================================
    # ERROR HANDLING
    # ==========================================

    if not response.ok:

        print("Lyzr error response:")

        print(response.text)

        response.raise_for_status()


    # ==========================================
    # PARSE RESPONSE
    # ==========================================

    data = response.json()

    raw_response = data.get(
        "response",
        ""
    )


    # Lyzr returns JSON as a string
    if isinstance(raw_response, str):

        try:

            return json.loads(
                raw_response
            )

        except json.JSONDecodeError:

            raise ValueError(
                "Lyzr returned a response "
                "that is not valid JSON"
            )


    return raw_response