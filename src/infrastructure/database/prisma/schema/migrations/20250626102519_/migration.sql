/*
  Warnings:

  - You are about to drop the column `status` on the `Payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CompanyDebt" ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "status";
