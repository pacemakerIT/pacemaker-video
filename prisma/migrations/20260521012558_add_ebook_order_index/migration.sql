-- AlterTable
ALTER TABLE "Ebook" RENAME CONSTRAINT "Document_pkey" TO "Ebook_pkey";

-- AlterTable
ALTER TABLE "Ebook" ADD COLUMN "orderIndex" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Video" ALTER COLUMN "courseId" DROP NOT NULL;

-- RenameIndex
ALTER INDEX "Document_documentId_key" RENAME TO "Ebook_ebookId_key";
