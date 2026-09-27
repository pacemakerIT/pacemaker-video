import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ItemType } from '@prisma/client';
import EbookDetailContainer from './ebook-detail-container';

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
    <>
      <button onClick={onAddToCart}>{buttonText}</button>
      <button
        aria-label="like"
        aria-pressed={isLiked}
        onClick={() => onToggleLike?.(!isLiked)}
      >
        favorite
      </button>
    </>
  )
}));

vi.mock('@/components/common/confirm-modal', () => ({
  default: ({
    isOpen,
    title,
    description,
    onConfirm
  }: {
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }) =>
    isOpen ? (
      <div role="dialog">
        <h2>{title}</h2>
        <p>{description}</p>
        <button onClick={onConfirm}>확인</button>
      </div>
    ) : null
}));

vi.mock('../../common/section-header', () => ({
  default: () => <div data-testid="section-header" />
}));

vi.mock('../../common/expandable-cards', () => ({
  default: ({ className }: { className?: string }) => (
    <div data-testid="expandable-cards" className={className} />
  )
}));

vi.mock('../../common/detail-reviews-section', () => ({
  default: () => <div data-testid="reviews-section" />
}));

vi.mock('../../common/detail-related-content-section', () => ({
  default: () => <div data-testid="related-section" />
}));

vi.mock('../../common/detail-recommendation-section', () => ({
  default: () => <div data-testid="recommendation-section" />
}));

describe('EbookDetailContainer', () => {
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
  });

  it('shows the login-required flow for signed-out users', () => {
    mocks.useUser.mockReturnValue({ isSignedIn: false });

    render(<EbookDetailContainer id="ebook-1" />);

    fireEvent.click(screen.getByRole('button', { name: 'Add to Cart' }));

    expect(screen.getByText('로그인 필요')).toBeInTheDocument();
    expect(
      screen.getByText('로그인이 필요한 서비스입니다. 로그인 하시겠습니까?')
    ).toBeInTheDocument();
    expect(mocks.addToCart).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: '확인' }));

    expect(mocks.push).toHaveBeenCalledWith('/sign-in');
  });

  it('adds the ebook to cart for signed-in users', async () => {
    render(<EbookDetailContainer id="ebook-1" />);

    fireEvent.click(screen.getByRole('button', { name: 'Add to Cart' }));

    await waitFor(() => {
      expect(mocks.addToCart).toHaveBeenCalledWith('ebook-1', ItemType.EBOOK);
    });

    expect(screen.getByText('장바구니 담기 완료')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '확인' }));

    expect(mocks.push).toHaveBeenCalledWith('/mypage/cart');
  });

  it('routes to the cart when the ebook is already in cart', () => {
    mocks.cart.push({ itemId: 'ebook-1', itemType: ItemType.EBOOK });

    render(<EbookDetailContainer id="ebook-1" />);

    fireEvent.click(screen.getByRole('button', { name: 'Go to Cart' }));

    expect(mocks.push).toHaveBeenCalledWith('/mypage/cart');
    expect(mocks.addToCart).not.toHaveBeenCalled();
  });

  it('shows already-purchased behavior when the user can access the ebook', () => {
    render(<EbookDetailContainer id="ebook-1" canAccessEbook />);

    fireEvent.click(screen.getByRole('button', { name: 'Purchased' }));

    expect(screen.getByText('이미 구매한 콘텐츠')).toBeInTheDocument();
    expect(mocks.addToCart).not.toHaveBeenCalled();
  });

  it('adds the ebook to favorites for signed-in users', async () => {
    render(<EbookDetailContainer id="ebook-1" />);

    const likeButton = screen.getByRole('button', { name: 'like' });
    expect(likeButton).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(likeButton);

    await waitFor(() => {
      expect(mocks.addFavorite).toHaveBeenCalledWith('ebook-1', ItemType.EBOOK);
    });
    expect(mocks.removeFavorite).not.toHaveBeenCalled();
  });

  it('removes the ebook from favorites when it is already favorited', async () => {
    mocks.favorites.push({ itemId: 'ebook-1', itemType: ItemType.EBOOK });

    render(<EbookDetailContainer id="ebook-1" />);

    const likeButton = screen.getByRole('button', { name: 'like' });
    expect(likeButton).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(likeButton);

    await waitFor(() => {
      expect(mocks.removeFavorite).toHaveBeenCalledWith(
        'ebook-1',
        ItemType.EBOOK
      );
    });
    expect(mocks.addFavorite).not.toHaveBeenCalled();
  });

  it('ignores favorites of other item types with the same id', () => {
    mocks.favorites.push({ itemId: 'ebook-1', itemType: ItemType.COURSE });

    render(<EbookDetailContainer id="ebook-1" />);

    expect(screen.getByRole('button', { name: 'like' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('renders the sub description and keeps the toc in the side column', () => {
    render(
      <EbookDetailContainer id="ebook-1" subDescription="자세한 설명입니다." />
    );

    expect(screen.getByText('자세한 설명입니다.')).toBeInTheDocument();
    expect(screen.getByTestId('expandable-cards').className).toContain(
      'lg:w-[480px]'
    );
  });

  it('drops the empty sub description block so the toc spans full width', () => {
    const { container } = render(
      <EbookDetailContainer id="ebook-1" subDescription="   " />
    );

    expect(container.querySelector('p')).toBeNull();
    expect(screen.getByTestId('expandable-cards').className).toContain(
      'lg:w-full'
    );
  });

  it('asks signed-out users to log in before favoriting', () => {
    mocks.useUser.mockReturnValue({ isSignedIn: false });

    render(<EbookDetailContainer id="ebook-1" />);

    fireEvent.click(screen.getByRole('button', { name: 'like' }));

    expect(screen.getByText('로그인 필요')).toBeInTheDocument();
    expect(mocks.addFavorite).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: '확인' }));

    expect(mocks.push).toHaveBeenCalledWith('/sign-in');
  });
});
