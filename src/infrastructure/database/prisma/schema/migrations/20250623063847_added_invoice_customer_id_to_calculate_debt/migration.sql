-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "customerInfoId" INTEGER;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerInfoId_fkey" FOREIGN KEY ("customerInfoId") REFERENCES "CustomerInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
