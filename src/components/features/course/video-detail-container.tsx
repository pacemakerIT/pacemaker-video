'use client';
import {
  FileEdit,
  CodeSquare,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  CirclePlay,
  ChevronLeft
} from 'lucide-react';
import { useEffect, useState } from 'react';
import SectionHeader from '../../common/section-header';
import ExpandableCards from '../../common/expandable-cards';
import DetailHeroSection from '../../common/detail-hero-section';
import DetailReviewsSection from '../../common/detail-reviews-section';
import DetailRelatedContentSection from '../../common/detail-related-content-section';
import DetailRecommendationSection from '../../common/detail-recommendation-section';
import { ApiResponse } from '@/types/video-detail';
import { WistiaPlayer } from '@wistia/wistia-player-react';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useCartContext } from '@/app/context/cart-context';
import { useFavoriteContext } from '@/app/context/favorite-context';
import { ItemType } from '@prisma/client';

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

  const { cart, addToCart } = useCartContext();
  const { favorites, addFavorite, removeFavorite } = useFavoriteContext();

  const isLiked = favorites.some((f) => f.itemId === id);
  const isInCart = cart.some((c) => c.itemId === id);

  const handleToggleLike = async (nextState: boolean) => {
    if (!isSignedIn) {
      alert('로그인이 필요한 서비스입니다.');
      router.push('/sign-in');
      return;
    }

    try {
      if (nextState) {
        await addFavorite(id, ItemType.COURSE);
      } else {
        await removeFavorite(id);
      }
    } catch {
      alert('오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleAddToCart = async () => {
    if (!isSignedIn) {
      alert('로그인이 필요한 서비스입니다.');
      router.push('/sign-in');
      return;
    }

    if (isInCart) {
      router.push('/mypage/cart');
      return;
    }

    try {
      await addToCart(id, ItemType.COURSE);

      const confirmMove = window.confirm(
        '장바구니에 담았습니다. 장바구니로 이동하시겠습니까?'
      );
      if (confirmMove) {
        router.push('/mypage/cart');
      }
    } catch {
      alert('장에구니 담기에 실패했습니다.');
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

  // Mock Data
  const mockContentItems = [
    {
      id: '1',
      title: 'Developer Job Posting Examples',
      content:
        'We cover detailed methods for writing North American-style resumes. From selecting keywords that pass the ATS (Applicant Tracking System) to using action verbs that effectively appeal to your experience, you can learn it all.'
    },
    {
      id: '2',
      title: 'Analyzing Developer Job Postings',
      content:
        'We cover essential technical interview topics such as data structures and algorithms. You can gain practical sense through analysis of actual questions from big tech companies and model answers.'
    },
    {
      id: '3',
      title: 'Resume Examples from Hired Developers',
      content:
        'Learn how to logically explain your experience using the STAR technique. We provide answer strategies for each major evaluation item, such as leadership, conflict resolution, and teamwork.'
    }
  ];

  const mockRecommendationItems = [
    {
      icon: CodeSquare,
      title: 'IT / Software Development',
      text: 'For those who want to work as developers'
    },
    {
      icon: FileEdit,
      title: 'Resume',
      text: 'For those who want to improve their resumes'
    }
  ];

  const mockRelatedItems = [
    {
      id: 1,
      itemId: 'course-2',
      title: 'Resume & Interview Essentials',
      price: 2800,
      category: 'Interview'
    },
    {
      id: 2,
      itemId: 'course-3',
      title: 'Resume & Interview Essentials',
      price: 2800,
      category: 'Networking'
    },
    {
      id: 3,
      itemId: 'course-4',
      title: 'Resume & Interview Essentials',
      price: 2800,
      category: 'Resume'
    }
  ];

  return (
    <div className="flex flex-col w-full h-full relative">
      <DetailHeroSection
        title={data.course.title}
        courseTitle={data.course.courseTitle}
        subtitle={data.course.promoText || undefined}
        description={data.course.summary || data.course.description}
        price={data.course.price}
        instructor={data.instructor?.name || '페이스메이커'}
        backgroundImage={data.course.backgroundImage}
        onAddToCart={handleAddToCart}
        onToggleLike={handleToggleLike}
        isLiked={isLiked}
        buttonText={isInCart ? 'Go to Cart' : 'Add to Cart'}
      />

      <div className="w-full max-w-[1240px] px-5 py-24 mx-auto flex flex-col gap-24">
        {selectedMediaId && (
          <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative">
            <WistiaPlayer
              mediaId={(() => {
                const validWistiaIds = [
                  '32ktrbrf3j',
                  'a74mrwu4wi',
                  '30q7n48g4f',
                  '342jss6yh5',
                  'z1fxq584qr',
                  '7350d06e13',
                  '26sk4lmiix',
                  '9ya5adzoen',
                  'g9tdlp0rre',
                  'c8ss0suilx',
                  'b0767e8ebb',
                  'e4a27b971d'
                ];

                if (selectedMediaId && selectedMediaId.length <= 12)
                  return selectedMediaId;

                // Use last char of UUID for better uniform distribution
                // (UUIDs are hex, 0-15. Our pool is 12. Modulo 12 covers most.)
                const lastChar = selectedMediaId.slice(-1);
                const hash = parseInt(lastChar, 16);
                // If NaN (unlikely), fallback to 0
                const index = isNaN(hash) ? 0 : hash;

                return validWistiaIds[index % validWistiaIds.length];
              })()}
              id={`wistia-player-${selectedMediaId}`}
            />
          </div>
        )}

        <div className="flex flex-col gap-8">
          <SectionHeader
            subtitle="How the Course Works"
            title={
              data.course.detailTitle ||
              'Step by Step: From a Strong Developer Resume to Interviews'
            }
          />
          <div className="flex gap-4">
            <div className="text-pace-stone-500 whitespace-pre-wrap">
              {data.course.description ||
                'Detailed course description not available.'}
            </div>
            <ExpandableCards items={mockContentItems} />
          </div>
        </div>

        <DetailRecommendationSection items={mockRecommendationItems} />

        <DetailRelatedContentSection
          title={'You May Also Like'}
          items={mockRelatedItems}
        />

        <DetailReviewsSection
          title="Student Reviews"
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
          rating={data.course.rating}
          reviewCount={data.course.reviewCount}
        />
      </div>

      {/* Playlist Toggle Button (Floating) */}
      {!isPlaylistOpen && (
        <button
          type="button"
          onClick={() => setIsPlaylistOpen(true)}
          className="fixed right-0 top-[40%] z-[60] h-20 inline-flex items-center gap-2 rounded-l-md border border-pace-gray-100 bg-white px-4 py-3 text-sm font-medium text-gray-900 shadow-lg transition-all duration-300 ease-in-out hover:bg-pace-gray-50"
        >
          <ChevronLeft className="h-5 w-5 text-pace-base" />
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
          onClick={() => setIsPlaylistOpen(false)}
          className={`relative top-[40%] z-40 h-20 inline-flex items-center gap-2 rounded-l-md border border-pace-gray-100 bg-white px-4 py-3 text-sm font-medium text-gray-900 shadow-lg transition-all duration-300 ease-in-out hover:bg-pace-gray-50 ${
            isPlaylistOpen
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 translate-x-full'
          }`}
        >
          <ChevronRight className="h-5 w-5 text-pace-base" />
        </button>
        <div
          className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ease-in-out ${
            isPlaylistOpen ? 'opacity-100' : 'opacity-0'
          }`}
          role="presentation"
          onClick={() => setIsPlaylistOpen(false)}
        />
        <aside
          className={`relative h-full w-full max-w-sm bg-white shadow-xl transition-transform duration-300 ease-in-out flex flex-col ${
            isPlaylistOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="flex flex-col gap-2">
              {data.course.sections.map((section) => {
                const isExpanded = expandedSessions.has(section.id);
                return (
                  <div
                    key={section.id}
                    className="border border-pace-gray-100 rounded-lg overflow-hidden bg-white"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSession(section.id)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-pace-gray-50 transition-colors"
                    >
                      <span className="text-sm font-semibold text-gray-900">
                        {section.title}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-pace-stone-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-pace-stone-500 flex-shrink-0" />
                      )}
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isExpanded
                          ? 'max-h-[1000px] opacity-100'
                          : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="border-t border-pace-gray-100 bg-pace-gray-50/50">
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
                              className={`w-full text-left px-4 py-3 transition-colors flex items-center gap-2 justify-between ${
                                isActive
                                  ? 'bg-pace-base/10 border-l-4 border-pace-base text-pace-base'
                                  : 'hover:bg-white text-pace-stone-700'
                              }`}
                            >
                              <div
                                className={`size-2 rounded-full flex items-center justify-center flex-shrink-0  ${
                                  isActive ? 'bg-pace-base' : 'bg-pace-gray-300'
                                }`}
                              />
                              <span className="text-sm font-medium truncate w-full">
                                {video.title}
                              </span>
                              <CirclePlay className="h-4 w-4" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
