import { PrismaClient, PaymentMethod, PaymentStatus } from "@prisma/client";
import { faker } from "@faker-js/faker";

// Configuration - Set your desired amount here
const ORDER_COUNT = 100000; // Change this constant to set the number of orders
const BATCH_SIZE = 1000; // Process in batches for better performance
const MAX_ITEMS_PER_ORDER = 16; // Maximum number of items per order
const MIN_ITEMS_PER_ORDER = 8; // Minimum number of items per order

const prisma = new PrismaClient();

// Generate order data
function generateOrderData(tableIds: number[], userIds: number[]) {
  return {
    tableId: faker.helpers.maybe(() => faker.helpers.arrayElement(tableIds), {
      probability: 0.7,
    }),
    userId: faker.helpers.arrayElement(userIds),
  };
}

// Generate order item data
function generateOrderItemData(orderId: number, menuItemIds: number[]) {
  const menuItemId = faker.helpers.arrayElement(menuItemIds);
  const quantity = faker.number.int({ min: 1, max: 5 });

  return {
    orderId: orderId,
    menuItemId: menuItemId,
    quantity: quantity,
    price: faker.number.float({ min: 5, max: 100, fractionDigits: 2 }),
    notes: faker.helpers.maybe(() => faker.lorem.sentence(), {
      probability: 0.3,
    }),
    sortOrder: faker.number.int({ min: 0, max: 100 }),
  };
}

// Generate invoice reference data
function generateInvoiceRefData(orderId: number) {
  return {
    orderId: orderId,
  };
}

// Generate invoice data
function generateInvoiceData(
  invoiceRefId: number,
  orderData: any,
  totalAmount: number
) {
  const subtotal = totalAmount;
  const total = subtotal; // No tax or service charge for simplicity

  return {
    invoiceRefId: invoiceRefId,
    version: 1,
    isLatestVersion: true,
    subtotal: subtotal,
    total: total,
    debt: faker.helpers.maybe(
      () => faker.number.float({ min: 0, max: total * 0.3, fractionDigits: 2 }),
      { probability: 0.2 }
    ),
    paymentMethod: faker.helpers.arrayElement([
      PaymentMethod.CASH,
      PaymentMethod.CARD,
      PaymentMethod.DEBT,
    ]),
    paid: faker.helpers.maybe(() => true, { probability: 0.8 }),
    status: faker.helpers.arrayElement([
      PaymentStatus.PAID,
      PaymentStatus.PARTIAL,
      PaymentStatus.PENDING,
    ]),
    userId: orderData.userId,
    tableId: orderData.tableId,
  };
}

// Get existing table IDs
async function getTableIds(): Promise<number[]> {
  try {
    const tables = await prisma.table.findMany({
      select: { id: true },
    });
    return tables.map((table) => table.id);
  } catch (error) {
    console.error("Error fetching table IDs:", error);
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

// Get existing menu item IDs with prices
async function getMenuItemIds(): Promise<{ id: number; price: number }[]> {
  try {
    const menuItems = await prisma.menuItem.findMany({
      where: { isActive: true },
      select: { id: true, price: true },
    });
    return menuItems;
  } catch (error) {
    console.error("Error fetching menu item IDs:", error);
    return [];
  }
}

// Seed orders and order items in batches
async function seedOrders() {
  console.log(`Starting to seed ${ORDER_COUNT} orders with random items...`);

  // Get existing IDs
  console.log("Fetching existing tables, users, and menu items...");
  const tableIds = await getTableIds();
  const userIds = await getUserIds();
  const menuItems = await getMenuItemIds();

  if (userIds.length === 0) {
    console.error("No users found in database. Please ensure users exist.");
    return;
  }

  if (menuItems.length === 0) {
    console.error(
      "No menu items found in database. Please ensure menu items exist."
    );
    return;
  }

  const menuItemIds = menuItems.map((item) => item.id);

  console.log(
    `Found ${tableIds.length} tables, ${userIds.length} users, and ${menuItems.length} menu items`
  );

  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;
  let totalItemsCreated = 0;

  try {
    // Process in batches
    for (let i = 0; i < ORDER_COUNT; i += BATCH_SIZE) {
      const batchSize = Math.min(BATCH_SIZE, ORDER_COUNT - i);
      console.log(
        `Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(
          ORDER_COUNT / BATCH_SIZE
        )}`
      );

      let batchSuccessCount = 0;

      // Process each order individually
      for (let j = 0; j < batchSize; j++) {
        try {
          // Create order
          const orderData = generateOrderData(tableIds, userIds);
          const order = await prisma.order.create({
            data: orderData as any,
          });

          // Generate random number of items for this order
          const itemCount = faker.number.int({
            min: MIN_ITEMS_PER_ORDER,
            max: MAX_ITEMS_PER_ORDER,
          });

          // Create order items
          const orderItems: any[] = [];
          let totalAmount = 0;

          for (let k = 0; k < itemCount; k++) {
            const menuItem = faker.helpers.arrayElement(menuItems);
            const quantity = faker.number.int({ min: 1, max: 5 });
            const itemTotal = menuItem.price * quantity;
            totalAmount += itemTotal;

            const orderItemData = {
              orderId: order.id,
              menuItemId: menuItem.id,
              quantity: quantity,
              price: menuItem.price, // Use actual menu item price
              notes: faker.helpers.maybe(() => faker.lorem.sentence(), {
                probability: 0.3,
              }),
              sortOrder: k,
            };
            orderItems.push(orderItemData);
          }

          // Insert all order items for this order
          for (const orderItemData of orderItems) {
            await prisma.orderItem.create({
              data: orderItemData as any,
            });
          }

          // Create invoice reference
          const invoiceRefData = generateInvoiceRefData(order.id);
          const invoiceRef = await prisma.invoiceRef.create({
            data: invoiceRefData as any,
          });

          // Create invoice
          const invoiceData = generateInvoiceData(
            invoiceRef.id,
            orderData,
            totalAmount
          );
          await prisma.invoice.create({
            data: invoiceData as any,
          });

          batchSuccessCount++;
          totalItemsCreated += itemCount;
        } catch (error: any) {
          console.error(`Error inserting order:`, error);
          errorCount++;
        }
      }

      successCount += batchSuccessCount;
      console.log(
        `Batch ${
          Math.floor(i / BATCH_SIZE) + 1
        }: Inserted ${batchSuccessCount} orders with items`
      );
    }

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log("\n=== Order Seeding Summary ===");
    console.log(`Total orders to seed: ${ORDER_COUNT}`);
    console.log(`Successfully inserted: ${successCount} orders`);
    console.log(`Total order items created: ${totalItemsCreated}`);
    console.log(`Total invoices created: ${successCount}`);
    console.log(
      `Average items per order: ${(totalItemsCreated / successCount).toFixed(
        2
      )}`
    );
    console.log(`Errors: ${errorCount}`);
    console.log(`Duration: ${duration.toFixed(2)} seconds`);
    console.log(
      `Average rate: ${(successCount / duration).toFixed(2)} orders/second`
    );
  } catch (error) {
    console.error("Error during seeding:", error);
  }
}

// Main function
async function main() {
  try {
    await seedOrders();
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

export { seedOrders, generateOrderData, generateOrderItemData };
