import json
import os

import httpx

from .schemas import ParsedResume


async def enrich_with_ollama(text: str, deterministic: dict) -> ParsedResume:
    base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
    model = os.getenv("OLLAMA_MODEL", "llama3.2:3b")
    timeout = float(os.getenv("OLLAMA_TIMEOUT_SECONDS", "30"))
    prompt = (
        "Extract resume facts only. Never score, rank, recommend, or make hiring decisions. "
        "Return strict JSON matching the supplied schema. Use null/empty arrays when unknown.\n"
        f"Deterministic hints: {json.dumps(deterministic)}\nResume text:\n{text[:50000]}"
    )
    payload = {
        "model": model,
        "stream": False,
        "format": ParsedResume.model_json_schema(),
        "messages": [{"role": "user", "content": prompt}],
    }
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(f"{base_url}/api/chat", json=payload)
            response.raise_for_status()
        content = response.json()["message"]["content"]
        return ParsedResume.model_validate_json(content)
    except (httpx.TimeoutException, httpx.ConnectError) as error:
        raise RuntimeError("OLLAMA_UNAVAILABLE") from error
    except (httpx.HTTPError, KeyError, ValueError) as error:
        raise RuntimeError("OLLAMA_INVALID_RESPONSE") from error
