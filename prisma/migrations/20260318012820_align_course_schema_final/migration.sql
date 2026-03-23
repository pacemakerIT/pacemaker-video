/*
  Warnings:

  - You are about to drop the column `backgroundImage` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `courseTitle` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `detailTitle` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `isMain` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `promoText` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `reviewCount` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `Course` table. All the data in the column will be lost.
  - Added the required column `visualTitle2` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "backgroundImage",
DROP COLUMN "courseTitle",
DROP COLUMN "detailTitle",
DROP COLUMN "duration",
DROP COLUMN "isMain",
DROP COLUMN "language",
DROP COLUMN "level",
DROP COLUMN "promoText",
DROP COLUMN "rating",
DROP COLUMN "reviewCount",
DROP COLUMN "summary",
ADD COLUMN     "processContent" TEXT,
ADD COLUMN     "processTitle" TEXT,
ADD COLUMN     "showOnMain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "thumbnailUrl" TEXT,
ADD COLUMN     "time" TEXT,
ADD COLUMN     "videoLink" TEXT,
ADD COLUMN     "visualTitle" TEXT,
ADD COLUMN     "visualTitle2" TEXT NOT NULL,
ALTER COLUMN "title" DROP NOT NULL;
