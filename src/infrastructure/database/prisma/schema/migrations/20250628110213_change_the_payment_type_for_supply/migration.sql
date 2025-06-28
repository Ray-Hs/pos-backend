/*
  Warnings:

  - The `paymentMethod` column on the `supply` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "supply" DROP COLUMN "paymentMethod",
ADD COLUMN     "paymentMethod" "SupplyPaymentMethod" NOT NULL DEFAULT 'CASH';
