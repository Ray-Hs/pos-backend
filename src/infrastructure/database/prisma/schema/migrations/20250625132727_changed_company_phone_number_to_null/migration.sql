-- DropIndex
DROP INDEX "CompanyInfo_phoneNumber_key";

-- AlterTable
ALTER TABLE "CompanyInfo" ALTER COLUMN "phoneNumber" DROP NOT NULL;
