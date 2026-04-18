-- AlterTable
ALTER TABLE "movies" ALTER COLUMN "rentDuration" DROP NOT NULL,
ALTER COLUMN "rentDuration" DROP DEFAULT;
