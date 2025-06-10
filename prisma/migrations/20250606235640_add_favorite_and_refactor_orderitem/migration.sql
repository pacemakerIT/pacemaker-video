/*
  Warnings:

  - You are about to drop the `_DocumentToOrderItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_OrderItemToVideo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_OrderItemToWorkshop` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "documentId" UUID,
ADD COLUMN     "videoId" UUID,
ADD COLUMN     "workshopId" UUID;

-- DropTable
DROP TABLE "_DocumentToOrderItem";

-- DropTable
DROP TABLE "_OrderItemToVideo";

-- DropTable
DROP TABLE "_OrderItemToWorkshop";

-- CreateTable
CREATE TABLE "Favorite" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "videoId" UUID,
    "documentId" UUID,
    "workshopId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_videoId_key" ON "Favorite"("userId", "videoId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_documentId_key" ON "Favorite"("userId", "documentId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_workshopId_key" ON "Favorite"("userId", "workshopId");
