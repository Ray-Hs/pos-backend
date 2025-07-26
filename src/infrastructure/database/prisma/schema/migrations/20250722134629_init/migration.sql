/*
  Warnings:

  - You are about to drop the column `isInitialOrder` on the `Order` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PrintStatus" AS ENUM ('PENDING', 'PRINTING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PrintType" AS ENUM ('NEW_ORDER', 'ORDER_UPDATE', 'ORDER_CANCELLATION');

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "isInitialOrder";

-- CreateTable
CREATE TABLE "OrderPrintQueue" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "printerId" INTEGER NOT NULL,
    "printerIp" TEXT NOT NULL,
    "status" "PrintStatus" NOT NULL DEFAULT 'PENDING',
    "printType" "PrintType" NOT NULL DEFAULT 'ORDER_UPDATE',
    "addedItems" JSONB,
    "deletedItems" JSONB,
    "updatedItems" JSONB,
    "tableName" TEXT,
    "userName" TEXT,
    "orderNumber" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "printedAt" TIMESTAMP(3),

    CONSTRAINT "OrderPrintQueue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderPrintQueue_orderId_printerId_idx" ON "OrderPrintQueue"("orderId", "printerId");

-- CreateIndex
CREATE INDEX "OrderPrintQueue_status_createdAt_idx" ON "OrderPrintQueue"("status", "createdAt");
