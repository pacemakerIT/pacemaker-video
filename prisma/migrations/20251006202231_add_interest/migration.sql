-- CreateEnum
CREATE TYPE "public"."Interest" AS ENUM ('INTERVIEW', 'RESUME', 'NETWORKING', 'MARKETING', 'IT', 'DESIGN', 'PUBLIC', 'ACCOUNTING', 'SERVICE');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "interest" "public"."Interest"[];
