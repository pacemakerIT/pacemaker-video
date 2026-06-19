'use client';

import WorkshopForm, {
  WorkshopData
} from '@/components/admin/workshops/workshop-form';

type Props = {
  workshopId: string;
  initialData: WorkshopData;
};

export default function WorkshopEditClient({ workshopId, initialData }: Props) {
  return (
    <div className="p-10">
      <div className="flex justify-between pb-10">
        <h1 className="text-pace-3xl font-bold">워크샵 관리</h1>
      </div>
      <div>
        <div className="border-b border-pace-gray-700 pb-5">
          <span className="text-pace-xl font-bold leading-[52px]">
            워크샵 수정
          </span>
        </div>

        <WorkshopForm
          initialData={initialData}
          isEdit={true}
          workshopId={workshopId}
        />
      </div>
    </div>
  );
}
