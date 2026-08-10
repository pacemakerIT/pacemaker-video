import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/admin-auth';

export async function PATCH(req: Request) {
  const adminAccess = await requireAdminUser();
  if (!adminAccess.ok) {
    return NextResponse.json(
      { error: adminAccess.error },
      { status: adminAccess.status }
    );
  }

  try {
    const body = await req.json();
    const { items } = body as { items: { id: string; orderIndex: number }[] };

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    await prisma.$transaction(
      items.map((item) =>
        prisma.mainVisual.update({
          where: { id: item.id },
          data: { orderIndex: item.orderIndex }
        })
      )
    );

    revalidatePath('/admin/main-visual');
    revalidatePath('/');

    return NextResponse.json({ message: 'Order updated' }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to reorder main visuals' },
      { status: 500 }
    );
  }
}
