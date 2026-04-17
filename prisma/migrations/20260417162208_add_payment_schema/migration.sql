-- CreateTable আগে
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "movieId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'BDT',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT,
    "gateway" "PaymentGateway" NOT NULL DEFAULT 'STRIPE',
    "purchaseType" "PurchaseType" NOT NULL,
    "planType" "PlanType",
    "rentalDuration" "RentalDuration",
    "rentExpiresAt" TIMESTAMP(3),
    "subscriptionEndsAt" TIMESTAMP(3),
    "stripeEventId" TEXT,
    "stripeSessionId" TEXT,
    "stripeCustomerId" TEXT,
    "subscriptionId" TEXT,
    "invoiceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- AlterEnum পরে
BEGIN;
CREATE TYPE "RentalDuration_new" AS ENUM ('DAYS_1', 'DAYS_7');

-- default drop করো আগে
ALTER TABLE "movies" ALTER COLUMN "rentDuration" DROP DEFAULT;
ALTER TABLE "payments" ALTER COLUMN "rentalDuration" DROP DEFAULT;

-- type change করো
ALTER TABLE "payments" ALTER COLUMN "rentalDuration" TYPE "RentalDuration_new" USING ("rentalDuration"::text::"RentalDuration_new");
ALTER TABLE "movies" ALTER COLUMN "rentDuration" TYPE "RentalDuration_new" USING ("rentDuration"::text::"RentalDuration_new");

ALTER TYPE "RentalDuration" RENAME TO "RentalDuration_old";
ALTER TYPE "RentalDuration_new" RENAME TO "RentalDuration";
DROP TYPE "public"."RentalDuration_old";

-- default আবার set করো
ALTER TABLE "movies" ALTER COLUMN "rentDuration" SET DEFAULT 'DAYS_7';

COMMIT;

-- CreateIndex
CREATE UNIQUE INDEX "payments_transactionId_key" ON "payments"("transactionId");
CREATE UNIQUE INDEX "payments_stripeEventId_key" ON "payments"("stripeEventId");
CREATE UNIQUE INDEX "payments_stripeSessionId_key" ON "payments"("stripeSessionId");
CREATE INDEX "idx_transaction_id" ON "payments"("transactionId");
CREATE INDEX "idx_payment_user" ON "payments"("userId");
CREATE INDEX "idx_payment_status" ON "payments"("status");
CREATE INDEX "idx_payment_purchase_type" ON "payments"("purchaseType");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movies"("id") ON DELETE SET NULL ON UPDATE CASCADE;