import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  const filePath = path.join(
    process.cwd(),
    'public',
    'json',
    'pacemaker_reviews.json'
  );
  const fileContents = await fs.readFile(filePath, 'utf-8');
  const reviews = JSON.parse(fileContents);
  return NextResponse.json(reviews);
}
