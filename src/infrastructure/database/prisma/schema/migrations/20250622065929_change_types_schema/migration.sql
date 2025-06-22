/*
  Warnings:

  - The values [PAY_LATER] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `item_price` on the `supply` table. All the data in the column will be lost.
  - You are about to drop the column `item_qty` on the `supply` table. All the data in the column will be lost.
  - You are about to drop the column `item_sell_price` on the `supply` table. All the data in the column will be lost.
  - You are about to drop the column `item_type` on the `supply` table. All the data in the column will be lost.
  - You are about to drop the column `package_price` on the `supply` table. All the data in the column will be lost.
  - You are about to drop the column `package_qty` on the `supply` table. All the data in the column will be lost.
  - You are about to drop the column `total_items` on the `supply` table. All the data in the column will be lost.
  - You are about to drop the column `total_price` on the `supply` table. All the data in the column will be lost.
  - Added the required column `itemPrice` to the `supply` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemQty` to the `supply` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemSellPrice` to the `supply` table without a default value. This is not possible if the table is not empty.
  - Added the required column `packagePrice` to the `supply` table without a default value. This is not possible if the table is not empty.
  - Added the required column `packageQty` to the `supply` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('CASH', 'CARD', 'DEBT');
ALTER TABLE "supply" ALTER COLUMN "paymentMethod" DROP DEFAULT;
ALTER TABLE "Invoice" ALTER COLUMN "paymentMethod" TYPE "PaymentMethod_new" USING ("paymentMethod"::text::"PaymentMethod_new");
ALTER TABLE "supply" ALTER COLUMN "paymentMethod" TYPE "PaymentMethod_new" USING ("paymentMethod"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "PaymentMethod_old";
ALTER TABLE "supply" ALTER COLUMN "paymentMethod" SET DEFAULT 'CASH';
COMMIT;

-- AlterTable
ALTER TABLE "CustomerDiscount" ALTER COLUMN "phoneNumber" DROP NOT NULL;

-- AlterTable
ALTER TABLE "supply" DROP COLUMN "item_price",
DROP COLUMN "item_qty",
DROP COLUMN "item_sell_price",
DROP COLUMN "item_type",
DROP COLUMN "package_price",
DROP COLUMN "package_qty",
DROP COLUMN "total_items",
DROP COLUMN "total_price",
ADD COLUMN     "invoiceNO" TEXT,
ADD COLUMN     "itemPrice" INTEGER NOT NULL,
ADD COLUMN     "itemQty" INTEGER NOT NULL,
ADD COLUMN     "itemSellPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "packagePrice" INTEGER NOT NULL,
ADD COLUMN     "packageQty" INTEGER NOT NULL,
ADD COLUMN     "totalItems" INTEGER,
ADD COLUMN     "totalPrice" DOUBLE PRECISION;
