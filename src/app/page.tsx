// Main landing page with visual banners and course lists
import ListHeader from '@/components/common/list-header';
import { Button } from '@/components/ui/button';
import WorkshopList from '@/components/features/workshops/workshop-list-horz';
import MainReviewContainer from '@/components/main-review-container';
import EbookList from '@/components/features/ebook/ebook-list-horz';
import LoginOrListenButton from '@/components/auth/login-or-listen-button';
import CourseList from '@/components/features/course/course-list-horz';
import prisma from '@/lib/prisma';
import Link from 'next/link';

import { MainVisual } from '@prisma/client';

export const revalidate = 0; // Ensure fresh data on every request

export default async function Home() {
  const allMainVisuals: MainVisual[] = await prisma.mainVisual.findMany({
    where: { isPublic: true },
    orderBy: { orderIndex: 'asc' }
  });

  const now = new Date();
  const mainVisuals = allMainVisuals.filter((visual: MainVisual) => {
    let isWithinRange = true;

    // Check Start Boundary
    if (visual.startDate && visual.startTime) {
      const start = new Date(visual.startDate);
      const [startH, startM] = visual.startTime.split(':').map(Number);
      start.setHours(startH, startM, 0, 0);
      if (now < start) isWithinRange = false;
    }

    // Check End Boundary
    if (visual.endDate && visual.endTime) {
      const end = new Date(visual.endDate);
      const [endH, endM] = visual.endTime.split(':').map(Number);
      end.setHours(endH, endM, 59, 999);
      if (now > end) isWithinRange = false;
    }

    return isWithinRange;
  });

  const slides =
    mainVisuals.length > 0
      ? mainVisuals.map((visual: MainVisual, index: number) => {
          const title = visual.title || '';
          const colorIndex = index % 2;
          const colors = [
            { tag: 'rgba(0, 173, 189, 0.85)', highlight: 'text-teal' },
            { tag: '#FF4F02', highlight: 'text-orange' }
          ];

          return {
            tag: 'Announcement',
            tagColor: colors[colorIndex].tag,
            title: title,
            highlight: '',
            highlightColor: colors[colorIndex].highlight,
            description: visual.description || '',
            buttonText: visual.linkName || '',
            link: visual.link || '',
            titleSizeClass:
              title.length >= 35 ? 'text-[clamp(1.2rem,3vw,1.8rem)]' : undefined
          };
        })
      : [
          {
            tag: 'Career Success',
            tagColor: 'rgba(0, 173, 189, 0.85)',
            title: 'Build the skills to launch your career abroad.',
            highlight: 'Expertise',
            highlightColor: 'text-teal',
            description:
              'Experience, resumes, and interviews, all in one place.',
            buttonText: 'Explore programs',
            link: '/courses'
          },
          {
            tag: 'Next Steps',
            tagColor: 'rgba(255, 79, 2, 0.85)',
            title: 'Ready to take the next step?',
            highlight: 'Your Future',
            highlightColor: 'text-orange',
            description: 'Start your journey today with expert guidance.',
            buttonText: 'Get Started',
            link: '/courses'
          },
          {
            tag: 'Join Us',
            tagColor: 'rgba(0, 173, 189, 0.85)',
            title: 'Your future career starts here.',
            highlight: 'Join Now',
            highlightColor: 'text-teal',
            description: 'Connect with mentors and grow your network.',
            buttonText: 'Get Started',
            link: '/courses'
          }
        ];

  return (
    <main className="bg-surface w-full flex flex-col">
      <ListHeader
        slides={slides}
        // autoPlayInterval={5000} // 5초마다 자동 전환
      />
      <div className="bg-gray-soft">
        <section className="py-[80px]">
          <div className="page-container">
            <div className="w-full aspect-video rounded-xl overflow-hidden shadow-[0_30px_70px_rgba(0,38,59,0.12)] bg-black">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/gk43OcYMes8?si=4rPZKvzBGS9H6Mhx&mute=1&autoplay=1"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </section>

        <section className="pb-24 mt-[40px]">
          <div className="page-container flex flex-col items-center justify-center gap-8 md:gap-12">
            <div className="text-center flex flex-col items-center gap-4 md:gap-6">
              <h1 className="text-[2.2rem] md:text-[2.75rem] font-bold text-navy font-headline leading-tight px-4 whitespace-pre-wrap">
                {'Real stories from people who got hired in \nNorth America'}
              </h1>
              <div className="text-[#667085] leading-relaxed space-y-4 text-[1.2rem] whitespace-pre-wrap">
                <p>
                  Finding a job here can feel confusing. Where do you even
                  start?
                  <br />
                  {
                    'On Pacemaker, mentors who work in IT, design, UX, marketing, accounting, and more share what actually \nworked for them.'
                  }
                </p>
                <p>
                  Whether you are in Korea, Canada, or anywhere else,
                  <br />
                  you can learn on your own time and take the next step with us.
                </p>
              </div>
            </div>

            <div className="flex w-full flex-wrap items-center justify-center gap-6 pt-10">
              <Button
                asChild
                className="h-auto w-auto rounded-2xl border-2 border-teal bg-transparent px-8 py-4 font-headline text-lg font-bold text-teal transition-all duration-500 ease-out hover:scale-[1.02] hover:bg-teal/5"
              >
                <Link href="/courses">{'Browse online courses'}</Link>
              </Button>
              <div className="flex justify-center">
                <LoginOrListenButton />
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="py-[80px] bg-surface overflow-hidden">
        <div className="page-container">
          <WorkshopList />
        </div>
      </section>

      <section className="py-[80px] bg-white overflow-hidden">
        <div className="page-container">
          <CourseList />
        </div>
      </section>

      <section className="py-[80px] bg-surface-container-low overflow-hidden">
        <div className="page-container">
          <EbookList />
        </div>
      </section>

      <footer className="pt-[80px] bg-surface-container-low">
        <MainReviewContainer />
      </footer>
    </main>
  );
}
