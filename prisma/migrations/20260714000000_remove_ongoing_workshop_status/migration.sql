UPDATE "Workshop"
SET "status" = 'CLOSED'
WHERE "status" = 'ONGOING';

ALTER TABLE "Workshop" ALTER COLUMN "status" DROP DEFAULT;
ALTER TYPE "WorkshopStatus" RENAME TO "WorkshopStatus_old";
CREATE TYPE "WorkshopStatus" AS ENUM ('OPEN', 'CLOSED', 'COMPLETED', 'HIDDEN');

ALTER TABLE "Workshop"
ALTER COLUMN "status" TYPE "WorkshopStatus"
USING ("status"::text::"WorkshopStatus");

ALTER TABLE "Workshop" ALTER COLUMN "status" SET DEFAULT 'OPEN';
DROP TYPE "WorkshopStatus_old";
