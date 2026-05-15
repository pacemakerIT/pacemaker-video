-- AlterTable
ALTER TABLE "Order"
ADD COLUMN     "totalAmountCents" INTEGER,
ADD COLUMN     "subtotalAmount" INTEGER,
ADD COLUMN     "discountAmount" INTEGER,
ADD COLUMN     "taxAmount" INTEGER,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'cad',
ADD COLUMN     "stripeCheckoutSessionId" TEXT,
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeReceiptUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripeCheckoutSessionId_key" ON "Order"("stripeCheckoutSessionId");
