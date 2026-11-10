import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ItemType } from '@prisma/client';
import VideoDetailContainer from './video-detail-container';

const mocks = vi.hoisted(() => ({
  addToCart: vi.fn(),
  cart: [] as Array<{ itemId: string; itemType: unknown }>,
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
  favorites: [] as Array<{ itemId: string; itemType: unknown }>,
  push: vi.fn(),
  useUser: vi.fn()
}));

vi.mock('@clerk/nextjs', () => ({
  useUser: mocks.useUser
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mocks.push
  })
}));

vi.mock('@/app/context/cart-context', () => ({
  useCartContext: () => ({
    cart: mocks.cart,
    addToCart: mocks.addToCart
  })
}));

vi.mock('@/app/context/favorite-context', () => ({
  useFavoriteContext: () => ({
    favorites: mocks.favorites,
    addFavorite: mocks.addFavorite,
    removeFavorite: mocks.removeFavorite
  })
}));

vi.mock('@wistia/wistia-player-react', () => ({
  WistiaPlayer: ({ mediaId }: { mediaId: string }) => (
    <div data-testid="wistia-player">{mediaId}</div>
  )
}));

vi.mock('../../common/detail-hero-section', () => ({
  default: ({
    buttonText,
    onAddToCart,
    onToggleLike,
    isLiked
  }: {
    buttonText: string;
    onAddToCart?: () => void;
    onToggleLike?: (next: boolean) => void;
    isLiked?: boolean;
  }) => (
    <div>
      <button onClick={onAddToCart}>{buttonText}</button>
      <button
        aria-label="Save"
        aria-pressed={isLiked}
        onClick={() => onToggleLike?.(!isLiked)}
      >
        favorite
      </button>
    </div>
  )
}));

vi.mock('@/components/common/confirm-modal', () => ({
  default: ({
    isOpen,
    title,
    description,
    onConfirm,
    confirmText = 'Confirm'
  }: {
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    confirmText?: string;
  }) =>
    isOpen ? (
      <div role="dialog">
        <h2>{title}</h2>
        <p>{description}</p>
        <button onClick={onConfirm}>{confirmText}</button>
      </div>
    ) : null
}));

vi.mock('../../common/section-header', () => ({
  default: ({ title }: { title: string }) => <div>{title}</div>
}));

vi.mock('../../common/expandable-cards', () => ({
  default: () => <div data-testid="expandable-cards" />
}));

vi.mock('../../common/detail-reviews-section', () => ({
  default: ({
    reviews = []
  }: {
    reviews?: Array<{ id: string; profileName: string }>;
  }) => (
    <div data-testid="reviews-section">
      {reviews.map((r) => (
        <span key={r.id}>{r.profileName}</span>
      ))}
    </div>
  )
}));

vi.mock('../../common/detail-related-content-section', () => ({
  default: () => <div data-testid="related-section" />
}));

vi.mock('../../common/detail-recommendation-section', () => ({
  default: () => <div data-testid="recommendation-section" />
}));

function makeCourseResponse(canAccessCourse = false) {
  return {
    success: true,
    data: {
      course: {
        id: 'course-1',
        title: 'Resume and Interview Prep',
        description: 'Practical interview course',
        price: '2800',
        thumbnailUrl: '/img/course-1.png',
        visualTitle: 'Chosen by Professionals',
        visualTitle2: 'From Resumes to Confident Interviews',
        processTitle: 'Step by Step',
        processContent: 'Course overview content',
        sections: [
          {
            id: 'sec-1',
            title: 'Section 1',
            description: 'Section 1 desc',
            videos: [
              {
                id: 'vid-1',
                videoId: canAccessCourse ? '32ktrbrf3j' : '',
                canAccessVideo: canAccessCourse,
                title: 'Lesson 1',
                description: 'Lesson 1 desc'
              }
            ]
          }
        ],
        targetAudiences: [],
        relatedCourses: [],
        resolvedRecommendedCourses: [],
        reviews: [
          {
            id: 'rev-1',
            rating: 5,
            content: 'Great course!',
            createdAt: '2025-01-10T00:00:00.000Z',
            user: { name: null, image: null }
          }
        ]
      },
      instructors: [],
      entitlements: {
        isFreeCourse: false,
        hasPurchasedCourse: canAccessCourse,
        canAccessCourse,
        accessibleVideoIds: canAccessCourse ? ['vid-1'] : []
      }
    }
  };
}

describe('VideoDetailContainer', () => {
  beforeEach(() => {
    mocks.addToCart.mockReset();
    mocks.addToCart.mockResolvedValue(undefined);
    mocks.cart.length = 0;
    mocks.addFavorite.mockReset();
    mocks.addFavorite.mockResolvedValue(undefined);
    mocks.removeFavorite.mockReset();
    mocks.removeFavorite.mockResolvedValue(undefined);
    mocks.favorites.length = 0;
    mocks.push.mockReset();
    mocks.useUser.mockReset();
    mocks.useUser.mockReturnValue({ isSignedIn: true });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makeCourseResponse(false)
    } as Response);
  });

  it('shows the English login-required modal for signed-out users', async () => {
    mocks.useUser.mockReturnValue({ isSignedIn: false });

    render(<VideoDetailContainer id="course-1" />);

    const addButton = await screen.findByRole('button', {
      name: 'Add to Cart'
    });
    fireEvent.click(addButton);

    expect(screen.getByText('Log in required')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Please log in to add this course to your cart. Would you like to log in now?'
      )
    ).toBeInTheDocument();
    expect(mocks.addToCart).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));
    expect(mocks.push).toHaveBeenCalledWith('/sign-in');
  });

  it('adds the course to cart for signed-in users and shows the English confirmation modal', async () => {
    render(<VideoDetailContainer id="course-1" />);

    const addButton = await screen.findByRole('button', {
      name: 'Add to Cart'
    });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mocks.addToCart).toHaveBeenCalledWith('course-1', ItemType.COURSE);
    });

    expect(screen.getByText('Added to cart')).toBeInTheDocument();
    expect(
      screen.getByText(
        'This course is in your cart. Would you like to go to your cart?'
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Go to cart' }));
    expect(mocks.push).toHaveBeenCalledWith('/mypage/cart');
  });

  it('falls back to "Anonymous" when a review author has no name', async () => {
    render(<VideoDetailContainer id="course-1" />);

    expect(await screen.findByText('Anonymous')).toBeInTheDocument();
  });

  it('renders the Wistia player and TOC sidebar when the user can access the course', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makeCourseResponse(true)
    } as Response);

    render(<VideoDetailContainer id="course-1" />);

    expect(await screen.findByTestId('wistia-player')).toHaveTextContent(
      '32ktrbrf3j'
    );
    expect(
      screen.getByRole('button', { name: 'Open Table of Contents' })
    ).toBeInTheDocument();
  });
});
