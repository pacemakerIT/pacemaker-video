import ListHeader from '@/components/common/list-header';
import LogoCarousel from '@/components/common/logo-marquee';
import ReviewContainer from '@/components/common/review-container';
import EbookListGrid from '@/components/features/ebook/ebook-list-grid';

export default function EBooksPage() {
  return (
    <div className="w-screen flex gap-20 flex-col">
      <ListHeader
        // TO-DO : DB 연결 필요
        title={
          '합격률 94%의 비밀: 취업과 이직에서 승리하는\n나만의 관점을 담은 자소서 작성'
        }
        height={'h-[370px]'}
        gradientColors={{
          start: '#FFD262',
          middle: '#FFFFFF',
          end: '#FCF0D7'
        }}
        // TO-DO : DB 연결 필요
        buttonText={'전자책 보러가기'}
      />
      <LogoCarousel />
      <EbookListGrid />
      <ReviewContainer />
    </div>
  );
}
