-- AlterTable
ALTER TABLE "Course" ADD COLUMN "orderKey" TEXT NOT NULL DEFAULT 'a0';

-- AlterTable
ALTER TABLE "Workshop" ADD COLUMN "orderKey" TEXT NOT NULL DEFAULT 'a0';
