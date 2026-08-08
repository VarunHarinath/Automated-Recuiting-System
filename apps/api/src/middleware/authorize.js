import { ApiError } from '../lib/api-error.js';

export function requireRole(...roles) {
  const permittedRoles = new Set(roles);
  return (request, _response, next) => {
    if (!request.auth) return next(new ApiError(401, 'UNAUTHORIZED', 'Authentication is required.'));
    if (!permittedRoles.has(request.auth.role)) {
      return next(new ApiError(403, 'FORBIDDEN', 'You do not have permission to perform this action.'));
    }
    next();
  };
}
