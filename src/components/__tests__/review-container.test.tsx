// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import ReviewContainer from '../common/review-container';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// next/image mocking
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt="" {...props} />;
  }
}));

describe('ReviewContainer', () => {
  const mockReviews = [
    {
      id: '1',
      author: 'Test Author',
      date: '1 day ago',
      rating: 4,
      content: 'This is a test review. It is very helpful.'
    },
    {
      id: '2',
      author: 'Another Author',
      date: '2 days ago',
      rating: 5,
      content: 'Another review content.'
    }
  ];

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve(mockReviews)
        })
      ) as unknown as { (...args: unknown[]): unknown }
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders review cards with author, rating, and content', async () => {
    render(<ReviewContainer />);
    // 작성자
    await waitFor(() => {
      expect(screen.getAllByText('Test Author').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Another Author').length).toBeGreaterThan(0);
    });
    // 내용
    expect(screen.getAllByText(/This is a test review/).length).toBeGreaterThan(
      0
    );
    expect(
      screen.getAllByText(/Another review content/).length
    ).toBeGreaterThan(0);
    // 별점 이미지 개수
    const repeatCount = 3;
    expect(screen.getAllByAltText('star').length).toBe(
      (mockReviews[0].rating + mockReviews[1].rating) * repeatCount
    );
  });

  it('shows ... when content is long (multiline ellipsis)', async () => {
    const longContent = 'A '.repeat(300);
    const reviews = [{ ...mockReviews[0], content: longContent }];
    (
      global.fetch as unknown as {
        mockImplementationOnce: (fn: () => Promise<unknown>) => void;
      }
    ).mockImplementationOnce(() =>
      Promise.resolve({ json: () => Promise.resolve(reviews) })
    );
    render(<ReviewContainer />);
    await waitFor(() => {
      expect(screen.getAllByText('Test Author').length).toBeGreaterThan(0);
    });
    // MatcherFunction은 boolean만 반환해야 하므로 undefined 대신 false 반환
    const contentDivs = screen.getAllByText((_, el) => {
      return !!el && el.className?.includes('line-clamp');
    });
    expect(contentDivs.length).toBeGreaterThan(0);
  });
});
