/*
  Warnings:

  - A unique constraint covering the columns `[customerDiscountId]` on the table `CustomerInfo` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CustomerInfo" ADD COLUMN     "customerDiscountId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "CustomerInfo_customerDiscountId_key" ON "CustomerInfo"("customerDiscountId");

-- AddForeignKey
ALTER TABLE "CustomerInfo" ADD CONSTRAINT "CustomerInfo_customerDiscountId_fkey" FOREIGN KEY ("customerDiscountId") REFERENCES "CustomerDiscount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
