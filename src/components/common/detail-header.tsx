interface DetailHeaderProps {
  backgroundImage?: string;
  subtitle?: string;
  title?: string;
  courseTitle?: string;
  instructor?: string;
  description?: string;
  price?: string;
}

export default function DetailHeader({
  backgroundImage = '/img/video-bg.png',
  subtitle = '캐나다 테크기업 OOO이 선택한',
  title = '북미 취업의 정석: 차별화된 이력서부터 잡오퍼를 부르는 인터뷰까지',
  courseTitle = '자기소개서 작성 및 면접 준비까지 하나로!',
  instructor = 'Heilee, Linda, Raphael. Lee',
  description = '실제 캐나다 기업 합격 이력서를 바탕으로, 북미 인사 담당자들이 개발자 이력서에서 주목하는 구조와 표현을 분석해보세요!',
  price = '$999.99'
}: DetailHeaderProps) {
  return (
    <div className="w-full flex justify-between items-center h-[600px] relative overflow-hidden">
      {/* 배경 이미지 */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minWidth: '100%',
          minHeight: '100%'
        }}
      ></div>

      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="w-[62.5%] min-w-[1200px] items-center mx-auto justify-center flex gap-8">
        {/* 왼쪽 60% - 부제목과 제목 */}
        <div className="w-[60%] flex flex-col justify-center items-start px-12 relative z-10">
          <div className="text-white/80 text-lg font-medium mb-4">
            {subtitle}
          </div>
          <h1 className="text-white text-5xl font-bold leading-tight">
            {title}
          </h1>
        </div>

        {/* 오른쪽 40% - 강의 정보 카드 */}
        <div className="w-[40%] flex justify-center items-center px-8 relative z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {courseTitle}
            </h2>
            <div className="flex justify-between items-center">
              <span>강사</span>
              <p className="text-gray-600 mb-4">{instructor}</p>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed mb-6">
              {description}
            </p>
            <div className="flex items-center justify-between mb-6">
              <span className="text-3xl font-bold text-blue-600">{price}</span>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                장바구니 담기
              </button>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors">
                ♥
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
