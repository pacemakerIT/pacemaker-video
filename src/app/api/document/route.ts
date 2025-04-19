// import { createClient } from '@supabase/supabase-js';
// import { auth } from '@clerk/nextjs/server';
// import { NextRequest, NextResponse } from 'next/server';

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

export async function GET() {
  //   const { searchParams } = new URL(req.url);
  //   const filePath = searchParams.get('filePath');
  //   const bucketName = searchParams.get('bucketName');
  //   const session = await auth();
  //   if (!session.userId) {
  //     return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
  //   }
  //   const { data, error } = await supabase.storage
  //     .from(bucketName!)
  //     .createSignedUrl(filePath!, 60);
  //   if (error || !data.signedUrl) {
  //     return NextResponse.json(
  //       { message: 'Failed to generate signed URL' },
  //       { status: 500 }
  //     );
  //   }
  //   // Supabase에서 PDF 파일 가져오기
  //   const response = await fetch(data.signedUrl);
  //   if (!response.ok) {
  //     return NextResponse.json(
  //       { message: 'Failed to fetch PDF' },
  //       { status: 500 }
  //     );
  //   }
  //   // Content - Type을 PDF로 설정하여 브라우저에서 보기만 가능하게 함
  //   return new NextResponse(response.body, {
  //     headers: {
  //       'Content-Type': 'application/pdf',
  //       'Content-Disposition': 'inline' // 다운로드 창 없이 브라우저에서만 보기 가능
  //     }
  //   });
}
