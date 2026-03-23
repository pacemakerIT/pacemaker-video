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
          'The 94% Success Formula: Writing Applications\nThat Set You Apart'
        }
        height={'h-[370px]'}
        gradientColors={{
          start: '#FFD262',
          middle: '#FFFFFF',
          end: '#FCF0D7'
        }}
        // TO-DO : DB 연결 필요
        buttonText={'View the guide'}
      />
      <LogoCarousel />
      <EbookListGrid />
      <ReviewContainer />
    </div>
  );
}
