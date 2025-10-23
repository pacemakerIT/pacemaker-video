-- 1) 임시로 컬럼 추가 (NULL 허용)
ALTER TABLE "Video" ADD COLUMN IF NOT EXISTS "courseId" uuid;

-- 2) videoId == course.id 인 레코드 자동 매핑
UPDATE "Video" v
SET "courseId" = c.id
FROM "Course" c
WHERE c.id::text = v."videoId" AND v."courseId" IS NULL;

-- 3) 남은 NULL 처리: 플레이스홀더 코스 보장
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "Course" WHERE id = '00000000-0000-0000-0000-000000000001'
  ) THEN
    INSERT INTO "Course" (id, title, instructorId)
    VALUES ('00000000-0000-0000-0000-000000000001', 'Unassigned', gen_random_uuid());
  END IF;
END$$;

UPDATE "Video"
SET "courseId" = '00000000-0000-0000-0000-000000000001'
WHERE "courseId" IS NULL;

-- 4) FK 및 NOT NULL 적용
ALTER TABLE "Video"
  ADD CONSTRAINT IF NOT EXISTS "Video_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE;

ALTER TABLE "Video" ALTER COLUMN "courseId" SET NOT NULL;