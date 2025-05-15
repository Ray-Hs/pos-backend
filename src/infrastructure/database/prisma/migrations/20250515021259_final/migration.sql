-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'PAY_LATER');

-- CreateEnum
CREATE TYPE "TableStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'RECEIPT');

-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('ADMIN', 'STAFF');

-- CreateTable
CREATE TABLE "Tax" (
    "id" SERIAL NOT NULL,
    "rate" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Tax_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" SERIAL NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "paymentMethod" "PaymentMethod",
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "taxId" INTEGER,
    "serviceId" INTEGER,
    "orderId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "tableId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

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
    "updatedAt" TIMESTAMP(3) NOT NULL,

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
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeletedOrderItem_pkey" PRIMARY KEY ("id")
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
    "company" TEXT,
    "code" TEXT,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Table" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 4,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "status" "TableStatus",
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
    "role" "ROLE" NOT NULL DEFAULT 'STAFF',
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Invoice_orderId_userId_tableId_idx" ON "Invoice"("orderId", "userId", "tableId");

-- CreateIndex
CREATE INDEX "Order_tableId_userId_idx" ON "Order"("tableId", "userId");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_menuItemId_quantity_idx" ON "OrderItem"("orderId", "menuItemId", "quantity");

-- CreateIndex
CREATE INDEX "DeletedOrderItem_orderId_menuItemId_quantity_idx" ON "DeletedOrderItem"("orderId", "menuItemId", "quantity");

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

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_taxId_fkey" FOREIGN KEY ("taxId") REFERENCES "Tax"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeletedOrderItem" ADD CONSTRAINT "DeletedOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeletedOrderItem" ADD CONSTRAINT "DeletedOrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubCategory" ADD CONSTRAINT "SubCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "SubCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;
