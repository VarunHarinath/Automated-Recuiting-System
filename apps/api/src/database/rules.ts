import type { ApplicationStatus, CommunicationStatus, PrismaClient } from '@prisma/client';

export async function recordApplicationStatusChange(
  client: PrismaClient,
  input: { applicationId: string; changedById: string; newStatus: ApplicationStatus; reason?: string },
): Promise<void> {
  await client.$transaction(async (transaction) => {
    const application = await transaction.application.findUniqueOrThrow({ where: { id: input.applicationId } });
    await transaction.application.update({
      where: { id: input.applicationId },
      data: { currentStatus: input.newStatus, lastStatusChangedAt: new Date() },
    });
    await transaction.applicationStatusHistory.create({
      data: {
        applicationId: input.applicationId,
        changedById: input.changedById,
        previousStatus: application.currentStatus,
        newStatus: input.newStatus,
        reason: input.reason ?? null,
      },
    });
  });
}

export async function recordCommunicationOutcome(
  client: PrismaClient,
  communicationId: string,
  status: Extract<CommunicationStatus, 'SENT' | 'FAILED'>,
  failureReason?: string,
): Promise<void> {
  await client.communication.update({
    where: { id: communicationId },
    data: {
      status,
      failureReason: status === 'FAILED' ? (failureReason ?? 'Unspecified delivery failure') : null,
      sentAt: status === 'SENT' ? new Date() : null,
      ...(status === 'FAILED' ? { retryCount: { increment: 1 } } : {}),
    },
  });
}
