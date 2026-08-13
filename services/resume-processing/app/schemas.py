from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ParsedResume(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str | None = None
    email: str | None = None
    phone: str | None = None
    skills: list[str] = Field(default_factory=list)
    education: list[str] = Field(default_factory=list)
    experience: list[str] = Field(default_factory=list)
    total_experience_years: float | None = Field(default=None, ge=0)
    summary: str | None = None


class ProcessedResume(BaseModel):
    extracted_text: str
    parsed_data: ParsedResume
    warnings: list[str] = Field(default_factory=list)


class ErrorBody(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorBody
