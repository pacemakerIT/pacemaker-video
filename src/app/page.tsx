import ListHeader from '@/components/common/list-header';
import { Button } from '@/components/ui/button';
import WorkshopList from '@/components/features/workshops/workshop-list-horz';
import MainReviewContainer from '@/components/main-review-container';
import EbookList from '@/components/features/ebook/ebook-list-horz';
import LoginOrListenButton from '@/components/auth/login-or-listen-button';
import CourseList from '@/components/features/course/course-list-horz';

export default async function Home() {
  return (
    <div className="w-screen flex gap-20 flex-col bg-[#FBF9f6]">
      <ListHeader
        slides={[
          {
            title:
              'Build the skills to launch your career abroad.\nExperience, resumes, and interviews — all in one place.',
            subtitle:
              'Begin your career journey in the U.S. & Canada with Pacemaker.\nFrom resumes to interview skills and networking, every step supported.',
            buttonText: 'Explore Programs'
          },
          {
            title: 'Ready to take the next step?'
          },
          {
            title: 'Your future career starts here.',
            buttonText: 'Get Started'
          }
        ]}
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
            'Not sure where to start your career abroad?\nPacemaker offers online programs across IT, Graphic Design, UI/UX, and more\nfeaturing real stories from mentors who’ve secured roles in the field.\n\nWherever you are, you don’t have to do it alone.\nStart your career journey with Pacemaker.'
          }
        </span>
        <div className="flex justify-center items-center gap-4">
          <Button className="h-12 bg-white text-pace-orange-600 border border-pace-orange-600 p-4 rounded-full flex justify-center items-center mx-auto font-normal ">
            {'Browse Online Courses'}
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
