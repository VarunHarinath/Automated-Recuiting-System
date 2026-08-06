export function sendSuccess(response, data, status = 200, meta = {}) {
  return response.status(status).json({ success: true, data, meta });
}

export function sendFailure(response, status, code, message, details = []) {
  return response.status(status).json({ success: false, error: { code, message, details } });
}
