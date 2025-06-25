/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Table" DROP CONSTRAINT "Table_sectionId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;
