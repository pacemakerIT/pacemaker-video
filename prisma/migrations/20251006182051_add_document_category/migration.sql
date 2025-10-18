/*
  Warnings:

  - The `category` column on the `Document` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."DocumentCategory" AS ENUM ('MARKETING', 'IT', 'DESIGN', 'PUBLIC', 'ACCOUNTING', 'SERVICE');

-- AlterTable
ALTER TABLE "public"."Document" DROP COLUMN "category",
ADD COLUMN     "category" "public"."DocumentCategory";
