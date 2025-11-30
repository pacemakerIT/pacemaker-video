import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

const COURSE_TITLE = '자기소개서 작성 및 면접 준비까지 하늘로!';
const COURSE_DESC =
  '2~30대 디지털 산업계의 개발자 직종과, 해외 웹/모바일이 아닌 다양한 분야에서 스킬을 다룬 내용으로 구성한 자기소개서 작성 및 면접 준비까지 전문네가 제공하는 컨텐츠입니다.';

const TITLE = '북미 개발자 차별화된 이력서부터 인터뷰까지 차근차근 준비하기';

const COURSE_THUMBNAILS = [
  '/img/gitlab.png',
  '/img/join-us-online.png',
  '/img/code-editor.png'
];

const COURSE_CATEGORIES = ['INTERVIEW', 'RESUME', 'NETWORKING'];

// Section Titles
const SECTION_TITLES = [
  '북미 개발자 채용 공고 사례',
  '북미 개발자 채용 공고 분석',
  '실제 북미 개발자 취업 성공 이력서'
];

async function main() {
  console.log('🧹 기존 Seed 데이터 제거 중…');

  await prisma.video.deleteMany({});
  await prisma.sectionItem.deleteMany({});
  await prisma.section.deleteMany({});
  await prisma.course.deleteMany({});

  console.log('✨ 기존 데이터 삭제 완료, 새로운 시드 생성 시작…');
  // 1) Mock Instructor 생성
  const instructorId = randomUUID();
  await prisma.instructor.upsert({
    where: { id: instructorId },
    update: {},
    create: {
      id: instructorId,
      name: 'Raphael. Lee',
      profileImage: '/img/instructor-image.png',
      description: 'I’ve bee managing multicultural teams for ever 19 years. And blesses to lead and be part of the opening teams in global projects in various countries. Growing personal & professional goals by sharing visions with teammates became a part of my passion and a long-term goal in my life.',
      careers: [
        { period: '2019 ~', position: 'Managing Director at Pacemaker' },
        { period: '2015 ~ 2019', position: 'Director of Operations at Metanet' },
        { period: '2009 ~ 2014', position: 'Business Development Manager at People In Biz Corp.' },
        { period: '2004 ~ 2008', position: 'Purchaser at InterContinental Hotels Group' }
      ]
    }
  });

  // 2) Course 6개 생성
  for (let i = 1; i <= 6; i++) {
    const courseId = randomUUID();

    const thumbnail = COURSE_THUMBNAILS[(i - 1) % COURSE_THUMBNAILS.length];
    const categoryString = COURSE_CATEGORIES[(i - 1) % COURSE_CATEGORIES.length];

    // Course 생성
    await prisma.course.create({
      data: {
        id: courseId,
        title: TITLE,
        courseTitle: COURSE_TITLE,
        description: COURSE_DESC,
        price: '2800',
        rating: 5,
        reviewCount: 1500,
        category: categoryString as 'INTERVIEW' | 'RESUME' | 'NETWORKING',
        duration: '7시간',
        level: '중급',
        language: '한국어',
        backgroundImage: thumbnail,
        instructorId,

        sectionsRel: {
          create: SECTION_TITLES.map((sectionName, idx) => ({
            id: randomUUID(),
            title: sectionName,
            description: null,
            orderIndex: idx + 1
          }))
        }
      }
    });

    // 생성된 Section 조회
    const sections = await prisma.section.findMany({
      where: { courseId },
      orderBy: { orderIndex: 'asc' }
    });

    // 각 Section에 Video 4개씩 생성
    for (let sectionIdx = 0; sectionIdx < sections.length; sectionIdx++) {
      const section = sections[sectionIdx];
      for (let s = 1; s <= 4; s++) {
        // 첫 번째 코스의 첫 번째 섹션의 첫 번째 비디오는 특정 ID 사용
        const isFirstVideo = i === 1 && sectionIdx === 0 && s === 1;

        await prisma.video.create({
          data: {
            videoId: isFirstVideo ? '32ktrbrf3j' : randomUUID(),
            title: `Session ${s}`,
            description: null,
            price: null,
            category: 'INTERVIEW',
            thumbnail,
            courseId,
            sectionId: section.id
          }
        });
      }
    }
  }

  console.log('🎉 Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
