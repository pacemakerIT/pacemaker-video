import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export type AdminAccess =
  | { ok: true }
  | {
      ok: false;
      status: 401 | 403;
      error: string;
    };

export async function getAdminAccessForClerkUserId(
  clerkUserId: string | null | undefined
): Promise<AdminAccess> {
  if (!clerkUserId) {
    return { ok: false, status: 401, error: 'Unauthorized' };
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { roleId: true }
  });

  if (user?.roleId !== 'ADMIN') {
    return { ok: false, status: 403, error: 'Forbidden' };
  }

  return { ok: true };
}

export async function requireAdminUser(): Promise<AdminAccess> {
  const { userId } = await auth();

  return getAdminAccessForClerkUserId(userId);
}
