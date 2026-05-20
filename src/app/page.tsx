// Main landing page with visual banners and course lists
import ListHeader from '@/components/common/list-header';
import { Button } from '@/components/ui/button';
import WorkshopList from '@/components/features/workshops/workshop-list-horz';
import MainReviewContainer from '@/components/main-review-container';
import EbookList from '@/components/features/ebook/ebook-list-horz';
import LoginOrListenButton from '@/components/auth/login-or-listen-button';
import CourseList from '@/components/features/course/course-list-horz';
import prisma from '@/lib/prisma';

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
    <div className="w-full flex gap-20 flex-col bg-white">
      <ListHeader
        slides={slides}
        // autoPlayInterval={5000} // 5초마다 자동 전환
        gradientColors={{
          start: '#FFCDCE',
          middle: '#FAE3D7',
          end: '#FF823660'
        }}
      />
      <div className=" bg-white w-full max-w-[1200px] px-4 md:px-6 items-center mx-auto justify-center flex flex-col gap-8 md:gap-12">
        <div className="w-full aspect-video rounded-2xl md:rounded-[32px] overflow-hidden shadow-2xl bg-black">
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

        <div className="text-center flex flex-col items-center gap-4 md:gap-6">
          <h1 className="text-[2.2rem] md:text-[2.75rem] font-bold text-navy font-headline leading-tight px-4 text-navy">
            {'Real stories from people who got hired in North America'}
          </h1>
          <p className="max-w-[800px] font-light text-[0.95rem] md:text-pace-sm text-center whitespace-pre-wrap leading-[1.6] text-gray-500">
            {
              'Finding a job here can feel confusing. Where do you even start? On Pacemaker, mentors who work in IT, design, UX, marketing, accounting, and more share what actually worked for them. Whether you are in Korea, Canada, or anywhere else, you can learn on your own time and take the next step with us.'
            }
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full">
          <Button className="w-1/2 sm:w-auto h-14 bg-teal/5 text-teal border-2 border-teal px-8 rounded-2xl font-bold hover:bg-teal/10 transition-colors">
            {'Browse online courses'}
          </Button>
          <div className="w-full flex justify-center sm:w-auto">
            <LoginOrListenButton />
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1200px] px-4 md:px-6 items-center mx-auto justify-center flex flex-col gap-20 py-20 bg-white">
        <WorkshopList />
        <CourseList />
        <EbookList />
        <MainReviewContainer />
      </div>
    </div>
  );
}
