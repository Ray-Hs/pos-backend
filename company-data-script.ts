import { PrismaClient, Currency } from "@prisma/client";
import { faker } from "@faker-js/faker";

// Configuration - Set your desired amount here
const COMPANY_COUNT = 900; // Change this constant to set the number of companies
const BATCH_SIZE = 100; // Process in batches for better performance

const prisma = new PrismaClient();

// Generate a unique company code
function generateCompanyCode(): string {
  return `COMP-${faker.string.alphanumeric(8).toUpperCase()}`;
}

// Generate company data
function generateCompanyData() {
  const companyData = {
    code: generateCompanyCode(),
    name: faker.company.name(),
    currency: faker.helpers.arrayElement([Currency.IQD, Currency.USD]),
  };

  // Add optional fields with probability
  if (faker.helpers.maybe(() => true, { probability: 0.8 })) {
    (companyData as any).phoneNumber = faker.phone.number();
  }

  if (faker.helpers.maybe(() => true, { probability: 0.9 })) {
    (companyData as any).email = faker.internet.email();
  }

  if (faker.helpers.maybe(() => true, { probability: 0.6 })) {
    (companyData as any).note = faker.lorem.sentence();
  }

  return companyData;
}

// Seed companies in batches
async function seedCompanies() {
  console.log(`Starting to seed ${COMPANY_COUNT} companies...`);

  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;

  try {
    // Process in batches
    for (let i = 0; i < COMPANY_COUNT; i += BATCH_SIZE) {
      const batchSize = Math.min(BATCH_SIZE, COMPANY_COUNT - i);
      console.log(
        `Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(
          COMPANY_COUNT / BATCH_SIZE
        )}`
      );

      let batchSuccessCount = 0;

      // Process each company individually
      for (let j = 0; j < batchSize; j++) {
        try {
          const companyData = generateCompanyData();
          await prisma.companyInfo.create({
            data: companyData as any,
          });
          batchSuccessCount++;
        } catch (error: any) {
          // Skip if company code already exists
          if (error.code === "P2002") {
            console.log(`Skipped duplicate company code`);
          } else {
            console.error(`Error inserting company:`, error);
            errorCount++;
          }
        }
      }

      successCount += batchSuccessCount;
      console.log(
        `Batch ${
          Math.floor(i / BATCH_SIZE) + 1
        }: Inserted ${batchSuccessCount} companies`
      );
    }

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log("\n=== Company Seeding Summary ===");
    console.log(`Total companies to seed: ${COMPANY_COUNT}`);
    console.log(`Successfully inserted: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Duration: ${duration.toFixed(2)} seconds`);
    console.log(
      `Average rate: ${(successCount / duration).toFixed(2)} companies/second`
    );
  } catch (error) {
    console.error("Error during seeding:", error);
  }
}

// Main function
async function main() {
  try {
    await seedCompanies();
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

export { seedCompanies, generateCompanyData };
