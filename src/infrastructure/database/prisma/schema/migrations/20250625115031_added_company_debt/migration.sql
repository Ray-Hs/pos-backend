-- CreateTable
CREATE TABLE "CompanyDebt" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "product" TEXT NOT NULL,
    "invoiceNumber" TEXT,
    "quantity" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "totalAmount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyDebt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyDebt_id_invoiceNumber_idx" ON "CompanyDebt"("id", "invoiceNumber");

-- AddForeignKey
ALTER TABLE "CompanyDebt" ADD CONSTRAINT "CompanyDebt_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "CompanyInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
