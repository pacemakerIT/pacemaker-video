import { PrismaClient } from '@prisma/client';
import courseData from '../public/json/video-detail-mock.json';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// UUID 생성 함수 (crypto.randomUUID 사용)
function generateUUID(): string {
  return crypto.randomUUID();
}

async function main() {
  // Instructors 생성
  for (const instructorData of courseData.instructors) {
    await prisma.instructor.upsert({
      where: { id: instructorData.id },
      update: {},
      create: {
        id: instructorData.id,
        name: instructorData.name,
        profileImage: instructorData.profileImage,
        description: instructorData.description,
        careers: instructorData.careers // JSON으로 저장
      }
    });
  }

  // Courses 생성
  for (const courseDataItem of courseData.courses) {
    await prisma.course.upsert({
      where: { id: courseDataItem.id },
      update: {},
      create: {
        id: courseDataItem.id,
        title: courseDataItem.title,
        subtitle: courseDataItem.subtitle,
        courseTitle: courseDataItem.courseTitle,
        description: courseDataItem.description,
        price: courseDataItem.price,
        rating: courseDataItem.rating,
        reviewCount: courseDataItem.reviewCount,
        category: courseDataItem.category,
        duration: courseDataItem.duration,
        level: courseDataItem.level,
        language: courseDataItem.language,
        backgroundImage: courseDataItem.backgroundImage,
        instructorId: courseDataItem.instructorId,
        createdAt: courseDataItem.createdAt,
        updatedAt: courseDataItem.updatedAt,
        sections: courseDataItem.sections, // JSON으로 저장
        reviews: courseDataItem.reviews // JSON으로 저장
      }
    });

    // 각 Course에 대한 Video 생성
    await prisma.video.upsert({
      where: { videoId: courseDataItem.id }, // videoId를 course의 id로 사용
      update: {},
      create: {
        videoId: courseDataItem.id,
        title: courseDataItem.title,
        description: courseDataItem.description,
        price: parseFloat(courseDataItem.price?.replace('$', '') || '0'),
        category: 'INTERVIEW', // 기본값
        thumbnail: courseDataItem.backgroundImage,
        courseId: courseDataItem.id // Course와 연결
      }
    });
  }

  // GlobalRelatedItems 생성 (UUID 생성)
  for (const itemData of courseData.globalRelatedItems) {
    const newId = generateUUID();
    await prisma.globalRelatedItem.upsert({
      where: { id: newId },
      update: {},
      create: {
        id: newId,
        title: itemData.title,
        content: itemData.content,
        price: itemData.price,
        category: itemData.category,
        type: itemData.type,
        thumbnail: itemData.thumbnail
      }
    });
  }

  // 1) 목업 강사 보장 (없으면 생성)
  const mockInstructorId = randomUUID();
  await prisma.instructor.upsert({
    where: { id: mockInstructorId },
    update: {},
    create: {
      id: mockInstructorId,
      name: 'Mock Instructor',
      profileImage: '/img/instructor-image.png',
      description: '시드 데이터용 Mock 강사입니다.',
      careers: [
        { period: '2020 ~', position: 'Senior Instructor at PaceUP' },
        { period: '2016 ~ 2020', position: 'Frontend Engineer at TechCorp' }
      ]
    }
  });

  // 2) 공통 섹션/리뷰 템플릿
  const buildSections = (n: number) => [
    {
      id: randomUUID(),
      type: 'content',
      title: `콘텐츠 소개 섹션 ${n}`,
      subtitle: '핵심 내용을 한눈에',
      description: '이 강의는 실무에서 바로 적용 가능한 내용을 담고 있습니다.',
      orderIndex: 1,
      items: [
        {
          id: randomUUID(),
          title: '개요',
          content: '강의 전체 개요를 설명합니다.',
          icon: null,
          orderIndex: 1
        },
        {
          id: randomUUID(),
          title: '핵심 주제',
          content: '핵심 주제를 정리합니다.',
          icon: null,
          orderIndex: 2
        }
      ]
    },
    {
      id: randomUUID(),
      type: 'recommendation',
      title: '이런 분들께 추천드려요',
      subtitle: null,
      description: null,
      orderIndex: 2,
      items: [
        {
          id: randomUUID(),
          title: '초급 개발자',
          content: '기초를 탄탄히 다지고 싶은 분',
          icon: 'CodeSquare',
          orderIndex: 1
        },
        {
          id: randomUUID(),
          title: '이직 준비',
          content: '포트폴리오를 보강하고 싶은 분',
          icon: 'FileEdit',
          orderIndex: 2
        }
      ]
    },
    {
      id: randomUUID(),
      type: 'related',
      title: '함께 보면 좋은 컨텐츠',
      subtitle: null,
      description: null,
      orderIndex: 3,
      items: [
        {
          id: randomUUID(),
          title: 'React 기본',
          content: '핵심 개념 요약',
          icon: null,
          orderIndex: 1,
          itemId: 'course-1',
          price: 199,
          category: 'IT',
          type: 'course',
          thumbnail: '/img/course_image1.png'
        },
        {
          id: randomUUID(),
          title: 'Node.js 입문',
          content: '서버 사이드 시작',
          icon: null,
          orderIndex: 2,
          itemId: 'course-2',
          price: 249,
          category: 'IT',
          type: 'course',
          thumbnail: '/img/course_image2.png'
        }
      ]
    }
  ];

  const buildReviews = () => [
    {
      id: 1,
      profileImage: '/img/instructor-image.png',
      profileName: 'Alice',
      rating: 5,
      reviewDate: '2024.03.01',
      reviewContent: '매우 유익했습니다.'
    },
    {
      id: 2,
      profileImage: '/img/instructor-image.png',
      profileName: 'Bob',
      rating: 4,
      reviewDate: '2024.03.02',
      reviewContent: '실무에 도움됐어요.'
    }
  ];

  // 3) 코스/비디오 7개 생성
  for (let i = 1; i <= 7; i++) {
    const courseId = randomUUID();
    const title = `Mock Course ${i}`;
    const priceStr = `${(99 + i * 10).toFixed(2)}`;

    await prisma.course.upsert({
      where: { id: courseId },
      update: {},
      create: {
        id: courseId,
        title,
        subtitle: `부제 ${i}`,
        courseTitle: `코스 타이틀 ${i}`,
        description: `이 코스는 Mock 데이터 ${i} 입니다.`,
        price: priceStr,
        rating: 4 + (i % 2) * 0.5,
        reviewCount: 100 + i,
        category: 'IT',
        duration: `${6 + i}시간`,
        level: i % 2 === 0 ? '초급' : '중급',
        language: '한국어',
        backgroundImage: '/img/course_image1.png',
        instructorId: mockInstructorId,
        createdAt: '2024-03-01T00:00:00.000Z',
        updatedAt: '2024-03-15T00:00:00.000Z',
        sections: buildSections(i),
        reviews: buildReviews()
      }
    });

    await prisma.video.upsert({
      where: { videoId: courseId },
      update: {},
      create: {
        videoId: courseId, // 코스와 동일한 식별자 사용
        title: `${title} - 소개 영상`,
        description: '코스 소개 및 커리큘럼 안내',
        price: Number(priceStr.replace('$', '')),
        category: 'INTERVIEW',
        thumbnail: '/img/video-bg.png',
        courseId: courseId // FK로 연결
      }
    });
  }

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
