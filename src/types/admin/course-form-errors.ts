export type CourseFormErrors = {
  category?: string;
  isPublic?: string;
  recruitStatus?: string;
  title?: string;
  intro?: string;
  videoLink?: string;
  workshopDate?: string;
  workshopLocation?: string;
  price?: string;
  time?: string;
  thumbnail?: string;
  visualTitle?: string;
  visualTitle2?: string;
  links?: string;
  recommended?: string;
  sections?: { title?: string; content?: string }[];
  instructors?: {
    name?: string;
    intro?: string;
    careers?: {
      startDate?: string;
      endDate?: string;
      isCurrent?: boolean;
      description?: string;
    }[];
    photo?: string;
  }[];
};
