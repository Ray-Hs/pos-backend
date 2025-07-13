-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING';
