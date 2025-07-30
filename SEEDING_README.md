# Database Seeding Scripts

This project includes powerful data seeding scripts that use Faker.js to generate realistic data for testing and development purposes. We have scripts for customers, companies, purchased products (supply), and orders with order items.

## Features

- **Scalable**: Can seed from 100 to 1 million+ records
- **Realistic Data**: Uses Faker.js to generate realistic information
- **Batch Processing**: Processes data in batches for optimal performance
- **Error Handling**: Gracefully handles duplicate entries and other errors
- **Progress Tracking**: Shows real-time progress and performance metrics
- **Configurable**: Easy to modify record count and data generation rules
- **Relationship Support**: Properly handles foreign key relationships

## Data Generated

### Customer Data

The customer script generates the following information:

- **Code**: Unique customer code (format: `CUST-XXXXXXXX`)
- **Name**: Full name using Faker.js
- **Phone Number**: Unique phone number (required field)
- **Email**: Email address (70% probability)
- **Debt**: Current debt amount (30% probability, 0-10,000)
- **Initial Debt**: Initial debt amount (20% probability, 0-5,000)
- **Note**: Customer notes (40% probability)

### Company Data

The company script generates the following information:

- **Code**: Unique company code (format: `COMP-XXXXXXXX`)
- **Name**: Company name using Faker.js
- **Currency**: Randomly selected (IQD or USD)
- **Phone Number**: Phone number (80% probability)
- **Email**: Email address (90% probability)
- **Note**: Company notes (60% probability)

### Supply/Purchased Products Data

The supply script generates the following information:

- **Invoice Number**: Unique invoice number (format: `INV-XXXXXXXX`)
- **Company ID**: References existing company
- **Payment Method**: Randomly selected (CASH, CARD, DEBT)
- **Barcode**: 13-digit barcode (70% probability)
- **Name**: Product name using Faker.js
- **Package Quantity**: Number of items per package (1-100)
- **Item Quantity**: Number of packages (1-50)
- **Package Price**: Price per package (100-10,000)
- **Item Price**: Calculated price per item
- **Item Sell Price**: Calculated selling price with markup
- **Total Items**: Calculated total items
- **Total Price**: Calculated total price
- **Remaining Quantity**: Remaining stock (80% probability)
- **Store**: Store name (60% probability)
- **Note**: Product notes (40% probability)
- **User ID**: References existing user (80% probability)
- **Expiry Date**: Future expiry date (70% probability)

### Order and Order Items Data

The orders script generates the following information:

- **Order**: References existing table (70% probability) and user
- **Order Items**: 1-8 items per order with:
  - **Menu Item ID**: References existing active menu items
  - **Quantity**: Random quantity (1-5)
  - **Price**: Uses actual menu item price
  - **Notes**: Order item notes (30% probability)
  - **Sort Order**: Sequential ordering within the order
- **Invoice Reference**: Links order to invoice system
- **Invoice**: Complete invoice with:
  - **Subtotal/Total**: Calculated from order items
  - **Payment Method**: Randomly selected (CASH, CARD, DEBT)
  - **Payment Status**: Randomly selected (PAID, PARTIAL, PENDING)
  - **Debt Amount**: Random debt (20% probability)
  - **Paid Status**: 80% probability of being paid

## Usage

### Basic Usage

```bash
# Seed customers
npm run seed:customers          # 100 customers (default)
npm run seed:customers:100      # 100 customers
npm run seed:customers:1000     # 1,000 customers
npm run seed:customers:10000    # 10,000 customers
npm run seed:customers:100000   # 100,000 customers
npm run seed:customers:1000000  # 1,000,000 customers

# Seed companies
npm run seed:companies          # 900 companies (configurable in script)

# Seed purchased products (supply)
npm run seed:supply             # 200 supply records (configurable in script)

# Seed orders and order items
npm run seed:orders             # 1000 orders with items (configurable in script)
```

### Custom Configuration

You can modify the scripts to change:

1. **Customer Count**: Edit the `CUSTOMER_COUNT` constant in `data-script.ts` or use environment variables
2. **Company Count**: Edit the `COMPANY_COUNT` constant in `company-data-script.ts`
3. **Supply Count**: Edit the `SUPPLY_COUNT` constant in `supply-data-script.ts`
4. **Order Count**: Edit the `ORDER_COUNT` constant in `order-data-script.ts`
5. **Items Per Order**: Edit `MIN_ITEMS_PER_ORDER` and `MAX_ITEMS_PER_ORDER` constants
6. **Batch Size**: Edit the `BATCH_SIZE` constant in each script
7. **Data Generation Rules**: Modify the respective generation functions

### Performance

Based on testing:

- **100 customers**: ~0.24 seconds (413 customers/second)
- **1,000 customers**: ~0.64 seconds (1,562 customers/second)
- **10,000 customers**: ~5.59 seconds (1,788 customers/second)
- **900 companies**: ~0.5 seconds (1,800 companies/second)
- **200 supply records**: ~2.0 seconds (100 records/second) - includes relationship lookups
- **1,000 orders**: ~3.0 seconds (333 orders/second) - includes order items creation

## Script Structure

```
data-script.ts (Customers)
├── Configuration
│   ├── CUSTOMER_COUNT (environment variable or default 100)
│   └── BATCH_SIZE (1000 for optimal performance)
├── Data Generation Functions
│   ├── generateCustomerCode()
│   ├── generateUniquePhoneNumber()
│   └── generateCustomerData()
├── Main Seeding Function
│   └── seedCustomers()
└── Utility Functions
    └── main()

company-data-script.ts (Companies)
├── Configuration
│   ├── COMPANY_COUNT (constant, default 900)
│   └── BATCH_SIZE (100 for optimal performance)
├── Data Generation Functions
│   ├── generateCompanyCode()
│   └── generateCompanyData()
├── Main Seeding Function
│   └── seedCompanies()
└── Utility Functions
    └── main()

supply-data-script.ts (Purchased Products)
├── Configuration
│   ├── SUPPLY_COUNT (constant, default 200)
│   └── BATCH_SIZE (50 for optimal performance)
├── Data Generation Functions
│   ├── generateInvoiceNumber()
│   ├── generateBarcode()
│   └── generateSupplyData()
├── Relationship Functions
│   ├── getCompanyIds()
│   └── getUserIds()
├── Main Seeding Function
│   └── seedSupply()
└── Utility Functions
    └── main()
```

## Environment Variables

- `CUSTOMER_COUNT`: Number of customers to seed (default: 100)

## Dependencies

### Supply Script Dependencies

The supply script requires existing companies and users in the database:

- **Companies**: Must be seeded first using `npm run seed:companies`
- **Users**: Should exist in the database (can be created manually or via other scripts)

## Error Handling

The scripts handle:

- **Duplicate Phone Numbers/Codes**: Skips and logs the duplicate
- **Database Connection Issues**: Graceful error handling
- **Batch Processing Errors**: Continues with remaining batches
- **Missing Dependencies**: Supply script checks for required companies and users
- **Foreign Key Constraints**: Properly handles relationship requirements

## Output

The script provides detailed output including:

- Progress updates for each batch
- Summary statistics
- Performance metrics
- Error counts

Example output:

```
Starting to seed 10000 customers...
Processing batch 1 of 10
Batch 1: Inserted 1000 customers
...
=== Seeding Summary ===
Total customers to seed: 10000
Successfully inserted: 10000
Errors: 0
Duration: 5.59 seconds
Average rate: 1788.27 customers/second
```

## Prerequisites

- Node.js and npm installed
- Prisma client generated (`npx prisma generate`)
- Database connection configured
- Faker.js installed (`@faker-js/faker`)

## Future Enhancements

- Support for seeding other entities (orders, invoices, etc.)
- More realistic data patterns based on business rules
- Data validation and cleanup options
- Export/import functionality for generated data
