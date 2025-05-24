-- CreateEnum
CREATE TYPE "VideoCategory" AS ENUM ('INTERVIEW', 'RESUME', 'NETWORKING');

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "category" "VideoCategory";
