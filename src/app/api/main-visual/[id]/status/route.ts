import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { isPublic } = await req.json();

    const updated = await prisma.mainVisual.update({
      where: { id },
      data: { isPublic }
    });

    revalidatePath('/admin/main-visual');
    revalidatePath('/');

    return NextResponse.json(updated, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}
