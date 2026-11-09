import type { MainVisual } from '@prisma/client';
import type { EditableMainVisual } from '@/lib/mcp-main-visual-change';

export const MCP_MAIN_VISUAL_DETAIL_SELECT = {
  id: true,
  title: true,
  description: true,
  linkName: true,
  link: true,
  isPublic: true,
  orderIndex: true,
  updatedAt: true
} as const;

export function toEditableMainVisual(
  visual: Pick<MainVisual, keyof EditableMainVisual>
): EditableMainVisual {
  return {
    title: visual.title,
    description: visual.description,
    linkName: visual.linkName,
    link: visual.link,
    isPublic: visual.isPublic
  };
}

// The admin preview page is served by this app. Development uses the origin
// the MCP called; deployed environments use the configured app URL.
export function previewOriginFor(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (process.env.NODE_ENV !== 'development' && configured) {
    return new URL(configured).origin;
  }
  return new URL(request.url).origin;
}
