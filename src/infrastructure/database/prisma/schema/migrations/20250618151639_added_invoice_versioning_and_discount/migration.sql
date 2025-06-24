/*
  Warnings:

  - You are about to alter the column `discount` on the `CustomerDiscount` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the column `updatedAt` on the `DeletedOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `discount` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `OrderItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `CompanyInfo` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `CustomerInfo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `invoiceId` to the `DeletedOrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reason` to the `DeletedOrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoiceRefId` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `version` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_orderId_fkey";

-- DropIndex
DROP INDEX "Invoice_orderId_userId_tableId_idx";

-- AlterTable
ALTER TABLE "CustomerDiscount" ALTER COLUMN "discount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "DeletedOrderItem" DROP COLUMN "updatedAt",
ADD COLUMN     "invoiceId" INTEGER NOT NULL,
ADD COLUMN     "reason" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "discount",
DROP COLUMN "orderId",
DROP COLUMN "updatedAt",
ADD COLUMN     "customerDiscountId" INTEGER,
ADD COLUMN     "invoiceRefId" INTEGER NOT NULL,
ADD COLUMN     "isLatestVersion" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "version" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "updatedAt";

-- CreateTable
CREATE TABLE "InvoiceRef" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderId" INTEGER,

    CONSTRAINT "InvoiceRef_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyInfo_code_key" ON "CompanyInfo"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerInfo_code_key" ON "CustomerInfo"("code");

-- CreateIndex
CREATE INDEX "Invoice_invoiceRefId_isLatestVersion_idx" ON "Invoice"("invoiceRefId", "isLatestVersion");

-- AddForeignKey
ALTER TABLE "InvoiceRef" ADD CONSTRAINT "InvoiceRef_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerDiscountId_fkey" FOREIGN KEY ("customerDiscountId") REFERENCES "CustomerDiscount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_invoiceRefId_fkey" FOREIGN KEY ("invoiceRefId") REFERENCES "InvoiceRef"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeletedOrderItem" ADD CONSTRAINT "DeletedOrderItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
