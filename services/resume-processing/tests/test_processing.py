import io
import json

import fitz
import pytest
from docx import Document
from fastapi.testclient import TestClient

from app.main import app
from app.schemas import ParsedResume

client = TestClient(app)


def pdf_bytes(text="Jane Doe\njane@example.com\nPython developer 5 years"):
    document = fitz.open(); page = document.new_page(); page.insert_text((72, 72), text); data = document.tobytes(); document.close(); return data


def docx_bytes(text="Jane Doe\njane@example.com\nPython developer 5 years"):
    stream=io.BytesIO(); document=Document(); document.add_paragraph(text); document.save(stream); return stream.getvalue()


@pytest.fixture(autouse=True)
def fake_ollama(monkeypatch):
    async def enrich(_text, hints): return ParsedResume.model_validate(hints)
    monkeypatch.setattr("app.main.enrich_with_ollama", enrich)


def send(data, name, mime, skills='["Python", "React"]'):
    return client.post("/v1/resumes/process", files={"file":(name,data,mime)}, data={"known_skills":skills})


def test_parse_01_pdf_extraction(): assert send(pdf_bytes(),"resume.pdf","application/pdf").status_code==200
def test_parse_02_docx_extraction(): assert send(docx_bytes(),"resume.docx","application/vnd.openxmlformats-officedocument.wordprocessingml.document").status_code==200
def test_parse_03_email_extraction(): assert send(pdf_bytes(),"resume.pdf","application/pdf").json()["parsed_data"]["email"]=="jane@example.com"
def test_parse_04_name_extraction(): assert send(pdf_bytes(),"resume.pdf","application/pdf").json()["parsed_data"]["name"]=="Jane Doe"
def test_parse_05_skill_extraction(): assert "Python" in send(pdf_bytes(),"resume.pdf","application/pdf").json()["parsed_data"]["skills"]
def test_parse_06_experience_years(): assert send(pdf_bytes(),"resume.pdf","application/pdf").json()["parsed_data"]["total_experience_years"]==5
def test_parse_07_phone_extraction(): assert send(pdf_bytes("Jane\n+1 312 555 1212"),"resume.pdf","application/pdf").json()["parsed_data"]["phone"]
def test_parse_08_unsupported_extension(): assert send(b"text","resume.txt","text/plain").status_code==415
def test_parse_09_mime_mismatch(): assert send(pdf_bytes(),"resume.docx","application/pdf").status_code==415
def test_parse_10_empty_file(): assert send(b"","resume.pdf","application/pdf").status_code==422
def test_parse_11_corrupt_pdf(): assert send(b"bad","resume.pdf","application/pdf").status_code==422
def test_parse_12_corrupt_docx(): assert send(b"bad","resume.docx","application/vnd.openxmlformats-officedocument.wordprocessingml.document").status_code==422
def test_parse_13_invalid_skill_context(): assert send(pdf_bytes(),"resume.pdf","application/pdf",'{}').status_code==422
def test_parse_14_case_insensitive_skill(): assert "Python" in send(pdf_bytes("Jane\nPYTHON"),"resume.pdf","application/pdf").json()["parsed_data"]["skills"]
def test_parse_15_no_email_is_null(): assert send(pdf_bytes("Jane Doe"),"resume.pdf","application/pdf").json()["parsed_data"]["email"] is None
def test_parse_16_no_phone_is_null(): assert send(pdf_bytes("Jane Doe"),"resume.pdf","application/pdf").json()["parsed_data"]["phone"] is None
def test_parse_17_text_is_returned(): assert "Jane Doe" in send(pdf_bytes(),"resume.pdf","application/pdf").json()["extracted_text"]
def test_parse_18_unknown_skill_excluded(): assert "React" not in send(pdf_bytes(),"resume.pdf","application/pdf").json()["parsed_data"]["skills"]
def test_parse_19_education_hint(): assert send(pdf_bytes("Jane\nState University Bachelor degree"),"resume.pdf","application/pdf").json()["parsed_data"]["education"]
def test_parse_20_experience_hint(): assert send(pdf_bytes(),"resume.pdf","application/pdf").json()["parsed_data"]["experience"]
def test_parse_21_warnings_array(): assert send(pdf_bytes(),"resume.pdf","application/pdf").json()["warnings"]==[]
def test_parse_22_llm_unavailable(monkeypatch):
    async def fail(*_): raise RuntimeError("OLLAMA_UNAVAILABLE")
    monkeypatch.setattr("app.main.enrich_with_ollama",fail); assert send(pdf_bytes(),"resume.pdf","application/pdf").status_code==503
def test_parse_23_llm_invalid(monkeypatch):
    async def fail(*_): raise RuntimeError("OLLAMA_INVALID_RESPONSE")
    monkeypatch.setattr("app.main.enrich_with_ollama",fail); assert send(pdf_bytes(),"resume.pdf","application/pdf").status_code==503
def test_parse_24_response_has_structured_json(): assert isinstance(send(pdf_bytes(),"resume.pdf","application/pdf").json()["parsed_data"],dict)
def test_parse_25_no_decision_fields():
    data=send(pdf_bytes(),"resume.pdf","application/pdf").json()["parsed_data"]; assert not ({"score","rank","hired","recommendation"}&data.keys())
