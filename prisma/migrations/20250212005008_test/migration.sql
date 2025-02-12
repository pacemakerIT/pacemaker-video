-- CreateTable
CREATE TABLE "Test" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);
