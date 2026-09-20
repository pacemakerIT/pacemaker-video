import { auth } from '@clerk/nextjs/server';
import { ItemType, OrderStatus } from '@prisma/client';
import MyList from '@/components/features/mypage/my-list';
import MyWorkshopList from '@/components/features/mypage/my-workshop-list';
import MyAccountLayout from '@/components/features/mypage/my-account-layout';
import prisma from '@/lib/prisma';
import { MyCard, MyWorkshopCard } from '@/types/my-card';

function titleCase(value: string | null) {
  if (!value) return 'General';
  return value
    .toLowerCase()
    .replace(
      /(^|_)(\w)/g,
      (_, space, letter) => `${space ? ' ' : ''}${letter.toUpperCase()}`
    );
}

function countTableOfContents(value: unknown) {
  return Array.isArray(value) ? value.length : 0;
}

async function getDashboardData() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true, lastLoginAt: true }
  });
  if (!user) return null;

  const [orderItems, registrations] = await Promise.all([
    prisma.orderItem.findMany({
      where: { order: { userId: user.id, status: OrderStatus.COMPLETED } },
      select: { itemId: true, itemType: true }
    }),
    prisma.userWorkshop.findMany({
      where: { userId: user.id },
      include: {
        workshop: {
          include: {
            instructors: { include: { instructor: true }, take: 1 }
          }
        }
      },
      orderBy: { workshop: { startDate: 'asc' } }
    })
  ]);

  const courseIds = [
    ...new Set(
      orderItems
        .filter((item) => item.itemType === ItemType.COURSE)
        .map((item) => item.itemId)
    )
  ];
  const ebookIds = [
    ...new Set(
      orderItems
        .filter((item) => item.itemType === ItemType.EBOOK)
        .map((item) => item.itemId)
    )
  ];

  const [courses, ebooks] = await Promise.all([
    prisma.course.findMany({
      where: { id: { in: courseIds } },
      include: {
        videos: {
          select: {
            id: true,
            watchedVideos: {
              where: { userId: user.id },
              select: { progress: true }
            }
          }
        }
      }
    }),
    prisma.ebook.findMany({ where: { id: { in: ebookIds } } })
  ]);

  const courseCards: MyCard[] = courses.map((course) => ({
    id: course.id,
    itemId: course.id,
    title: course.title || 'Untitled course',
    category: titleCase(course.category),
    type: ItemType.COURSE,
    purchased: true,
    totalChapters: course.videos.length,
    completedChapters: course.videos.filter((video) =>
      video.watchedVideos.some((watched) => watched.progress >= 100)
    ).length,
    description: course.description || undefined,
    image: course.thumbnailUrl || undefined
  }));

  const ebookCards: MyCard[] = ebooks.map((ebook) => ({
    id: ebook.id,
    itemId: ebook.id,
    title: ebook.title || 'Untitled e-book',
    category: titleCase(ebook.category),
    type: ItemType.EBOOK,
    purchased: true,
    totalChapters: countTableOfContents(ebook.tableOfContents),
    completedChapters: 0,
    description: ebook.description || ebook.subDescription || undefined,
    image: ebook.thumbnail || undefined
  }));

  const workshopCards: MyWorkshopCard[] = registrations.map(({ workshop }) => ({
    id: workshop.id,
    itemId: workshop.id,
    title: workshop.title,
    date: workshop.startDate,
    category: titleCase(workshop.category),
    location: workshop.locationOrUrl || 'Location to be announced',
    host: workshop.instructors[0]?.instructor.name || 'Pacemaker',
    image: workshop.thumbnail || undefined
  }));

  return {
    courseCards,
    ebookCards,
    workshopCards,
    lastLoginAt: user.lastLoginAt
  };
}

export default async function MyPage() {
  const data = await getDashboardData();
  const courseCards = data?.courseCards ?? [];
  const ebookCards = data?.ebookCards ?? [];
  const workshopCards = data?.workshopCards ?? [];
  const completedCourses = courseCards.filter(
    (card) =>
      card.totalChapters !== 0 && card.completedChapters === card.totalChapters
  ).length;
  const completedEbooks = ebookCards.filter(
    (card) =>
      card.totalChapters !== 0 && card.completedChapters === card.totalChapters
  ).length;
  const nextWorkshop = workshopCards
    .filter((card) => card.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0];
  const lastLogin =
    data?.lastLoginAt?.toLocaleString('en-CA', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }) ?? 'Not available';
  const stats = [
    {
      label: 'Workshops',
      detail: nextWorkshop
        ? `Next workshop: ${nextWorkshop.date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })} - ${nextWorkshop.date.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' })}`
        : 'No upcoming workshops',
      total: workshopCards.length
    },
    {
      label: 'Online Courses',
      detail: `${completedCourses} of ${courseCards.length} courses completed`,
      total: courseCards.length
    },
    {
      label: 'E-books',
      detail: `${completedEbooks} of ${ebookCards.length} read`,
      total: ebookCards.length
    }
  ];

  return (
    <MyAccountLayout>
      <section className="relative mb-10 overflow-hidden border border-[#00263B]/10 bg-[linear-gradient(135deg,rgba(0,38,59,0.04)_0%,rgba(0,173,189,0.10)_55%,rgba(255,79,2,0.08)_100%)] p-6 shadow-card sm:p-8">
        <h1 className="mb-4 font-headline text-2xl font-bold tracking-tight text-[#00263B] sm:text-[2.2rem]">
          Welcome to your Pacemaker Dashboard!
        </h1>
        <p className="mb-4 text-xs text-[#475467]">Last login: {lastLogin}</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between border border-gray-100 bg-white p-5 shadow-card transition-transform duration-300 hover:-translate-y-1"
            >
              <div>
                <h2 className="font-headline text-sm font-bold text-[#00263B]">
                  {stat.label}
                </h2>
                <p className="mt-1 text-xs text-[#475467]">{stat.detail}</p>
              </div>
              <strong className="ml-3 font-headline text-4xl font-extrabold text-[#FF4F02]">
                {stat.total}
              </strong>
            </div>
          ))}
        </div>
      </section>
      <MyWorkshopList cards={workshopCards} />
      <MyList title="My Online Courses" cards={courseCards} />
      <MyList title="My E-books" cards={ebookCards} />
    </MyAccountLayout>
  );
}
