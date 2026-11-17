'use client';
import {
  ChevronRight,
  ChevronUp,
  ChevronDown,
  CirclePlay,
  ChevronLeft,
  X,
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
  Heart,
  VideoOff
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import SectionHeader from '../../common/section-header';
import ExpandableCards from '../../common/expandable-cards';
import DetailHeroSection from '../../common/detail-hero-section';
import DetailReviewsSection from '../../common/detail-reviews-section';
import DetailRelatedContentSection from '../../common/detail-related-content-section';
import DetailRecommendationSection from '../../common/detail-recommendation-section';
import { ApiResponse } from '@/types/video-detail';
import { WistiaPlayer } from '@wistia/wistia-player-react';
import { resolveImageSrc } from '@/lib/utils';
import { formatCourseCareers } from '@/lib/course-form-data';
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

function isDummyWistiaId(id: string): boolean {
  if (!id) return true;
  const trimmed = id.trim();
  return (
    trimmed.startsWith('temp-') ||
    trimmed.startsWith('vidx-') ||
    trimmed.startsWith('video-')
  );
}

function getWistiaMediaId(id: string): string | null {
  if (!id) return null;
  const trimmed = id.trim();
  if (trimmed.includes('wistia.com') || trimmed.includes('wistia.net')) {
    const parts = trimmed.split('/').filter(Boolean);
    const last = parts[parts.length - 1];
    return last ? last.split('?')[0] : trimmed;
  }
  if (isDummyWistiaId(trimmed)) {
    if (process.env.NODE_ENV === 'development') {
      return '32ktrbrf3j';
    }
    return null;
  }
  return trimmed;
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
    confirmText?: string;
    cancelText?: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
    showCancel: true,
    confirmText: 'Confirm',
    cancelText: 'Cancel'
  });

  const showAlert = (
    title: string,
    description: string,
    confirmText = 'OK'
  ) => {
    setModalConfig({
      isOpen: true,
      title,
      description,
      onConfirm: () => {},
      showCancel: false,
      confirmText,
      cancelText: 'Cancel'
    });
  };

  const showConfirm = (
    title: string,
    description: string,
    onConfirm: () => void,
    confirmText = 'Confirm'
  ) => {
    setModalConfig({
      isOpen: true,
      title,
      description,
      onConfirm,
      showCancel: true,
      confirmText,
      cancelText: 'Cancel'
    });
  };

  const handleToggleLike = async (nextState: boolean) => {
    if (!isSignedIn) {
      showConfirm(
        'Log in required',
        'Please log in to save this course. Would you like to log in now?',
        () => {
          router.push('/sign-in');
        },
        'Log in'
      );
      return;
    }

    try {
      if (nextState) {
        await addFavorite(id, ItemType.COURSE);
      } else {
        await removeFavorite(id, ItemType.COURSE);
      }
    } catch {
      showAlert('Something went wrong', 'Please try again.');
    }
  };

  const handleAddToCart = async () => {
    if (!isSignedIn) {
      showConfirm(
        'Log in required',
        'Please log in to add this course to your cart. Would you like to log in now?',
        () => {
          router.push('/sign-in');
        },
        'Log in'
      );
      return;
    }

    if (data?.entitlements?.canAccessCourse) {
      showAlert(
        'Already purchased',
        'You already own this course. You can watch it right away.'
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
        'Added to cart',
        'This course is in your cart. Would you like to go to your cart?',
        () => {
          router.push('/mypage/cart');
        },
        'Go to cart'
      );
    } catch {
      showAlert(
        'Could not add to cart',
        'Something went wrong. Please try again.'
      );
    }
  };

  const toggleSession = (sessionId: string) => {
    setExpandedSessions((prev) => {
      if (prev.has(sessionId)) {
        return new Set();
      } else {
        return new Set([sessionId]);
      }
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
          const firstAccessibleVideo = result.data.course.sections
            .flatMap((section) => section.videos)
            .find((video) => video.canAccessVideo && video.videoId);

          setSelectedMediaId(firstAccessibleVideo?.videoId || '');
          const firstSectionId = result.data.course.sections[0]?.id;
          setExpandedSessions(
            firstSectionId ? new Set([firstSectionId]) : new Set()
          );
        } else {
          setError(result.message || 'Could not load course details.');
        }
      } catch {
        setError('Network error. Please try again.');
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
        <div className="text-pace-stone-500">Loading course...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center items-center min-h-[400px]">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full flex justify-center items-center min-h-[400px]">
        <div className="text-pace-stone-500">Course not found.</div>
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

  const canAccessCourse = Boolean(data.entitlements?.canAccessCourse);
  const allVideos = data.course.sections.flatMap((section) => section.videos);
  const totalVideosCount = allVideos.length;
  const selectedVideo = allVideos.find((v) => v.videoId === selectedMediaId);

  const heroButtonText = canAccessCourse
    ? 'Purchased'
    : isInCart
      ? 'Go to Cart'
      : 'Add to Cart';

  return (
    <div className="flex flex-col min-h-screen relative w-full overflow-x-hidden">
      {canAccessCourse ? (
        /* PURCHASED STATE: Top Video Player Section matching course_detail_video.html */
        <section className="w-full bg-gray-soft py-10 border-b border-pace-gray-100">
          <div className="max-w-[1248px] mx-auto px-6">
            <div
              id="videoPlayerCard"
              className="flex flex-col shadow-2xl relative overflow-hidden bg-white rounded-2xl"
            >
              <div
                id="videoPlayerContainer"
                className="flex-1 flex flex-col bg-white relative"
              >
                {/* Video Screen */}
                <div
                  id="videoScreenSection"
                  className="relative w-full aspect-video min-h-[200px] sm:min-h-[360px] bg-black flex items-center justify-center overflow-hidden"
                >
                  {(() => {
                    const effectiveMediaId = getWistiaMediaId(selectedMediaId);
                    if (effectiveMediaId) {
                      return (
                        <WistiaPlayer
                          key={effectiveMediaId}
                          mediaId={effectiveMediaId}
                          id="wistia-player-container-1"
                          className="w-full h-full block"
                          style={{ width: '100%', height: '100%' }}
                        />
                      );
                    }
                    return (
                      <div className="flex flex-col items-center justify-center gap-2 p-6 text-center text-white/80">
                        <VideoOff className="w-8 h-8 text-white/60 mb-1" />
                        <p className="text-base font-semibold font-heading">
                          Video coming soon
                        </p>
                        <p className="text-xs text-white/60 font-body">
                          This video is not available yet.
                        </p>
                      </div>
                    );
                  })()}
                </div>

                {/* Video Info Bar */}
                <div className="p-6 bg-white border-t border-pace-gray-100">
                  <h2
                    id="videoTitle"
                    className="text-2xl font-headline font-bold text-navy mb-1 leading-tight"
                  >
                    {selectedVideo?.title || data.course.title || ''}
                  </h2>
                  <p
                    id="videoSubtitle"
                    className="text-sm font-body text-gray-700 font-medium leading-normal"
                  >
                    {selectedVideo?.description ||
                      data.course.description ||
                      ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* UNPURCHASED STATE: DetailHeroSection matching course_detail.html */
        <DetailHeroSection
          visualTitle={data.course.visualTitle || undefined}
          visualTitle2={data.course.visualTitle2 || data.course.title || ''}
          title={data.course.title || ''}
          description={data.course.description || ''}
          price={data.course.price || ''}
          instructor={
            data.instructors?.map((inst) => inst.name).join(', ') || 'Pacemaker'
          }
          backgroundImage={resolveImageSrc({
            thumbnailUrl: data.course.thumbnailUrl,
            itemType: ItemType.COURSE
          })}
          onAddToCart={handleAddToCart}
          onToggleLike={handleToggleLike}
          isLiked={isLiked}
          buttonText={heroButtonText}
          itemType={ItemType.COURSE}
        />
      )}

      {/* MAIN CONTENT SECTION (for both states) */}
      <main
        id="main-content"
        className="max-w-[1200px] w-full mx-auto px-6 py-12 sm:py-20 space-y-12 sm:space-y-20 min-w-0"
      >
        <section>
          <SectionHeader
            subtitle="How the Course Works"
            title={
              data.course.processTitle ||
              data.course.title ||
              'What You Will Learn'
            }
            className="mb-12"
          />
          <div className="flex flex-col lg:flex-row lg:justify-between gap-8 lg:gap-16">
            {Boolean(data.course.processContent?.trim()) && (
              <div className="w-full lg:w-[680px] text-pace-stone-500 leading-relaxed whitespace-pre-wrap">
                {data.course.processContent}
              </div>
            )}
            <ExpandableCards
              items={contentItems}
              className={`w-full max-w-none mx-0 ${
                data.course.processContent?.trim()
                  ? 'lg:w-[480px]'
                  : 'lg:w-full'
              }`}
            />
          </div>
        </section>

        <DetailRecommendationSection
          items={recommendationItems}
          headerClassName="mb-12"
        />

        {data.instructors && data.instructors.length > 0 && (
          <section className="flex flex-col w-full">
            <SectionHeader title="Instructor Profile" className="mb-12" />
            <Carousel setApi={setApi} className="w-full">
              <CarouselContent>
                {data.instructors.map((instructor, idx) => (
                  <CarouselItem key={instructor.id || idx}>
                    <div className="w-full flex flex-col lg:flex-row lg:justify-between gap-16">
                      <div className="w-full lg:w-[680px]">
                        <h3 className="text-2xl font-heading font-bold mb-4">
                          {instructor.name}
                        </h3>
                        <p className="text-pace-stone-500 leading-relaxed mb-8">
                          {instructor.description}
                        </p>
                        <div className="mt-6">
                          <h4 className="font-bold mb-4">Experience</h4>
                          <ul className="text-pace-stone-500 space-y-4 text-sm">
                            {formatCourseCareers(instructor.careers).map(
                              ({ period, position }, index) => (
                                <li key={index} className="flex gap-4 sm:gap-8">
                                  <span className="w-24 shrink-0">
                                    {period}
                                  </span>
                                  <span>{position}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                      <div className="w-full lg:w-[480px] flex flex-col">
                        {(() => {
                          const profileImage =
                            resolveImageSrc({
                              thumbnail: instructor.profileImage
                            }) || '/img/instructor-image.png';
                          return (
                            <div className="relative flex-1 min-h-[400px] overflow-hidden bg-gray-50">
                              <Image
                                src={profileImage}
                                alt={
                                  instructor.name
                                    ? `${instructor.name} profile`
                                    : 'Instructor profile'
                                }
                                fill
                                className="object-cover"
                              />
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
                    className={`w-[18px] h-[18px] rounded-full transition-all ${
                      current === i
                        ? 'bg-pace-orange-600'
                        : 'bg-[#cccccc] hover:bg-pace-orange-600'
                    }`}
                    onClick={() => api?.scrollTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        <DetailRelatedContentSection
          title="You May Also Like"
          items={relatedContentItems}
          headerClassName="mb-12"
        />

        <DetailReviewsSection
          title="Student Reviews"
          reviewCount={data.course.reviews?.length ?? 0}
          rating={
            data.course.reviews && data.course.reviews.length > 0
              ? Math.round(
                  data.course.reviews.reduce((sum, r) => sum + r.rating, 0) /
                    data.course.reviews.length
                )
              : 5
          }
          reviews={
            data.course.reviews?.map((review) => ({
              id: review.id,
              profileImage: review.user?.image || '/img/user1.png',
              profileName: review.user?.name || 'Anonymous',
              rating: review.rating,
              reviewDate: (() => {
                const d = new Date(review.createdAt);
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                const yyyy = d.getFullYear();
                return `${mm}.${dd}.${yyyy}`;
              })(),
              reviewContent: review.content
            })) || []
          }
        />
      </main>

      {/* TOC SIDEBAR & FLOATING TOGGLE (ONLY FOR PURCHASED STATE) */}
      {canAccessCourse && (
        <>
          {/* Floating TOC Open Button */}
          <button
            type="button"
            id="openTocBtn"
            aria-label="Open Table of Contents"
            onClick={() => setIsPlaylistOpen(true)}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-30 w-8 h-16 rounded-l-xl bg-white border border-r-0 border-gray-200 shadow-md flex items-center justify-center text-gray-500 hover:text-orange hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Modal Backdrop overlay */}
          <div
            id="tocBackdrop"
            onClick={() => setIsPlaylistOpen(false)}
            className={`fixed inset-0 bg-black/55 backdrop-blur-sm z-[90] transition-opacity duration-300 ${
              isPlaylistOpen
                ? 'opacity-100 pointer-events-auto'
                : 'opacity-0 pointer-events-none'
            }`}
          />

          {/* TOC Sidebar Drawer */}
          <aside
            id="tocSidebar"
            className={`fixed right-0 top-0 bottom-0 h-[100dvh] w-full sm:w-[500px] bg-gray-soft border-l border-gray-200 flex flex-col transition-all duration-300 ease-in-out z-[100] shadow-2xl ${
              isPlaylistOpen
                ? 'translate-x-0 visible'
                : 'translate-x-full invisible'
            }`}
          >
            {/* Close TOC Button (Desktop floating left edge) */}
            <button
              type="button"
              id="closeTocBtn"
              aria-label="Close Table of Contents"
              onClick={() => setIsPlaylistOpen(false)}
              className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full z-50 w-10 h-16 rounded-l-xl bg-white border border-r-0 border-gray-200 shadow-md items-center justify-center text-gray-500 hover:text-orange transition-all duration-300 cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* TOC Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shadow-sm z-10">
              <h3 className="font-headline font-bold text-navy text-[1rem]">
                Course Outline
              </h3>
              <div className="flex items-center gap-4">
                <span
                  id="totalLessonsCount"
                  className="text-xs font-semibold text-gray-400"
                >
                  {totalVideosCount} Lessons
                </span>
                <button
                  type="button"
                  id="closeTocBtnMobile"
                  aria-label="Close Table of Contents"
                  onClick={() => setIsPlaylistOpen(false)}
                  className="sm:hidden flex items-center justify-center text-gray-400 hover:text-navy transition-colors focus:outline-none"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* TOC Sections */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-[10px] bg-gray-soft">
              {data.course.sections.map((section) => {
                const isExpanded = expandedSessions.has(section.id);
                return (
                  <div
                    key={section.id}
                    className="toc-section border border-gray-100 rounded-none shadow-card overflow-hidden bg-white"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSession(section.id)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-soft transition-colors focus:outline-none"
                    >
                      <span className="text-[18px] font-bold text-navy font-headline">
                        {section.title}
                      </span>
                      <div className="flex items-center gap-1 text-[14px] text-body">
                        <span>{isExpanded ? 'Close' : 'Read'}</span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out px-5 ${
                        isExpanded
                          ? 'max-h-[1000px] opacity-100 pb-5'
                          : 'max-h-0 opacity-0 pb-0'
                      }`}
                    >
                      <div className="text-[14px] font-medium text-navy mb-3">
                        Course Outline
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {section.videos.map((video, vIdx) => {
                          const canAccessVideo = Boolean(
                            video.canAccessVideo && video.videoId
                          );
                          const isActive =
                            canAccessVideo && video.videoId === selectedMediaId;
                          return (
                            <button
                              key={video.id}
                              type="button"
                              onClick={() => {
                                if (!canAccessVideo) {
                                  showAlert(
                                    'Purchase required',
                                    'Buy this course to watch this lesson.'
                                  );
                                  return;
                                }
                                setSelectedMediaId(video.videoId);
                                setIsPlaylistOpen(false);
                              }}
                              className={`lesson-item w-full py-2 text-left flex justify-between items-start hover:bg-gray-soft rounded transition-colors duration-200 ${
                                isActive ? 'active' : ''
                              } ${!canAccessVideo ? 'cursor-not-allowed opacity-50' : ''}`}
                            >
                              <div className="flex items-start flex-1 min-w-0 pr-3">
                                <span
                                  className={`lesson-session-label text-[14px] font-medium w-[85px] flex-shrink-0 mt-[1px] ${
                                    isActive ? 'text-navy' : 'text-body'
                                  }`}
                                >
                                  Session {String(vIdx + 1).padStart(2, '0')}
                                </span>
                                <span
                                  className={`lesson-title-text text-[14px] font-medium leading-snug break-words pr-2 ${
                                    isActive ? 'text-navy' : 'text-gray-400'
                                  }`}
                                >
                                  {video.title || `Session ${vIdx + 1}`}
                                </span>
                              </div>
                              <CirclePlay
                                className={`h-[18px] w-[18px] flex-shrink-0 mt-[2px] ${
                                  isActive ? 'text-teal' : 'text-gray-400'
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
        </>
      )}

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        onOpenChange={(open) =>
          setModalConfig((prev) => ({ ...prev, isOpen: open }))
        }
        title={modalConfig.title}
        description={modalConfig.description}
        onConfirm={modalConfig.onConfirm}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        showCancel={modalConfig.showCancel}
      />
    </div>
  );
}
