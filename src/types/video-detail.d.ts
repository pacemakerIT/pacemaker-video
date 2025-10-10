// Single-table 구조 타입 정의
export interface SingleTableCourse {
  id: string;
  title: string;
  subtitle: string;
  courseTitle: string;
  description: string;
  price: string;
  rating: number;
  reviewCount: number;
  category: string;
  duration: string;
  level: string;
  language: string;
  backgroundImage: string;
  createdAt: string;
  updatedAt: string;

  // 단일 값들 (평면적)
  instructorName: string;
  instructorProfileImage: string;
  instructorDescription: string;
  sectionTitle: string;
  sectionSubtitle: string;
  sectionDescription: string;
  recommendationTitle: string;
  reviewTitle: string;
  relatedContentTitle: string;

  // 배열 데이터들
  instructorCareers: CareerItem[];
  expandableCards: ExpandableCard[];
  recommendationItems: RecommendationItem[];
  relatedContentItems: RelatedContentItem[];
  reviews: Review[];
}

// Six-table 구조 타입 정의
export interface SixTableCourse {
  id: string;
  title: string;
  subtitle: string;
  courseTitle: string;
  description: string;
  price: string;
  rating: number;
  reviewCount: number;
  category: string;
  duration: string;
  level: string;
  language: string;
  backgroundImage: string;
  instructorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SixTableInstructor {
  id: string;
  name: string;
  profileImage: string;
  description: string;
}

export interface SixTableCourseSection {
  id: string;
  courseId: string;
  type: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  orderIndex: number;
  items: SixTableSectionItem[];
}

export interface SixTableSectionItem {
  id: string;
  sectionId: string;
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

export interface SixTableApiResponse {
  success: boolean;
  data: {
    course: SixTableCourse;
    instructor: SixTableInstructor | null;
    instructorCareers: CareerItem[];
    sections: SixTableCourseSection[];
    reviews: Review[];
  };
  error?: string;
  message?: string;
}

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
  thumbnail: string;
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
export interface SingleTableApiResponse {
  success: boolean;
  data: SingleTableCourse;
  error?: string;
  message?: string;
}

// Three-table 구조 타입 정의
export interface Course {
  id: string;
  title: string;
  subtitle: string;
  courseTitle: string;
  description: string;
  price: string;
  rating: number;
  reviewCount: number;
  category: string;
  duration: string;
  level: string;
  language: string;
  backgroundImage: string;
  instructorId: string;
  createdAt: string;
  updatedAt: string;
  sections: Section[];
  reviews: Review[];
}

export interface Section {
  id: string;
  type: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  orderIndex: number;
  items: SectionItem[];
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

export interface Instructor {
  id: string;
  name: string;
  profileImage: string;
  description: string;
  careers: CareerItem[];
}

export interface GlobalRelatedItem {
  id: string;
  title: string;
  content: string;
  price: number;
  category: string;
  type: string;
  thumbnail: string;
}

export interface ApiResponse {
  success: boolean;
  data: {
    course: Course;
    instructor: Instructor | null;
  };
  error?: string;
  message?: string;
}
