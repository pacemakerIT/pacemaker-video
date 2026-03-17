/* eslint-disable no-console */
import {
  ItemType,
  PrismaClient,
  CourseCategory,
  DocumentCategory,
  WorkshopCategory,
  TargetAudienceType
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

const EBOOK_THUMBNAILS = [
  '/img/ebook_image1.png',
  '/img/ebook_image2.png',
  '/img/ebook_image3.png',
  '/img/ebook_image4.png',
  '/img/ebook_image5.png',
  '/img/ebook_image6.png'
];

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
    console.log('🧹 로컬 환경: 기존 Seed 데이터 제거 중…');
    await prisma.video.deleteMany({});
    await prisma.sectionItem.deleteMany({});
    await prisma.section.deleteMany({});
    await prisma.course.deleteMany({});
    await prisma.document.deleteMany({});
    console.log('✨ 기존 데이터 삭제 완료.');
  }

  console.log('🚀 새로운 시드 생성 시작…');

  // 0) Main Visual 생성
  console.log('Generating Main Visuals...');
  await prisma.mainVisual.deleteMany({});
  await prisma.mainVisual.createMany({
    data: [
      {
        title: 'Build the skills to launch your career abroad.\nExperience, resumes, and interviews, all in one place.',
        description: 'Begin your career journey in the U.S. & Canada with Pacemaker.\nFrom resumes to interview skills and networking, every step is supported.',
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
      name: 'Sarah Kim',
      profileImage: '/img/instructor-image.png',
      description:
        'Expert in resume writing and career consulting with over 10 years of experience.',
      careers: [
        { period: '2020 ~', position: 'Career Consultant' },
        { period: '2015 ~ 2020', position: 'HR Manager at Tech Corp' }
      ]
    }
  });

  // 2) Course 6개 생성
  for (let i = 1; i <= 6; i++) {
    const courseId = randomUUID();

    const thumbnail = COURSE_THUMBNAILS[(i - 1) % COURSE_THUMBNAILS.length];
    const categories = Object.values(CourseCategory);
    const categoryString = categories[(i - 1) % categories.length];

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

  // 3) Document (E-book) 6개 생성
  console.log('Generating English e-books...');
  const ebooks = [
    {
      category: DocumentCategory.MARKETING,
      title: 'The 94% Success Formula: A Proven Approach to Job & Career Transitions',
      subTitle: 'Branding & Networking for Marketers',
      description: 'Learn what truly matters in hiring criteria and how to build the right experience to strengthen your resume.',
      price: 2800,
      visualTitle1: 'Branding & Networking',
      visualTitle2: 'for Marketers'
    },
    {
      category: DocumentCategory.DESIGN,
      title: 'What Every Designer Should Know: Interviews That Shape Your Career',
      subTitle: 'Preparing for Design Interviews',
      description: 'Identify your unique strengths and communicate your design thinking with confidence during interviews.',
      price: 2800,
      visualTitle1: 'Preparing for',
      visualTitle2: 'Design Interviews'
    },
    {
      category: DocumentCategory.PUBLIC,
      title: 'A Resume That Gets You Hired in the North American Public Sector',
      subTitle: 'Public Sector Resume',
      description: 'Learn how to structure your resume to meet public sector hiring criteria and leave a strong, positive impression on recruiters.',
      price: 2800,
      visualTitle1: 'Public Sector',
      visualTitle2: 'Resume'
    },
    {
      category: DocumentCategory.IT,
      title: 'The 94% Success Formula: Resumes That Win Jobs and Interviews',
      subTitle: 'IT Resume & Interview Preparation',
      description: 'Understand what hiring managers look for and learn how to build a resume and interview strategy aligned with North American IT hiring standards.',
      price: 2800,
      visualTitle1: 'IT Resume &',
      visualTitle2: 'Interview Preparation'
    },
    {
      category: DocumentCategory.ACCOUNTING,
      title: 'A practical guide to Interviews for finance and accounting roles, learn once, use for life.',
      subTitle: 'Preparing for Accounting Interviews',
      description: 'Learn how to identify your strengths and clues to present them in resumes and interviews.',
      price: 2800,
      visualTitle1: 'Preparing for',
      visualTitle2: 'Accounting Interviews'
    },
    {
      category: DocumentCategory.SERVICE,
      title: 'The 94% success approach: communicate your value clearly in job searches and career moves.',
      subTitle: 'Resume & Networking for Service Roles',
      description: 'Learn what truly matters in resumes and how to build relevant experience strategically.',
      price: 2800,
      visualTitle1: 'Resume & Networking',
      visualTitle2: 'for Service Roles'
    }
  ];

  const EBOOK_TOC = [
    {
      id: '1',
      title: 'Developer Job Posting Examples',
      content:
        'Review real North American job posting examples to understand current hiring trends.'
    },
    {
      id: '2',
      title: 'Analyzing Developer Job Postings',
      content:
        'Analyze resume strategies and key keywords based on actual North American job postings.'
    },
    {
      id: '3',
      title: 'Resume Examples from Hired Developers',
      content:
        'Learn how to analyze and leverage job postings through successful real-world resumes.'
    }
  ];

  for (let i = 0; i < ebooks.length; i++) {
    const ebook = ebooks[i];
    await prisma.document.create({
      data: {
        documentId: `ebook-${i + 1}`,
        title: ebook.title,
        description: ebook.description,
        price: ebook.price,
        bucketUrl: `https://example-bucket.s3.amazonaws.com/ebooks/guide-${i + 1}.pdf`,
        category: ebook.category,
        thumbnail: EBOOK_THUMBNAILS[i % EBOOK_THUMBNAILS.length],
        isPublic: true,
        subTitle: ebook.subTitle,
        isMain: i < 4,
        visualTitle1: ebook.visualTitle1,
        visualTitle2: ebook.visualTitle2,
        tableOfContents: EBOOK_TOC,
        targetAudienceTypes: (() => {
          switch (ebook.category) {
            case DocumentCategory.MARKETING:
              return [TargetAudienceType.NETWORKING];
            case DocumentCategory.IT:
              return [TargetAudienceType.IT];
            case DocumentCategory.DESIGN:
              return [TargetAudienceType.DESIGN];
            case DocumentCategory.PUBLIC:
              return [TargetAudienceType.GOVERNMENT];
            case DocumentCategory.ACCOUNTING:
              return [TargetAudienceType.FINANCE];
            case DocumentCategory.SERVICE:
              return [TargetAudienceType.SERVICE];
            default:
              return [];
          }
        })()
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

  // 워크샵 카테고리에 데이터 추가
  const categories = Object.values(WorkshopCategory);

  // 2. 현재 DB에 있는 모든 Workshop 조회
  const workshops = await prisma.workshop.findMany({
    select: { id: true }
  });

  console.log(`${workshops.length}개의 데이터를 업데이트 중...`);

  // 3. 루프를 돌며 랜덤 카테고리 할당
  for (const workshop of workshops) {
    const randomCategory =
      categories[Math.floor(Math.random() * categories.length)];

    await prisma.workshop.update({
      where: { id: workshop.id },
      data: {
        category: randomCategory
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
