-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'PARTIAL', 'PENDING');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'DEBT', 'RECEIPT', 'SPLIT');

-- CreateEnum
CREATE TYPE "PrintStatus" AS ENUM ('PENDING', 'PRINTING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PrintType" AS ENUM ('NEW_ORDER', 'ORDER_UPDATE', 'ORDER_CANCELLATION');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('IQD', 'USD');

-- CreateEnum
CREATE TYPE "SupplyPaymentMethod" AS ENUM ('CASH', 'CARD', 'DEBT');

-- CreateEnum
CREATE TYPE "TableStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'RECEIPT', 'SPLIT');

-- CreateTable
CREATE TABLE "Tax" (
    "id" SERIAL NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Tax_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyDebt" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "product" TEXT NOT NULL,
    "invoiceNumber" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" INTEGER DEFAULT 0,
    "remainingAmount" INTEGER DEFAULT 0,
    "userId" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "currency" "Currency" NOT NULL DEFAULT 'IQD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyDebt_pkey" PRIMARY KEY ("id")
);

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
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerPayment" (
    "id" SERIAL NOT NULL,
    "customerInfoId" INTEGER NOT NULL,
    "invoiceId" INTEGER,
    "invoiceNumber" TEXT,
    "amount" INTEGER NOT NULL,
    "note" TEXT,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" SERIAL NOT NULL,
    "rate" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "exchangeDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceRef" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderId" INTEGER,

    CONSTRAINT "InvoiceRef_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" SERIAL NOT NULL,
    "invoiceRefId" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "isLatestVersion" BOOLEAN NOT NULL DEFAULT true,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "debt" DOUBLE PRECISION DEFAULT 0,
    "paymentMethod" "PaymentMethod",
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "taxId" INTEGER,
    "serviceId" INTEGER,
    "userId" INTEGER NOT NULL,
    "tableId" INTEGER,
    "customerDiscountId" INTEGER,
    "customerInfoId" INTEGER,
    "discount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "tableId" INTEGER,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "menuItemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeletedOrderItem" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "menuItemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "reason" TEXT NOT NULL,
    "invoiceId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeletedOrderItem_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Settings" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branding" (
    "id" SERIAL NOT NULL,
    "restaurantName" TEXT,
    "address" TEXT,
    "phoneNumber" TEXT,
    "email" TEXT,
    "website" TEXT,
    "restaurantLogo" TEXT,
    "receiptHeader" TEXT,
    "receiptFooter" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "settingsId" INTEGER NOT NULL,

    CONSTRAINT "Branding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Printers" (
    "id" SERIAL NOT NULL,
    "ip" TEXT NOT NULL DEFAULT '0.0.0.0',
    "name" TEXT NOT NULL DEFAULT 'New Printer',
    "description" TEXT,
    "settingsId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Printers_pkey" PRIMARY KEY ("id")
);

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
    "initialDebt" INTEGER DEFAULT 0,
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
    "phoneNumber" TEXT,
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
    "phoneNumber" TEXT,
    "discount" INTEGER NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "CRMId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerInfoId" INTEGER,

    CONSTRAINT "CustomerDiscount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_ku" TEXT NOT NULL,
    "title_ar" TEXT NOT NULL,
    "description_en" TEXT NOT NULL DEFAULT '',
    "description_ku" TEXT NOT NULL DEFAULT '',
    "description_ar" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubCategory" (
    "id" SERIAL NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_ku" TEXT NOT NULL,
    "title_ar" TEXT NOT NULL,
    "description_en" TEXT NOT NULL DEFAULT '',
    "description_ku" TEXT NOT NULL DEFAULT '',
    "description_ar" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,
    "categoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" SERIAL NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_ku" TEXT NOT NULL,
    "title_ar" TEXT NOT NULL,
    "description_en" TEXT NOT NULL DEFAULT '',
    "description_ku" TEXT NOT NULL DEFAULT '',
    "description_ar" TEXT NOT NULL DEFAULT '',
    "subCategoryId" INTEGER,
    "price" DOUBLE PRECISION NOT NULL,
    "code" TEXT DEFAULT '',
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "printersId" INTEGER,
    "companyId" INTEGER,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supply" (
    "id" SERIAL NOT NULL,
    "invoiceNO" TEXT,
    "companyId" INTEGER NOT NULL,
    "paymentMethod" "SupplyPaymentMethod" NOT NULL DEFAULT 'CASH',
    "barcode" TEXT,
    "name" TEXT NOT NULL,
    "packageQty" INTEGER NOT NULL,
    "itemQty" INTEGER NOT NULL,
    "packagePrice" INTEGER NOT NULL,
    "itemPrice" INTEGER NOT NULL,
    "itemSellPrice" DOUBLE PRECISION NOT NULL,
    "totalItems" INTEGER,
    "totalPrice" DOUBLE PRECISION,
    "store" TEXT,
    "note" TEXT DEFAULT '',
    "remainingQuantity" INTEGER DEFAULT 0,
    "userId" INTEGER,
    "expiryDate" TIMESTAMP(3),
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Table" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 4,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "status" "TableStatus" DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sectionId" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'New Section',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "available" INTEGER,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL DEFAULT 'Staff',
    "password" TEXT NOT NULL,
    "roleId" INTEGER,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "settingsId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PermissionToUserRole" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PermissionToUserRole_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "CompanyDebt_id_invoiceNumber_idx" ON "CompanyDebt"("id", "invoiceNumber");

-- CreateIndex
CREATE INDEX "CustomerPayment_customerInfoId_invoiceId_idx" ON "CustomerPayment"("customerInfoId", "invoiceId");

-- CreateIndex
CREATE INDEX "Invoice_invoiceRefId_isLatestVersion_idx" ON "Invoice"("invoiceRefId", "isLatestVersion");

-- CreateIndex
CREATE INDEX "Order_tableId_userId_idx" ON "Order"("tableId", "userId");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_menuItemId_quantity_idx" ON "OrderItem"("orderId", "menuItemId", "quantity");

-- CreateIndex
CREATE INDEX "DeletedOrderItem_orderId_menuItemId_quantity_idx" ON "DeletedOrderItem"("orderId", "menuItemId", "quantity");

-- CreateIndex
CREATE INDEX "OrderPrintQueue_orderId_printerId_idx" ON "OrderPrintQueue"("orderId", "printerId");

-- CreateIndex
CREATE INDEX "OrderPrintQueue_status_createdAt_idx" ON "OrderPrintQueue"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Branding_settingsId_key" ON "Branding"("settingsId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerInfo_code_key" ON "CustomerInfo"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerInfo_phoneNumber_key" ON "CustomerInfo"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyInfo_code_key" ON "CompanyInfo"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerDiscount_phoneNumber_key" ON "CustomerDiscount"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerDiscount_customerInfoId_key" ON "CustomerDiscount"("customerInfoId");

-- CreateIndex
CREATE INDEX "Category_sortOrder_isActive_idx" ON "Category"("sortOrder", "isActive");

-- CreateIndex
CREATE INDEX "SubCategory_isActive_categoryId_idx" ON "SubCategory"("isActive", "categoryId");

-- CreateIndex
CREATE INDEX "MenuItem_isActive_subCategoryId_idx" ON "MenuItem"("isActive", "subCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Table_name_key" ON "Table"("name");

-- CreateIndex
CREATE INDEX "Table_sectionId_status_sortOrder_idx" ON "Table"("sectionId", "status", "sortOrder");

-- CreateIndex
CREATE INDEX "Section_sortOrder_available_idx" ON "Section"("sortOrder", "available");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_name_key" ON "UserRole"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");

-- CreateIndex
CREATE INDEX "_PermissionToUserRole_B_index" ON "_PermissionToUserRole"("B");

-- AddForeignKey
ALTER TABLE "CompanyDebt" ADD CONSTRAINT "CompanyDebt_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "CompanyInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyDebt" ADD CONSTRAINT "CompanyDebt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_companyDebtId_fkey" FOREIGN KEY ("companyDebtId") REFERENCES "CompanyDebt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPayment" ADD CONSTRAINT "CustomerPayment_customerInfoId_fkey" FOREIGN KEY ("customerInfoId") REFERENCES "CustomerInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPayment" ADD CONSTRAINT "CustomerPayment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeRate" ADD CONSTRAINT "ExchangeRate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceRef" ADD CONSTRAINT "InvoiceRef_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerInfoId_fkey" FOREIGN KEY ("customerInfoId") REFERENCES "CustomerInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerDiscountId_fkey" FOREIGN KEY ("customerDiscountId") REFERENCES "CustomerDiscount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_taxId_fkey" FOREIGN KEY ("taxId") REFERENCES "Tax"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_invoiceRefId_fkey" FOREIGN KEY ("invoiceRefId") REFERENCES "InvoiceRef"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeletedOrderItem" ADD CONSTRAINT "DeletedOrderItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeletedOrderItem" ADD CONSTRAINT "DeletedOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeletedOrderItem" ADD CONSTRAINT "DeletedOrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branding" ADD CONSTRAINT "Branding_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "Settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Printers" ADD CONSTRAINT "Printers_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "Settings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerInfo" ADD CONSTRAINT "CustomerInfo_CRMId_fkey" FOREIGN KEY ("CRMId") REFERENCES "CRM"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyInfo" ADD CONSTRAINT "CompanyInfo_CRMId_fkey" FOREIGN KEY ("CRMId") REFERENCES "CRM"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDiscount" ADD CONSTRAINT "CustomerDiscount_CRMId_fkey" FOREIGN KEY ("CRMId") REFERENCES "CRM"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDiscount" ADD CONSTRAINT "CustomerDiscount_customerInfoId_fkey" FOREIGN KEY ("customerInfoId") REFERENCES "CustomerInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubCategory" ADD CONSTRAINT "SubCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "SubCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "CompanyInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_printersId_fkey" FOREIGN KEY ("printersId") REFERENCES "Printers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply" ADD CONSTRAINT "supply_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "CompanyInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply" ADD CONSTRAINT "supply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "UserRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "Settings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToUserRole" ADD CONSTRAINT "_PermissionToUserRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToUserRole" ADD CONSTRAINT "_PermissionToUserRole_B_fkey" FOREIGN KEY ("B") REFERENCES "UserRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;
