-- CreateTable
CREATE TABLE "PurchasedDocument" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "documentId" UUID NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PurchasedDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "documentId" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "price" DOUBLE PRECISION,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PurchasedDocument_userId_documentId_key" ON "PurchasedDocument"("userId", "documentId");

-- CreateIndex
CREATE UNIQUE INDEX "Document_documentId_key" ON "Document"("documentId");

-- AddForeignKey
ALTER TABLE "PurchasedDocument" ADD CONSTRAINT "PurchasedDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchasedDocument" ADD CONSTRAINT "PurchasedDocument_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
