-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "sortOrder" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."MenuItem"
  ADD COLUMN "code"        text      NULL,
  ADD COLUMN "sortOrder"   integer   NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Section" ALTER COLUMN "sortOrder" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SubCategory" ALTER COLUMN "sortOrder" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Table" ADD COLUMN     "sortOrder" INTEGER DEFAULT 0;
