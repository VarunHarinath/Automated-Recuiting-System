import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { environment } from '../config/environment.js';
import { ApiError } from '../lib/api-error.js';

function resolveStoragePath(storageKey) {
  const root = path.resolve(environment.LOCAL_STORAGE_PATH);
  const target = path.resolve(root, storageKey);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) throw new ApiError(422, 'INVALID_STORAGE_KEY', 'The resume storage reference is invalid.');
  return target;
}

export async function processStoredResume(resume, knownSkills) {
  let bytes;
  try { bytes = await readFile(resolveStoragePath(resume.storageKey)); }
  catch (error) { if (error instanceof ApiError) throw error; throw new ApiError(422, 'RESUME_FILE_UNAVAILABLE', 'The stored resume file is unavailable.'); }
  const form = new FormData();
  form.append('file', new Blob([bytes], { type: resume.mimeType }), resume.originalFileName);
  form.append('known_skills', JSON.stringify(knownSkills));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), environment.RESUME_SERVICE_TIMEOUT_MS);
  try {
    const response = await fetch(`${environment.RESUME_SERVICE_URL}/v1/resumes/process`, { method: 'POST', body: form, signal: controller.signal });
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new ApiError(502, body?.detail?.code ?? 'RESUME_PROCESSING_FAILED', 'The resume processing service could not process this document.');
    return body;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(502, error?.name === 'AbortError' ? 'RESUME_PROCESSING_TIMEOUT' : 'RESUME_SERVICE_UNAVAILABLE', 'The resume processing service is unavailable.');
  } finally { clearTimeout(timer); }
}
