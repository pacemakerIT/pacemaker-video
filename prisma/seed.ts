import { PrismaClient, VideoCategory, WorkshopStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Video seed data
  const videosData = [
    {
      videoId: 'wistia_gitlab_interview_001',
      title: 'GitLab 기반 자기소개서 작성법 (기초)',
      description:
        '2-30대 취준생을 위한 GitLab 활용 자기소개서 및 면접 준비 가이드입니다. 첫 번째 스텝을 함께하세요!',
      price: 2800.0,
      category: VideoCategory.RESUME
    },
    {
      videoId: 'wistia_code_interview_001',
      title: '코딩 면접 대비: 자신감 있는 자기소개서',
      description:
        '개발 직군을 위한 특화된 자기소개서 및 면접 준비 전략. 코딩 실력을 효과적으로 어필하세요.',
      price: 2800.0,
      category: VideoCategory.INTERVIEW
    },
    {
      videoId: 'wistia_online_interview_001',
      title: '온라인 면접 특화 자기소개서와 스피치',
      description:
        'JOIN US ONLINE! 비대면 면접에 최적화된 자기소개서 작성법과 전달력 높은 스피치 팁을 드립니다.',
      price: 2800.0,
      category: VideoCategory.INTERVIEW
    },
    {
      videoId: 'wistia_gitlab_interview_002', // 고유 ID 유지
      title: 'GitLab 활용 심화: 프로젝트 경험 어필하기',
      description:
        'GitLab으로 관리한 프로젝트 경험을 자기소개서와 면접에서 효과적으로 녹여내는 방법을 알려드립니다.',
      price: 2800.0,
      category: VideoCategory.RESUME
    },
    {
      videoId: 'wistia_career_change_001',
      title: '커리어 전환자를 위한 자기소개서 작성 비법',
      description:
        '새로운 분야로 도전하는 당신을 위한 맞춤형 자기소개서 및 면접 준비. 당신의 강점을 찾아드립니다.',
      price: 2800.0,
      category: VideoCategory.RESUME
    },
    {
      videoId: 'wistia_frontend_interview_001',
      title: '프론트엔드 개발자 면접 자기소개 완전정복',
      description:
        '프론트엔드 개발자 취업을 위한 자기소개서 작성부터 기술 면접까지 한번에 준비하세요.',
      price: 2800.0,
      category: VideoCategory.INTERVIEW
    },
    {
      videoId: 'wistia_backend_interview_001',
      title: '백엔드 개발자 면접 자기소개 핵심 전략',
      description:
        '백엔드 개발자로서의 역량을 어필하는 자기소개서 작성법과 면접 성공 노하우를 공유합니다.',
      price: 2800.0,
      category: VideoCategory.INTERVIEW
    },
    {
      videoId: 'wistia_data_analyst_interview_001',
      title: '데이터 분석가 취업 자기소개서와 포트폴리오',
      description:
        '데이터 분석가로 커리어를 시작하거나 이직하려는 분들을 위한 자기소개서 및 포트폴리오 구성 팁입니다.',
      price: 2800.0,
      category: VideoCategory.RESUME
    }
  ];

  for (const videoData of videosData) {
    const video = await prisma.video.upsert({
      where: { videoId: videoData.videoId },
      update: videoData,
      create: videoData
    });
    // eslint-disable-next-line no-console
    console.log(
      `Created/Updated video with id: ${video.id}, videoId: ${video.videoId}`
    );
  }

  // 2. Instructor 생성
  const instructor = await prisma.user.upsert({
    where: { email: 'sujin@example.com' },
    update: {},
    create: {
      email: 'sujin@example.com',
      name: '구수진',
      clerkId: 'instructor-sujin',
      roleId: 'INSTRUCTOR',
      isSubscribed: false
    }
  });

  // 3. 단일 워크숍 (기존 코드 유지)
  const workshop = await prisma.workshop.create({
    data: {
      title: 'UX Design workshop',
      description: '꿈을 현실로 만드는 이야기',
      startDate: new Date('2025-07-10T19:00:00-04:00'),
      endDate: new Date('2025-07-10T21:00:00-04:00'),
      price: 20,
      locationOrUrl: 'North York centre',
      status: 'ONGOING',
      instructor: {
        connect: { id: instructor.id }
      }
    }
  });
  // eslint-disable-next-line no-console
  console.log(`Created/Updated workshop with id: ${workshop.id}`);

  // 4. 다양한 상태의 워크숍 추가
  const workshops = [
    {
      title: 'React 실전 워크숍',
      description: '실무 중심의 리액트 프로젝트 실습',
      startDate: new Date('2025-06-15T14:00:00-04:00'),
      endDate: new Date('2025-06-15T17:00:00-04:00'),
      price: 30,
      locationOrUrl: 'Zoom',
      status: WorkshopStatus.RECRUITING
    },
    {
      title: 'UX 포트폴리오 리뷰 세션',
      description: '1:1 피드백으로 UX 포트폴리오 업그레이드',
      startDate: new Date('2025-06-28T19:00:00-04:00'),
      endDate: new Date('2025-06-28T21:00:00-04:00'),
      price: 15,
      locationOrUrl: 'Google Meet',
      status: WorkshopStatus.CLOSED
    },
    {
      title: '프론트엔드 취업 부트캠프',
      description: 'React, TypeScript 집중 실습',
      startDate: new Date('2025-07-12T13:00:00-04:00'),
      endDate: new Date('2025-07-12T17:00:00-04:00'),
      price: 25,
      locationOrUrl: 'North York Centre',
      status: WorkshopStatus.ONGOING
    },
    {
      title: '개발자 커리어 전략 세미나',
      description: '시니어 개발자의 이직 전략 공유',
      startDate: new Date('2025-07-22T18:30:00-04:00'),
      endDate: new Date('2025-07-22T20:00:00-04:00'),
      price: 0,
      locationOrUrl: '온라인',
      status: WorkshopStatus.RECRUITING
    },
    {
      title: '백엔드 아키텍처 기초',
      description: '도메인 중심 설계와 시스템 구성의 이해',
      startDate: new Date('2025-08-03T10:00:00-04:00'),
      endDate: new Date('2025-08-03T13:00:00-04:00'),
      price: 35,
      locationOrUrl: 'KakaoTalk Live',
      status: WorkshopStatus.COMPLETED
    },
    {
      title: '디자인 시스템과 컴포넌트 관리',
      description: 'Figma + Storybook 실습',
      startDate: new Date('2025-08-10T15:00:00-04:00'),
      endDate: new Date('2025-08-10T17:00:00-04:00'),
      price: 18,
      locationOrUrl: 'Zoom',
      status: WorkshopStatus.RECRUITING
    },
    {
      title: '면접에서 실력을 보여주는 방법',
      description: '라이브 코딩 면접 전략 및 모의 면접',
      startDate: new Date('2025-08-18T16:00:00-04:00'),
      endDate: new Date('2025-08-18T18:00:00-04:00'),
      price: 20,
      locationOrUrl: 'Discord',
      status: WorkshopStatus.CLOSED
    },
    {
      title: '자기소개서 클리닉 워크숍',
      description: '글쓰기 코치와 함께하는 1:1 첨삭',
      startDate: new Date('2025-06-21T11:00:00-04:00'),
      endDate: new Date('2025-06-21T12:30:00-04:00'),
      price: 10,
      locationOrUrl: 'Toronto Public Library',
      status: WorkshopStatus.COMPLETED
    }
  ];

  for (const w of workshops) {
    const created = await prisma.workshop.create({
      data: {
        ...w,
        instructor: {
          connect: { id: instructor.id }
        }
      }
    });
    // eslint-disable-next-line no-console
    console.log(`Created workshop: ${created.title} (${w.status})`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error('Error during video/workshop seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
