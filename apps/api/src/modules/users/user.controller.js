import { sendSuccess } from '../../lib/responses.js';
import { createUser, getUser, listUsers, updateUser, updateUserStatus } from './user.service.js';
import {
  parseInput,
  userCreateSchema,
  userIdParamsSchema,
  userListQuerySchema,
  userStatusSchema,
  userUpdateSchema,
} from './user.validation.js';

function actorContext(request) {
  return {
    ...request.auth,
    ipAddress: request.ip,
    userAgent: request.get('user-agent'),
  };
}

export async function listUsersController(request, response) {
  const query = parseInput(userListQuerySchema, request.query);
  const result = await listUsers(query);
  return sendSuccess(response, result.users, 200, result.meta);
}

export async function getUserController(request, response) {
  const { id } = parseInput(userIdParamsSchema, request.params);
  return sendSuccess(response, await getUser(id));
}

export async function createUserController(request, response) {
  const input = parseInput(userCreateSchema, request.body);
  return sendSuccess(response, await createUser(input, actorContext(request)), 201);
}

export async function updateUserController(request, response) {
  const { id } = parseInput(userIdParamsSchema, request.params);
  const input = parseInput(userUpdateSchema, request.body);
  return sendSuccess(response, await updateUser(id, input, actorContext(request)));
}

export async function updateUserStatusController(request, response) {
  const { id } = parseInput(userIdParamsSchema, request.params);
  const input = parseInput(userStatusSchema, request.body);
  return sendSuccess(response, await updateUserStatus(id, input, actorContext(request)));
}
