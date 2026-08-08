import { ApiError } from '../lib/api-error.js';
import { getActiveUser, sanitizeUser } from '../modules/auth/auth.service.js';
import { verifyAccessToken } from '../modules/auth/auth.jwt.js';

export async function authenticate(request, _response, next) {
  try {
    const authorization = request.get('authorization');
    if (!authorization) throw new ApiError(401, 'UNAUTHORIZED', 'Authentication is required.');

    const match = /^Bearer ([^\s]+)$/.exec(authorization);
    if (!match) throw new ApiError(401, 'INVALID_TOKEN', 'The authorization header is malformed.');

    const payload = verifyAccessToken(match[1]);
    const user = await getActiveUser(payload.sub);
    if (!user) throw new ApiError(401, 'UNAUTHORIZED', 'Authentication is required.');

    request.auth = sanitizeUser(user);
    next();
  } catch (error) {
    next(error);
  }
}
