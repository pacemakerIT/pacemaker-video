/* eslint-disable no-console */
import {
  ItemType,
  PrismaClient,
  CourseCategory,
  DocumentCategory,
  WorkshopCategory,
  TargetAudienceType,
  WorkshopStatus
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { randomUUID } from 'crypto';

const connectionString =
  process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim() || '';

if (!connectionString) {
  throw new Error('Either DIRECT_URL or DATABASE_URL must be set for seed.');
}
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString })
});

const TITLE = 'Resume + Interview Prep (All-in-One)';
const DESCRIPTION =
  'Learn how recruiters evaluate resumes and interviews, based on real hiring examples from Canadian companies.';
const PROCESS_CONTENT = `To land a developer role in North America, strong coding skills aren’t enough.\n Understanding job postings and what companies are truly looking for is just as important. With AI-driven productivity on the rise, developer job openings in North America have decreased by nearly 35% over the past five years, making hiring more competitive than ever.

If North American job postings feel unfamiliar, this course guides you through how to read them effectively. Using real English resumes from Pacemaker developers hired by Canadian companies, you’ll learn how to analyze job postings and reflect those insights directly in your resume.`;

const VISUAL_TITLE = 'Chosen by Professionals';
const VISUAL_TITLE_2 = 'From Differentiated Resumes to Confident Interviews';

const PROCESS_TITLE =
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

const SECTION_TITLES = [
  'Case Studies of North American Developer Job Postings',
  'Analysis of North American Developer Job Postings',
  'Actual Successful Resumes for North American Developer Jobs'
];

const SEEDED_INSTRUCTOR_IDS = {
  raphael: 'cd0bf417-d5ff-4ab7-8dd2-6e6682189f77',
  sujin: 'f5b45574-ad41-4614-bd75-d15a885fe4ae'
} as const;

const SEEDED_REFERENCE_DATE = new Date('2026-03-25T12:00:00.000Z');
const ORDER_ITEM_TYPES = ['COURSE', 'EBOOK', 'WORKSHOP'] as const;

type SeedOrderItemType = (typeof ORDER_ITEM_TYPES)[number];
type SeedCatalogEntry = {
  id: string;
  itemType: SeedOrderItemType;
  price: number;
};

function isRemoteSupabaseUrl(url: string) {
  return (
    url.includes('supabase.com') ||
    url.includes('pooler.supabase.com') ||
    url.includes('supabase.co')
  );
}

function createSeededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomInt(rng: () => number, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function randomPastDate(rng: () => number, maxOffsetMs: number) {
  return new Date(
    SEEDED_REFERENCE_DATE.getTime() - Math.floor(rng() * maxOffsetMs)
  );
}

function pickOne<T>(rng: () => number, items: readonly T[]) {
  return items[Math.floor(rng() * items.length)];
}

async function resetLocalSeedData() {
  console.log('🧹 로컬 환경: 기존 Seed 데이터 제거 중...');

  await prisma.favorite.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.watchedVideo.deleteMany({});
  await prisma.workshopRegistration.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.mainVisual.deleteMany({});
  await prisma.video.deleteMany({});
  await prisma.section.deleteMany({});
  await prisma.$executeRawUnsafe('DELETE FROM "_CourseToInstructor";');
  await prisma.course.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.workshop.deleteMany({});
  await prisma.instructor.deleteMany({});

  console.log('✨ 기존 데이터 삭제 완료.');
}

async function main() {
  if (isRemoteSupabaseUrl(connectionString)) {
    throw new Error(
      'Remote Supabase database detected. Refusing to run destructive local seed.'
    );
  }

  const rng = createSeededRandom(20260325);
  const seededCatalog: Record<SeedOrderItemType, SeedCatalogEntry[]> = {
    COURSE: [],
    EBOOK: [],
    WORKSHOP: []
  };
  const seedOrderUsers: Array<{ id: string; roleId: string }> = [];

  await resetLocalSeedData();

  console.log('🚀 새로운 시드 생성 시작…');

  console.log('Generating Main Visuals...');
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

  const instructorId = SEEDED_INSTRUCTOR_IDS.raphael;
  await prisma.instructor.upsert({
    where: { id: instructorId },
    update: {
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
    },
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

  const instructorId2 = SEEDED_INSTRUCTOR_IDS.sujin;
  await prisma.instructor.upsert({
    where: { id: instructorId2 },
    update: {
      name: 'Sujin Ku',
      profileImage: '/img/instructor-image.png',
      description:
        'Employer Strategy & Engagement Specialist at University of Toronto / Career Coach',
      careers: [
        { period: '2020 ~', position: 'Career Coach at U of T' },
        { period: '2015 ~ 2020', position: 'Employer Strategy Specialist' }
      ]
    },
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

  for (let i = 1; i <= 6; i++) {
    const courseId = randomUUID();
    const coursePrice = 2800;
    const thumbnail = COURSE_THUMBNAILS[(i - 1) % COURSE_THUMBNAILS.length];
    const categories = Object.values(CourseCategory);
    const categoryString = categories[(i - 1) % categories.length];

    await prisma.course.create({
      data: {
        id: courseId,
        category: categoryString as CourseCategory,
        isPublic: true,
        showOnMain: true,
        title: TITLE,
        description: DESCRIPTION,
        processTitle: PROCESS_TITLE,
        processContent: PROCESS_CONTENT,
        videoLink: 'https://vimeo.com/123456789',
        price: '2800',
        time: '7 Hours',
        thumbnailUrl: thumbnail,
        visualTitle: VISUAL_TITLE,
        visualTitle2: VISUAL_TITLE_2,
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

    seededCatalog.COURSE.push({
      id: courseId,
      itemType: 'COURSE',
      price: coursePrice
    });

    const sections = await prisma.section.findMany({
      where: { courseId },
      orderBy: { orderIndex: 'asc' }
    });

    const sectionContentMap: Record<string, string> = {
      'Case Studies of North American Developer Job Postings':
        'Covers the North American style of resume writing in detail. Learn everything from keyword selection to pass ATS (Applicant Tracking Systems) to using action verbs to effectively showcase experiences.',
      'Analysis of North American Developer Job Postings':
        'Covers essential technical interview topics such as data structures and algorithms. Gain practical experience through analysis of past questions from big tech companies and model answers.',
      'Actual Successful Resumes for North American Developer Jobs':
        'Learn how to logically explain your experiences using the STAR technique. Provides answering strategies for key evaluation criteria such as leadership, conflict resolution, and teamwork.'
    };

    for (const section of sections) {
      const content = sectionContentMap[section.title];
      if (!content) {
        continue;
      }

      await prisma.sectionItem.create({
        data: {
          id: randomUUID(),
          sectionId: section.id,
          title: section.title,
          content,
          orderIndex: 1
        }
      });
    }

    for (let sectionIdx = 0; sectionIdx < sections.length; sectionIdx++) {
      const section = sections[sectionIdx];
      for (let s = 1; s <= 4; s++) {
        await prisma.video.create({
          data: {
            videoId:
              i === 1 && sectionIdx === 0 && s === 1
                ? '32ktrbrf3j'
                : `vidx-${i}-${sectionIdx + 1}-${s}`,
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

  console.log('Generating English e-books...');
  const ebooks = [
    {
      category: DocumentCategory.MARKETING,
      title:
        'The 94% Success Formula: A Proven Approach to Job & Career Transitions',
      subTitle: 'Branding & Networking for Marketers',
      description:
        'Learn what truly matters in hiring criteria and how to build the right experience to strengthen your resume.',
      price: 2800,
      visualTitle1: 'Branding & Networking',
      visualTitle2: 'for Marketers'
    },
    {
      category: DocumentCategory.DESIGN,
      title:
        'What Every Designer Should Know: Interviews That Shape Your Career',
      subTitle: 'Preparing for Design Interviews',
      description:
        'Identify your unique strengths and communicate your design thinking with confidence during interviews.',
      price: 2800,
      visualTitle1: 'Preparing for',
      visualTitle2: 'Design Interviews'
    },
    {
      category: DocumentCategory.PUBLIC,
      title: 'A Resume That Gets You Hired in the North American Public Sector',
      subTitle: 'Public Sector Resume',
      description:
        'Learn how to structure your resume to meet public sector hiring criteria and leave a strong, positive impression on recruiters.',
      price: 2800,
      visualTitle1: 'Public Sector',
      visualTitle2: 'Resume'
    },
    {
      category: DocumentCategory.IT,
      title: 'The 94% Success Formula: Resumes That Win Jobs and Interviews',
      subTitle: 'IT Resume & Interview Preparation',
      description:
        'Understand what hiring managers look for and learn how to build a resume and interview strategy aligned with North American IT hiring standards.',
      price: 2800,
      visualTitle1: 'IT Resume &',
      visualTitle2: 'Interview Preparation'
    },
    {
      category: DocumentCategory.ACCOUNTING,
      title:
        'A practical guide to Interviews for finance and accounting roles, learn once, use for life.',
      subTitle: 'Preparing for Accounting Interviews',
      description:
        'Learn how to identify your strengths and clues to present them in resumes and interviews.',
      price: 2800,
      visualTitle1: 'Preparing for',
      visualTitle2: 'Accounting Interviews'
    },
    {
      category: DocumentCategory.SERVICE,
      title:
        'The 94% success approach: communicate your value clearly in job searches and career moves.',
      subTitle: 'Resume & Networking for Service Roles',
      description:
        'Learn what truly matters in resumes and how to build relevant experience strategically.',
      price: 2800,
      visualTitle1: 'Resume & Networking',
      visualTitle2: 'for Service Roles'
    }
  ];

  const ebookToc = [
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
    const documentRecordId = randomUUID();

    await prisma.document.create({
      data: {
        id: documentRecordId,
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
        tableOfContents: ebookToc,
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

    seededCatalog.EBOOK.push({
      id: documentRecordId,
      itemType: 'EBOOK',
      price: ebook.price
    });
  }

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
        roleId: u.roleId,
        name: u.roleId === 'ADMIN' ? 'Admin User' : 'Test User',
        nickname: u.roleId === 'ADMIN' ? 'Admin' : 'Tester'
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

  console.log('Generating stable sample users...');
  for (let i = 1; i <= 30; i++) {
    const email = `user${i}@example.com`;
    const name = `User ${i}`;
    const nickname = `Nick${i}`;
    const createdAt = randomPastDate(rng, 10_000_000_000);
    const lastLoginAt = randomPastDate(rng, 14 * 24 * 60 * 60 * 1000);

    let roleId;
    const roleRandom = rng();
    if (roleRandom < 0.1) {
      roleId = 'ADMIN';
    } else if (roleRandom < 0.3) {
      roleId = 'INSTRUCTOR';
    } else {
      roleId = 'USER';
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        nickname,
        image: null,
        clerkId: `clerk_user_${i}`,
        roleId,
        isSubscribed: i % 3 === 0,
        createdAt,
        lastLoginAt
      },
      create: {
        id: randomUUID(),
        email,
        name,
        nickname,
        image: null,
        clerkId: `clerk_user_${i}`,
        roleId,
        isSubscribed: i % 3 === 0,
        createdAt,
        lastLoginAt
      }
    });

    if (roleId !== 'ADMIN') {
      seedOrderUsers.push({ id: user.id, roleId });
    }
  }

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
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    const workshopId = randomUUID();

    await prisma.workshop.create({
      data: {
        id: workshopId,
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

    seededCatalog.WORKSHOP.push({
      id: workshopId,
      itemType: 'WORKSHOP',
      price: 20
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
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    const workshopId = randomUUID();

    await prisma.workshop.create({
      data: {
        id: workshopId,
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

    seededCatalog.WORKSHOP.push({
      id: workshopId,
      itemType: 'WORKSHOP',
      price: 20
    });
  }

  console.log('Generating sample orders...');
  for (const user of seedOrderUsers) {
    if (user.roleId === 'ADMIN') {
      continue;
    }

    const numOrders = randomInt(rng, 1, 5);

    for (let orderIndex = 0; orderIndex < numOrders; orderIndex++) {
      const numItems = randomInt(rng, 1, 3);
      const orderItems: SeedCatalogEntry[] = [];

      for (let itemIndex = 0; itemIndex < numItems; itemIndex++) {
        const itemType = pickOne(rng, ORDER_ITEM_TYPES);
        const item = pickOne(rng, seededCatalog[itemType]);

        orderItems.push(item);
      }

      const totalAmount = orderItems.reduce((sum, item) => sum + item.price, 0);

      await prisma.order.create({
        data: {
          id: randomUUID(),
          userId: user.id,
          totalAmount,
          status: 'COMPLETED',
          orderedAt: randomPastDate(rng, 10_000_000_000),
          items: {
            create: orderItems.map((item) => ({
              itemType: item.itemType as ItemType,
              itemId: item.id,
              priceAtPurchase: item.price,
              quantity: 1
            }))
          }
        }
      });
    }
  }

  console.log('Creating mock reviews...');
  const users = await prisma.user.findMany({
    where: { roleId: 'USER' },
    orderBy: { email: 'asc' }
  });
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'asc' }
  });

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
      for (let i = 0; i < 3; i++) {
        const user = users[i % users.length];
        const reviewData = reviewContents[i % reviewContents.length];

        await prisma.review.create({
          data: {
            userId: user.id,
            courseId: course.id,
            rating: reviewData.rating,
            content: reviewData.content,
            createdAt: randomPastDate(rng, 90 * 24 * 60 * 60 * 1000)
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
