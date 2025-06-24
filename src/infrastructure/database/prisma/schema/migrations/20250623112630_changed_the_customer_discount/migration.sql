/*
  Warnings:

  - You are about to drop the column `customerDiscountId` on the `CustomerInfo` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[customerInfoId]` on the table `CustomerDiscount` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "CustomerInfo" DROP CONSTRAINT "CustomerInfo_customerDiscountId_fkey";

-- DropIndex
DROP INDEX "CustomerInfo_customerDiscountId_key";

-- AlterTable
ALTER TABLE "CustomerDiscount" ADD COLUMN     "customerInfoId" INTEGER;

-- AlterTable
ALTER TABLE "CustomerInfo" DROP COLUMN "customerDiscountId";

-- CreateIndex
CREATE UNIQUE INDEX "CustomerDiscount_customerInfoId_key" ON "CustomerDiscount"("customerInfoId");

-- AddForeignKey
ALTER TABLE "CustomerDiscount" ADD CONSTRAINT "CustomerDiscount_customerInfoId_fkey" FOREIGN KEY ("customerInfoId") REFERENCES "CustomerInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
