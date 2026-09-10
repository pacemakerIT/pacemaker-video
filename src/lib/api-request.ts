import { Interest, ItemType } from '@prisma/client';
import { NextResponse } from 'next/server';
import { CurrentUserError } from '@/lib/current-user';

export function isItemType(value: unknown): value is ItemType {
  return (
    typeof value === 'string' &&
    Object.values(ItemType).includes(value as ItemType)
  );
}

export function hasValidInterests(interests: unknown): interests is Interest[] {
  return (
    Array.isArray(interests) &&
    interests.every(
      (interest) =>
        typeof interest === 'string' &&
        Object.values(Interest).includes(interest as Interest)
    )
  );
}

export function apiErrorResponse(error: unknown, fallbackMessage: string) {
  if (error instanceof CurrentUserError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status }
    );
  }

  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}
