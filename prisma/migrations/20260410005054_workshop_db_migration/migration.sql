/*
  Warnings:

  - You are about to drop the column `instructorId` on the `Workshop` table. All the data in the column will be lost.
  - You are about to drop the `WorkshopRegistration` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "WorkshopStatus" ADD VALUE 'ONGOING';

-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "workshopId" UUID;

-- AlterTable
ALTER TABLE "Favorite" ADD COLUMN     "workshopId" UUID;

-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "workshopId" UUID,
ALTER COLUMN "courseId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Workshop" DROP COLUMN "instructorId",
ADD COLUMN     "isMain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "processContent" TEXT;

-- DropTable
DROP TABLE "WorkshopRegistration";

-- CreateTable
CREATE TABLE "WorkshopInstructor" (
    "workshopId" UUID NOT NULL,
    "instructorId" UUID NOT NULL,

    CONSTRAINT "WorkshopInstructor_pkey" PRIMARY KEY ("workshopId","instructorId")
);

-- CreateTable
CREATE TABLE "UserWorkshop" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "workshopId" UUID NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "orderId" UUID,

    CONSTRAINT "UserWorkshop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkshopInstructor_instructorId_idx" ON "WorkshopInstructor"("instructorId");

-- CreateIndex
CREATE UNIQUE INDEX "UserWorkshop_userId_workshopId_key" ON "UserWorkshop"("userId", "workshopId");

-- CreateIndex
CREATE INDEX "Cart_workshopId_idx" ON "Cart"("workshopId");

-- CreateIndex
CREATE INDEX "Favorite_workshopId_idx" ON "Favorite"("workshopId");

-- CreateIndex
CREATE INDEX "Section_workshopId_idx" ON "Section"("workshopId");
