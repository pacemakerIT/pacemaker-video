import { TargetAudienceType } from '@prisma/client';

export interface TargetAudienceMetadata {
  label: string;
  title: string;
  content: string;
  icon: string;
}

export const TARGET_AUDIENCE_MAPPING: Record<
  TargetAudienceType,
  TargetAudienceMetadata
> = {
  IT: {
    label: 'IT 개발',
    title: 'IT 개발 역량 강화',
    content:
      '실무에 필요한 핵심 개발 스킬과 트렌드를 학습하고 싶은 분들을 위해 준비했습니다.',
    icon: 'Code2'
  },

  GOVERNMENT: {
    label: '공무원',
    title: '공직 진출 및 직무 역량',
    content:
      '공무원 시험 준비부터 공직 실무 역량까지 차근차근 배우고 싶은 분들에게 추천합니다.',
    icon: 'Users'
  },

  FINANCE: {
    label: '재무회계',
    title: '성공적인 재무회계 실무',
    content:
      '복잡한 숫자와 세무, 회계 원리를 체계적으로 정리하여 실무에 바로 적용해 보세요.',
    icon: 'BarChart3'
  },

  DESIGN: {
    label: '디자인',
    title: '감각적인 디자인 실무',
    content:
      '기초 이론부터 포트폴리오 완성까지, 현업 디자이너의 노하우를 직접 전수해 드립니다.',
    icon: 'Palette'
  },

  RESUME: {
    label: '북미 취업이력서',
    title: '글로벌 북미 취업 이력서',
    content:
      '북미 시장에서 통하는 영문 이력서와 레쥬메 작성법을 완벽하게 마스터하세요.',
    icon: 'FileText'
  },

  INTERVIEW: {
    label: '인터뷰 준비',
    title: '합격을 부르는 면접 전략',
    content:
      '다양한 인터뷰 케이스와 답변 전략을 통해 면접관의 마음을 사로잡는 법을 배웁니다.',
    icon: 'MessageSquare'
  },

  NETWORKING: {
    label: '네트워킹',
    title: '전략적 네트워킹 스킬',
    content:
      '커리어 성장을 위한 관계 형성법과 효과적인 비즈니스 커뮤니케이션 방법을 익힙니다.',
    icon: 'Share2'
  },

  SERVICE: {
    label: '서비스',
    title: '서비스 기획 및 운영',
    content:
      '고객 중심의 사고를 통해 혁신적인 서비스를 기획하고 운영하는 핵심 역량을 키웁니다.',
    icon: 'Heart'
  }
};
