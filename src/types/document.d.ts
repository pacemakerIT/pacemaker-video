export interface Document {
  id: string;
  documentId: string;
  title?: string;
  description?: string;
  price?: number;
  uploadDate: Date;
  bucketUrl: string;
}
