-- Rename existing major-unit Float amounts to minor-unit integer amounts.
ALTER TABLE "Order" RENAME COLUMN "totalAmount" TO "totalAmountCents";
ALTER TABLE "Order"
ALTER COLUMN "totalAmountCents" TYPE INTEGER
USING ROUND("totalAmountCents" * 100)::INTEGER;

ALTER TABLE "OrderItem" RENAME COLUMN "priceAtPurchase" TO "priceAtPurchaseCents";
ALTER TABLE "OrderItem"
ALTER COLUMN "priceAtPurchaseCents" TYPE INTEGER
USING ROUND("priceAtPurchaseCents" * 100)::INTEGER;

-- AlterTable
ALTER TABLE "Order"
ADD COLUMN     "subtotalAmountCents" INTEGER,
ADD COLUMN     "discountAmountCents" INTEGER,
ADD COLUMN     "taxAmountCents" INTEGER,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'cad',
ADD COLUMN     "stripeCheckoutSessionId" TEXT,
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeReceiptUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripeCheckoutSessionId_key" ON "Order"("stripeCheckoutSessionId");
