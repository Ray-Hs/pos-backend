/*
  Warnings:

  - You are about to drop the column `company` on the `MenuItem` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Printers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Roles` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('IQD', 'USD');

-- DropForeignKey
ALTER TABLE "Printers" DROP CONSTRAINT "Printers_settingsId_fkey";

-- AlterTable
ALTER TABLE "MenuItem" DROP COLUMN "company",
ADD COLUMN     "companyId" INTEGER;

-- AlterTable
ALTER TABLE "Printers" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "settingsId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Roles" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "CRM" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "CRM_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerInfo" (
    "id" SERIAL NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT,
    "debt" INTEGER,
    "note" TEXT,
    "CRMId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyInfo" (
    "id" SERIAL NOT NULL,
    "code" TEXT,
    "currency" "Currency",
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT,
    "note" TEXT,
    "CRMId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerDiscount" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "CRMId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerDiscount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supply" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH',
    "barcode" TEXT,
    "name" TEXT NOT NULL,
    "package_qty" INTEGER NOT NULL,
    "item_qty" INTEGER NOT NULL,
    "item_type" TEXT NOT NULL,
    "package_price" INTEGER NOT NULL,
    "item_price" INTEGER NOT NULL,
    "item_sell_price" DOUBLE PRECISION NOT NULL,
    "total_items" INTEGER,
    "total_price" DOUBLE PRECISION,
    "store" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerInfo_phoneNumber_key" ON "CustomerInfo"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyInfo_phoneNumber_key" ON "CompanyInfo"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerDiscount_phoneNumber_key" ON "CustomerDiscount"("phoneNumber");

-- AddForeignKey
ALTER TABLE "Printers" ADD CONSTRAINT "Printers_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "Settings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerInfo" ADD CONSTRAINT "CustomerInfo_CRMId_fkey" FOREIGN KEY ("CRMId") REFERENCES "CRM"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyInfo" ADD CONSTRAINT "CompanyInfo_CRMId_fkey" FOREIGN KEY ("CRMId") REFERENCES "CRM"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDiscount" ADD CONSTRAINT "CustomerDiscount_CRMId_fkey" FOREIGN KEY ("CRMId") REFERENCES "CRM"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "CompanyInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply" ADD CONSTRAINT "supply_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "CompanyInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
