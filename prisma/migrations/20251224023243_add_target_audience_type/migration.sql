-- CreateEnum
CREATE TYPE "TargetAudienceType" AS ENUM ('IT', 'GOVERNMENT', 'FINANCE', 'DESIGN', 'RESUME', 'INTERVIEW', 'NETWORKING', 'SERVICE');

-- AlterTable
ALTER TABLE "CourseTargetAudience" ADD COLUMN     "type" "TargetAudienceType",
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "content" DROP NOT NULL;
