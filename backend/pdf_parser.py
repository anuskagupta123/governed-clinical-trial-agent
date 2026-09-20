from pathlib import Path
from pypdf import PdfReader


def extract_pdf_text(pdf_path: str) -> str:
    """
    Extract text from a clinical trial protocol PDF.
    """

    path = Path(pdf_path)

    if not path.exists():
        raise FileNotFoundError(
            f"Protocol PDF not found: {pdf_path}"
        )

    reader = PdfReader(str(path))

    pages = []

    for page_number, page in enumerate(reader.pages, start=1):

        text = page.extract_text() or ""

        pages.append(
            f"\n--- PAGE {page_number} ---\n{text}"
        )

    return "\n".join(pages)