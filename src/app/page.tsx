import VideoList from '@/components/video-list';
import UserInfo from '@/components/user/user-info';
import ListHeader from '@/components/list-header';
import { Button } from '@/components/ui/button';

export default async function Home() {
  return (
    <div className="w-screen flex gap-20 flex-col">
      <ListHeader
        slides={[
          {
            title:
              '북미 취업 준비 어디서부터 해야할지 막막하다면?\n스펙 쌓기부터 레쥬메 작성 및 인터뷰까지 하나로!',
            subtitle:
              '꿈꾸던 북미 취업, 페이스메이커와 함께 시작하세요!\n레쥬메 작성부터 인터뷰 스킬, 네트워킹까지 각 분야별 멘토들이 함께 합니다.',
            buttonText: '강의 보러가기'
          },
          {
            title: '두 번째 슬라이드 제목'
          },
          {
            title: '세 번째 슬라이드 제목',
            buttonText: '세 번째 버튼'
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
      <div className="w-[62.5%] items-center mx-auto justify-center flex flex-col gap-8">
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
          {'성공한 선배들이 전하는 진짜 북미 취업 이야기'}
        </h1>
        <span className="font-light text-pace-sm text-center whitespace-pre-line leading-[140%]">
          {
            '어렵기만 한 북미 취업, 어디서부터 어떻게 시작해야 할지 막막하셨죠?\n페이스메이커 온라인 강의 플랫폼에서는 IT, 그래픽 디자인, UX/UI 디자인,마케팅, 회계 등 다양한 분야에서\n 실제 북미 기업 취업에 성공한 멘토들이 실전 노하우를 전해드립니다.\n \n 지금 한국에 계시든, 캐나다에계시든 장소에 구애받지 않고\n 페이스메이커와 함께 북미 취업에 도전해보세요!\n'
          }
        </span>
        <div className="flex justify-center items-center gap-4">
          <Button className="h-12 bg-white text-pace-orange-600 border border-pace-orange-600 p-4 rounded-full flex justify-center items-center mx-auto font-normal ">
            {'온라인 강의 둘러보기'}
          </Button>
          <Button className="h-12 bg-pace-orange-600 text-white border border-pace-orange-600 p-4 rounded-full flex justify-center items-center mx-auto font-normal ">
            {'로그인하고 강의 듣기'}
          </Button>
        </div>
        <VideoList />
        <UserInfo />
      </div>
    </div>
  );
}
