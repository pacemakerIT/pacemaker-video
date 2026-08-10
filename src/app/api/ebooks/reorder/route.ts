import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
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
    const { items } = body as { items: { id: string; orderKey: string }[] };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const values = Prisma.join(
      items.map(
        (item) => Prisma.sql`(${item.id}::uuid, ${item.orderKey}::text)`
      )
    );

    await prisma.$executeRaw`
      UPDATE "Ebook" AS e
      SET "orderKey" = v.order_key
      FROM (VALUES ${values}) AS v(id, order_key)
      WHERE e.id = v.id
    `;

    revalidatePath('/admin/ebooks');
    revalidatePath('/ebooks');

    return NextResponse.json({ message: 'Order updated' }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to reorder ebooks' },
      { status: 500 }
    );
  }
}
