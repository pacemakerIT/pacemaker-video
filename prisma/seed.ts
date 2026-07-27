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

const WORKSHOP_DURATION_MS = 2 * 60 * 60 * 1000;
const WORKSHOP_STATUS = {
  open: 'OPEN' as unknown as WorkshopStatus,
  closed: WorkshopStatus.CLOSED,
  completed: WorkshopStatus.COMPLETED
};

function isRemoteSupabaseUrl(url: string) {
  return (
    url.includes('supabase.com') ||
    url.includes('pooler.supabase.com') ||
    url.includes('supabase.co')
  );
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function setLocalTime(date: Date, hour: number, minute = 0) {
  const result = new Date(date);
  result.setHours(hour, minute, 0, 0);
  return result;
}

function resolveWorkshopStatus(
  startDate: Date,
  endDate: Date,
  referenceDate: Date,
  desiredStatus?: WorkshopStatus
) {
  if (endDate < referenceDate) return WORKSHOP_STATUS.completed;
  if (desiredStatus === WORKSHOP_STATUS.closed) return WORKSHOP_STATUS.closed;
  return WORKSHOP_STATUS.open;
}

type WorkshopSeedData = {
  title: string;
  description: string;
  dayOffset?: number;
  startHour?: number;
  startDate?: Date;
  endDate?: Date;
  durationHours?: number;
  status?: WorkshopStatus;
  price: number;
  locationOrUrl: string;
  instructorId: string;
  category: keyof typeof WorkshopCategory;
  thumbnailIndex: number;
};

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
    const documentRecordId = randomUUID();

    await prisma.ebook.create({
      data: {
        id: documentRecordId,
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

  console.log(
    'Skipping account seed data. User roles, Clerk users, sample orders, and mock reviews are managed separately.'
  );

  console.log('Generating dummy workshops...');
  const workshopOrderKeys = generateNKeysBetween(null, null, 8);
  let workshopOrderIdx = 0;
  const workshopStatusReferenceDate = new Date();
  const workshopData: WorkshopSeedData[] = [
    {
      title: 'Portfolio Review Night',
      description:
        'Bring your portfolio and get direct feedback on storytelling, project framing, and interview-ready presentation.',
      dayOffset: -120,
      startHour: 19,
      price: 15,
      locationOrUrl: 'North York Centre',
      instructorId,
      category: 'NETWORKING',
      thumbnailIndex: 0
    },
    {
      title: 'Canadian Resume Clinic',
      description:
        'A practical resume workshop for translating international experience into clear, recruiter-friendly Canadian resume bullets.',
      dayOffset: -45,
      startHour: 18,
      price: 20,
      locationOrUrl: 'Online - Zoom',
      instructorId: instructorId2,
      category: 'RESUME',
      thumbnailIndex: 1
    },
    {
      title: 'Interview Storytelling Lab',
      description:
        'Practice behavioral interview answers using real prompts and learn how to connect your experience to business impact.',
      dayOffset: -10,
      startHour: 19,
      price: 25,
      locationOrUrl: 'Downtown Toronto',
      instructorId,
      category: 'INTERVIEW',
      thumbnailIndex: 2
    },
    {
      title: 'Career Transition Bootcamp',
      description:
        'A multi-day workshop that has already started and continues into the future. Registration is closed, but the workshop is not completed yet.',
      startDate: setLocalTime(addDays(workshopStatusReferenceDate, -1), 10),
      endDate: setLocalTime(addDays(workshopStatusReferenceDate, 2), 17),
      status: WORKSHOP_STATUS.closed,
      price: 40,
      locationOrUrl: 'North York Centre',
      instructorId: instructorId2,
      category: 'NETWORKING',
      thumbnailIndex: 0
    },
    {
      title: 'Hidden Job Market Workshop',
      description:
        'A future workshop whose seats are already full. It should appear as Closed, not Completed.',
      dayOffset: 5,
      startHour: 18,
      status: WORKSHOP_STATUS.closed,
      price: 20,
      locationOrUrl: 'North York Centre',
      instructorId,
      category: 'NETWORKING',
      thumbnailIndex: 1
    },
    {
      title: 'LinkedIn Networking Sprint',
      description:
        'Build a targeted LinkedIn outreach list and leave with message templates tailored to your career direction.',
      dayOffset: 14,
      startHour: 19,
      price: 10,
      locationOrUrl: 'Online - Zoom',
      instructorId: instructorId2,
      category: 'NETWORKING',
      thumbnailIndex: 2
    },
    {
      title: 'Tech Resume Rewrite Intensive',
      description:
        'Rewrite your developer resume with stronger metrics, tighter project descriptions, and keyword alignment.',
      dayOffset: 45,
      startHour: 18,
      price: 30,
      locationOrUrl: 'Downtown Toronto',
      instructorId,
      category: 'RESUME',
      thumbnailIndex: 0
    },
    {
      title: 'Mock Interview Circle',
      description:
        'Practice technical and behavioral interview rounds in a small-group format with structured peer feedback.',
      dayOffset: 75,
      startHour: 19,
      price: 25,
      locationOrUrl: 'Online - Zoom',
      instructorId: instructorId2,
      category: 'INTERVIEW',
      thumbnailIndex: 1
    }
  ];

  for (const ws of workshopData) {
    const startDate =
      ws.startDate ??
      setLocalTime(
        addDays(workshopStatusReferenceDate, ws.dayOffset ?? 0),
        ws.startHour ?? 19
      );
    const durationMs = ws.durationHours
      ? ws.durationHours * 60 * 60 * 1000
      : WORKSHOP_DURATION_MS;
    const endDate = ws.endDate ?? new Date(startDate.getTime() + durationMs);
    const status = resolveWorkshopStatus(
      startDate,
      endDate,
      workshopStatusReferenceDate,
      ws.status
    );
    const workshopId = randomUUID();

    await prisma.workshop.create({
      data: {
        id: workshopId,
        title: ws.title,
        description: ws.description,
        startDate,
        endDate,
        price: ws.price,
        locationOrUrl: ws.locationOrUrl,
        status,
        category: ws.category as WorkshopCategory,
        orderKey: workshopOrderKeys[workshopOrderIdx++],
        instructors: {
          create: [{ instructorId: ws.instructorId }]
        },
        thumbnail: getRandomImage(
          WORKSHOP_THUMBNAILS[ws.thumbnailIndex % WORKSHOP_THUMBNAILS.length]
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
