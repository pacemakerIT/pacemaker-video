import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/admin-auth';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ReorderItem = { id: string; orderKey: string };

function isValidReorderItem(item: unknown): item is ReorderItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    typeof item.id === 'string' &&
    UUID_PATTERN.test(item.id) &&
    'orderKey' in item &&
    typeof item.orderKey === 'string' &&
    item.orderKey.trim().length > 0
  );
}

export async function PATCH(req: Request) {
  try {
    const adminAccess = await requireAdminUser();

    if (!adminAccess.ok) {
      return NextResponse.json(
        { error: adminAccess.error },
        { status: adminAccess.status }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }
    const items =
      body && typeof body === 'object' && !Array.isArray(body)
        ? (body as { items?: unknown }).items
        : undefined;

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      !items.every(isValidReorderItem)
    ) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    if (new Set(items.map((item) => item.id)).size !== items.length) {
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
