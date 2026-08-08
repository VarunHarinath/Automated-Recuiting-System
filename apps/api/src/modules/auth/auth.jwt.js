import jwt from 'jsonwebtoken';
import { environment, jwtSecret } from '../../config/environment.js';
import { ApiError } from '../../lib/api-error.js';

const issuer = 'automated-recruitment-system';
const audience = 'ars-api';

export function signAccessToken(user, options = {}) {
  return jwt.sign(
    { role: user.role, email: user.email },
    jwtSecret,
    {
      algorithm: 'HS256',
      subject: user.id,
      issuer,
      audience,
      expiresIn: options.expiresIn ?? environment.JWT_EXPIRES_IN,
    },
  );
}

export function verifyAccessToken(token) {
  try {
    const payload = jwt.verify(token, jwtSecret, { algorithms: ['HS256'], issuer, audience });
    if (typeof payload === 'string' || !payload.sub) throw new Error('Missing subject claim.');
    return payload;
  } catch (error) {
    if (error?.name === 'TokenExpiredError') {
      throw new ApiError(401, 'TOKEN_EXPIRED', 'The access token has expired.');
    }
    throw new ApiError(401, 'INVALID_TOKEN', 'The access token is invalid.');
  }
}
