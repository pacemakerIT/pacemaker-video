/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- =======================
-- ROLE ENUM → TABLE 전환
-- =======================
-- STEP 1: UserRole 테이블 생성
CREATE TABLE "UserRole" (
  "id" TEXT PRIMARY KEY,
  "label" TEXT NOT NULL
);

-- STEP 2: Role 데이터 삽입
INSERT INTO "UserRole" ("id", "label") VALUES
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
ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "UserRole"("id") ON DELETE RESTRICT;
