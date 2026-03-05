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
  [TargetAudienceType.GOVERNMENT]: {
    icon: Globe,
    label: 'Public Sector',
    text: 'For those aiming for government or public positions'
  },
  [TargetAudienceType.FINANCE]: {
    icon: Search,
    label: 'Finance/Accounting',
    text: 'Strategic career prep for financial roles'
  },
  [TargetAudienceType.DESIGN]: {
    icon: Globe,
    label: 'Design',
    text: 'Visual portfolio and interview strategy for designers'
  },
  [TargetAudienceType.SERVICE]: {
    icon: Users,
    label: 'Service Roles',
    text: 'Effective communication for service industry jobs'
  }
};
