import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;

    // JSON 파일 경로
    const filePath = path.join(
      process.cwd(),
      'public',
      'json',
      'video-detail-mock.json'
    );

    // JSON 파일 읽기
    const jsonData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(jsonData);

    // videoId에 따라 다른 데이터를 반환할 수 있도록 확장 가능
    // 현재는 모든 요청에 대해 같은 데이터를 반환
    const response = {
      success: true,
      data: {
        ...data,
        course: {
          ...data.course,
          id: videoId // 요청된 videoId로 설정
        }
      }
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch video detail',
        message: '비디오 상세 정보를 가져오는데 실패했습니다.'
      },
      { status: 500 }
    );
  }
}
