-- AlterTable
ALTER TABLE "cast_members" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "idx_cast_member_deleted" ON "cast_members"("isDeleted");
