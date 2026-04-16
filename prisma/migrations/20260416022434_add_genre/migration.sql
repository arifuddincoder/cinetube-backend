-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('MOVIE', 'SERIES');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('NETFLIX', 'DISNEY_PLUS', 'HBO_MAX', 'AMAZON_PRIME', 'APPLE_TV', 'YOUTUBE', 'HULU', 'OTHER');

-- CreateEnum
CREATE TYPE "Pricing" AS ENUM ('FREE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'PUBLISHED', 'UNPUBLISHED');

-- CreateEnum
CREATE TYPE "PurchaseType" AS ENUM ('BUY', 'RENT', 'SUBSCRIPTION');

-- CreateEnum
CREATE TYPE "RentalDuration" AS ENUM ('HOURS_48', 'DAYS_7', 'DAYS_30');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('STRIPE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "SortOrder" AS ENUM ('LATEST', 'TOP_RATED', 'MOST_REVIEWED', 'MOST_LIKED');

-- CreateTable
CREATE TABLE "genres" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedTime" TIMESTAMP(3),

    CONSTRAINT "genres_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "genres_name_key" ON "genres"("name");

-- CreateIndex
CREATE INDEX "idx_genre_deleted" ON "genres"("isDeleted");

-- CreateIndex
CREATE INDEX "idx_genre_name" ON "genres"("name");
