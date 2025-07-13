# Storage API Documentation

## Overview

The storage system now groups items by store location and provides comprehensive inventory management with totals across all stores.

## API Endpoint

```
GET /api/supply/storage
```

## Query Parameters

- `q` (optional): Search query for items, companies, or barcodes
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `expired` (optional): Filter for expired items
- `days` (optional): Number of days to consider as "soon to expire"

## Response Structure

```json
{
  "success": true,
  "data": {
    "stores": [
      {
        "storeName": "Main Store",
        "items": [
          {
            "item": "Coca Cola",
            "quantity": 150,
            "price": 500,
            "sellPrice": 750,
            "totalValue": 75000,
            "profit": 37500,
            "companyDetails": {
              "id": 1,
              "name": "Coca Cola Company",
              "code": "COCA001",
              "phoneNumber": "+9647501234567",
              "note": "Main supplier"
            },
            "store": "Main Store",
            "itemCode": "123456789",
            "expiryDate": "2024-12-31T00:00:00.000Z",
            "lastRestock": "2024-01-15T10:30:00.000Z",
            "lastSale": null
          },
          {
            "item": "Pepsi",
            "quantity": 100,
            "price": 450,
            "sellPrice": 700,
            "totalValue": 45000,
            "profit": 25000,
            "companyDetails": {
              "id": 2,
              "name": "PepsiCo",
              "code": "PEPSI001",
              "phoneNumber": "+9647501234568",
              "note": "Secondary supplier"
            },
            "store": "Main Store",
            "itemCode": "987654321",
            "expiryDate": "2024-11-30T00:00:00.000Z",
            "lastRestock": "2024-01-10T14:20:00.000Z",
            "lastSale": null
          }
        ],
        "totalItems": 250,
        "totalValue": 120000,
        "totalProfit": 62500
      },
      {
        "storeName": "Warehouse",
        "items": [
          {
            "item": "Water Bottles",
            "quantity": 500,
            "price": 200,
            "sellPrice": 400,
            "totalValue": 100000,
            "profit": 100000,
            "companyDetails": {
              "id": 3,
              "name": "Pure Water Co",
              "code": "WATER001",
              "phoneNumber": "+9647501234569",
              "note": "Water supplier"
            },
            "store": "Warehouse",
            "itemCode": "555666777",
            "expiryDate": "2025-06-30T00:00:00.000Z",
            "lastRestock": "2024-01-20T09:15:00.000Z",
            "lastSale": null
          }
        ],
        "totalItems": 500,
        "totalValue": 100000,
        "totalProfit": 100000
      }
    ],
    "totalStores": 2,
    "totalItems": 750,
    "totalValue": 220000,
    "totalProfit": 162500
  },
  "pages": 1
}
```

## Features

### 1. Store-based Grouping

- Items are grouped by store location
- Each store shows its own totals
- Items within each store are sorted alphabetically

### 2. Item Aggregation

- Duplicate items within the same store are combined
- Quantities are summed up
- Values and profits are calculated accordingly
- Earliest expiry date is kept
- Latest restock date is kept

### 3. Comprehensive Totals

- **Per Store**: totalItems, totalValue, totalProfit
- **Overall**: totalStores, totalItems, totalValue, totalProfit

### 4. Search and Filtering

- Search by item name, company name, company code, or barcode
- Filter by expiry date (expired or soon to expire)
- Pagination support

### 5. Item Details

Each item includes:

- Basic info: name, quantity, price, sell price
- Financial: total value, profit margin
- Company details: supplier information
- Location: store assignment
- Tracking: item code, expiry date, last restock
- Sales: last sale date (currently null, can be implemented later)

## Usage Examples

### Get all storage items

```
GET /api/supply/storage
```

### Search for specific items

```
GET /api/supply/storage?q=coca
```

### Get expired items

```
GET /api/supply/storage?expired=true&days=7
```

### Paginated results

```
GET /api/supply/storage?page=1&limit=10
```

## Notes

- Items with zero remaining quantity are excluded
- Stores without items are not included
- The "lastSale" field is currently null but can be implemented by joining with order data
- All monetary values are in the base currency (IQD)
- Dates are in ISO 8601 format
