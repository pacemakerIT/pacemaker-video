import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { v4 as uuidv4 } from 'uuid';

function getClerkUserName(clerkUser: Awaited<ReturnType<typeof currentUser>>) {
  if (!clerkUser) return null;

  const metadata = clerkUser.unsafeMetadata as {
    firstName?: unknown;
    lastName?: unknown;
  };
  const firstName = clerkUser.firstName || metadata.firstName || '';
  const lastName = clerkUser.lastName || metadata.lastName || '';

  return `${firstName} ${lastName}`.trim() || null;
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId: userId
      }
    });

    if (existingUser) {
      return NextResponse.json(existingUser, { status: 200 });
    }

    // Clerk creates the session before its user.created webhook is guaranteed to
    // reach this app. Provision here as well so a newly signed-up user is never
    // treated as signed out while that webhook is still in flight.
    const clerkUser = await currentUser();
    const email =
      clerkUser?.primaryEmailAddress?.emailAddress ??
      clerkUser?.emailAddresses[0]?.emailAddress;

    if (!clerkUser || !email) {
      return NextResponse.json(
        { error: 'Unable to provision the authenticated user.' },
        { status: 409 }
      );
    }

    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      create: {
        id: uuidv4(),
        clerkId: userId,
        email,
        name: getClerkUserName(clerkUser)
      },
      update: {}
    });

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch users: ${error}` },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, roleId, nickname } = body;

    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        ...(name && { name }),
        ...(roleId && { roleId }),
        ...(nickname && { nickname }),
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to update user: ${error}` },
      { status: 500 }
    );
  }
}
