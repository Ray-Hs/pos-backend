-- AlterTable
ALTER TABLE "supply" ADD COLUMN     "remainingQuantity" INTEGER DEFAULT 0,
ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "supply" ADD CONSTRAINT "supply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
