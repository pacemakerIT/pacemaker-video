-- Remove the Ongoing workshop status. Any existing Ongoing rows become Closed.
ALTER TABLE "Workshop" ALTER COLUMN "status" DROP DEFAULT;

UPDATE "Workshop" SET "status" = 'Closed' WHERE "status" = 'Ongoing';

BEGIN;
CREATE TYPE "WorkshopStatus_new" AS ENUM ('Open', 'Closed', 'Completed', 'Hidden');
ALTER TABLE "Workshop" ALTER COLUMN "status" TYPE "WorkshopStatus_new" USING ("status"::text::"WorkshopStatus_new");
ALTER TYPE "WorkshopStatus" RENAME TO "WorkshopStatus_old";
ALTER TYPE "WorkshopStatus_new" RENAME TO "WorkshopStatus";
DROP TYPE "WorkshopStatus_old";
COMMIT;

ALTER TABLE "Workshop" ALTER COLUMN "status" SET DEFAULT 'Open';
