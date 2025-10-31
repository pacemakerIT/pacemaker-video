/*
  Warnings:

  - Added the required column `courseId` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ItemType" ADD VALUE 'COURSE';
ALTER TYPE "ItemType" ADD VALUE 'EBOOK';

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "courseId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "Course" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "courseTitle" TEXT,
    "description" TEXT,
    "price" TEXT,
    "rating" DOUBLE PRECISION,
    "reviewCount" INTEGER,
    "category" TEXT,
    "duration" TEXT,
    "level" TEXT,
    "language" TEXT,
    "backgroundImage" TEXT,
    "instructorId" UUID NOT NULL,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "sections" JSONB,
    "reviews" JSONB,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Instructor" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "profileImage" TEXT,
    "description" TEXT,
    "careers" JSONB,

    CONSTRAINT "Instructor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlobalRelatedItem" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "thumbnail" TEXT,

    CONSTRAINT "GlobalRelatedItem_pkey" PRIMARY KEY ("id")
);
