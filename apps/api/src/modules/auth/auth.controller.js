import { sendSuccess } from '../../lib/responses.js';
import { ApiError } from '../../lib/api-error.js';
import { loginSchema } from './auth.validation.js';
import { login, recordLogout } from './auth.service.js';

function requestContext(request) {
  return { ipAddress: request.ip, userAgent: request.get('user-agent') };
}

export async function loginController(request, response) {
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      'The submitted data is invalid.',
      parsed.error.issues.map(({ path, message }) => ({ field: path.join('.'), message })),
    );
  }
  return sendSuccess(response, await login(parsed.data, requestContext(request)));
}

export function meController(request, response) {
  return sendSuccess(response, request.auth);
}

export async function logoutController(request, response) {
  await recordLogout(request.auth, requestContext(request));
  return sendSuccess(response, { message: 'Logged out successfully. Discard the access token on the client.' });
}
