import type { Meta, StoryObj } from '@storybook/nextjs';
import Card from './Card';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    title: { control: 'text', description: '카드의 제목' },
    description: { control: 'text', description: '카드에 표시될 설명' },
    price: { control: 'number', description: '가격 정보' },
    videoId: { control: 'text', description: '연결될 비디오의 ID' },
    category: {
      control: { type: 'select' },
      options: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'], // 예시 카테고리
      description: '강의 카테고리'
    }
  }
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'default-id',
    videoId: 'default-video-id',
    title: '리액트 마스터클래스',
    price: 99,
    description:
      '이 강의는 리액트의 기초부터 심화까지 모든 것을 다룹니다. 훅, 상태 관리, 그리고 최신 기능들을 마스터하여 실무에 바로 적용할 수 있는 능력을 키워보세요.',
    category: 'Intermediate',
    uploadDate: new Date(),
    watchedVideos: [],
    purchasedVideos: []
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/2JDue2re7bdxSiR2Uyc938/pacemaker-website?node-id=728-417&t=PD4alfAVgviL1VgC-4'
    }
  }
};
