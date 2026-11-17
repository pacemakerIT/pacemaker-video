/* eslint-disable no-console */
import { loadEnvConfig } from '@next/env';
import {
  ItemType,
  OrderStatus,
  PrismaClient,
  WorkshopStatus,
  type Prisma
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { amountToCents } from '../src/lib/money';
import {
  COURSES,
  EBOOKS,
  INSTRUCTORS,
  MAIN_VISUALS,
  WORKSHOPS,
  type SeedFile
} from './seed-data';
import {
  isLocalSeedDatabase,
  maskConnectionString,
  resolveSeedStorage,
  seedFileUrl,
  seededWorkshopStatus,
  shiftDays,
  workshopDayShift,
  type SeedStorage
} from './seed-helpers';

// Seeds a local database with the content visible in production on
// 2026-11-03 (prisma/seed-data.ts) plus test accounts and My Page scenarios.
// It never talks to storage: in -dev mode it stores URLs of files that
// scripts/prepare-dev-seed-files.mjs copied into the -dev buckets.

// `prisma db seed` loads .env through prisma.config.ts; this covers running
// the file directly.
loadEnvConfig(process.cwd());

const connectionString =
  process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim() || '';

if (!connectionString) {
  throw new Error('Either DIRECT_URL or DATABASE_URL must be set for seed.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString })
});

type Tx = Prisma.TransactionClient;
type SeededWorkshop = (typeof WORKSHOPS)[number] & {
  start: Date;
  end: Date;
  status: WorkshopStatus;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const PAYMENT_SUCCESS_SESSION_ID = 'cs_test_seed_payment_success';

// Stable local accounts. Seed ids are only used when the account does not
// exist yet; everything else uses the id the upsert returns.
const TEST_ACCOUNTS = [
  {
    id: '87921304-7f86-4398-9e22-420170acdb03',
    email: 'admin@paceupcareer.com',
    clerkId: 'user_38K4nsQvRHKpUo2ORvKpSCEAEWs',
    roleId: 'ADMIN',
    name: 'Admin User',
    nickname: 'Admin',
    lastLoginDaysAgo: 7
  },
  {
    id: '70fd529d-154d-43e5-8dcc-2127aa7651fc',
    email: 'user@paceupcareer.com',
    clerkId: 'user_3Da2QIjxxSbeuJWHg82WAfJzEXt',
    roleId: 'USER',
    name: 'Test User',
    nickname: 'Tester',
    lastLoginDaysAgo: 1
  }
] as const;

const daysAgo = (now: Date, days: number) =>
  new Date(now.getTime() - days * DAY_MS);

function imageUrl(storage: SeedStorage, file: SeedFile) {
  return seedFileUrl(storage, 'image', file.key) ?? file.fallback ?? null;
}

function orderItem(itemType: ItemType, itemId: string, price: number) {
  return {
    itemId,
    itemType,
    priceAtPurchaseCents: amountToCents(price),
    quantity: 1
  };
}

const orderTotal = (items: { priceAtPurchaseCents: number }[]) =>
  items.reduce((total, item) => total + item.priceAtPurchaseCents, 0);

async function resetContent(tx: Tx) {
  await tx.favorite.deleteMany({});
  await tx.cart.deleteMany({});
  await tx.watchedVideo.deleteMany({});
  await tx.userWorkshop.deleteMany({});
  await tx.orderItem.deleteMany({});
  await tx.order.deleteMany({});
  await tx.review.deleteMany({});
  await tx.mainVisual.deleteMany({});
  await tx.video.deleteMany({});
  await tx.section.deleteMany({});
  await tx.courseToInstructor.deleteMany({});
  await tx.workshopInstructor.deleteMany({});
  await tx.course.deleteMany({});
  await tx.ebook.deleteMany({});
  await tx.workshop.deleteMany({});
  await tx.instructor.deleteMany({});
}

async function seedMainVisuals(tx: Tx) {
  await tx.mainVisual.createMany({
    data: MAIN_VISUALS.map((visual) => ({ ...visual, isPublic: true }))
  });
}

async function seedInstructors(tx: Tx, storage: SeedStorage) {
  await tx.instructor.createMany({
    data: INSTRUCTORS.map(({ profileImage, ...instructor }) => ({
      ...instructor,
      // Production stores the bare key; the image proxy looks it up in the
      // configured image bucket.
      profileImage:
        storage.mode === 'dev'
          ? profileImage.key
          : (profileImage.fallback ?? null)
    }))
  });
}

async function seedCourses(tx: Tx, storage: SeedStorage) {
  for (const course of COURSES) {
    const { sections, reviews, instructorIds, thumbnail, ...fields } = course;
    void reviews;
    await tx.course.create({
      data: {
        ...fields,
        isPublic: true,
        thumbnailUrl: imageUrl(storage, thumbnail),
        instructors: { connect: instructorIds.map((id) => ({ id })) }
      }
    });
    await tx.section.createMany({
      data: sections.map(({ videos, ...section }) => {
        void videos;
        return { ...section, courseId: course.id };
      })
    });
    await tx.video.createMany({
      data: sections.flatMap((section) =>
        section.videos.map((video) => ({
          ...video,
          courseId: course.id,
          sectionId: section.id
        }))
      )
    });
  }
}

async function seedEbooks(tx: Tx, storage: SeedStorage) {
  await tx.ebook.createMany({
    data: EBOOKS.map(({ thumbnail, file, recommendedLinks, ...ebook }) => ({
      ...ebook,
      isPublic: true,
      thumbnail: imageUrl(storage, thumbnail),
      bucketUrl: seedFileUrl(storage, 'ebook', file.key) ?? '',
      ...(recommendedLinks === null ? {} : { recommendedLinks })
    }))
  });
}

async function seedWorkshops(tx: Tx, storage: SeedStorage, now: Date) {
  const shift = workshopDayShift(
    WORKSHOPS.map((workshop) => new Date(workshop.startDate)),
    now
  );
  const seeded: SeededWorkshop[] = WORKSHOPS.map((workshop) => {
    const end = shiftDays(new Date(workshop.endDate), shift);
    return {
      ...workshop,
      start: shiftDays(new Date(workshop.startDate), shift),
      end,
      status: WorkshopStatus[seededWorkshopStatus(end, now)]
    };
  });

  await tx.workshop.createMany({
    data: seeded.map(
      ({ start, end, startDate, endDate, thumbnail, ...workshop }) => {
        void startDate;
        void endDate;
        return {
          ...workshop,
          startDate: start,
          endDate: end,
          thumbnail: imageUrl(storage, thumbnail)
        };
      }
    )
  });
  return seeded;
}

async function upsertTestAccounts(tx: Tx, now: Date) {
  const ids: string[] = [];
  for (const account of TEST_ACCOUNTS) {
    const profile = {
      roleId: account.roleId,
      name: account.name,
      nickname: account.nickname,
      lastLoginAt: daysAgo(now, account.lastLoginDaysAgo)
    };
    const user = await tx.user.upsert({
      where: { email: account.email },
      // Keep the existing Clerk identity; seed ids may belong to another
      // Clerk instance.
      update: profile,
      create: {
        id: account.id,
        email: account.email,
        clerkId: account.clerkId,
        ...profile
      },
      select: { id: true }
    });
    ids.push(user.id);
  }
  const [adminId, userId] = ids;
  return { adminId, userId };
}

async function seedReviews(tx: Tx, authorIds: string[]) {
  await tx.review.createMany({
    data: COURSES.flatMap((course) =>
      course.reviews.map((review, index) => ({
        ...review,
        courseId: course.id,
        userId: authorIds[index % authorIds.length]
      }))
    )
  });
}

async function seedMyPage(
  tx: Tx,
  userId: string,
  workshops: SeededWorkshop[],
  now: Date
) {
  const mainEbooks = EBOOKS.filter((ebook) => ebook.isMain);
  const ended = workshops.filter((w) => w.status === WorkshopStatus.COMPLETED);
  const upcoming = workshops.find((w) => w.status === WorkshopStatus.OPEN);
  if (!upcoming || ended.length < 2 || mainEbooks.length < 4) {
    throw new Error(
      'Seed content must include 2 ended and 1 upcoming workshop and 4 main e-books.'
    );
  }
  const [attendedWorkshop] = ended;
  const missedWorkshop = ended[ended.length - 1];

  // Older purchase: every course, three e-books and two past workshops.
  const dashboardItems = [
    ...COURSES.map((c) => orderItem(ItemType.COURSE, c.id, Number(c.price))),
    ...mainEbooks
      .slice(0, 3)
      .map((e) => orderItem(ItemType.EBOOK, e.id, e.price)),
    ...[attendedWorkshop, missedWorkshop].map((w) =>
      orderItem(ItemType.WORKSHOP, w.id, w.price)
    )
  ];
  const dashboardOrder = await tx.order.create({
    data: {
      userId,
      status: OrderStatus.COMPLETED,
      subtotalAmountCents: orderTotal(dashboardItems),
      totalAmountCents: orderTotal(dashboardItems),
      discountAmountCents: 0,
      taxAmountCents: 0,
      currency: 'cad',
      orderedAt: shiftDays(attendedWorkshop.start, -14),
      items: { create: dashboardItems }
    },
    select: { id: true }
  });

  // Preview with the seeded USER account at:
  // /mypage/payment-success?session_id=cs_test_seed_payment_success
  // This is a local fixture identifier, not a real Stripe checkout session.
  const [firstCourse, secondCourse] = COURSES;
  const paymentItems = [
    orderItem(ItemType.COURSE, firstCourse.id, Number(firstCourse.price)),
    orderItem(ItemType.COURSE, secondCourse.id, Number(secondCourse.price)),
    orderItem(ItemType.EBOOK, mainEbooks[3].id, mainEbooks[3].price),
    orderItem(ItemType.WORKSHOP, upcoming.id, upcoming.price)
  ];
  const paymentOrder = await tx.order.create({
    data: {
      userId,
      status: OrderStatus.COMPLETED,
      stripeCheckoutSessionId: PAYMENT_SUCCESS_SESSION_ID,
      subtotalAmountCents: orderTotal(paymentItems),
      totalAmountCents: orderTotal(paymentItems),
      discountAmountCents: 0,
      taxAmountCents: 0,
      currency: 'cad',
      orderedAt: daysAgo(now, 1),
      items: { create: paymentItems }
    },
    select: { id: true }
  });

  // Each registration points at the order that bought the workshop.
  await tx.userWorkshop.createMany({
    data: [
      {
        workshopId: attendedWorkshop.id,
        orderId: dashboardOrder.id,
        attended: true,
        registeredAt: shiftDays(attendedWorkshop.start, -14)
      },
      {
        workshopId: missedWorkshop.id,
        orderId: dashboardOrder.id,
        attended: false,
        registeredAt: shiftDays(attendedWorkshop.start, -14)
      },
      {
        workshopId: upcoming.id,
        orderId: paymentOrder.id,
        attended: false,
        registeredAt: daysAgo(now, 1)
      }
    ].map((registration) => ({ ...registration, userId }))
  });

  // Course progress: the first course finished, the second in progress.
  const videoIds = (course: (typeof COURSES)[number]) =>
    [...course.sections]
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .flatMap((section) => section.videos.map((video) => video.id));
  const finished = videoIds(firstCourse);
  const inProgress = videoIds(secondCourse).slice(0, 5);
  await tx.watchedVideo.createMany({
    data: [
      ...finished.map((videoId) => ({ userId, videoId, progress: 100 })),
      ...inProgress.map((videoId, index) => ({
        userId,
        videoId,
        progress: index === inProgress.length - 1 ? 35 : 100
      }))
    ]
  });

  await tx.favorite.createMany({
    data: [
      ...COURSES.slice(0, 2).map((c) => ({
        itemId: c.id,
        itemType: ItemType.COURSE
      })),
      ...mainEbooks.slice(0, 2).map((e) => ({
        itemId: e.id,
        itemType: ItemType.EBOOK
      })),
      {
        itemId: upcoming.id,
        itemType: ItemType.WORKSHOP,
        workshopId: upcoming.id
      }
    ].map((favorite) => ({ ...favorite, userId }))
  });
}

async function main() {
  if (!isLocalSeedDatabase(connectionString)) {
    console.error(
      '❌ Refusing to seed a non-local database:',
      maskConnectionString(connectionString)
    );
    throw new Error(
      'Seed only runs against a local database (localhost or the dev Docker container). It deletes content tables, so it refuses remote and production databases.'
    );
  }

  const storage = resolveSeedStorage(process.env);
  if (storage.mode === 'dev') {
    console.log(
      `📦 Files: ${storage.imageBucket} / ${storage.ebookBucket} (URLs only; run npm run storage:prepare-dev-seed-files once if they are missing)`
    );
  } else {
    console.warn(
      `⚠️ Using /img fallback images and no e-book files: ${storage.reason}.`
    );
  }

  const now = new Date();
  await prisma.$transaction(
    async (tx) => {
      console.log('🧹 Removing existing seed data...');
      await resetContent(tx);

      console.log('🚀 Creating production content...');
      await seedMainVisuals(tx);
      await seedInstructors(tx, storage);
      await seedCourses(tx, storage);
      await seedEbooks(tx, storage);
      const workshops = await seedWorkshops(tx, storage, now);

      console.log('👤 Creating test accounts and My Page data...');
      const { adminId, userId } = await upsertTestAccounts(tx, now);
      await seedReviews(tx, [adminId, userId]);
      await seedMyPage(tx, userId, workshops, now);
    },
    { timeout: 60_000, maxWait: 10_000 }
  );

  console.log(
    `🎉 Seeded ${MAIN_VISUALS.length} main visuals, ${COURSES.length} courses, ${EBOOKS.length} e-books, ${WORKSHOPS.length} workshops and ${INSTRUCTORS.length} instructors.`
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
