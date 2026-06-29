export type WorkshopFormErrors = {
  category?: string;
  recruitStatus?: string;
  title?: string;
  intro?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  price?: string;
  thumbnail?: string;
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
