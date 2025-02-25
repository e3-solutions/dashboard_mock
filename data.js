/**
 * RetailMetrics Mock Data Generator
 * 
 * This file generates randomized retail data for the FashionForward dashboard.
 * It creates the data once at server startup and keeps it in memory.
 */

const regions = ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West'];
const storeTypes = ['Mall', 'Street', 'Outlet', 'Flagship'];
const categories = ['Men\'s', 'Women\'s', 'Children\'s', 'Accessories', 'Footwear'];
const departments = [
  'Men\'s Casual', 'Men\'s Formal', 'Women\'s Casual', 'Women\'s Formal', 
  'Women\'s Athletic', 'Children\'s', 'Accessories', 'Footwear'
];
const timeRanges = [
  'Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month', 
  'Last Month', 'This Quarter', 'Last Quarter', 'YTD', 'Last Year'
];
const cityByRegion = {
  'Northeast': ['New York', 'Boston', 'Philadelphia', 'Washington DC', 'Pittsburgh'],
  'Southeast': ['Miami', 'Atlanta', 'Charlotte', 'Nashville', 'Orlando'],
  'Midwest': ['Chicago', 'Detroit', 'Minneapolis', 'Cleveland', 'Indianapolis'],
  'Southwest': ['Dallas', 'Houston', 'Phoenix', 'Austin', 'San Antonio'],
  'West': ['Los Angeles', 'San Francisco', 'Seattle', 'Portland', 'Denver']
};
const streets = ['Fashion Ave', 'Retail Row', 'Main St', 'Market St', 'Commerce Blvd', 'Shopping Center Dr'];
const firstNames = ['Alex', 'Sarah', 'Michael', 'Jessica', 'David', 'Emily', 'James', 'Jennifer', 'Robert', 'Lisa'];
const lastNames = ['Johnson', 'Smith', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson'];
const positions = ['Sales Associate', 'Department Lead', 'Assistant Manager', 'Store Manager', 'Inventory Specialist'];
const products = {
  'Men\'s': ['Classic Button-Down Shirt', 'Slim-Fit Jeans', 'Wool Blazer', 'Cotton T-Shirt', 'Chino Pants'],
  'Women\'s': ['Designer Denim Jacket', 'Floral Sundress', 'Cashmere Sweater', 'Silk Blouse', 'Tailored Pants'],
  'Children\'s': ['Graphic T-Shirt', 'Denim Overalls', 'Colorful Leggings', 'School Uniform', 'Puffer Jacket'],
  'Accessories': ['Leather Belt', 'Designer Sunglasses', 'Winter Scarf', 'Statement Necklace', 'Leather Wallet'],
  'Footwear': ['Running Sneakers', 'Leather Boots', 'Casual Loafers', 'Dress Shoes', 'Summer Sandals']
};

// In-memory data store
const mockDataStore = {
  stores: [],
  salesData: {},
  inventoryData: {},
  storeDetails: {},
  filters: {
    regions,
    storeTypes,
    categories,
    departments,
    timeRanges
  }
};

/**
 * Helper functions for generating random data
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max, decimals = 2) {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(decimals));
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function getRandomCoordinates(region) {
  // Very approximate center points for regions
  const regionCenters = {
    'Northeast': { lat: 40.7, lng: -74.0 },
    'Southeast': { lat: 33.7, lng: -84.4 },
    'Midwest': { lat: 41.9, lng: -87.6 },
    'Southwest': { lat: 32.8, lng: -96.8 },
    'West': { lat: 34.0, lng: -118.2 }
  };

  const center = regionCenters[region];
  return {
    lat: center.lat + getRandomFloat(-1.5, 1.5, 4),
    lng: center.lng + getRandomFloat(-1.5, 1.5, 4)
  };
}

/**
 * Generate store data
 */
function generateStores(count = 200) {
  const stores = [];
  const startDate = new Date(2015, 0, 1);
  const endDate = new Date(2022, 11, 31);

  for (let i = 1; i <= count; i++) {
    const storeId = `ST${String(i).padStart(3, '0')}`;
    const region = getRandomElement(regions);
    const city = getRandomElement(cityByRegion[region]);
    const storeType = getRandomElement(storeTypes);
    const coordinates = getRandomCoordinates(region);
    const openDate = formatDate(getRandomDate(startDate, endDate));
    const size = getRandomInt(5000, 20000);
    const streetNumber = getRandomInt(100, 999);
    const street = getRandomElement(streets);
    const managerFirstName = getRandomElement(firstNames);
    const managerLastName = getRandomElement(lastNames);

    stores.push({
      id: storeId,
      name: `FashionForward ${city} ${storeType === 'Flagship' ? 'Flagship' : ''}`.trim(),
      region,
      type: storeType,
      address: `${streetNumber} ${street}, ${city}`,
      openDate,
      size,
      coordinates,
      manager: `${managerFirstName} ${managerLastName}`
    });
  }

  return stores;
}

/**
 * Generate sales data
 */
function generateSalesData(stores) {
  const startDate = new Date(2023, 0, 1);
  const endDate = new Date(2023, 3, 30);
  const oneDay = 24 * 60 * 60 * 1000;
  const totalDays = Math.round((endDate - startDate) / oneDay);
  
  const byDate = [];
  let totalSales = 0;
  let totalTransactions = 0;

  // Generate daily sales data
  for (let i = 0; i < totalDays; i++) {
    const currentDate = new Date(startDate.getTime() + i * oneDay);
    const formattedDate = formatDate(currentDate);
    const dailySales = getRandomInt(80000, 120000);
    const transactions = getRandomInt(1200, 1800);
    const avgValue = parseFloat((dailySales / transactions).toFixed(2));
    
    totalSales += dailySales;
    totalTransactions += transactions;
    
    byDate.push({
      date: formattedDate,
      sales: dailySales,
      transactions,
      avgValue
    });
  }

  // Generate sales by region
  const byRegion = regions.map(region => {
    const regionStores = stores.filter(store => store.region === region);
    const storeCount = regionStores.length;
    const regionSales = getRandomInt(800000, 1200000);
    totalSales += regionSales;
    
    return {
      region,
      sales: regionSales,
      percentOfTotal: 0, // Will calculate after all regions
      storeCount
    };
  });

  // Calculate percentages
  const totalRegionSales = byRegion.reduce((sum, region) => sum + region.sales, 0);
  byRegion.forEach(region => {
    region.percentOfTotal = parseFloat((region.sales / totalRegionSales).toFixed(2));
  });

  // Generate sales by category
  const byCategory = categories.map(category => {
    const categorySales = getRandomInt(500000, 1500000);
    const comparisonSales = categorySales * (1 - getRandomFloat(-0.1, 0.2));
    const percentChange = parseFloat(((categorySales - comparisonSales) / comparisonSales * 100).toFixed(1));
    
    return {
      category,
      sales: categorySales,
      percentOfTotal: 0, // Will calculate after all categories
      comparisonSales: Math.round(comparisonSales),
      percentChange
    };
  });

  // Calculate percentages
  const totalCategorySales = byCategory.reduce((sum, category) => sum + category.sales, 0);
  byCategory.forEach(category => {
    category.percentOfTotal = parseFloat((category.sales / totalCategorySales).toFixed(2));
  });

  // Generate sales by store
  const byStore = stores.map((store, index) => {
    const storeSales = getRandomInt(100000, 300000);
    const rank = index % 50 + 1; // Just a random rank between 1-50
    const regionStores = stores.filter(s => s.region === store.region);
    const regionTotalSales = regionStores.length * 200000; // Approximation
    const percentOfRegion = parseFloat((storeSales / regionTotalSales).toFixed(2));
    const percentChange = getRandomFloat(-10, 15, 1);
    
    return {
      storeId: store.id,
      storeName: store.name,
      sales: storeSales,
      rank,
      percentOfRegion,
      percentChange
    };
  });

  // Create summary
  const comparisonSales = totalSales * (1 - getRandomFloat(-0.05, 0.1));
  const percentChange = parseFloat(((totalSales - comparisonSales) / comparisonSales * 100).toFixed(1));
  const averageTransactionValue = parseFloat((totalSales / totalTransactions).toFixed(2));
  const conversionRate = getRandomFloat(0.2, 0.3, 2);

  return {
    summary: {
      totalSales,
      comparisonSales: Math.round(comparisonSales),
      percentChange,
      averageTransactionValue,
      transactionCount: totalTransactions,
      conversionRate
    },
    byDate,
    byRegion,
    byCategory,
    byStore
  };
}

/**
 * Generate inventory data
 */
function generateInventoryData(stores) {
  // Summary data
  const totalItems = getRandomInt(300000, 350000);
  const totalValue = getRandomInt(4000000, 5000000);
  const turnoverRate = getRandomFloat(2.8, 3.5, 1);
  const outOfStockPercentage = getRandomFloat(0.02, 0.06, 2);

  // Inventory by category
  const byCategory = categories.map(category => {
    const itemCount = getRandomInt(50000, 100000);
    const value = getRandomInt(800000, 1500000);
    const turnoverRate = getRandomFloat(2.5, 3.8, 1);
    
    return {
      category,
      value,
      itemCount,
      turnoverRate
    };
  });

  // Inventory by store
  const byStore = stores.map(store => {
    const itemCount = getRandomInt(15000, 30000);
    const value = getRandomInt(200000, 400000);
    const turnoverRate = getRandomFloat(2.5, 4.0, 1);
    const outOfStockItems = Math.round(itemCount * getRandomFloat(0.01, 0.05, 3));
    
    return {
      storeId: store.id,
      storeName: store.name,
      value,
      itemCount,
      turnoverRate,
      outOfStockItems
    };
  });

  return {
    summary: {
      totalValue,
      totalItems,
      turnoverRate,
      outOfStockPercentage
    },
    byCategory,
    byStore
  };
}

/**
 * Generate store details
 */
function generateStoreDetails(stores) {
  const storeDetails = {};

  stores.forEach(store => {
    // Basic store info
    const staffCount = getRandomInt(20, 60);
    const storeInfo = {
      ...store,
      staffCount
    };

    // Sales by department
    const salesByDepartment = departments.map(department => {
      const sales = getRandomInt(20000, 150000);
      const percentOfStore = getRandomFloat(0.05, 0.25, 2);
      const percentChange = getRandomFloat(-8, 12, 1);
      
      return {
        department,
        sales,
        percentOfStore,
        percentChange
      };
    });

    // Staff performance
    const staffPerformance = [];
    for (let i = 0; i < getRandomInt(5, 10); i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const position = getRandomElement(positions);
      const salesTotal = getRandomInt(20000, 80000);
      const transactionCount = getRandomInt(200, 800);
      const avgPerTransaction = parseFloat((salesTotal / transactionCount).toFixed(2));
      
      staffPerformance.push({
        name: `${firstName} ${lastName}`,
        position,
        salesTotal,
        transactionCount,
        avgPerTransaction
      });
    }

    // Inventory details
    const totalValue = getRandomInt(200000, 400000);
    const turnoverRate = getRandomFloat(2.5, 4.0, 1);
    
    // Top selling items
    const topSellingItems = [];
    for (let i = 0; i < getRandomInt(5, 10); i++) {
      const category = getRandomElement(categories);
      const productName = getRandomElement(products[category]);
      const unitsSold = getRandomInt(50, 200);
      const revenue = getRandomInt(5000, 15000);
      const id = `P${getRandomInt(1000, 9999)}`;
      
      topSellingItems.push({
        id,
        name: productName,
        category,
        unitsSold,
        revenue
      });
    }

    // Historical performance
    const historicalPerformance = [];
    for (let year = 2022; year <= 2023; year++) {
      for (let quarter = 1; quarter <= 4; quarter++) {
        if (year === 2023 && quarter > 2) continue; // Only include data up to Q2 2023
        
        const sales = getRandomInt(200000, 400000);
        const transactions = getRandomInt(3000, 6000);
        const avgValue = parseFloat((sales / transactions).toFixed(2));
        
        historicalPerformance.push({
          year,
          quarter,
          sales,
          transactions,
          avgValue
        });
      }
    }

    storeDetails[store.id] = {
      storeInfo,
      salesByDepartment,
      staffPerformance,
      inventoryDetails: {
        totalValue,
        turnoverRate,
        topSellingItems
      },
      historicalPerformance
    };
  });

  return storeDetails;
}

/**
 * Initialize all mock data
 */
function initializeMockData() {
  console.log('Initializing RetailMetrics mock data...');
  
  // Generate store data
  mockDataStore.stores = generateStores(200);
  console.log(`Generated ${mockDataStore.stores.length} stores`);
  
  // Generate sales data
  mockDataStore.salesData = generateSalesData(mockDataStore.stores);
  console.log('Generated sales data');
  
  // Generate inventory data
  mockDataStore.inventoryData = generateInventoryData(mockDataStore.stores);
  console.log('Generated inventory data');
  
  // Generate store details
  mockDataStore.storeDetails = generateStoreDetails(mockDataStore.stores);
  console.log('Generated store details');
  
  console.log('Mock data initialization complete!');
  return mockDataStore;
}

/**
 * API endpoint handlers
 */
function handleGetStores() {
  return mockDataStore.stores;
}

function handleGetSales(params = {}) {
  // In a real implementation, this would filter the data based on params
  // For this mock, we'll just return all data
  return mockDataStore.salesData;
}

function handleGetInventory(params = {}) {
  // In a real implementation, this would filter the data based on params
  return mockDataStore.inventoryData;
}

function handleGetStoreDetails(storeId) {
  return mockDataStore.storeDetails[storeId] || null;
}

function handleGetFilters() {
  return mockDataStore.filters;
}

// Export the initialized data and handlers
module.exports = {
  initializeMockData,
  handleGetStores,
  handleGetSales,
  handleGetInventory,
  handleGetStoreDetails,
  handleGetFilters
};

// Initialize data when this module is imported
initializeMockData();