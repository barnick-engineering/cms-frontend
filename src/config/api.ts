import type { ApiEndpoints } from '@/interface/apiEndpointsInterface'

// Support both VITE_BACKEND_URL and VITE_API_BASE_URL for backward compatibility
const envBaseUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL

if (!envBaseUrl) {
  console.error('VITE_BACKEND_URL or VITE_API_BASE_URL must be set in .env file')
}

export const BASE_URL = envBaseUrl || ''

export const apiEndpoints: ApiEndpoints = {
  auth: {
    signIn: '/api/v1/account/login/',
    refresh: '/auth/refresh',
  },
  dashbaord: {
    dashboardReport: '/api/v1/dashboard',
  },
  shop: {
    createShop: '/shop',
    shopList: '/shop',
    updateShop: '/shop/',
  },
  designation: {
    designationList: '/designation',
    createDesignation: '/designation',
    updateDesignation: '/designation',
    deleteDesignation: '/designation',
  },
  customer: {
    customerList: '/api/v1/customer',
    createCustomer: '/api/v1/customer/',
    updateCustomer: '/api/v1/customer/',
    deleteCustomer: '/api/v1/customer/',
    getCustomerById: '/api/v1/customer/',
  },
  vendor: {
    vendorList: '/vendor',
    createVendor: '/vendor',
    updateVendor: '/vendor',
    deleteVendor: '/vendor',
    getVendorById: '/vendor/id',
  },
  workOrder: {
    workOrderList: '/api/v1/work-order',
    createWorkOrder: '/api/v1/work-order/',
    updateWorkOrder: '/api/v1/work-order/',
    deleteWorkOrder: '/api/v1/work-order/',
    getWorkOrderById: '/api/v1/work-order/',
  },
  inventory: {
    inventoryList: '/inventory',
    createInventory: '/inventory',
    updateInventory: '/inventory',
    deleteInventory: '/inventory',
    getInventoryById: '/inventory/id',
    inventoryTrackingById: '/inventory-tracking/{inventoryId}',
  },
  expense: {
    expenseList: '/api/v1/expense',
    createExpense: '/api/v1/expense/',
    updateExpense: '/api/v1/expense/',
    deleteExpense: '/api/v1/expense/',
  },
  team: {
    teamList: '/api/v1/account/',
  },
  user: {
    changePassword: '/user/change-password',
  },
  reports : {
    reportTransactions: '/report/transactions',
    reportStocks: '/report/stocks',
    reportStockTrack: '/report/stocks/track',
    reportExpenses: '/report/expenses',
    reportBalanceSheet: '/report/balance-sheet',
  },
  product: {
    productList: '/api/v1/product',
    createProduct: '/api/v1/product/',
    updateProduct: '/api/v1/product/',
    deleteProduct: '/api/v1/product/',
    getProductById: '/api/v1/product/',
  }
}