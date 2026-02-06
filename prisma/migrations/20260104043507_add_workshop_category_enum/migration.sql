-- CreateEnum
CREATE TYPE "WorkshopCategory" AS ENUM ('INTERVIEW', 'RESUME', 'NETWORKING');

-- AlterEnum
ALTER TYPE "WorkshopStatus" ADD VALUE 'HIDDEN';

-- AlterTable
ALTER TABLE "Workshop" ADD COLUMN     "category" "WorkshopCategory";
