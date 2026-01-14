-- AlterTable
ALTER TABLE "Document" 
ADD COLUMN     "isMain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subDescription" TEXT,
ADD COLUMN     "subTitle" TEXT,
ADD COLUMN     "tableOfContents" JSONB,
ADD COLUMN     "thumbnail" TEXT,
ADD COLUMN     "visualTitle1" TEXT,
ADD COLUMN     "visualTitle2" TEXT;
