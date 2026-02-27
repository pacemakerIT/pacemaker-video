export type EbookFormErrors = {
  category?: string;
  isPublic?: string;
  title?: string;
  intro?: string;
  price?: string;
  thumbnail?: string;
  visualTitle?: string;
  visualTitle2?: string;
  links?: string;
  recommended?: string;
  sections?: { title?: string; content?: string }[];
  file?: string;
};
