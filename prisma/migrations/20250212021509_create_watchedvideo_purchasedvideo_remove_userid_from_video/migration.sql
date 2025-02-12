/*
  Warnings:

  - You are about to drop the `Progress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PurchasedCourse` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `videoId` on the `WatchedVideo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Progress" DROP CONSTRAINT "Progress_userId_fkey";

-- DropForeignKey
ALTER TABLE "PurchasedCourse" DROP CONSTRAINT "PurchasedCourse_userId_fkey";

-- AlterTable
ALTER TABLE "WatchedVideo" DROP COLUMN "videoId",
ADD COLUMN     "videoId" UUID NOT NULL;

-- DropTable
DROP TABLE "Progress";

-- DropTable
DROP TABLE "PurchasedCourse";

-- DropEnum
DROP TYPE "PurchaseStatus";

-- CreateTable
CREATE TABLE "Video" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "videoId" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "price" DOUBLE PRECISION,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchasedVideo" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "videoId" UUID NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PurchasedVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Video_videoId_key" ON "Video"("videoId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchasedVideo_userId_videoId_key" ON "PurchasedVideo"("userId", "videoId");

-- CreateIndex
CREATE UNIQUE INDEX "WatchedVideo_userId_videoId_key" ON "WatchedVideo"("userId", "videoId");

-- AddForeignKey
ALTER TABLE "WatchedVideo" ADD CONSTRAINT "WatchedVideo_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchasedVideo" ADD CONSTRAINT "PurchasedVideo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchasedVideo" ADD CONSTRAINT "PurchasedVideo_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
