import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding videos ...`);

  // 비디오 (Video) 시드 데이터 생성 (8개)
  const videosData = [
    {
      videoId: 'wistia_gitlab_interview_001',
      title: 'GitLab 기반 자기소개서 작성법 (기초)',
      description:
        '2-30대 취준생을 위한 GitLab 활용 자기소개서 및 면접 준비 가이드입니다. 첫 번째 스텝을 함께하세요!',
      price: 2800.0
    },
    {
      videoId: 'wistia_code_interview_001',
      title: '코딩 면접 대비: 자신감 있는 자기소개서',
      description:
        '개발 직군을 위한 특화된 자기소개서 및 면접 준비 전략. 코딩 실력을 효과적으로 어필하세요.',
      price: 2800.0
    },
    {
      videoId: 'wistia_online_interview_001',
      title: '온라인 면접 특화 자기소개서와 스피치',
      description:
        'JOIN US ONLINE! 비대면 면접에 최적화된 자기소개서 작성법과 전달력 높은 스피치 팁을 드립니다.',
      price: 2800.0
    },
    {
      videoId: 'wistia_gitlab_interview_002', // 고유 ID 유지
      title: 'GitLab 활용 심화: 프로젝트 경험 어필하기',
      description:
        'GitLab으로 관리한 프로젝트 경험을 자기소개서와 면접에서 효과적으로 녹여내는 방법을 알려드립니다.',
      price: 2800.0
    },
    {
      videoId: 'wistia_career_change_001',
      title: '커리어 전환자를 위한 자기소개서 작성 비법',
      description:
        '새로운 분야로 도전하는 당신을 위한 맞춤형 자기소개서 및 면접 준비. 당신의 강점을 찾아드립니다.',
      price: 2800.0
    },
    {
      videoId: 'wistia_frontend_interview_001',
      title: '프론트엔드 개발자 면접 자기소개 완전정복',
      description:
        '프론트엔드 개발자 취업을 위한 자기소개서 작성부터 기술 면접까지 한번에 준비하세요.',
      price: 2800.0
    },
    {
      videoId: 'wistia_backend_interview_001',
      title: '백엔드 개발자 면접 자기소개 핵심 전략',
      description:
        '백엔드 개발자로서의 역량을 어필하는 자기소개서 작성법과 면접 성공 노하우를 공유합니다.',
      price: 2800.0
    },
    {
      videoId: 'wistia_data_analyst_interview_001',
      title: '데이터 분석가 취업 자기소개서와 포트폴리오',
      description:
        '데이터 분석가로 커리어를 시작하거나 이직하려는 분들을 위한 자기소개서 및 포트폴리오 구성 팁입니다.',
      price: 2800.0
    }
  ];

  for (const videoData of videosData) {
    const video = await prisma.video.upsert({
      where: { videoId: videoData.videoId },
      update: {}, // 이미 존재하면 업데이트할 내용 (여기서는 비워둠)
      create: videoData
    });
    console.log(
      `Created/Updated video with id: ${video.id}, videoId: ${video.videoId}`
    );
  }

  console.log(`Seeding videos finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error during video seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
