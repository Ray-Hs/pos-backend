/*
  Warnings:

  - Added the required column `userId` to the `CompanyDebt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CompanyDebt" ADD COLUMN     "remainingAmount" INTEGER DEFAULT 0,
ADD COLUMN     "userId" INTEGER NOT NULL,
ALTER COLUMN "quantity" SET DEFAULT 1,
ALTER COLUMN "price" SET DEFAULT 0,
ALTER COLUMN "totalAmount" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "supply" ADD COLUMN     "note" TEXT DEFAULT '';

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "companyDebtId" INTEGER NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'IQD',
    "amount" INTEGER NOT NULL,
    "note" TEXT,
    "isLatestVersion" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CompanyDebt" ADD CONSTRAINT "CompanyDebt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_companyDebtId_fkey" FOREIGN KEY ("companyDebtId") REFERENCES "CompanyDebt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
