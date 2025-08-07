// types/workshop.ts
export enum WorkshopStatus {
  RECRUITING = 'RECRUITING', // 모집중
  CLOSED = 'CLOSED', // 모집마감
  ONGOING = 'ONGOING', // 진행중
  COMPLETED = 'COMPLETED' // 진행완료
}

export interface WorkshopCard {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  price: number | null;
  status: WorkshopStatus;
  instructor: {
    name: string | null;
  } | null;
  locationOrUrl: string | null;
}
