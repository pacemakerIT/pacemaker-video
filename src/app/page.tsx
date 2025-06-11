import VideoList from '@/components/video-list';
import UserInfo from '@/components/user-info';
import ListHeader from '@/components/list-header';

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
      <div className="w-[1200px] items-center mx-auto justify-center flex flex-col gap-8">
        <VideoList />
        <UserInfo />
      </div>
    </div>
  );
}
