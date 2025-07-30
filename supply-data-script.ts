import { PrismaClient, SupplyPaymentMethod } from "@prisma/client";
import { faker } from "@faker-js/faker";

// Configuration - Set your desired amount here
const SUPPLY_COUNT = 500000; // Change this constant to set the number of purchased products
const BATCH_SIZE = 1000; // Process in batches for better performance

const prisma = new PrismaClient();

// Generate a unique invoice number
function generateInvoiceNumber(): string {
  return `INV-${faker.string.alphanumeric(8).toUpperCase()}`;
}

// Generate a unique barcode
function generateBarcode(): string {
  return faker.string.numeric(13);
}

// Generate supply/purchased product data
function generateSupplyData(companyIds: number[], userIds: number[]) {
  const packageQty = faker.number.int({ min: 1, max: 100 });
  const itemQty = faker.number.int({ min: 1, max: 50 });
  const packagePrice = faker.number.int({ min: 100, max: 10000 });
  const itemPrice = Math.floor(packagePrice / packageQty);
  const itemSellPrice =
    itemPrice * faker.number.float({ min: 1.1, max: 2.5, fractionDigits: 2 });
  const totalItems = packageQty * itemQty;
  const totalPrice = packagePrice * packageQty;

  const supplyData = {
    invoiceNO: generateInvoiceNumber(),
    companyId: faker.helpers.arrayElement(companyIds),
    paymentMethod: faker.helpers.arrayElement([
      SupplyPaymentMethod.CASH,
      SupplyPaymentMethod.CARD,
      SupplyPaymentMethod.DEBT,
    ]),
    barcode: faker.helpers.maybe(() => generateBarcode(), { probability: 0.7 }),
    name: faker.commerce.productName(),
    packageQty: packageQty,
    itemQty: itemQty,
    packagePrice: packagePrice,
    itemPrice: itemPrice,
    itemSellPrice: itemSellPrice,
    totalItems: totalItems,
    totalPrice: totalPrice,
    remainingQuantity: faker.helpers.maybe(
      () => faker.number.int({ min: 0, max: totalItems }),
      { probability: 0.8 }
    ),
  };

  // Add optional fields with probability
  if (faker.helpers.maybe(() => true, { probability: 0.6 })) {
    (supplyData as any).store = faker.company.name();
  }

  if (faker.helpers.maybe(() => true, { probability: 0.4 })) {
    (supplyData as any).note = faker.lorem.sentence();
  }

  if (faker.helpers.maybe(() => true, { probability: 0.8 })) {
    (supplyData as any).userId = faker.helpers.arrayElement(userIds);
  }

  if (faker.helpers.maybe(() => true, { probability: 0.7 })) {
    // Generate expiry date between now and 2 years from now
    const futureDate = new Date();
    futureDate.setFullYear(
      futureDate.getFullYear() + faker.number.int({ min: 0, max: 2 })
    );
    futureDate.setMonth(faker.number.int({ min: 0, max: 11 }));
    futureDate.setDate(faker.number.int({ min: 1, max: 28 }));
    (supplyData as any).expiryDate = futureDate;
  }

  return supplyData;
}

// Get existing company IDs
async function getCompanyIds(): Promise<number[]> {
  try {
    const companies = await prisma.companyInfo.findMany({
      select: { id: true },
    });
    return companies.map((company) => company.id);
  } catch (error) {
    console.error("Error fetching company IDs:", error);
    return [];
  }
}

// Get existing user IDs
async function getUserIds(): Promise<number[]> {
  try {
    const users = await prisma.user.findMany({
      select: { id: true },
    });
    return users.map((user) => user.id);
  } catch (error) {
    console.error("Error fetching user IDs:", error);
    return [];
  }
}

// Seed supply/purchased products in batches
async function seedSupply() {
  console.log(`Starting to seed ${SUPPLY_COUNT} purchased products...`);

  // Get existing company and user IDs
  console.log("Fetching existing companies and users...");
  const companyIds = await getCompanyIds();
  const userIds = await getUserIds();

  if (companyIds.length === 0) {
    console.error(
      "No companies found in database. Please seed companies first."
    );
    return;
  }

  if (userIds.length === 0) {
    console.warn(
      "No users found in database. Supply records will be created without user references."
    );
  }

  console.log(
    `Found ${companyIds.length} companies and ${userIds.length} users`
  );

  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;

  try {
    // Process in batches
    for (let i = 0; i < SUPPLY_COUNT; i += BATCH_SIZE) {
      const batchSize = Math.min(BATCH_SIZE, SUPPLY_COUNT - i);
      console.log(
        `Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(
          SUPPLY_COUNT / BATCH_SIZE
        )}`
      );

      let batchSuccessCount = 0;

      // Process each supply record individually
      for (let j = 0; j < batchSize; j++) {
        try {
          const supplyData = generateSupplyData(companyIds, userIds);
          await prisma.supply.create({
            data: supplyData as any,
          });
          batchSuccessCount++;
        } catch (error: any) {
          console.error(`Error inserting supply record:`, error);
          errorCount++;
        }
      }

      successCount += batchSuccessCount;
      console.log(
        `Batch ${
          Math.floor(i / BATCH_SIZE) + 1
        }: Inserted ${batchSuccessCount} supply records`
      );
    }

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log("\n=== Supply Seeding Summary ===");
    console.log(`Total supply records to seed: ${SUPPLY_COUNT}`);
    console.log(`Successfully inserted: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Duration: ${duration.toFixed(2)} seconds`);
    console.log(
      `Average rate: ${(successCount / duration).toFixed(2)} records/second`
    );
  } catch (error) {
    console.error("Error during seeding:", error);
  }
}

// Main function
async function main() {
  try {
    await seedSupply();
  } catch (error) {
    console.error("Error in main function:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { seedSupply, generateSupplyData };
