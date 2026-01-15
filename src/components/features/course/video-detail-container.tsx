'use client';
import {
  ChevronRight,
  ChevronUp,
  ChevronDown,
  CirclePlay,
  ChevronLeft,
  CodeXml,
  FileSignature,
  HelpCircle,
  Code2,
  Users,
  BarChart3,
  Palette,
  FileText,
  MessageSquare,
  Share2,
  Heart
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

  // Dynamic content items from database
  const contentItems =
    data.course.sections.flatMap((section) =>
      section.items.map((item) => ({
        id: item.id,
        title: item.title,
        content: item.content
      }))
    ) || [];

  // Icon mapping for recommendation items
  const getIcon = (iconName: string | null) => {
    switch (iconName) {
      case 'CodeXml':
        return CodeXml;
      case 'FileSignature':
        return FileSignature;
      case 'Code2':
        return Code2;
      case 'Users':
        return Users;
      case 'BarChart3':
        return BarChart3;
      case 'Palette':
        return Palette;
      case 'FileText':
        return FileText;
      case 'MessageSquare':
        return MessageSquare;
      case 'Share2':
        return Share2;
      case 'Heart':
        return Heart;
      default:
        return HelpCircle;
    }
  };

  const recommendationItems =
    data.course.targetAudiences?.map((item) => ({
      icon: getIcon(item.icon),
      label: item.label,
      text: item.content
    })) || [];

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
              mediaId={selectedMediaId}
              id="wistia-player-container-1"
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
            <ExpandableCards items={contentItems} />
          </div>
        </div>

        <DetailRecommendationSection items={recommendationItems} />

        <DetailRelatedContentSection
          title={'이 컨텐츠와 함께 보면 좋아요!'}
          items={data.course.relatedCourses || []}
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
