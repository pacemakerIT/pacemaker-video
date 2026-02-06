import { render, screen } from '@testing-library/react';
import MainReviewContainer from '../main-review-container';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Clerk useAuth 모킹
const mockUseAuth = vi.fn();

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => mockUseAuth()
}));

describe('MainReviewContainer', () => {
  beforeEach(() => {
    // 기본적으로 로그인하지 않은 상태로 설정
    mockUseAuth.mockReturnValue({
      userId: null,
      isLoaded: true,
      isSignedIn: false
    });
  });

  it('renders the main review image', () => {
    render(<MainReviewContainer />);
    const img = screen.getByAltText('background');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/img/main-review.png');
  });

  it('renders the main heading', () => {
    render(<MainReviewContainer />);
    expect(
      screen.getByText('Boost your career with Pacemaker Today!')
    ).toBeInTheDocument();
  });

  it('renders the login button when user is not signed in', () => {
    render(<MainReviewContainer />);
    expect(
      screen.getByRole('button', { name: /Log In to Start Learning/i })
    ).toBeInTheDocument();
  });

  it('renders the courses button when user is signed in', () => {
    // 로그인된 상태로 모킹
    mockUseAuth.mockReturnValue({
      userId: 'test-user-id',
      isLoaded: true,
      isSignedIn: true
    });

    render(<MainReviewContainer />);
    expect(
      screen.getByRole('button', { name: /Explore Courses/i })
    ).toBeInTheDocument();
  });
});
