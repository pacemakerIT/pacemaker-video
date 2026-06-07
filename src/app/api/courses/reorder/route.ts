import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function PATCH(req: Request) {
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
      UPDATE "Course" AS c
      SET "orderKey" = v.order_key
      FROM (VALUES ${values}) AS v(id, order_key)
      WHERE c.id = v.id
    `;

    revalidatePath('/admin/courses');
    revalidatePath('/courses');

    return NextResponse.json({ message: 'Order updated' }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to reorder courses' },
      { status: 500 }
    );
  }
}
