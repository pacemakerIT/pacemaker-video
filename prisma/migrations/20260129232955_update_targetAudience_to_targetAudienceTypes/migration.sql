/*
  Warnings:

  - You are about to drop the column `targetAudience` on the `Document` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "targetAudience",
ADD COLUMN     "targetAudienceTypes" "TargetAudienceType"[] DEFAULT ARRAY[]::"TargetAudienceType"[];
