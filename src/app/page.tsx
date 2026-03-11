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
      ? mainVisuals.map((visual: MainVisual) => ({
          title: visual.title || '',
          subtitle: visual.description || '',
          buttonText: visual.linkName || 'Explore programs',
          route: visual.link || '/courses'
        }))
      : [
          {
            title:
              'Build the skills to launch your career abroad.\nExperience, resumes, and interviews, all in one place.',
            subtitle:
              'Begin your career journey in the U.S. & Canada with Pacemaker.\nFrom resumes to interview skills and networking, every step is supported.',
            buttonText: 'Explore programs',
            route: '/courses'
          },
          {
            title: 'Ready to take the next step?'
          },
          {
            title: 'Your future career starts here.',
            buttonText: 'Get Started',
            route: '/courses'
          }
        ];

  return (
    <div className="w-screen flex gap-20 flex-col bg-[#FBF9f6]">
      <ListHeader
        slides={slides}
        // autoPlayInterval={5000} // 5초마다 자동 전환
        height={'h-[502px]'}
        gradientColors={{
          start: '#FFCDCE',
          middle: '#FAE3D7',
          end: '#FF823660'
        }}
      />
      <div className="w-[62.5%] min-w-[1200px] items-center mx-auto justify-center flex flex-col gap-8">
        <iframe
          width="100%"
          height="673"
          src="https://www.youtube.com/embed/gk43OcYMes8?si=4rPZKvzBGS9H6Mhx&mute=1&autoplay=1"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
        <h1 className="text-pace-5xl font-bold pt-2 ">
          {'Real stories from professionals who secured roles'}
        </h1>
        <span className="font-light text-pace-sm text-center whitespace-pre-line leading-[140%]">
          {
            'Why a mentor-led career journey?\nMentors with real-world experience in North America will act as\nguides to shorten the months of fear and structure you.\n\nFrom one individual to a full community,\nthe mentor community is here for you.'
          }
        </span>
        <div className="flex justify-center items-center gap-4">
          <Button className="h-12 bg-white text-pace-orange-600 border border-pace-orange-600 p-4 rounded-full flex justify-center items-center mx-auto font-normal ">
            {'Explore programs'}
          </Button>
          <LoginOrListenButton />
        </div>
        <CourseList />
        <EbookList />
        <WorkshopList />
        <MainReviewContainer />
      </div>
    </div>
  );
}
