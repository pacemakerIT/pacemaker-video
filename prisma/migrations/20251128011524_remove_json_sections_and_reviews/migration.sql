/*
  Warnings:

  - You are about to drop the column `reviews` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `sections` on the `Course` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "reviews",
DROP COLUMN "sections";
