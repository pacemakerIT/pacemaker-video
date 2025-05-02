-- CreateTable
CREATE TABLE "PaceUser" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isSubscribed" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionEndDate" TIMESTAMP(3),

    CONSTRAINT "PaceUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaceUser_clerkId_key" ON "PaceUser"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "PaceUser_email_key" ON "PaceUser"("email");
