/*
  Warnings:

  - The `rentDuration` column on the `movies` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "movies" DROP COLUMN "rentDuration",
ADD COLUMN     "rentDuration" "RentalDuration" NOT NULL DEFAULT 'DAYS_7';
