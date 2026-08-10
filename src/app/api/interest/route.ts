import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireCurrentUserId } from '@/lib/current-user';
import { apiErrorResponse, hasValidInterests } from '@/lib/api-request';

export async function GET() {
  try {
    const userId = await requireCurrentUserId();

    const userWithInterests = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        interest: true
      }
    });

    return NextResponse.json(userWithInterests);
  } catch (err) {
    return apiErrorResponse(err, 'Failed to fetch interests');
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await requireCurrentUserId();
    const { interests } = await req.json().catch(() => ({}));

    if (!hasValidInterests(interests)) {
      return NextResponse.json(
        { error: 'Invalid request: interests are required.' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { interest: interests },
      select: { id: true, interest: true }
    });

    return NextResponse.json(
      { message: 'Interests updated successfully', data: updatedUser },
      { status: 200 }
    );
  } catch (err) {
    return apiErrorResponse(err, 'Failed to update interests');
  }
}
