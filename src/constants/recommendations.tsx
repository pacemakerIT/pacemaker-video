import {
  LucideIcon,
  CodeSquare,
  FileEdit,
  Globe,
  MessageSquare,
  Search,
  Users
} from 'lucide-react';
import { TargetAudienceType } from '@prisma/client';

export const RECOMMENDATION_BANNERS: Record<
  TargetAudienceType,
  { icon: LucideIcon; label: string; text: string }
> = {
  [TargetAudienceType.IT]: {
    icon: CodeSquare,
    label: 'IT Specialist',
    text: 'For those interested in North American tech careers'
  },
  [TargetAudienceType.RESUME]: {
    icon: FileEdit,
    label: 'Resume Prep',
    text: 'For those who need help with North American resumes'
  },
  [TargetAudienceType.INTERVIEW]: {
    icon: MessageSquare,
    label: 'Interview Prep',
    text: 'Strategy for landing job offers through interviews'
  },
  [TargetAudienceType.NETWORKING]: {
    icon: Users,
    label: 'Networking',
    text: 'Building professional connections in North America'
  },
  [TargetAudienceType.JOB_SEARCH]: {
    icon: Search,
    label: 'Job Search',
    text: 'Effective strategies for finding the right opportunity'
  },
  [TargetAudienceType.GLOBAL_CAREER]: {
    icon: Globe,
    label: 'Global Career',
    text: 'Navigating the international job market'
  }
};
