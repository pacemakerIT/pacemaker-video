-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'content';

-- AlterTable
ALTER TABLE "SectionItem" ADD COLUMN     "icon" TEXT;

-- CreateTable
CREATE TABLE "CourseTargetAudience" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "courseId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "icon" TEXT,
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "CourseTargetAudience_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseTargetAudience_courseId_idx" ON "CourseTargetAudience"("courseId");
