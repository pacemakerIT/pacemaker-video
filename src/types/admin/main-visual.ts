export interface MainVisual {
  title: string;
  description: string;
  status: 'public' | 'private' | '';
  startDate?: Date;
  endDate?: Date;
  startTime: string;
  endTime: string;
  image: File | string | null;
  imageUrl?: string; // 수정 시 기존 이미지
  link: string;
}
