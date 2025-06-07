/*
  Warnings:

  - You are about to drop the column `price` on the `WorkshopRegistration` table. All the data in the column will be lost.
  - You are about to drop the `PurchasedDocument` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PurchasedVideo` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED');

-- AlterTable
ALTER TABLE "WorkshopRegistration" DROP COLUMN "price",
ADD COLUMN     "attended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "orderId" UUID;

-- DropTable
DROP TABLE "PurchasedDocument";

-- DropTable
DROP TABLE "PurchasedVideo";

-- CreateTable
CREATE TABLE "Order" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "stripePaymentIntentId" TEXT,
    "stripeInvoiceId" TEXT,
    "stripeInvoiceUrl" TEXT,
    "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    "priceAtPurchase" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DocumentToOrderItem" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_DocumentToOrderItem_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_OrderItemToVideo" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_OrderItemToVideo_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_OrderItemToWorkshop" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_OrderItemToWorkshop_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripePaymentIntentId_key" ON "Order"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripeInvoiceId_key" ON "Order"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "_DocumentToOrderItem_B_index" ON "_DocumentToOrderItem"("B");

-- CreateIndex
CREATE INDEX "_OrderItemToVideo_B_index" ON "_OrderItemToVideo"("B");

-- CreateIndex
CREATE INDEX "_OrderItemToWorkshop_B_index" ON "_OrderItemToWorkshop"("B");
