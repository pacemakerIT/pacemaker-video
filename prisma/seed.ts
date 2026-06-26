/* eslint-disable no-console */
import {
  PrismaClient,
  CourseCategory,
  EbookCategory,
  WorkshopCategory,
  TargetAudienceType,
  WorkshopStatus
} from '@prisma/client';
import { generateNKeysBetween } from 'fractional-indexing';
import { PrismaPg } from '@prisma/adapter-pg';
import { randomUUID } from 'crypto';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const connectionString =
  process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim() || '';

if (!connectionString) {
  throw new Error('Either DIRECT_URL or DATABASE_URL must be set for seed.');
}
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString })
});

const cleanEnv = (key: string) => {
  const val = process.env[key];
  if (!val) return '';
  return val.replace(/^['"](.*)['"]$/, '$1');
};

const s3Client = new S3Client({
  forcePathStyle: true,
  region: cleanEnv('SUPABASE_S3_REGION') || 'ca-central-1',
  endpoint: cleanEnv('SUPABASE_S3_ENDPOINT'),
  credentials: {
    accessKeyId: cleanEnv('SUPABASE_S3_ACCESS_KEY'),
    secretAccessKey: cleanEnv('SUPABASE_S3_SECRET_KEY')
  }
});

const BUCKET =
  cleanEnv('SUPABASE_S3_BUCKET') || cleanEnv('SUPABASE_S3_IMG_BUCKET') || '';

async function getRemoteImages() {
  if (!BUCKET) return [];
  try {
    const command = new ListObjectsV2Command({ Bucket: BUCKET });
    const response = await s3Client.send(command);
    return (
      (response.Contents?.map((item) => item.Key).filter(
        (key) => key && /\.(png|jpg|jpeg|webp)$/i.test(key)
      ) as string[]) || []
    );
  } catch (err) {
    console.error('Failed to fetch images from S3:', err);
    return [];
  }
}

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

const WORKSHOP_THUMBNAILS = [
  '/img/course_image1.png',
  '/img/course_image2.png',
  '/img/course_image3.png'
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

function isRemoteSupabaseUrl(url: string) {
  return (
    url.includes('supabase.com') ||
    url.includes('pooler.supabase.com') ||
    url.includes('supabase.co')
  );
}

async function resetLocalSeedData() {
  console.log('🧹 Local environment: Removing existing seed data...');

  await prisma.favorite.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.watchedVideo.deleteMany({});
  await prisma.userWorkshop.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.mainVisual.deleteMany({});
  await prisma.video.deleteMany({});
  await prisma.section.deleteMany({});
  await prisma.$executeRawUnsafe('DELETE FROM "_CourseToInstructor";');
  await prisma.course.deleteMany({});
  await prisma.ebook.deleteMany({});
  await prisma.workshop.deleteMany({});
  await prisma.instructor.deleteMany({});

  console.log('✨ Existing data deletion complete.');
}

async function main() {
  if (isRemoteSupabaseUrl(connectionString)) {
    // Masking credentials for security in logs
    const maskedUrl = connectionString.replace(
      /:\/\/([^:]+):([^@]+)@/,
      '://$1:****@'
    );
    console.error('❌ Remote Supabase database detected:', maskedUrl);
    throw new Error(
      'Remote Supabase database detected. Refusing to run destructive local seed on production/remote DB.'
    );
  }

  const supabaseUrl = cleanEnv('NEXT_PUBLIC_SUPABASE_URL');
  const remoteImages = await getRemoteImages();
  console.log(
    `📸 Found ${remoteImages.length} images in Supabase bucket: ${BUCKET}`
  );

  const getRandomImage = (fallback: string) => {
    if (remoteImages.length > 0) {
      const key = remoteImages[Math.floor(Math.random() * remoteImages.length)];
      if (supabaseUrl && BUCKET) {
        return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${key}`;
      }
      return key; // Fallback to raw key if URL/Bucket missing, resolver will handle it
    }
    return fallback;
  };

  await resetLocalSeedData();

  console.log('🚀 Starting new seed generation...');

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
      profileImage: getRandomImage('/img/instructor-image.png'),
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
      profileImage: getRandomImage('/img/instructor-image.png'),
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
      profileImage: getRandomImage('/img/instructor-image.png'),
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
      profileImage: getRandomImage('/img/instructor-image.png'),
      description:
        'Employer Strategy & Engagement Specialist at University of Toronto / Career Coach',
      careers: [
        { period: '2020 ~', position: 'Career Coach at U of T' },
        { period: '2015 ~ 2020', position: 'Employer Strategy Specialist' }
      ]
    }
  });

  const courseOrderKeys = generateNKeysBetween(null, null, 6);

  console.log('Generating English e-books...');
  const courseIds = Array.from({ length: 6 }, () => randomUUID());

  for (let i = 1; i <= 6; i++) {
    const courseId = courseIds[i - 1];
    const coursePrice = 2800;
    const thumbnail = getRandomImage(
      COURSE_THUMBNAILS[(i - 1) % COURSE_THUMBNAILS.length]
    );
    const categories = Object.values(CourseCategory);
    const categoryString = categories[(i - 1) % categories.length];

    // Link to next course, wrapping around
    const nextCourseId = courseIds[i % 6];
    const prevCourseId = courseIds[(i + 4) % 6]; // (i-2) % 6 safely

    await prisma.course.create({
      data: {
        id: courseId,
        category: categoryString as CourseCategory,
        isPublic: true,
        showOnMain: true,
        orderKey: courseOrderKeys[i - 1],
        title: `${TITLE} - Volume ${i}`,
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
        recommendedLinks: [
          {
            name: `Recommended Course ${i + 1}`,
            url: `/courses/${nextCourseId}`
          },
          {
            name: `Bonus Material for ${i}`,
            url: `/courses/${prevCourseId}`
          }
        ],
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
  const ebookOrderKeys = generateNKeysBetween(null, null, 6);
  const ebooks = [
    {
      category: EbookCategory.MARKETING,
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
      category: EbookCategory.DESIGN,
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
      category: EbookCategory.PUBLIC,
      title: 'A Resume That Gets You Hired in the North American Public Sector',
      subTitle: 'Public Sector Resume',
      description:
        'Learn how to structure your resume to meet public sector hiring criteria and leave a strong, positive impression on recruiters.',
      price: 2800,
      visualTitle1: 'Public Sector',
      visualTitle2: 'Resume'
    },
    {
      category: EbookCategory.IT,
      title: 'The 94% Success Formula: Resumes That Win Jobs and Interviews',
      subTitle: 'IT Resume & Interview Preparation',
      description:
        'Understand what hiring managers look for and learn how to build a resume and interview strategy aligned with North American IT hiring standards.',
      price: 2800,
      visualTitle1: 'IT Resume &',
      visualTitle2: 'Interview Preparation'
    },
    {
      category: EbookCategory.ACCOUNTING,
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
      category: EbookCategory.SERVICE,
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
    const ebookRecordId = randomUUID();

    await prisma.ebook.create({
      data: {
        id: ebookRecordId,
        ebookId: `ebook-${i + 1}`,
        title: ebook.title,
        description: ebook.description,
        price: ebook.price,
        bucketUrl: `https://example-bucket.s3.amazonaws.com/ebooks/guide-${i + 1}.pdf`,
        category: ebook.category,
        thumbnail: getRandomImage(
          EBOOK_THUMBNAILS[i % EBOOK_THUMBNAILS.length]
        ),
        isPublic: true,
        subTitle: ebook.subTitle,
        isMain: i < 4,
        orderKey: ebookOrderKeys[i],
        visualTitle1: ebook.visualTitle1,
        visualTitle2: ebook.visualTitle2,
        tableOfContents: ebookToc,
        targetAudienceTypes: (() => {
          switch (ebook.category) {
            case EbookCategory.MARKETING:
              return [TargetAudienceType.NETWORKING];
            case EbookCategory.IT:
              return [TargetAudienceType.IT];
            case EbookCategory.DESIGN:
              return [TargetAudienceType.DESIGN];
            case EbookCategory.PUBLIC:
              return [TargetAudienceType.GOVERNMENT];
            case EbookCategory.ACCOUNTING:
              return [TargetAudienceType.FINANCE];
            case EbookCategory.SERVICE:
              return [TargetAudienceType.SERVICE];
            default:
              return [];
          }
        })()
      }
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
      clerkId: 'user_3Da2QIjxxSbeuJWHg82WAfJzEXt',
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

  console.log('Generating dummy reviews...');
  const reviewData = [
    {
      rating: 5,
      content:
        'This course completely changed how I approach job applications. The resume templates and interview prep sections are gold. Got my first North American tech offer within 2 months!'
    },
    {
      rating: 5,
      content:
        'Incredibly practical. Every lesson felt relevant to real hiring processes. The instructor breaks down complex topics in a way that is easy to follow. Highly recommend to anyone transitioning into tech.'
    },
    {
      rating: 4,
      content:
        'Great content overall. The resume section was especially helpful for understanding what Canadian employers actually look for. Would love more mock interview examples.'
    },
    {
      rating: 5,
      content:
        'I was skeptical at first but this course delivered beyond my expectations. The step-by-step approach made the whole job search process feel manageable.'
    },
    {
      rating: 4,
      content:
        'Solid course with actionable advice. The networking section gave me strategies I could apply immediately. A few videos felt a bit long but the value is definitely there.'
    },
    {
      rating: 5,
      content:
        'Worth every penny. Landed a software developer role at a mid-size company after following the course roadmap. The real job posting analysis was eye-opening.'
    }
  ];

  await prisma.review.deleteMany({
    where: { userId: { in: stableUsers.map((u) => u.id) } }
  });

  for (let i = 0; i < reviewData.length; i++) {
    const userId = stableUsers[i % stableUsers.length].id;
    const courseId = courseIds[i % courseIds.length];
    await prisma.review.create({
      data: {
        userId,
        courseId,
        rating: reviewData[i].rating,
        content: reviewData[i].content
      }
    });
  }

  console.log('Generating dummy workshops...');
  const workshopOrderKeys = generateNKeysBetween(null, null, 8);
  let workshopOrderIdx = 0;
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

  for (let i = 0; i < uxDesignWorkshopData.length; i++) {
    const ws = uxDesignWorkshopData[i];
    const startDate = new Date(ws.date);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

    const status =
      startDate < SEEDED_REFERENCE_DATE
        ? WorkshopStatus.COMPLETED
        : WorkshopStatus.RECRUITING;

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
        status,
        category: ws.category as WorkshopCategory,
        orderKey: workshopOrderKeys[workshopOrderIdx++],
        instructors: {
          create: [{ instructorId: instructorId2 }]
        },
        thumbnail: getRandomImage(
          WORKSHOP_THUMBNAILS[i % WORKSHOP_THUMBNAILS.length]
        )
      }
    });
  }

  const homeWorkshopData = [
    {
      title: 'Mind Training for Success',
      category: 'NETWORKING',
      status: 'ONGOING',
      date: '2026-03-16T19:00:00Z'
    },
    {
      title: "Let's Connect!",
      category: 'NETWORKING',
      status: 'RECRUITING',
      date: '2026-05-15T19:00:00Z'
    },
    {
      title: 'Build an English Resume for Career Transitions',
      category: 'RESUME',
      status: 'RECRUITING',
      date: '2026-08-10T19:00:00Z'
    },
    {
      title: 'Resume Workshop for International Opportunities',
      category: 'NETWORKING',
      status: 'RECRUITING',
      date: '2026-11-05T19:00:00Z'
    }
  ];

  for (let i = 0; i < homeWorkshopData.length; i++) {
    const ws = homeWorkshopData[i];
    const startDate = new Date(ws.date);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

    const status =
      startDate < SEEDED_REFERENCE_DATE
        ? WorkshopStatus.COMPLETED
        : WorkshopStatus.RECRUITING;

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
        status,
        category: ws.category as WorkshopCategory,
        orderKey: workshopOrderKeys[workshopOrderIdx++],
        instructors: {
          create: [{ instructorId: instructorId2 }]
        },
        thumbnail: getRandomImage(
          WORKSHOP_THUMBNAILS[(i + 2) % WORKSHOP_THUMBNAILS.length]
        )
      }
    });
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
