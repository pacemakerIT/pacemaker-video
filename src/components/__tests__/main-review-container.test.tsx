// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import MainReviewContainer from '../main-review-container';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';

// next/image mocking
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt="" {...props} />;
  }
}));

describe('MainReviewContainer', () => {
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

  it('renders the login button', () => {
    render(<MainReviewContainer />);
    expect(
      screen.getByRole('button', { name: /로그인 하고 강의 듣기/i })
    ).toBeInTheDocument();
  });
});
