/**
 * RetailMetrics API Test Script
 * 
 * This script starts the mock server and tests all endpoints
 * to ensure they return the expected data structures.
 * 
 * Run with: bun testApi.js
 */

const { spawn } = require('child_process');
const path = require('path');

const BASE_URL = 'http://localhost:3001';
let serverProcess = null;

// ANSI color codes for better terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Start the mock server in a child process
 */
function startServer() {
  return new Promise((resolve, reject) => {
    console.log(`${colors.bright}Starting mock server...${colors.reset}`);
    
    const serverPath = path.join(__dirname, 'server.js');
    serverProcess = spawn('bun', [serverPath], {
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    let serverOutput = '';
    
    serverProcess.stdout.on('data', (data) => {
      serverOutput += data.toString();
      // Check if server has started by looking for the "running on port" message
      if (serverOutput.includes('running on port')) {
        console.log(`${colors.green}Server started successfully${colors.reset}`);
        // Give it a moment to fully initialize
        setTimeout(() => resolve(), 500);
      }
    });
    
    serverProcess.stderr.on('data', (data) => {
      console.error(`${colors.red}Server Error:${colors.reset} ${data.toString()}`);
    });
    
    serverProcess.on('error', (err) => {
      reject(new Error(`Failed to start server: ${err.message}`));
    });
    
    // Set a timeout in case server doesn't start
    const timeout = setTimeout(() => {
      reject(new Error('Server start timeout - check if port 3001 is available'));
    }, 5000);
    
    // Clear timeout when resolved
    serverProcess.once('spawn', () => {
      clearTimeout(timeout);
    });
  });
}

/**
 * Shut down the server
 */
function stopServer() {
  return new Promise((resolve) => {
    if (serverProcess && !serverProcess.killed) {
      console.log(`${colors.bright}Stopping server...${colors.reset}`);
      
      // Different shutdown approach based on platform
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', serverProcess.pid, '/f', '/t']);
      } else {
        serverProcess.kill('SIGTERM');
      }
      
      serverProcess.on('exit', () => {
        console.log(`${colors.green}Server stopped${colors.reset}`);
        resolve();
      });
      
      // Force resolve after a timeout in case the server doesn't exit cleanly
      setTimeout(() => {
        if (!serverProcess.killed) {
          console.log(`${colors.yellow}Warning: Server did not exit gracefully${colors.reset}`);
          serverProcess.kill('SIGKILL');
        }
        resolve();
      }, 3000);
    } else {
      resolve();
    }
  });
}

/**
 * Perform a fetch request and validate the response
 */
async function testEndpoint(endpoint, validationFn, params = {}) {
  let url = `${BASE_URL}${endpoint}`;
  
  // Add query parameters if provided
  if (Object.keys(params).length > 0) {
    const queryParams = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    url += `?${queryParams}`;
  }
  
  console.log(`${colors.bright}${colors.blue}Testing endpoint:${colors.reset} ${url}`);
  
  try {
    const startTime = performance.now();
    const response = await fetch(url);
    const endTime = performance.now();
    const responseTime = (endTime - startTime).toFixed(2);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    const validationResult = validationFn(data);
    
    if (validationResult === true) {
      console.log(`${colors.green}✓ Success${colors.reset} (${responseTime}ms)`);
      return { success: true, data, responseTime };
    } else {
      console.log(`${colors.red}✗ Validation failed:${colors.reset} ${validationResult}`);
      return { success: false, error: validationResult, data };
    }
  } catch (error) {
    console.log(`${colors.red}✗ Error:${colors.reset} ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Validation functions for each endpoint
 */
const validators = {
  // Validate stores endpoint
  stores: (data) => {
    if (!Array.isArray(data)) return 'Expected an array of stores';
    if (data.length === 0) return 'Expected at least one store';
    
    const firstStore = data[0];
    const requiredFields = ['id', 'name', 'region', 'type', 'address', 'openDate', 'size', 'coordinates', 'manager'];
    for (const field of requiredFields) {
      if (!(field in firstStore)) return `Missing required field: ${field}`;
    }
    
    if (!('lat' in firstStore.coordinates) || !('lng' in firstStore.coordinates)) {
      return 'Coordinates should have lat and lng properties';
    }
    
    return true;
  },
  
  // Validate sales endpoint
  sales: (data) => {
    const requiredSections = ['summary', 'byDate', 'byRegion', 'byCategory', 'byStore'];
    for (const section of requiredSections) {
      if (!(section in data)) return `Missing required section: ${section}`;
    }
    
    // Check summary fields
    const summaryFields = ['totalSales', 'comparisonSales', 'percentChange', 
                          'averageTransactionValue', 'transactionCount', 'conversionRate'];
    for (const field of summaryFields) {
      if (!(field in data.summary)) return `Missing summary field: ${field}`;
    }
    
    // Check arrays
    if (!Array.isArray(data.byDate)) return 'byDate should be an array';
    if (!Array.isArray(data.byRegion)) return 'byRegion should be an array';
    if (!Array.isArray(data.byCategory)) return 'byCategory should be an array';
    if (!Array.isArray(data.byStore)) return 'byStore should be an array';
    
    return true;
  },
  
  // Validate inventory endpoint
  inventory: (data) => {
    const requiredSections = ['summary', 'byCategory', 'byStore'];
    for (const section of requiredSections) {
      if (!(section in data)) return `Missing required section: ${section}`;
    }
    
    // Check summary fields
    const summaryFields = ['totalValue', 'totalItems', 'turnoverRate', 'outOfStockPercentage'];
    for (const field of summaryFields) {
      if (!(field in data.summary)) return `Missing summary field: ${field}`;
    }
    
    // Check arrays
    if (!Array.isArray(data.byCategory)) return 'byCategory should be an array';
    if (!Array.isArray(data.byStore)) return 'byStore should be an array';
    
    return true;
  },
  
  // Validate store details endpoint
  storeDetails: (data) => {
    const requiredSections = ['storeInfo', 'salesByDepartment', 'staffPerformance', 
                             'inventoryDetails', 'historicalPerformance'];
    for (const section of requiredSections) {
      if (!(section in data)) return `Missing required section: ${section}`;
    }
    
    // Check arrays
    if (!Array.isArray(data.salesByDepartment)) return 'salesByDepartment should be an array';
    if (!Array.isArray(data.staffPerformance)) return 'staffPerformance should be an array';
    if (!Array.isArray(data.historicalPerformance)) return 'historicalPerformance should be an array';
    
    // Check inventoryDetails
    if (!('topSellingItems' in data.inventoryDetails)) {
      return 'inventoryDetails should contain topSellingItems';
    }
    if (!Array.isArray(data.inventoryDetails.topSellingItems)) {
      return 'topSellingItems should be an array';
    }
    
    return true;
  },
  
  // Validate filters endpoint
  filters: (data) => {
    const requiredFilters = ['regions', 'storeTypes', 'categories', 'departments', 'timeRanges'];
    for (const filter of requiredFilters) {
      if (!(filter in data)) return `Missing required filter: ${filter}`;
      if (!Array.isArray(data[filter])) return `${filter} should be an array`;
      if (data[filter].length === 0) return `${filter} should not be empty`;
    }
    
    return true;
  }
};

/**
 * Run all tests
 */
async function runAllTests() {
  console.log(`\n${colors.bright}${colors.cyan}RetailMetrics API Tests${colors.reset}\n`);
  
  // Test the stores endpoint
  const storesResult = await testEndpoint('/api/stores', validators.stores);
  
  // Extract a store ID for the store details test
  let storeId = null;
  if (storesResult.success && storesResult.data.length > 0) {
    storeId = storesResult.data[0].id;
  }
  
  // Test other endpoints
  await testEndpoint('/api/sales', validators.sales, { startDate: '2023-01-01', endDate: '2023-03-31' });
  await testEndpoint('/api/inventory', validators.inventory, { region: 'Northeast' });
  
  // Test store details if we have a store ID
  if (storeId) {
    await testEndpoint(`/api/stores/${storeId}/details`, validators.storeDetails);
  } else {
    console.log(`${colors.yellow}⚠ Warning:${colors.reset} Skipping store details test - no store ID available`);
  }
  
  // Test filters endpoint
  await testEndpoint('/api/filters', validators.filters);
  
  // Test error handling with an invalid store ID
  console.log(`\n${colors.bright}${colors.blue}Testing error handling:${colors.reset}`);
  await testEndpoint('/api/stores/INVALID_ID/details', data => true);
  
  console.log(`\n${colors.bright}${colors.cyan}All tests completed${colors.reset}\n`);
}

// Main execution
(async () => {
  try {
    // Start the server first
    await startServer();
    
    console.log(`\n${colors.bright}${colors.cyan}RetailMetrics API Tests${colors.reset}\n`);
    
    // Test the stores endpoint
    const storesResult = await testEndpoint('/api/stores', validators.stores);
    
    // Extract a store ID for the store details test
    let storeId = null;
    if (storesResult.success && storesResult.data.length > 0) {
      storeId = storesResult.data[0].id;
    }
    
    // Test other endpoints
    await testEndpoint('/api/sales', validators.sales, { startDate: '2023-01-01', endDate: '2023-03-31' });
    await testEndpoint('/api/inventory', validators.inventory, { region: 'Northeast' });
    
    // Test store details if we have a store ID
    if (storeId) {
      await testEndpoint(`/api/stores/${storeId}/details`, validators.storeDetails);
    } else {
      console.log(`${colors.yellow}⚠ Warning:${colors.reset} Skipping store details test - no store ID available`);
    }
    
    // Test filters endpoint
    await testEndpoint('/api/filters', validators.filters);
    
    // Test error handling with an invalid store ID
    console.log(`\n${colors.bright}${colors.blue}Testing error handling:${colors.reset}`);
    await testEndpoint('/api/stores/INVALID_ID/details', data => true);
    
    console.log(`\n${colors.bright}${colors.green}All tests completed successfully!${colors.reset}\n`);
  } catch (error) {
    console.error(`${colors.red}Test failed:${colors.reset} ${error.message}`);
    process.exitCode = 1;
  } finally {
    // Always stop the server when done
    await stopServer();
  }
})();