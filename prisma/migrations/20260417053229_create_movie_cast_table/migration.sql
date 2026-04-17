/*
  Warnings:

  - You are about to drop the column `cast` on the `movies` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "movies" DROP COLUMN "cast";

-- CreateTable
CREATE TABLE "cast_members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cast_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movie_cast" (
    "movieId" TEXT NOT NULL,
    "castMemberId" TEXT NOT NULL,

    CONSTRAINT "movie_cast_pkey" PRIMARY KEY ("movieId","castMemberId")
);

-- CreateIndex
CREATE UNIQUE INDEX "cast_members_name_key" ON "cast_members"("name");

-- CreateIndex
CREATE UNIQUE INDEX "cast_members_slug_key" ON "cast_members"("slug");

-- AddForeignKey
ALTER TABLE "movie_cast" ADD CONSTRAINT "movie_cast_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_cast" ADD CONSTRAINT "movie_cast_castMemberId_fkey" FOREIGN KEY ("castMemberId") REFERENCES "cast_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
