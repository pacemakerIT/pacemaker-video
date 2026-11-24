-- CreateTable
CREATE TABLE "McpAuditLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actorClerkId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityId" UUID NOT NULL,
    "before" JSONB NOT NULL,
    "after" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "McpAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "McpAuditLog_entityId_createdAt_idx" ON "McpAuditLog"("entityId", "createdAt");

