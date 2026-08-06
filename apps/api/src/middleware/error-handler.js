import { ApiError } from '../lib/api-error.js';
import { sendFailure } from '../lib/responses.js';

export const notFoundHandler = (_request, response) => sendFailure(response, 404, 'NOT_FOUND', 'The requested resource was not found.');
export const errorHandler = (error, _request, response, _next) => {
  void _next;
  if (error instanceof ApiError) return sendFailure(response, error.status, error.code, error.message, error.details);
  return sendFailure(response, 500, 'INTERNAL_ERROR', 'An unexpected error occurred.');
};
