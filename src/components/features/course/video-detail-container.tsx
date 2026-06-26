'use client';
import {
  ChevronRight,
  ChevronUp,
  ChevronDown,
  CirclePlay,
  ChevronLeft
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import SectionHeader from '../../common/section-header';
import ExpandableCards from '../../common/expandable-cards';
import DetailHeroSection from '../../common/detail-hero-section';
import DetailReviewsSection from '../../common/detail-reviews-section';
import DetailRelatedContentSection from '../../common/detail-related-content-section';
import { ApiResponse } from '@/types/video-detail';
import { WistiaPlayer } from '@wistia/wistia-player-react';
import { resolveImageSrc } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useCartContext } from '@/app/context/cart-context';
import { useFavoriteContext } from '@/app/context/favorite-context';
import { ItemType } from '@prisma/client';
import ConfirmModal from '@/components/common/confirm-modal';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi
} from '@/components/ui/carousel';

interface VideoDetailContainerProps {
  id: string;
}

export default function VideoDetailContainer({
  id
}: VideoDetailContainerProps) {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const [data, setData] = useState<ApiResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMediaId, setSelectedMediaId] = useState<string>('');
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(
    new Set()
  );
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const { cart, addToCart } = useCartContext();
  const { favorites, addFavorite, removeFavorite } = useFavoriteContext();

  const isLiked = favorites.some((f) => f.itemId === id);
  const isInCart = cart.some((c) => c.itemId === id);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    showCancel: boolean;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
    showCancel: true
  });

  const showAlert = (title: string, description: string) => {
    setModalConfig({
      isOpen: true,
      title,
      description,
      onConfirm: () => {},
      showCancel: false
    });
  };

  const showConfirm = (
    title: string,
    description: string,
    onConfirm: () => void
  ) => {
    setModalConfig({
      isOpen: true,
      title,
      description,
      onConfirm,
      showCancel: true
    });
  };

  const handleToggleLike = async (nextState: boolean) => {
    if (!isSignedIn) {
      showConfirm(
        '로그인 필요',
        '로그인이 필요한 서비스입니다. 로그인 하시겠습니까?',
        () => {
          router.push('/sign-in');
        }
      );
      return;
    }

    try {
      if (nextState) {
        await addFavorite(id, ItemType.COURSE);
      } else {
        await removeFavorite(id);
      }
    } catch {
      showAlert('오류 발생', '오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleAddToCart = async () => {
    if (!isSignedIn) {
      showConfirm(
        '로그인 필요',
        '로그인이 필요한 서비스입니다. 로그인 하시겠습니까?',
        () => {
          router.push('/sign-in');
        }
      );
      return;
    }

    if (isInCart) {
      router.push('/mypage/cart');
      return;
    }

    try {
      await addToCart(id, ItemType.COURSE);

      showConfirm(
        '장바구니 담기 완료',
        '장바구니에 담았습니다. 장바구니로 이동하시겠습니까?',
        () => {
          router.push('/mypage/cart');
        }
      );
    } catch {
      showAlert('오류 발생', '장바구니 담기에 실패했습니다.');
    }
  };

  const toggleSession = (sessionId: string) => {
    setExpandedSessions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    const fetchVideoDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/courses/detail/${id}`);
        const result: ApiResponse = await response.json();

        if (result.success) {
          setData(result.data);
          // Set the first video as the selected media
          const firstSection = result.data.course.sections[0];
          if (firstSection && firstSection.videos.length > 0) {
            setSelectedMediaId(firstSection.videos[0].videoId);
          }
        } else {
          setError(result.message || '데이터를 불러오는데 실패했습니다.');
        }
      } catch {
        setError('네트워크 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVideoDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[400px]">
        <div className="text-pace-stone-500">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center items-center min-h-[400px]">
        <div className="text-red-500">오류: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full flex justify-center items-center min-h-[400px]">
        <div className="text-pace-stone-500">데이터를 찾을 수 없습니다.</div>
      </div>
    );
  }

  // Dynamic content items from database
  const contentItems =
    data.course.sections.map((section) => ({
      id: section.id,
      title: section.title,
      content: section.description || ''
    })) || [];

  const relatedContentItems =
    data.course.resolvedRecommendedCourses &&
    data.course.resolvedRecommendedCourses.length > 0
      ? data.course.resolvedRecommendedCourses
      : data.course.relatedCourses?.map((course) => ({
          id: course.id,
          itemId: course.itemId,
          title: course.title,
          price: course.price,
          category: course.category,
          type: course.type,
          thumbnail: course.thumbnail
        })) || [];

  const isWatchingVideo = Boolean(isSignedIn && selectedMediaId);

  let selectedVideoTitle = data.course.title || '';
  let selectedSectionTitle = '';
  for (const section of data.course.sections) {
    const video = section.videos.find((v) => v.videoId === selectedMediaId);
    if (video) {
      selectedVideoTitle = video.title || selectedVideoTitle;
      selectedSectionTitle = section.title;
      break;
    }
  }

  const totalLessonsCount = data.course.sections.reduce(
    (sum, section) => sum + section.videos.length,
    0
  );

  return (
    <div className="flex flex-col w-full h-full relative">
      {isWatchingVideo ? (
        <section className="w-full bg-[#f2f4f7] py-10 border-b border-gray-200">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="flex flex-col shadow-2xl relative overflow-hidden bg-white rounded-2xl">
              <div className="relative w-full aspect-video bg-black">
                <WistiaPlayer
                  mediaId={selectedMediaId}
                  id="wistia-player-container-1"
                />
              </div>
              <div className="p-6 bg-white border-t border-gray-100">
                <h2 className="text-2xl font-bold text-[#00263b] mb-1 leading-tight">
                  {selectedVideoTitle}
                </h2>
                {selectedSectionTitle && (
                  <p className="text-sm text-gray-700 font-medium leading-normal">
                    {selectedSectionTitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <DetailHeroSection
          visualTitle={data.course.visualTitle || undefined}
          visualTitle2={data.course.visualTitle2}
          title={data.course.title || ''}
          description={data.course.description || ''}
          price={data.course.price || ''}
          instructor={
            data.instructors?.map((inst) => inst.name).join(', ') ||
            '페이스메이커'
          }
          backgroundImage={resolveImageSrc({
            thumbnailUrl: data.course.thumbnailUrl,
            itemType: ItemType.COURSE
          })}
          onAddToCart={handleAddToCart}
          onToggleLike={handleToggleLike}
          isLiked={isLiked}
          buttonText={isInCart ? 'Go to Cart' : 'Add to Cart'}
          itemType={ItemType.COURSE}
        />
      )}

      <div className="max-w-[1200px] mx-auto px-6 py-20 space-y-20">
        <div>
          <SectionHeader
            subtitle="How the Course Works"
            title={
              data.course.processTitle ||
              'Step by Step: From a Strong Developer Resume to Interviews'
            }
            className="mb-12 [&_h5]:text-[#ff4f02] [&_h5]:font-bold [&_h5]:text-base [&_h3]:text-[#00263b] [&_h3]:text-3xl"
          />
          <div className="flex flex-col lg:flex-row lg:justify-between gap-16">
            <div className="w-full lg:w-[680px] text-gray-500 leading-relaxed whitespace-pre-wrap">
              {data.course.processContent ||
                'Detailed course description not available.'}
            </div>
            <ExpandableCards
              items={contentItems}
              className="w-full lg:w-[480px] max-w-none mx-0"
              itemClassName="bg-white rounded-none border border-gray-200"
              titleClassName="text-[#00263b]"
              labelClassName="text-gray-500"
            />
          </div>
        </div>

        {data.instructors && data.instructors.length > 0 && (
          <div className="flex flex-col w-full">
            <SectionHeader
              title="Instructor Introduction"
              className="mb-12 [&_h3]:text-[#00263b] [&_h3]:text-3xl"
            />
            <Carousel setApi={setApi} className="w-full">
              <CarouselContent>
                {data.instructors.map((instructor, idx) => (
                  <CarouselItem key={instructor.id || idx}>
                    <div className="w-full flex flex-col lg:flex-row lg:justify-between gap-16">
                      <div className="w-full lg:w-[680px]">
                        <h3 className="text-2xl font-bold text-[#00263b] mb-4">
                          {instructor.name}
                        </h3>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                          {instructor.description}
                        </p>
                        <h4 className="font-bold text-[#00263b] mb-4">
                          Career
                        </h4>
                        <table className="w-full text-sm">
                          <tbody className="text-gray-500">
                            {instructor.careers.map((careerItem, index) => (
                              <tr key={index}>
                                <td className="py-1 pr-8 w-24">
                                  {careerItem.period}
                                </td>
                                <td className="py-1">{careerItem.position}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="w-full lg:w-[480px] flex flex-col">
                        {(() => {
                          const profileImage = resolveImageSrc({
                            thumbnail: instructor.profileImage
                          });
                          return profileImage ? (
                            <div className="relative aspect-square">
                              <Image
                                src={profileImage}
                                alt="instructor"
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-full flex-1 min-h-[400px] bg-gray-50 flex items-center justify-center p-8 text-center">
                              <div>
                                <p className="text-2xl font-bold text-[#00263b] mb-2">
                                  Profile Photo
                                </p>
                                <p className="text-gray-400">
                                  Recommended: Avatar-style image
                                  <br />
                                  (e.g., ZEPETO)
                                </p>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {count > 1 && (
              <div className="flex justify-center gap-3 mt-16">
                {Array.from({ length: count }).map((_, i) => (
                  <button
                    key={i}
                    className={`w-[18px] h-[18px] rounded-full transition-colors duration-300 ${
                      current === i
                        ? 'bg-[#ff4f02]'
                        : 'bg-[#eeeeee] hover:bg-gray-300'
                    }`}
                    onClick={() => api?.scrollTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <DetailRelatedContentSection
          title={'You May Also Like'}
          items={relatedContentItems}
          headerClassName="mb-12 [&_h3]:text-[#00263b] [&_h3]:text-3xl"
          cardClassName="rounded-none shadow-[0_10px_30px_rgba(0,38,59,0.08)] border-gray-100"
        />

        <DetailReviewsSection
          title="Student Reviews"
          headerClassName="!w-fit [&_h3]:text-[#00263b] [&_h3]:text-3xl"
          cardClassName="rounded-none border-gray-200"
          reviews={
            data.course.reviews?.map((review) => ({
              id: review.id,
              profileImage: review.user?.image || '/img/user1.png',
              profileName: review.user?.name || '익명',
              rating: review.rating,
              reviewDate: new Date(review.createdAt)
                .toISOString()
                .split('T')[0]
                .replace(/-/g, '.'),
              reviewContent: review.content
            })) || []
          }
        />
      </div>

      {isWatchingVideo && !isPlaylistOpen && (
        <button
          type="button"
          aria-label="Open Table of Contents"
          onClick={() => setIsPlaylistOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-[60] w-8 h-16 rounded-l-xl bg-white border border-r-0 border-gray-200 shadow-md flex items-center justify-center text-gray-500 hover:text-[#ff4f02] hover:shadow-lg transition-all duration-300"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      <div
        className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ease-in-out ${
          isPlaylistOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          type="button"
          aria-label="Close Table of Contents"
          onClick={() => setIsPlaylistOpen(false)}
          className={`hidden sm:flex relative top-1/2 -translate-y-1/2 z-40 w-10 h-16 rounded-l-xl bg-white border border-r-0 border-gray-200 shadow-md items-center justify-center text-gray-500 hover:text-[#ff4f02] hover:shadow-lg transition-all duration-300 ${
            isPlaylistOpen
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 translate-x-full'
          }`}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <div
          className={`absolute inset-0 bg-black/55 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
            isPlaylistOpen ? 'opacity-100' : 'opacity-0'
          }`}
          role="presentation"
          onClick={() => setIsPlaylistOpen(false)}
        />
        <aside
          className={`relative h-full w-full max-w-sm bg-[#f2f4f7] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${
            isPlaylistOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shadow-sm z-10">
            <h3 className="font-bold text-[#00263b] text-base">
              Course Outline
            </h3>
            <span className="text-xs font-semibold text-gray-400">
              {totalLessonsCount} Lessons
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-[10px]">
            {data.course.sections.map((section) => {
              const isExpanded = expandedSessions.has(section.id);
              return (
                <div
                  key={section.id}
                  className="border border-gray-100 rounded-none shadow-[0_10px_30px_rgba(0,38,59,0.08)] overflow-hidden bg-white"
                >
                  <button
                    type="button"
                    onClick={() => toggleSession(section.id)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#f2f4f7] transition-colors"
                  >
                    <span className="text-[18px] font-bold text-[#00263b]">
                      {section.title}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isExpanded
                        ? 'max-h-[1000px] opacity-100'
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-5 pb-5 flex flex-col gap-0.5">
                      {section.videos.map((video) => {
                        const isActive = video.videoId === selectedMediaId;
                        return (
                          <button
                            key={video.videoId}
                            type="button"
                            onClick={() => {
                              setSelectedMediaId(video.videoId);
                              setIsPlaylistOpen(false);
                            }}
                            className={`lesson-item w-full py-2 text-left flex justify-between items-start rounded transition-colors duration-200 ${
                              isActive ? 'bg-[#f2f4f7]' : 'hover:bg-[#f2f4f7]'
                            }`}
                          >
                            <span
                              className={`text-[14px] font-medium leading-snug truncate pr-2 ${
                                isActive ? 'text-[#00263b]' : 'text-gray-400'
                              }`}
                            >
                              {video.title}
                            </span>
                            <CirclePlay
                              className={`h-[18px] w-[18px] flex-shrink-0 ${
                                isActive ? 'text-[#00adbd]' : 'text-gray-400'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        onOpenChange={(open) =>
          setModalConfig((prev) => ({ ...prev, isOpen: open }))
        }
        title={modalConfig.title}
        description={modalConfig.description}
        onConfirm={modalConfig.onConfirm}
        showCancel={modalConfig.showCancel}
      />
    </div>
  );
}
