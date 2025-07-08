-- DropForeignKey
ALTER TABLE "CustomerPayment" DROP CONSTRAINT "CustomerPayment_invoiceId_fkey";

-- AlterTable
ALTER TABLE "CustomerPayment" ALTER COLUMN "invoiceId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "CustomerPayment" ADD CONSTRAINT "CustomerPayment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
