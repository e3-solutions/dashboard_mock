# RetailMetrics Mock Data Server

This repository contains a mock data server that generates randomized retail data for the FashionForward dashboard project. It creates synthetic data at server startup and keeps it in memory for the duration of the application.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

Or if you use yarn:

```bash
yarn
```

### Running the Server

Start the server:

```bash
npm start
```

The server will run on port 3001 by default. You can override this by setting the PORT environment variable.

## API Endpoints

The following API endpoints are available:

### 1. Store Information
**GET** `/api/stores`

Returns a list of all FashionForward stores.

### 2. Sales Data
**GET** `/api/sales`

Returns sales data. Can be filtered with the following query parameters:
- `startDate`: Start date in ISO format (YYYY-MM-DD)
- `endDate`: End date in ISO format (YYYY-MM-DD)
- `storeIds`: Comma-separated list of store IDs
- `region`: Region name
- `storeType`: Store type

### 3. Inventory Data
**GET** `/api/inventory`

Returns inventory data. Can be filtered with the following query parameters:
- `storeIds`: Comma-separated list of store IDs
- `region`: Region name
- `storeType`: Store type

### 4. Store Detail Data
**GET** `/api/stores/{storeId}/details`

Returns detailed information for a specific store.

### 5. Filter Options
**GET** `/api/filters`

Returns available options for filters in the dashboard.

## Data Structure

### Store Information
```json
[
  {
    "id": "ST001",
    "name": "FashionForward Midtown",
    "region": "Northeast",
    "type": "Flagship",
    "address": "123 Fashion Ave, New York, NY",
    "openDate": "2018-03-15",
    "size": 15000,
    "coordinates": {
      "lat": 40.7128,
      "lng": -74.0060
    },
    "manager": "Alex Johnson"
  },
  // ... more stores
]
```

### Sales Data
```json
{
  "summary": {
    "totalSales": 3245789.50,
    "comparisonSales": 3100234.75,
    "percentChange": 4.7,
    "averageTransactionValue": 68.45,
    "transactionCount": 47418,
    "conversionRate": 0.23
  },
  "byDate": [ ... ],
  "byRegion": [ ... ],
  "byCategory": [ ... ],
  "byStore": [ ... ]
}
```

### Inventory Data
```json
{
  "summary": {
    "totalValue": 4567890.12,
    "totalItems": 324567,
    "turnoverRate": 3.2,
    "outOfStockPercentage": 0.04
  },
  "byCategory": [ ... ],
  "byStore": [ ... ]
}
```

### Store Detail Data
```json
{
  "storeInfo": { ... },
  "salesByDepartment": [ ... ],
  "staffPerformance": [ ... ],
  "inventoryDetails": { ... },
  "historicalPerformance": [ ... ]
}
```

### Filter Options
```json
{
  "regions": [ ... ],
  "storeTypes": [ ... ],
  "categories": [ ... ],
  "departments": [ ... ],
  "timeRanges": [ ... ]
}
```

## Customizing the Data

If you want to customize the generated data, you can modify the constants and generation functions in `mockDataGenerator.js`.

## License

This project is licensed under the MIT License.