-- AlterEnum
ALTER TYPE "ReviewStatus" ADD VALUE 'DRAFT';

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "unpublishReason" TEXT;
