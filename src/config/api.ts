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
    customerTransactions: '/transaction/customer/id',
  },
  vendor: {
    vendorList: '/vendor',
    createVendor: '/vendor',
    updateVendor: '/vendor',
    deleteVendor: '/vendor',
    getVendorById: '/vendor/id',
    vendorTransactions: '/transaction/vendor/id',
  },
  transactions: {
    transactionsList: '/transactions',
    createTransactions: '/transactions',
    getTransactionById: '/transactions/{id}',
    transactionLedger: '/transaction/ledger/{customerOrVendorId}',
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
    expenseList: '/expense',
    createExpense: '/expense',
    updateExpense: '/expense/{id}',
    deleteExpense: '/expense/{id}',
    getExpenseById: '/expense/{id}',
  },
  user: {
    userList: '/user/get-users-by-shop-id',
    allRoles: '/user/role/get-roles',
    createUser: '/user/add-user-to-shop',
    changePassword: '/user/change-password',
  },
  subscriptionPlans: {
    subscriptionList: '/subscription/plans',
    createSubscriptionPlan: '/subscription/plans',
    updateSubscriptionPlan: '/subscription/plans/{id}',
    getSubscriptionPlanById: '/subscription/plans/{id}',
    deleteSubscriptionPlan: '/subscription/plans/{id}',
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