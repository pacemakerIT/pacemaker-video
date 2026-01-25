-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "recommendedLinks" JSONB,
ADD COLUMN     "targetAudience" "TargetAudienceType"[] DEFAULT ARRAY[]::"TargetAudienceType"[];
