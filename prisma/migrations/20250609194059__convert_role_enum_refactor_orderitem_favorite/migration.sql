-- =======================
-- ROLE ENUM → TABLE 전환
-- =======================
-- STEP 1: Role 테이블 생성
CREATE TABLE "Role" (
  "id" TEXT PRIMARY KEY,
  "label" TEXT NOT NULL
);

-- STEP 2: Role 데이터 삽입
INSERT INTO "Role" ("id", "label") VALUES
('USER', '일반 사용자'),
('ADMIN', '관리자'),
('INSTRUCTOR', '강사');

-- STEP 3: roleId 임시로 추가
ALTER TABLE "User" ADD COLUMN "roleId" TEXT;

-- STEP 4: enum → 텍스트로 복사
UPDATE "User" SET "roleId" = "role"::TEXT;

-- STEP 5: role 컬럼 제거 
ALTER TABLE "User" DROP COLUMN "role";

-- STEP 6: enum 타입 제거
DROP TYPE IF EXISTS "Role";

-- STEP 7: FK 제약 추가
ALTER TABLE "User"
ALTER COLUMN "roleId" SET NOT NULL;

ALTER TABLE "User"
ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT;


-- ================================
-- OrderItem / Favorite 다형성 통합
-- ================================

-- 7. OrderItem 테이블에 itemType, itemId 추가
ALTER TABLE "OrderItem"
ADD COLUMN "itemType" TEXT,
ADD COLUMN "itemId" TEXT;

-- 8. 기존 데이터 마이그레이션
UPDATE "OrderItem"
SET "itemType" = 'VIDEO',
    "itemId" = "videoId"
WHERE "videoId" IS NOT NULL;

UPDATE "OrderItem"
SET "itemType" = 'DOCUMENT',
    "itemId" = "documentId"
WHERE "documentId" IS NOT NULL;

UPDATE "OrderItem"
SET "itemType" = 'WORKSHOP',
    "itemId" = "workshopId"
WHERE "workshopId" IS NOT NULL;

-- 9. 기존 컬럼 제거
ALTER TABLE "OrderItem"
DROP COLUMN "videoId",
DROP COLUMN "documentId",
DROP COLUMN "workshopId";

-- 10. NOT NULL 제약
ALTER TABLE "OrderItem"
ALTER COLUMN "itemType" SET NOT NULL,
ALTER COLUMN "itemId" SET NOT NULL;

-- ------------------------

-- 11. Favorite 테이블에 itemType, itemId 추가
ALTER TABLE "Favorite"
ADD COLUMN "itemType" TEXT,
ADD COLUMN "itemId" TEXT;

-- 12. 기존 데이터 마이그레이션
UPDATE "Favorite"
SET "itemType" = 'VIDEO',
    "itemId" = "videoId"
WHERE "videoId" IS NOT NULL;

UPDATE "Favorite"
SET "itemType" = 'DOCUMENT',
    "itemId" = "documentId"
WHERE "documentId" IS NOT NULL;

UPDATE "Favorite"
SET "itemType" = 'WORKSHOP',
    "itemId" = "workshopId"
WHERE "workshopId" IS NOT NULL;

-- 13. 기존 컬럼 제거
ALTER TABLE "Favorite"
DROP COLUMN "videoId",
DROP COLUMN "documentId",
DROP COLUMN "workshopId";

-- 14. NOT NULL 제약
ALTER TABLE "Favorite"
ALTER COLUMN "itemType" SET NOT NULL,
ALTER COLUMN "itemId" SET NOT NULL;

-- 15. 중복 찜 방지 유니크 제약
ALTER TABLE "Favorite"
ADD CONSTRAINT "unique_user_favorite" UNIQUE ("userId", "itemType", "itemId");
