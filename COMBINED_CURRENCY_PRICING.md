# Combined Currency Pricing System

This system provides combined IQD and USD pricing for companies, including both selling and buying prices with automatic currency conversion based on the latest exchange rates.

## Features

- **Dual Currency Support**: Both IQD and USD prices for selling and buying
- **Automatic Conversion**: Uses latest exchange rates for currency conversion
- **Real-time Pricing**: Gets latest prices from MenuItem (selling) and Supply (buying)
- **Transaction Tracking**: Includes total transaction amounts in both currencies

## API Endpoints

### 1. Get Company Combined Pricing
```
GET /api/finance/company-pricing/:id
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "companyId": 1,
    "company": {
      "id": 1,
      "name": "ABC Company",
      "currency": "IQD",
      "phoneNumber": "+9647501234567"
    },
    "sellingPrice": {
      "IQD": 15000.00,
      "USD": 10.00
    },
    "buyingPrice": {
      "IQD": 12000.00,
      "USD": 8.00
    },
    "exchangeRate": 1500,
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Get All Companies Combined Pricing
```
GET /api/finance/all-companies-pricing
```

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "companyId": 1,
      "companyName": "ABC Company",
      "companyCurrency": "IQD",
      "sellingPrices": {
        "IQD": 15000.00,
        "USD": 10.00
      },
      "buyingPrices": {
        "IQD": 12000.00,
        "USD": 8.00
      },
      "exchangeRate": 1500,
      "totalTransactions": {
        "IQD": 500000.00,
        "USD": 333.33
      },
      "lastUpdated": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 3. Get Company Pricing Summary
```
GET /api/finance/company-pricing-summary/:id
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "companyId": 1,
    "companyName": "ABC Company",
    "companyCurrency": "IQD",
    "sellingPrices": {
      "IQD": 15000.00,
      "USD": 10.00
    },
    "buyingPrices": {
      "IQD": 12000.00,
      "USD": 8.00
    },
    "exchangeRate": 1500,
    "totalTransactions": {
      "IQD": 500000.00,
      "USD": 333.33
    },
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  }
}
```

## How It Works

### 1. Price Sources
- **Selling Price**: Retrieved from the latest `MenuItem` record for the company
- **Buying Price**: Retrieved from the latest `Supply` record for the company
- **Exchange Rate**: Retrieved from the latest `ExchangeRate` record

### 2. Currency Conversion
- **IQD to USD**: `USD = IQD / exchangeRate`
- **USD to IQD**: `IQD = USD * exchangeRate`

### 3. Price Calculation Example

**Scenario:**
- Exchange Rate: 1 USD = 1500 IQD
- MenuItem Price: 15000 IQD (selling price)
- Supply Price: 12000 IQD (buying price)

**Calculated Prices:**
- Selling Price IQD: 15000.00
- Selling Price USD: 15000 / 1500 = 10.00
- Buying Price IQD: 12000.00
- Buying Price USD: 12000 / 1500 = 8.00

### 4. Transaction Totals
- **IQD Transactions**: Sum of all CompanyDebt records with currency = "IQD"
- **USD Transactions**: Sum of all CompanyDebt records with currency = "USD"

## Database Schema

### CompanyInfo
```sql
CREATE TABLE CompanyInfo (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  currency Currency DEFAULT 'IQD',
  -- other fields
);
```

### MenuItem (Selling Prices)
```sql
CREATE TABLE MenuItem (
  id INT PRIMARY KEY,
  price FLOAT,
  companyId INT,
  -- other fields
);
```

### Supply (Buying Prices)
```sql
CREATE TABLE supply (
  id INT PRIMARY KEY,
  itemSellPrice FLOAT,
  companyId INT,
  -- other fields
);
```

### ExchangeRate
```sql
CREATE TABLE ExchangeRate (
  id INT PRIMARY KEY,
  rate INT,
  exchangeDate DATETIME,
  -- other fields
);
```

### CompanyDebt (Transactions)
```sql
CREATE TABLE CompanyDebt (
  id INT PRIMARY KEY,
  totalAmount INT,
  currency Currency DEFAULT 'IQD',
  companyId INT,
  -- other fields
);
```

## Usage Examples

### Frontend Integration

```javascript
// Get combined pricing for a specific company
const getCompanyPricing = async (companyId) => {
  const response = await fetch(`/api/finance/company-pricing/${companyId}`);
  const data = await response.json();
  
  if (data.success) {
    const { sellingPrice, buyingPrice, exchangeRate } = data.data;
    
    console.log(`Selling Price: ${sellingPrice.IQD} IQD / ${sellingPrice.USD} USD`);
    console.log(`Buying Price: ${buyingPrice.IQD} IQD / ${buyingPrice.USD} USD`);
    console.log(`Exchange Rate: 1 USD = ${exchangeRate} IQD`);
  }
};

// Get all companies pricing
const getAllCompaniesPricing = async () => {
  const response = await fetch('/api/finance/all-companies-pricing');
  const data = await response.json();
  
  if (data.success) {
    data.data.forEach(company => {
      console.log(`${company.companyName}:`);
      console.log(`  Selling: ${company.sellingPrices.IQD} IQD / ${company.sellingPrices.USD} USD`);
      console.log(`  Buying: ${company.buyingPrices.IQD} IQD / ${company.buyingPrices.USD} USD`);
      console.log(`  Total Transactions: ${company.totalTransactions.IQD} IQD / ${company.totalTransactions.USD} USD`);
    });
  }
};
```

## Benefits

1. **Dual Currency Display**: Show prices in both IQD and USD simultaneously
2. **Real-time Conversion**: Automatic conversion using latest exchange rates
3. **Comprehensive Data**: Includes selling, buying, and transaction totals
4. **Easy Integration**: Simple REST API endpoints for frontend consumption
5. **Consistent Format**: Standardized response format across all endpoints

## Error Handling

The API returns appropriate error responses:

```json
{
  "success": false,
  "error": {
    "code": 404,
    "message": "Company with ID 999 not found"
  }
}
```

Common error scenarios:
- Company not found
- Invalid company ID
- Database connection issues
- Missing exchange rate data 