-- AlterTable: replace orderIndex with orderKey
ALTER TABLE "Ebook" DROP COLUMN "orderIndex";
ALTER TABLE "Ebook" ADD COLUMN "orderKey" TEXT NOT NULL DEFAULT 'a0';
