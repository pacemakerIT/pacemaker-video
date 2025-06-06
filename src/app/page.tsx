import VideoList from '@/components/video-list';
import UserInfo from '@/components/user-info';
import ListHeader from '@/components/list-header';

export default async function Home() {
  return (
    <div className="w-screen flex gap-4 flex-col">
      <ListHeader
        slides={[
          {
            title:
              '북미 취업 준비 어디서부터 해야할지 막막하다면?\n스펙 쌓기부터 레쥬메 작성 및 인터뷰까지 하나로!',
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
          middle: '#FF823610',
          end: '#FF823640'
        }}
      />
      <VideoList />
      <UserInfo />
    </div>
  );
}
