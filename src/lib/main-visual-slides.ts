import type { MainVisual } from '@prisma/client';

export type MainVisualSlideSource = Pick<
  MainVisual,
  | 'title'
  | 'description'
  | 'isPublic'
  | 'startDate'
  | 'endDate'
  | 'startTime'
  | 'endTime'
  | 'link'
  | 'linkName'
>;

export type MainVisualSlide = {
  tag: string;
  tagColor: string;
  title: string;
  highlight: string;
  highlightColor: string;
  description: string;
  buttonText: string;
  link: string;
  titleSizeClass?: string;
};

const SLIDE_COLORS = [
  { tag: 'rgba(0, 173, 189, 0.85)', highlight: 'text-teal' },
  { tag: '#FF4F02', highlight: 'text-orange' }
];

// The home page shows a public visual only inside its optional start/end
// window. Shared with the admin MCP preview so both apply the same rules.
export function isMainVisualOnHomePage(
  visual: MainVisualSlideSource,
  now: Date
): boolean {
  if (!visual.isPublic) {
    return false;
  }

  if (visual.startDate && visual.startTime) {
    const start = new Date(visual.startDate);
    const [startH, startM] = visual.startTime.split(':').map(Number);
    start.setHours(startH, startM, 0, 0);
    if (now < start) return false;
  }

  if (visual.endDate && visual.endTime) {
    const end = new Date(visual.endDate);
    const [endH, endM] = visual.endTime.split(':').map(Number);
    end.setHours(endH, endM, 59, 999);
    if (now > end) return false;
  }

  return true;
}

// `index` is the position among the visuals shown on the home page; it picks
// the alternating tag and highlight colors.
export function toMainVisualSlide(
  visual: MainVisualSlideSource,
  index: number
): MainVisualSlide {
  const title = visual.title || '';
  const colors = SLIDE_COLORS[index % SLIDE_COLORS.length];

  return {
    tag: 'Announcement',
    tagColor: colors.tag,
    title,
    highlight: '',
    highlightColor: colors.highlight,
    description: visual.description || '',
    buttonText: visual.linkName || '',
    link: visual.link || '',
    titleSizeClass:
      title.length >= 35 ? 'text-[clamp(1.2rem,3vw,1.8rem)]' : undefined
  };
}
