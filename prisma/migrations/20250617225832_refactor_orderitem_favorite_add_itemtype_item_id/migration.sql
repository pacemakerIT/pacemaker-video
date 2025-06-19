/*
  Warnings:

  - You are about to drop the column `documentId` on the `Favorite` table. All the data in the column will be lost.
  - You are about to drop the column `videoId` on the `Favorite` table. All the data in the column will be lost.
  - You are about to drop the column `workshopId` on the `Favorite` table. All the data in the column will be lost.
  - You are about to drop the column `documentId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `videoId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `workshopId` on the `OrderItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,itemType,itemId]` on the table `Favorite` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `itemId` to the `Favorite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemType` to the `Favorite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemId` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemType` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('VIDEO', 'DOCUMENT', 'WORKSHOP');

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_roleId_fkey";

-- DropIndex
DROP INDEX "Favorite_userId_documentId_key";

-- DropIndex
DROP INDEX "Favorite_userId_videoId_key";

-- DropIndex
DROP INDEX "Favorite_userId_workshopId_key";

-- AlterTable
ALTER TABLE "Favorite" DROP COLUMN "documentId",
DROP COLUMN "videoId",
DROP COLUMN "workshopId",
ADD COLUMN     "itemId" TEXT NOT NULL,
ADD COLUMN     "itemType" "ItemType" NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "documentId",
DROP COLUMN "videoId",
DROP COLUMN "workshopId",
ADD COLUMN     "itemId" TEXT NOT NULL,
ADD COLUMN     "itemType" "ItemType" NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "roleId" SET DEFAULT 'USER';

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_itemType_itemId_key" ON "Favorite"("userId", "itemType", "itemId");
