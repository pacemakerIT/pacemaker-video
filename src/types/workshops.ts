// types/workshop.ts
export enum WorkshopStatus {
  RECRUITING = 'RECRUITING', // 모집중
  CLOSED = 'CLOSED', // 모집마감
  ONGOING = 'ONGOING', // 진행중 -> 모집완료
  COMPLETED = 'COMPLETED' // 진행완료
}

export interface WorkshopCard {
  id: string;
  title: string;
  description: string | null;
  startDate: string | Date;
  endDate: string | Date;
  price: number | null;
  status: WorkshopStatus;
  category: string | null;
  thumbnail: string | null;
  instructors: {
    instructor: { name: string };
  }[];
  locationOrUrl: string | null;
}
