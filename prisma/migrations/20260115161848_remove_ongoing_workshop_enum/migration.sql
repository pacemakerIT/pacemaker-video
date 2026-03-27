/*
  Warnings:

  - The values [ONGOING] on the enum `WorkshopStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "WorkshopStatus_new" AS ENUM ('RECRUITING', 'CLOSED', 'COMPLETED', 'HIDDEN');
ALTER TABLE "public"."Workshop" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Workshop" ALTER COLUMN "status" TYPE "WorkshopStatus_new" USING ("status"::text::"WorkshopStatus_new");
ALTER TYPE "WorkshopStatus" RENAME TO "WorkshopStatus_old";
ALTER TYPE "WorkshopStatus_new" RENAME TO "WorkshopStatus";
DROP TYPE "public"."WorkshopStatus_old";
ALTER TABLE "Workshop" ALTER COLUMN "status" SET DEFAULT 'RECRUITING';
COMMIT;
