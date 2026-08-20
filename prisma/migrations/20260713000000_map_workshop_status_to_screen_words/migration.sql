-- Store workshop status values using the same words shown in the user-facing UI.
ALTER TABLE "Workshop" ALTER COLUMN "status" DROP DEFAULT;

ALTER TYPE "WorkshopStatus" RENAME VALUE 'RECRUITING' TO 'Open';
ALTER TYPE "WorkshopStatus" RENAME VALUE 'CLOSED' TO 'Closed';
ALTER TYPE "WorkshopStatus" RENAME VALUE 'ONGOING' TO 'Ongoing';
ALTER TYPE "WorkshopStatus" RENAME VALUE 'COMPLETED' TO 'Completed';
ALTER TYPE "WorkshopStatus" RENAME VALUE 'HIDDEN' TO 'Hidden';

ALTER TABLE "Workshop" ALTER COLUMN "status" SET DEFAULT 'Open';
