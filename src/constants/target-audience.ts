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
    label: 'IT Development',
    title: 'IT Development Skills',
    content:
      'Master the core development skills and latest trends required in the tech industry.',
    icon: 'Code2'
  },

  GOVERNMENT: {
    label: 'Public Service',
    title: 'Public Service Competency',
    content:
      'Comprehensive guidance from exam preparation to practical administrative skills.',
    icon: 'Users'
  },

  FINANCE: {
    label: 'Finance',
    title: 'Finance & Accounting',
    content:
      'Systematically master complex tax and accounting principles for immediate application.',
    icon: 'BarChart3'
  },

  DESIGN: {
    label: 'Design',
    title: 'Professional Design Practice',
    content:
      'Learn professional design secrets, from basic theory to creating a winning portfolio.',
    icon: 'Palette'
  },

  RESUME: {
    label: 'Resume',
    title: 'North American Resume',
    content:
      'Master the techniques for writing professional resumes tailored for the NA market.',
    icon: 'FileText'
  },

  INTERVIEW: {
    label: 'Interview',
    title: 'Winning Interview Strategies',
    content:
      'Learn high-impact response strategies and techniques to impress any interviewer.',
    icon: 'MessageSquare'
  },

  NETWORKING: {
    label: 'Networking',
    title: 'Strategic Networking',
    content:
      'Master relationship-building and business communication for career advancement.',
    icon: 'Share2'
  },

  SERVICE: {
    label: 'Service',
    title: 'Service Planning & Operations',
    content:
      'Build core competencies in service planning and operations with a customer-centric focus.',
    icon: 'Heart'
  }
};
