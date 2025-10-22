import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId)
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    const userWithInterests = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        interest: true
      }
    });

    return NextResponse.json(userWithInterests);
  } catch (err) {
    return NextResponse.json(
      { error: `GET /api/cart error: ${err}` },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId, interests } = await req.json();

    if (!userId || !Array.isArray(interests)) {
      return NextResponse.json(
        { error: 'Invalid request: userId and interests are required.' },
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
    return NextResponse.json(
      { error: `Failed to update interests: ${err}` },
      { status: 500 }
    );
  }
}
