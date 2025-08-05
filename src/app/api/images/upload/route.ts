import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/prisma';
import { imgBucketName, s3clientSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    const table = formData.get('table') as string;
    const column = formData.get('column') as string;
    const recordId = formData.get('recordId') as string;

    if (!file) {
      return NextResponse.json({ error: 'File Not Found' }, { status: 400 });
    }

    if (!table || !column) {
      return NextResponse.json(
        { error: 'Missing table or column' },
        { status: 400 }
      );
    }

    const ext = file.name.split('.').pop();
    const uuid = uuidv4();
    const fileName = `${uuid}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const putCommand = new PutObjectCommand({
      Bucket: imgBucketName,
      Key: fileName,
      Body: buffer,
      ContentType: file.type
    });

    // S3에 파일 업로드
    await s3clientSupabase.send(putCommand);

    // Supabase Storage URL 생성
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/${imgBucketName}/${fileName}`;

    // 레코드 ID가 있으면 업데이트, 없으면 새로 생성
    let updatedRecord;

    switch (table) {
      case 'Video':
        if (recordId && recordId.trim() !== '') {
          // 기존 레코드 업데이트
          updatedRecord = await prisma.video.update({
            where: { id: recordId },
            data: { [column]: imageUrl }
          });
        } else {
          // 새 레코드 생성
          updatedRecord = await prisma.video.create({
            data: {
              videoId: `video_${uuid}`,
              title: '새 비디오',
              [column]: imageUrl
            }
          });
        }
        break;
      case 'Workshop':
        if (recordId && recordId.trim() !== '') {
          // 기존 레코드 업데이트
          updatedRecord = await prisma.workshop.update({
            where: { id: recordId },
            data: { [column]: imageUrl }
          });
        } else {
          // 새 레코드 생성 - instructorId는 나중에 설정해야 함
          updatedRecord = await prisma.workshop.create({
            data: {
              title: '새 워크숍',
              description: '워크숍 설명',
              startDate: new Date(),
              endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              instructorId: '00000000-0000-0000-0000-000000000000', // 임시 값, 실제 사용 시 업데이트 필요
              [column]: imageUrl
            }
          });
        }
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid table name' },
          { status: 400 }
        );
    }

    // Image 테이블에도 기록
    const newImage = await prisma.image.create({
      data: {
        fileName,
        url: imageUrl
      }
    });

    return NextResponse.json(
      {
        message: 'Image uploaded successfully',
        image: newImage,
        updatedRecord
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
      },
      { status: 500 }
    );
  }
}
