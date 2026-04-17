/*
  Warnings:

  - You are about to drop the column `slug` on the `cast_members` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "cast_members_slug_key";

-- AlterTable
ALTER TABLE "cast_members" DROP COLUMN "slug";
