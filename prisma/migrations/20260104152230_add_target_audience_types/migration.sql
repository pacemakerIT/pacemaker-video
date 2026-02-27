-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "targetAudienceTypes" "TargetAudienceType"[];

-- DropTable
DROP TABLE IF EXISTS "CourseTargetAudience";
