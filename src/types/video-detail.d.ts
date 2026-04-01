// 공통 타입들
export interface CareerItem {
  period: string;
  position: string;
}

export interface ExpandableCard {
  id: string;
  title: string;
  content: string;
}

export interface RecommendationItem {
  id: string;
  icon: string;
  title: string;
  text: string;
}

export interface RelatedContentItem {
  id: string;
  itemId: string;
  title: string;
  price: number;
  category: string;
  type: string;
  thumbnail: string | null;
}

export interface Review {
  id: number;
  profileImage: string;
  profileName: string;
  rating: number;
  reviewDate: string;
  reviewContent: string;
}

// API 응답 타입들

// Three-table 구조 타입 정의
export interface Course {
  id: string;
  category: 'INTERVIEW' | 'RESUME' | 'NETWORKING' | null;
  isPublic: boolean;
  showOnMain: boolean;
  title: string | null;
  description: string | null;
  processTitle: string | null;
  processContent: string | null;
  videoLink: string | null;
  price: string | null;
  time: string | null;
  thumbnailUrl: string | null;
  visualTitle: string | null;
  visualTitle2: string;
  createdAt: string;
  updatedAt: string;
  instructors: Instructor[];
  sections: Section[];
  videos: Video[];
  reviews: ApiReview[];
  targetAudienceTypes: string[];
  targetAudiences: CourseTargetAudience[];
  relatedCourses: RelatedCourse[];
}

export interface RelatedCourse {
  id: string;
  itemId: string;
  title: string;
  price: number;
  category: string;
  type: string;
  thumbnail: string | null;
}

export interface ApiReview {
  id: string;
  rating: number;
  content: string;
  createdAt: string;
  user: {
    name: string | null;
    image: string | null;
  } | null;
}

export interface Video {
  id: string;
  videoId: string;
  title: string | null;
  description: string | null;
  price: number | null;
  thumbnail: string | null;
  category: string | null;
}

export interface Section {
  id: string;
  title: string;
  description: string | null;
  orderIndex: number;
  videos: Video[];
}
export interface CourseTargetAudience {
  type: string;
  title: string;
  content: string;
  icon: string | null;
  label: string;
}

export interface Instructor {
  id: string;
  name: string;
  profileImage: string;
  description: string;
  careers: CareerItem[];
}

export interface ApiResponse {
  success: boolean;
  data: {
    course: Course;
    instructors: Instructor[];
  };
  error?: string;
  message?: string;
}
