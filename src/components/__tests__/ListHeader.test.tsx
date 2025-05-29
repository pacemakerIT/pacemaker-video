import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ListHeader from '@/components/list-header';

describe('ListHeader', () => {
  // 기본 렌더링 테스트
  it('renders with basic props', () => {
    render(<ListHeader title="테스트 제목" buttonText="테스트 버튼" />);

    expect(screen.getByText('테스트 제목')).toBeDefined();
    expect(screen.getByText('테스트 버튼')).toBeDefined();
  });

  // 버튼이 없는 경우 테스트
  it('renders without button when buttonText is not provided', () => {
    render(<ListHeader title="테스트 제목" />);

    expect(screen.getByText('테스트 제목')).toBeDefined();
    expect(screen.queryByRole('button')).toBeNull();
  });

  // 커스텀 스타일 테스트
  it('renders with custom height and gradient', () => {
    render(
      <ListHeader
        title="테스트 제목"
        buttonText="테스트 버튼"
        height="h-64"
        gradientColors={{
          start: '#FF000060',
          middle: '#00FF0010',
          end: '#0000FF40'
        }}
      />
    );

    const container =
      screen.getByText('테스트 제목').parentElement?.parentElement;
    expect(container?.className).toContain('h-64');
  });

  // 슬라이드 기능 테스트
  it('renders slides with dots navigation', () => {
    const slides = [
      { title: '슬라이드 1', buttonText: '버튼 1' },
      { title: '슬라이드 2', buttonText: '버튼 2' },
      { title: '슬라이드 3', buttonText: '버튼 3' }
    ];

    render(<ListHeader slides={slides} autoPlayInterval={1000} />);

    // 초기 슬라이드 확인
    expect(screen.getByText('슬라이드 1')).toBeDefined();
    expect(screen.getByText('버튼 1')).toBeDefined();

    // dots navigation 확인
    const dots = screen.getAllByRole('button', { name: /Go to slide/i });
    expect(dots).toHaveLength(3);

    // 두 번째 슬라이드로 이동
    fireEvent.click(dots[1]);
    expect(screen.getByText('슬라이드 2')).toBeDefined();
    expect(screen.getByText('버튼 2')).toBeDefined();
  });

  // 버튼이 없는 슬라이드 테스트
  it('renders slides without buttons', () => {
    const slides = [{ title: '슬라이드 1' }, { title: '슬라이드 2' }];

    render(<ListHeader slides={slides} />);

    expect(screen.getByText('슬라이드 1')).toBeDefined();
    // dots navigation 버튼은 제외하고 메인 버튼만 확인
    expect(screen.queryByRole('button', { name: /버튼/i })).toBeNull();
  });

  // 자동 재생 테스트
  it('auto plays slides when interval is provided', async () => {
    vi.useFakeTimers();

    const slides = [
      { title: '슬라이드 1', buttonText: '버튼 1' },
      { title: '슬라이드 2', buttonText: '버튼 2' }
    ];

    render(<ListHeader slides={slides} autoPlayInterval={1000} />);

    // 초기 슬라이드 확인
    expect(screen.getByText('슬라이드 1')).toBeDefined();

    // 1초 후 자동 전환
    await vi.advanceTimersByTimeAsync(1000);

    expect(screen.getByText('슬라이드 2')).toBeDefined();

    vi.useRealTimers();
  });

  // 자동 재생이 없는 경우 테스트
  it('does not auto play when no interval is provided', async () => {
    vi.useFakeTimers();

    const slides = [
      { title: '슬라이드 1', buttonText: '버튼 1' },
      { title: '슬라이드 2', buttonText: '버튼 2' }
    ];

    render(<ListHeader slides={slides} />);

    // 초기 슬라이드 확인
    const titleElement = screen.getByText('슬라이드 1');
    expect(titleElement).toBeDefined();

    // 1초 후에도 전환되지 않아야 함
    await vi.advanceTimersByTimeAsync(1000);

    // 첫 번째 슬라이드가 여전히 보이는지 확인
    expect(screen.getByText('슬라이드 1')).toBeDefined();

    // 두 번째 슬라이드는 보이지 않아야 함
    expect(screen.queryByText('슬라이드 2')).toBeNull();

    vi.useRealTimers();
  });
});
