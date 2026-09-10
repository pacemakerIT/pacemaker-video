import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export class CurrentUserError extends Error {
  constructor(
    message: string,
    public readonly status: 401 | 404
  ) {
    super(message);
  }
}

/**
 * Resolves the authenticated Clerk user to the application's internal user ID.
 * API handlers must use this value rather than a user ID supplied by a client.
 */
export async function requireCurrentUserId() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    throw new CurrentUserError('Unauthorized', 401);
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true }
  });

  if (!user) {
    throw new CurrentUserError('User not found', 404);
  }

  return user.id;
}
