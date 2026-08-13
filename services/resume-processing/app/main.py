import json

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from .extractors import deterministic_extract, extract_text
from .ollama import enrich_with_ollama
from .schemas import ProcessedResume

app = FastAPI(title="Resume Processing Service", version="0.1.0")


class HealthResponse(BaseModel):
    status: str
    service: str


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", service="resume-processing")


@app.post("/v1/resumes/process", response_model=ProcessedResume)
async def process_resume(
    file: UploadFile = File(...),
    known_skills: str = Form("[]"),
) -> ProcessedResume:
    content = await file.read()
    if not content:
        raise HTTPException(422, detail={"code": "EMPTY_DOCUMENT", "message": "The uploaded document is empty."})
    try:
        skills = json.loads(known_skills)
        if not isinstance(skills, list) or not all(isinstance(item, str) for item in skills):
            raise ValueError
    except ValueError as error:
        raise HTTPException(422, detail={"code": "INVALID_SKILL_CONTEXT", "message": "Known skills must be a JSON string array."}) from error
    try:
        text = extract_text(content, file.content_type or "", file.filename or "")
        hints = deterministic_extract(text, skills)
        parsed = await enrich_with_ollama(text, hints)
        return ProcessedResume(extracted_text=text, parsed_data=parsed)
    except ValueError as error:
        code = str(error)
        status = 415 if code == "UNSUPPORTED_FILE_TYPE" else 422
        raise HTTPException(status, detail={"code": code, "message": "The resume could not be processed."}) from error
    except RuntimeError as error:
        code = str(error)
        raise HTTPException(503, detail={"code": code, "message": "The local extraction model is unavailable or returned invalid data."}) from error
