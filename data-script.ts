import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

// Configuration
const CUSTOMER_COUNT = parseInt(process.env.CUSTOMER_COUNT || "100"); // Start with 100, can be increased to 1 million
const BATCH_SIZE = 1000; // Process in batches for better performance

const prisma = new PrismaClient();

// Generate a unique customer code
function generateCustomerCode(): string {
  return `CUST-${faker.string.alphanumeric(8).toUpperCase()}`;
}

// Generate a unique phone number
function generateUniquePhoneNumber(): string {
  return faker.phone.number();
}

// Generate customer data
function generateCustomerData() {
  const customerData = {
    code: generateCustomerCode(),
    name: faker.person.fullName(),
    phoneNumber: generateUniquePhoneNumber(),
  };

  // Add optional fields with probability
  if (faker.helpers.maybe(() => true, { probability: 0.7 })) {
    (customerData as any).email = faker.internet.email();
  }

  if (faker.helpers.maybe(() => true, { probability: 0.3 })) {
    (customerData as any).debt = faker.number.int({ min: 0, max: 10000 });
  }

  if (faker.helpers.maybe(() => true, { probability: 0.2 })) {
    (customerData as any).initialDebt = faker.number.int({ min: 0, max: 5000 });
  }

  if (faker.helpers.maybe(() => true, { probability: 0.4 })) {
    (customerData as any).note = faker.lorem.sentence();
  }

  return customerData;
}

// Seed customers in batches
async function seedCustomers() {
  console.log(`Starting to seed ${CUSTOMER_COUNT} customers...`);

  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;

  try {
    // Process in batches
    for (let i = 0; i < CUSTOMER_COUNT; i += BATCH_SIZE) {
      const batchSize = Math.min(BATCH_SIZE, CUSTOMER_COUNT - i);
      console.log(
        `Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(
          CUSTOMER_COUNT / BATCH_SIZE
        )}`
      );

      let batchSuccessCount = 0;

      // Process each customer individually
      for (let j = 0; j < batchSize; j++) {
        try {
          const customerData = generateCustomerData();
          await prisma.customerInfo.create({
            data: customerData as any,
          });
          batchSuccessCount++;
        } catch (error: any) {
          // Skip if phone number already exists
          if (error.code === "P2002") {
            console.log(`Skipped duplicate phone number`);
          } else {
            console.error(`Error inserting customer:`, error);
            errorCount++;
          }
        }
      }

      successCount += batchSuccessCount;
      console.log(
        `Batch ${
          Math.floor(i / BATCH_SIZE) + 1
        }: Inserted ${batchSuccessCount} customers`
      );
    }

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log("\n=== Seeding Summary ===");
    console.log(`Total customers to seed: ${CUSTOMER_COUNT}`);
    console.log(`Successfully inserted: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Duration: ${duration.toFixed(2)} seconds`);
    console.log(
      `Average rate: ${(successCount / duration).toFixed(2)} customers/second`
    );
  } catch (error) {
    console.error("Error during seeding:", error);
  }
}

// Main function
async function main() {
  try {
    await seedCustomers();
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

export { seedCustomers, generateCustomerData };
