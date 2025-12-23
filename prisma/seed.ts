import { ItemType, PrismaClient } from '@prisma/client';
import courseData from '../public/json/video-detail-mock.json';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

const COURSE_TITLE = '자기소개서 작성 및 면접 준비까지 하늘로!';
const COURSE_DESC =
  '실제 캐나다 기업 합격 이력서를 바탕으로, 북미 인사 담당자들이 개발자 이력서에서 주목하는 구조와 표현을 분석해보세요!';

const LONG_DESCRIPTION = `북미에서 개발자로 취업하려면 코딩 실력만큼이나 채용공고를 제대로 읽고 이해하는 능력이 중요해요. 특히 요즘은 AI 덕분에 개발 생산성이 높아지면서, 지난 5년간 북미 지역의 개발자 채용공고 수가 약 35%나 줄었어요. 그만큼 기업들은 더 신중하게, 해당 포지션을 정말 잘 이해하고 있는 지원자를 찾고 있죠.

한국과는 조금 다른 북미식 채용공고의 특징, 어떻게 읽고 준비해야 할지 막막하셨다면, 실제 캐나다 기업에 최종 합격한 페이스메이커 개발자의 영문 이력서를 통해 채용공고 분석부터 이력서에 반영하는 방법까지 함께 살펴보세요!`;

const TITLE =
  '북미 취업의 정석: 차별화된 이력서부터 잡오퍼를 부르는 인터뷰까지';

const DETAIL_TITLE =
  '북미 개발자 차별화된 이력서부터 인터뷰까지 차근차근 준비하기';

const COURSE_THUMBNAILS = [
  '/img/course_image1.png',
  '/img/course_image2.png',
  '/img/course_image3.png'
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
      description:
        'I’ve bee managing multicultural teams for ever 19 years. And blesses to lead and be part of the opening teams in global projects in various countries. Growing personal & professional goals by sharing visions with teammates became a part of my passion and a long-term goal in my life.',
      careers: [
        { period: '2019 ~', position: 'Managing Director at Pacemaker' },
        {
          period: '2015 ~ 2019',
          position: 'Director of Operations at Metanet'
        },
        {
          period: '2009 ~ 2014',
          position: 'Business Development Manager at People In Biz Corp.'
        },
        {
          period: '2004 ~ 2008',
          position: 'Purchaser at InterContinental Hotels Group'
        }
      ]
    }
  });

  // 2) Course 6개 생성
  for (let i = 1; i <= 6; i++) {
    const courseId = randomUUID();

    const thumbnail = COURSE_THUMBNAILS[(i - 1) % COURSE_THUMBNAILS.length];
    const categoryString =
      COURSE_CATEGORIES[(i - 1) % COURSE_CATEGORIES.length];

    // Course 생성
    await prisma.course.create({
      data: {
        id: courseId,
        title: TITLE,
        courseTitle: COURSE_TITLE,
        description: LONG_DESCRIPTION,
        promoText: '캐나다 테크기업 OOO이 선택한',
        summary: COURSE_DESC,
        detailTitle: DETAIL_TITLE,
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

  // 4) Ensure UserRoles exist
  console.log('Creating user roles...');
  await prisma.userRole.upsert({
    where: { id: 'ADMIN' },
    update: {},
    create: { id: 'ADMIN', label: 'ADMIN' }
  });
  await prisma.userRole.upsert({
    where: { id: 'INSTRUCTOR' },
    update: {},
    create: { id: 'INSTRUCTOR', label: 'INSTRUCTOR' }
  });
  await prisma.userRole.upsert({
    where: { id: 'USER' },
    update: {},
    create: { id: 'USER', label: 'USER' }
  });

  // 5) 30명의 User 생성 with random roles
  console.log('Generating 30 users with random roles...');
  const itemTypes = ['COURSE', 'EBOOK', 'WORKSHOP'];

  for (let i = 1; i <= 30; i++) {
    const userId = randomUUID();
    const email = `user${i}@example.com`;
    const name = `User ${i}`;
    const nickname = `Nick${i}`;

    // Random role selection with weighted distribution
    // ADMIN: ~10%, INSTRUCTOR: ~20%, USER: ~70%
    let roleId;
    const roleRandom = Math.random();
    if (roleRandom < 0.1) {
      roleId = 'ADMIN';
    } else if (roleRandom < 0.3) {
      roleId = 'INSTRUCTOR';
    } else {
      roleId = 'USER';
    }

    await prisma.user.upsert({
      where: { email },
      update: {
        image: null
      },
      create: {
        id: userId,
        email,
        name,
        nickname,
        image: null,
        clerkId: `clerk_user_${i}`,
        roleId: roleId,
        isSubscribed: i % 3 === 0, // 1/3 probability
        createdAt: new Date(
          Date.now() - Math.floor(Math.random() * 10000000000)
        ), // Random past date
        lastLoginAt: new Date()
      }
    });

    // Create random orders for non-admin users
    if (roleId !== 'ADMIN') {
      // Generate 1-5 random orders per user
      const numOrders = Math.floor(Math.random() * 5) + 1;

      for (let j = 0; j < numOrders; j++) {
        const orderId = randomUUID();
        const orderItems: Array<{
          itemType: string;
          itemId: string;
          priceAtPurchase: number;
          quantity: number;
        }> = [];

        // Generate 1-3 items per order
        const numItems = Math.floor(Math.random() * 3) + 1;
        let totalAmount = 0;

        for (let k = 0; k < numItems; k++) {
          const itemType =
            itemTypes[Math.floor(Math.random() * itemTypes.length)];
          const price = Math.floor(Math.random() * 200) + 50; // Random price between 50-250
          const quantity = 1;

          orderItems.push({
            itemType,
            itemId: randomUUID(),
            priceAtPurchase: price,
            quantity
          });

          totalAmount += price * quantity;
        }

        // Create order with items
        await prisma.order.create({
          data: {
            id: orderId,
            userId: userId,
            totalAmount,
            status: 'COMPLETED',
            orderedAt: new Date(
              Date.now() - Math.floor(Math.random() * 10000000000)
            ),
            items: {
              create: orderItems.map((item) => ({
                itemType: item.itemType as ItemType,
                itemId: item.itemId,
                priceAtPurchase: item.priceAtPurchase,
                quantity: item.quantity
              }))
            }
          }
        });
      }
    }
  }

  // 6) Create Mock Reviews for Courses
  console.log('Creating mock reviews...');
  const users = await prisma.user.findMany({ where: { roleId: 'USER' } });
  const courses = await prisma.course.findMany();

  const reviewContents = [
    {
      rating: 5,
      content:
        '이력서 작성에 정말 큰 도움이 되었습니다. 특히 ATS 관련 팁은 어디서도 듣지 못한 내용이었어요!'
    },
    {
      rating: 4.5,
      content:
        '면접 준비가 막막했는데, 이 강의 덕분에 자신감을 얻었습니다. 모의 면접 질문들이 실제와 매우 비슷했습니다.'
    },
    {
      rating: 5,
      content:
        '강사님의 경험에서 우러나오는 조언들이 인상 깊었습니다. 해외 취업을 준비하는 분들께 강력 추천합니다.'
    }
  ];

  if (users.length > 0 && courses.length > 0) {
    for (const course of courses) {
      // Add 3 reviews per course to match mock data count
      for (let i = 0; i < 3; i++) {
        const user = users[i % users.length]; // Cycle through users
        const reviewData = reviewContents[i % reviewContents.length];

        await prisma.review.create({
          data: {
            userId: user.id,
            courseId: course.id,
            rating: reviewData.rating,
            content: reviewData.content,
            // Random date within last 3 months
            createdAt: new Date(
              Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)
            )
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
