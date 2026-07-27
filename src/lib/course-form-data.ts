export type CourseCareerFormData = {
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
};

export type CourseCareerDisplayData = {
  period: string;
  position: string;
};

type UnknownRecord = Record<string, unknown>;

function emptyCareer(): CourseCareerFormData {
  return {
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: ''
  };
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function getCareerEntries(careers: unknown): unknown[] {
  if (Array.isArray(careers)) return careers;

  if (typeof careers === 'string') {
    try {
      const parsed = JSON.parse(careers);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

function parseLegacyPeriod(period: string) {
  const years = period.match(/\b\d{4}\b/g) ?? [];
  const startDate = years[0] ?? '';
  const endDate = years[1] ?? '';
  const hasCurrentMarker =
    period.includes('~') ||
    /\b(?:present|current|now|ongoing)\b/i.test(period) ||
    period.includes('현재');

  return {
    startDate,
    endDate,
    isCurrent: Boolean(startDate && !endDate && hasCurrentMarker)
  };
}

/**
 * Converts persisted instructor careers into the format expected by the admin
 * course form. Older records use `{ period, position }`, while newly created
 * records use `{ startDate, endDate, isCurrent, description }`.
 */
export function normalizeCourseCareers(
  careers: unknown
): CourseCareerFormData[] {
  const entries = getCareerEntries(careers);

  if (entries.length === 0) return [emptyCareer()];

  return entries.map((entry) => {
    if (!isRecord(entry)) return emptyCareer();

    const period = stringValue(entry.period);
    const legacyPeriod = parseLegacyPeriod(period);
    const startDate = stringValue(entry.startDate) || legacyPeriod.startDate;
    const endDate = stringValue(entry.endDate) || legacyPeriod.endDate;
    const explicitIsCurrent = entry.isCurrent;
    const isCurrent =
      typeof explicitIsCurrent === 'boolean'
        ? explicitIsCurrent
        : legacyPeriod.isCurrent;

    return {
      startDate,
      endDate: isCurrent ? '' : endDate,
      isCurrent,
      description: stringValue(entry.description) || stringValue(entry.position)
    };
  });
}

/**
 * Supports both the legacy persisted shape (`period`/`position`) and the
 * canonical form shape when rendering a course's public instructor profile.
 */
export function formatCourseCareer(career: unknown): CourseCareerDisplayData {
  if (!isRecord(career)) return { period: '', position: '' };

  const legacyPeriod = stringValue(career.period);
  const startDate = stringValue(career.startDate);
  const endDate = stringValue(career.endDate);
  const isCurrent = career.isCurrent === true;

  return {
    period:
      legacyPeriod ||
      (startDate
        ? isCurrent
          ? `${startDate} ~`
          : endDate
            ? `${startDate} ~ ${endDate}`
            : startDate
        : ''),
    position: stringValue(career.position) || stringValue(career.description)
  };
}

/**
 * Returns only renderable careers for public detail pages. Database JSON can
 * be null, malformed, or serialized, so display code must not call `.map()`
 * on it directly.
 */
export function formatCourseCareers(
  careers: unknown
): CourseCareerDisplayData[] {
  return getCareerEntries(careers)
    .map(formatCourseCareer)
    .filter((career) => career.period !== '' || career.position !== '');
}
