-- CreateIndex
CREATE INDEX "Category_sortOrder_isActive_idx" ON "Category"("sortOrder", "isActive");

-- CreateIndex
CREATE INDEX "Invoice_orderId_userId_tableId_idx" ON "Invoice"("orderId", "userId", "tableId");

-- CreateIndex
CREATE INDEX "MenuItem_isActive_subCategoryId_idx" ON "MenuItem"("isActive", "subCategoryId");

-- CreateIndex
CREATE INDEX "Order_tableId_userId_status_idx" ON "Order"("tableId", "userId", "status");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_menuItemId_quantity_idx" ON "OrderItem"("orderId", "menuItemId", "quantity");

-- CreateIndex
CREATE INDEX "Section_sortOrder_available_idx" ON "Section"("sortOrder", "available");

-- CreateIndex
CREATE INDEX "SubCategory_isActive_categoryId_idx" ON "SubCategory"("isActive", "categoryId");

-- CreateIndex
CREATE INDEX "Table_sectionId_status_idx" ON "Table"("sectionId", "status");
