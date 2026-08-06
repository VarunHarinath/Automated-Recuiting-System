import { describe, expect, it } from 'vitest';
import { sendSuccess } from '../src/lib/responses.js';

describe('API health response', () => {
  it('uses the shared success envelope', () => {
    const result = {};
    const response = {
      status(status) { result.status = status; return this; },
      json(body) { result.body = body; return this; },
    };
    sendSuccess(response, { status: 'ok', service: 'api' });
    expect(result).toEqual({ status: 200, body: { success: true, data: { status: 'ok', service: 'api' }, meta: {} } });
  });
});
