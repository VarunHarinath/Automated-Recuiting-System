import io
import re

import fitz
from docx import Document

SUPPORTED_MIME_TYPES = {
    "application/pdf": ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
}


def extract_text(content: bytes, mime_type: str, filename: str) -> str:
    suffix = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    expected = SUPPORTED_MIME_TYPES.get(mime_type)
    if not expected or suffix != expected:
        raise ValueError("UNSUPPORTED_FILE_TYPE")
    try:
        if suffix == ".pdf":
            with fitz.open(stream=content, filetype="pdf") as document:
                text = "\n".join(page.get_text() for page in document)
        else:
            document = Document(io.BytesIO(content))
            text = "\n".join(paragraph.text for paragraph in document.paragraphs)
    except Exception as error:
        raise ValueError("UNREADABLE_DOCUMENT") from error
    text = re.sub(r"[ \t]+", " ", text).strip()
    if not text:
        raise ValueError("EMPTY_DOCUMENT")
    return text


def deterministic_extract(text: str, known_skills: list[str]) -> dict:
    email_match = re.search(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", text, re.I)
    phone_match = re.search(r"(?:\+?\d[\d\s().-]{7,}\d)", text)
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    name = lines[0][:120] if lines and not email_match or (lines and "@" not in lines[0]) else None
    skills = sorted({skill.strip() for skill in known_skills if re.search(rf"(?<!\w){re.escape(skill.strip())}(?!\w)", text, re.I)}, key=str.casefold)
    experience = [line for line in lines if re.search(r"experience|developer|engineer|manager|analyst", line, re.I)][:20]
    education = [line for line in lines if re.search(r"education|university|college|bachelor|master|degree", line, re.I)][:20]
    years = [float(value) for value in re.findall(r"(\d+(?:\.\d+)?)\+?\s+years?", text, re.I)]
    return {
        "name": name,
        "email": email_match.group(0).lower() if email_match else None,
        "phone": phone_match.group(0).strip() if phone_match else None,
        "skills": skills,
        "education": education,
        "experience": experience,
        "total_experience_years": max(years) if years else None,
        "summary": None,
    }
