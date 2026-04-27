export interface Ebook {
  id: string;
  ebookId: string;
  title?: string;
  description?: string;
  price?: number;
  uploadDate: Date;
  bucketUrl: string;
}
