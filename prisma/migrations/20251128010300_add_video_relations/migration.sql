/*
  Warnings:

  - The primary key for the `Section` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Section` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `SectionItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `SectionItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Section" DROP CONSTRAINT "Section_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "Section_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "SectionItem" DROP CONSTRAINT "SectionItem_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "SectionItem_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "sectionId" UUID;
