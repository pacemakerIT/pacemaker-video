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
  title: string;
  courseTitle: string;
  description: string;
  price: string;
  rating: number;
  reviewCount: number;
  category: 'INTERVIEW' | 'RESUME' | 'NETWORKING' | null;
  duration: string;
  level: string;
  language: string;
  backgroundImage: string;
  promoText: string | null;
  summary: string | null;
  detailTitle: string | null;
  instructorId?: string; // Optional or removed
  createdAt: string;
  updatedAt: string;
  sections: Section[];
  videos: Video[];
  reviews: ApiReview[];
  targetAudienceTypes: string[];
  targetAudiences: CourseTargetAudience[];
  relatedCourses: RelatedCourse[];
  instructors: Instructor[];
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
  items: SectionItem[];
  videos: Video[];
}

export interface SectionItem {
  id: string;
  title: string;
  content: string;
  icon: string | null;
  orderIndex: number;
  itemId?: string;
  price?: number;
  category?: string;
  type?: string;
  thumbnail?: string;
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
