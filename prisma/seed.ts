/* eslint-disable no-console */
import {
  ItemType,
  PrismaClient,
  DocumentCategory,
  WorkshopCategory,
  TargetAudienceType,
  WorkshopStatus
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { randomUUID } from 'crypto';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool)
});

const COURSE_TITLE = 'From Differentiated Resumes to Confident Interviews';
const COURSE_DESC =
  'Learn how recruiters evaluate resumes and interviews, based on real hiring examples from Canadian companies.';
const LONG_DESCRIPTION = `To land a developer role in North America, strong coding skills aren’t enough.\n Understanding job postings and what companies are truly looking for is just as important. With AI-driven productivity on the rise, developer job openings in North America have decreased by nearly 35% over the past five years, making hiring more competitive than ever.

If North American job postings feel unfamiliar, this course guides you through how to read them effectively. Using real English resumes from Pacemaker developers hired by Canadian companies, you’ll learn how to analyze job postings and reflect those insights directly in your resume.`;

const TITLE = 'From Differentiated Resumes to Confident Interviews';

const DETAIL_TITLE =
  'Step by Step: From a Strong Developer Resume to Interviews';

const COURSE_THUMBNAILS = [
  '/img/course_image1.png',
  '/img/course_image2.png',
  '/img/course_image3.png'
];

const COURSE_CATEGORIES = ['INTERVIEW', 'RESUME', 'NETWORKING'];

// Section Titles
const SECTION_TITLES = [
  'Case Studies of North American Developer Job Postings',
  'Analysis of North American Developer Job Postings',
  'Actual Successful Resumes for North American Developer Jobs'
];

async function main() {
  // 운영 환경(Supabase) 체크: DATABASE_URL에 supabase 주소가 포함되어 있으면 데이터 삭제 중단
  const isSupabase =
    process.env.DATABASE_URL?.includes('supabase.com') ||
    process.env.DATABASE_URL?.includes('pooler.supabase.com');

  if (isSupabase) {
    console.log('⚠️ 운영/원격 환경(Supabase) 감지: 데이터 삭제를 건너뜅니다.');
  } else {
    console.log('🧹 로컬 환경: 기존 Seed 데이터 제거 중...');
    await prisma.video.deleteMany({});
    await prisma.sectionItem.deleteMany({});
    await prisma.section.deleteMany({});
    await prisma.course.deleteMany({});
    await prisma.document.deleteMany({});
    await prisma.workshop.deleteMany({});
    console.log('✨ 기존 데이터 삭제 완료.');
  }

  console.log('🚀 새로운 시드 생성 시작…');

  // 0) Main Visual 생성
  console.log('Generating Main Visuals...');
  await prisma.mainVisual.deleteMany({});
  await prisma.mainVisual.createMany({
    data: [
      {
        title:
          'Build the skills to launch your career abroad.\nExperience, resumes, and interviews, all in one place.',
        description:
          'Begin your career journey in the U.S. & Canada with Pacemaker.\nFrom resumes to interview skills and networking, every step is supported.',
        isPublic: true,
        linkName: 'Explore programs',
        link: '/courses',
        orderIndex: 0
      },
      {
        title: 'Ready to take the next step?',
        isPublic: true,
        orderIndex: 1
      },
      {
        title: 'Your future career starts here.',
        isPublic: true,
        linkName: 'Get Started',
        link: '/courses',
        orderIndex: 2
      }
    ]
  });

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
        'I’ve been managing multicultural teams for ever 19 years. And blesses to lead and be part of the opening teams in global projects in various countries. Growing personal & professional goals by sharing visions with teammates became a part of my passion and a long-term goal in my life.',
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

  const instructorId2 = randomUUID();
  await prisma.instructor.upsert({
    where: { id: instructorId2 },
    update: {},
    create: {
      id: instructorId2,
      name: 'Sujin Ku',
      profileImage: '/img/instructor-image.png',
      description:
        'Employer Strategy & Engagement Specialist at University of Toronto / Career Coach',
      careers: [
        { period: '2020 ~', position: 'Career Coach at U of T' },
        { period: '2015 ~ 2020', position: 'Employer Strategy Specialist' }
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
        promoText: 'Chosen by Professionals',
        summary: COURSE_DESC,
        detailTitle: DETAIL_TITLE,
        price: '2800',
        rating: 5,
        reviewCount: 1500,
        category: categoryString as 'INTERVIEW' | 'RESUME' | 'NETWORKING',
        duration: '7 Hours',
        level: 'Intermediate',
        language: 'English',
        backgroundImage: thumbnail,
        instructors: {
          connect: [{ id: instructorId }, { id: instructorId2 }]
        },
        targetAudienceTypes: ['IT', 'GOVERNMENT'],

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

    // 각 Section에 상세 설명 Item 생성
    const SECTION_CONTENT_MAP: Record<string, string> = {
      'Case Studies of North American Developer Job Postings':
        'Covers the North American style of resume writing in detail. Learn everything from keyword selection to pass ATS (Applicant Tracking Systems) to using action verbs to effectively showcase experiences.',
      'Analysis of North American Developer Job Postings':
        'Covers essential technical interview topics such as data structures and algorithms. Gain practical experience through analysis of past questions from big tech companies and model answers.',
      'Actual Successful Resumes for North American Developer Jobs':
        'Learn how to logically explain your experiences using the STAR technique. Provides answering strategies for key evaluation criteria such as leadership, conflict resolution, and teamwork.'
    };

    for (const section of sections) {
      const content = SECTION_CONTENT_MAP[section.title];
      if (content) {
        await prisma.sectionItem.create({
          data: {
            id: randomUUID(),
            sectionId: section.id,
            title: section.title,
            content: content,
            orderIndex: 1
          }
        });
      }
    }

    // 각 Section에 Video 4개씩 생성
    for (let sectionIdx = 0; sectionIdx < sections.length; sectionIdx++) {
      const section = sections[sectionIdx];
      for (let s = 1; s <= 4; s++) {
        await prisma.video.create({
          data: {
            videoId: (() => {
              // 첫 번째 코스의 첫 번째 섹션의 첫 번째 비디오만 실제 Wistia ID 사용
              if (i === 1 && sectionIdx === 0 && s === 1) {
                return '32ktrbrf3j';
              }
              // 나머지는 중복되지 않도록 고유한 더미 ID 생성 (@unique 제약 조건 대응)
              return `vidx-${i}-${sectionIdx}-${s}-${randomUUID().slice(0, 8)}`;
            })(),
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

  // 3) Document 4개 생성
  console.log('Generating dummy documents...');
  const documentCategories: DocumentCategory[] = [
    'MARKETING',
    'IT',
    'DESIGN',
    'SERVICE'
  ];
  const audienceTypes: TargetAudienceType[] = [
    'IT',
    'NETWORKING',
    'DESIGN',
    'SERVICE'
  ];

  for (let i = 1; i <= 4; i++) {
    const category = documentCategories[(i - 1) % documentCategories.length];

    await prisma.document.create({
      data: {
        documentId: `doc-${i}-${randomUUID().slice(0, 8)}`,
        title: `북미 취업 성공을 위한 ${category} 가이드북 Vol.${i}`,
        description: `이 가이드북은 ${category} 분야 북미 취업을 희망하는 분들을 위해 제작되었습니다. 실제 합격 사례와 핵심 전략을 담고 있습니다.`,
        price: 15000 + i * 1000,
        bucketUrl: `https://example-bucket.s3.amazonaws.com/documents/guide-${i}.pdf`,
        category: category,
        thumbnail: COURSE_THUMBNAILS[(i - 1) % COURSE_THUMBNAILS.length],
        isPublic: true,
        subTitle: `${category} 커리어 성장을 위한 필수 지침서`,
        subDescription:
          '현직자들의 생생한 노하우와 유용한 꿀팁을 한 단계씩 따라해보세요.',
        isMain: i <= 2,
        visualTitle1: `꿈꾸던 ${category} 커리어,`,
        visualTitle2: '이제 현실이 됩니다',
        tableOfContents: [
          {
            section: 'Chapter 1',
            title: '시장 트렌드 분석',
            content: '현재 북미 시장의 흐름'
          },
          {
            section: 'Chapter 2',
            title: '이력서 커스텀',
            content: '나만의 강점 부각하기'
          },
          {
            section: 'Chapter 3',
            title: '실전 답변 전략',
            content: '자주 나오는 질문 베스트 10'
          }
        ],
        targetAudienceTypes:
          i % 2 === 0
            ? [audienceTypes[0], audienceTypes[1]]
            : [audienceTypes[2], audienceTypes[3]],
        recommendedLinks: [
          {
            name: '관련 무료 워크샵 신청하기',
            url: 'https://example.com/workshop'
          },
          {
            name: '오픈 카톡방 참여 (비번: 1234)',
            url: 'https://open.kakao.com/o/example'
          }
        ]
      }
    });
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

  // 5) 고정 테스트 계정 생성 (Admin, User)
  console.log('Generating stable test accounts...');
  const stableUsers = [
    {
      id: '87921304-7f86-4398-9e22-420170acdb03',
      email: 'admin@paceupcareer.com',
      clerkId: 'user_38K4nsQvRHKpUo2ORvKpSCEAEWs',
      roleId: 'ADMIN'
    },
    {
      id: '70fd529d-154d-43e5-8dcc-2127aa7651fc',
      email: 'user@paceupcareer.com',
      clerkId: 'user_38K5898TBktdhW31nKDhgXUwZVF',
      roleId: 'USER'
    }
  ];

  for (const u of stableUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        clerkId: u.clerkId,
        roleId: u.roleId
      },
      create: {
        id: u.id,
        email: u.email,
        clerkId: u.clerkId,
        roleId: u.roleId,
        name: u.roleId === 'ADMIN' ? 'Admin User' : 'Test User',
        nickname: u.roleId === 'ADMIN' ? 'Admin' : 'Tester'
      }
    });
  }

  // 6) 30명의 추가 User 생성 with random roles
  console.log('Generating 30 additional users with random roles...');
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

  // 7) 워크샵 생성 (Mock data from UX Design & Home page)
  console.log('Generating dummy workshops...');
  const uxDesignWorkshopData = [
    {
      title: 'UX Design Workshop',
      status: 'COMPLETED',
      category: 'NETWORKING',
      date: '2026-01-15T19:00:00Z'
    },
    {
      title: 'UX Design Workshop',
      status: 'COMPLETED',
      category: 'NETWORKING',
      date: '2026-02-10T19:00:00Z'
    },
    {
      title: 'UX Design Workshop',
      status: 'COMPLETED',
      category: 'NETWORKING',
      date: '2026-03-05T19:00:00Z'
    },
    {
      title: 'UX Design Workshop',
      status: 'RECRUITING',
      category: 'NETWORKING',
      date: '2026-03-20T19:00:00Z'
    }
  ];

  for (const ws of uxDesignWorkshopData) {
    const startDate = new Date(ws.date);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

    await prisma.workshop.create({
      data: {
        id: randomUUID(),
        title: ws.title,
        description:
          "Everyone has unique strengths and potential.\nIn this session, you'll gain powerful insights into navigating challenges in a global career environment, leveraging the power of networking, and discovering your own path forward.\nDon't miss this exclusive opportunity to learn directly from Sujin Ku, Career Coach at the University of Toronto.",
        startDate,
        endDate,
        price: 20,
        locationOrUrl: 'North York centre',
        status: ws.status as WorkshopStatus,
        category: ws.category as WorkshopCategory,
        instructorId: instructorId2,
        thumbnail: '/img/course_image1.png'
      }
    });
  }

  const homeWorkshopData = [
    {
      title: 'Mind Training for Success',
      category: 'NETWORKING',
      status: 'ONGOING',
      thumbnail: '/img/course_image2.png',
      date: '2026-03-16T19:00:00Z'
    },
    {
      title: "Let's Connect!",
      category: 'NETWORKING',
      status: 'RECRUITING',
      thumbnail: '/img/course_image3.png',
      date: '2026-05-15T19:00:00Z'
    },
    {
      title: 'Build an English Resume for Career Transitions',
      category: 'RESUME',
      status: 'RECRUITING',
      thumbnail: '/img/course_image1.png',
      date: '2026-08-10T19:00:00Z'
    },
    {
      title: 'Resume Workshop for International Opportunities',
      category: 'NETWORKING',
      status: 'RECRUITING',
      thumbnail: '/img/course_image2.png',
      date: '2026-11-05T19:00:00Z'
    }
  ];

  for (const ws of homeWorkshopData) {
    const startDate = new Date(ws.date);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

    await prisma.workshop.create({
      data: {
        id: randomUUID(),
        title: ws.title,
        description:
          'Join this workshop to gain valuable insights and boost your career.',
        startDate,
        endDate,
        price: 20,
        locationOrUrl: 'North York centre',
        status: ws.status as WorkshopStatus,
        category: ws.category as WorkshopCategory,
        instructorId: instructorId2,
        thumbnail: ws.thumbnail
      }
    });
  }
  // 6) Create Mock Reviews for Courses
  console.log('Creating mock reviews...');
  const users = await prisma.user.findMany({ where: { roleId: 'USER' } });
  const courses = await prisma.course.findMany();

  const reviewContents = [
    {
      rating: 5,
      content:
        "It was a huge help in writing my resume. Especially the ATS-related tips were content I hadn't heard anywhere else!"
    },
    {
      rating: 4.5,
      content:
        'I was at a loss for interview prep, but I gained confidence thanks to this lecture. The mock interview questions were very similar to the actual ones.'
    },
    {
      rating: 5,
      content:
        "The advice coming from the instructor's experience was impressive. I highly recommend it to those preparing for overseas employment."
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
    await pool.end();
  });
