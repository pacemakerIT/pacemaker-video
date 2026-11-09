// Admin preview of a change proposed through the admin MCP, drawn with the
// home page banner component. Read-only: the token in the URL cannot apply it.
import { notFound } from 'next/navigation';
import ListHeader from '@/components/common/list-header';
import prisma from '@/lib/prisma';
import {
  isMainVisualOnHomePage,
  toMainVisualSlide,
  type MainVisualSlideSource
} from '@/lib/main-visual-slides';
import {
  type EditableMainVisualField,
  type MainVisualChangeClaims,
  verifyMainVisualChangeToken
} from '@/lib/mcp-main-visual-change';

export const dynamic = 'force-dynamic';

const FIELD_LABELS: Record<EditableMainVisualField, string> = {
  title: '제목',
  description: '설명',
  linkName: '버튼 문구',
  link: '버튼 이동 주소',
  isPublic: '공개 여부'
};

type PreviewVisual = MainVisualSlideSource & { id: string };

function homePageSlide(visuals: PreviewVisual[], id: string, now: Date) {
  const shown = visuals.filter((visual) => isMainVisualOnHomePage(visual, now));
  const index = shown.findIndex((visual) => visual.id === id);
  return index === -1 ? null : toMainVisualSlide(shown[index], index);
}

function BannerPreview({
  label,
  visuals,
  id,
  now
}: {
  label: string;
  visuals: PreviewVisual[];
  id: string;
  now: Date;
}) {
  const slide = homePageSlide(visuals, id, now);

  return (
    <section
      aria-labelledby={`preview-${label}`}
      className="flex flex-col gap-3"
    >
      <h2 id={`preview-${label}`} className="text-pace-lg font-bold">
        {label}
      </h2>
      {slide ? (
        <div className="overflow-hidden rounded-lg border border-pace-gray-200">
          <ListHeader slides={[slide]} autoPlayInterval={0} />
        </div>
      ) : (
        <p className="rounded-lg border border-pace-gray-200 p-6 text-pace-gray-700">
          홈 화면에 보이지 않습니다. 비공개이거나 노출 기간 밖입니다.
        </p>
      )}
    </section>
  );
}

export default async function MainVisualChangePreviewPage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  let claims: MainVisualChangeClaims;
  try {
    claims = await verifyMainVisualChangeToken(token, 'preview');
  } catch {
    notFound();
  }

  const visuals = await prisma.mainVisual.findMany({
    orderBy: { orderIndex: 'asc' },
    select: {
      id: true,
      title: true,
      description: true,
      isPublic: true,
      startDate: true,
      endDate: true,
      startTime: true,
      endTime: true,
      link: true,
      linkName: true,
      updatedAt: true
    }
  });
  const target = visuals.find((visual) => visual.id === claims.mainVisualId);
  if (!target) {
    notFound();
  }

  const isStale = target.updatedAt.toISOString() !== claims.baseUpdatedAt;
  const changedVisuals = visuals.map((visual) =>
    visual.id === target.id ? { ...visual, ...claims.changes } : visual
  );
  const changedFields = Object.keys(
    claims.changes
  ) as EditableMainVisualField[];
  const now = new Date();

  return (
    <div className="flex flex-col gap-8 p-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-pace-xl font-bold">메인 배너 변경 미리보기</h1>
        <p className="text-pace-gray-700">
          바뀌는 항목:{' '}
          {changedFields.map((field) => FIELD_LABELS[field]).join(', ')}
        </p>
        <p className="text-pace-sm text-pace-gray-700">
          이 화면은 미리보기만 보여 줍니다. 적용은 Claude 등 MCP 앱에서 승인해야
          합니다.
        </p>
        {isStale && (
          <p
            role="alert"
            className="rounded-lg border border-pace-orange-500 p-4 text-pace-orange-500"
          >
            미리보기 이후 이 배너가 바뀌었습니다. MCP 앱에서 변경을 다시 제안해
            주세요.
          </p>
        )}
      </header>
      <BannerPreview label="지금" visuals={visuals} id={target.id} now={now} />
      <BannerPreview
        label="바꾼 뒤"
        visuals={changedVisuals}
        id={target.id}
        now={now}
      />
    </div>
  );
}
