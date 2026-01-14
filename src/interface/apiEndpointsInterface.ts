export interface ApiEndpoints {
  auth: {
    signIn: string
    refresh: string
  }
  shop: {
    createShop: string
    shopList: string
    updateShop: string
  }
  dashbaord: {
    dashboardReport: string
  }
  designation: {
    designationList: string
    createDesignation: string
    updateDesignation: string
    deleteDesignation: string
  }
  customer: {
    customerList: string
    createCustomer: string
    updateCustomer: string
    deleteCustomer: string
    getCustomerById: string
    customerTransactions: string
  }
  vendor: {
    vendorList: string
    createVendor: string
    updateVendor: string
    deleteVendor: string
    getVendorById: string
    vendorTransactions: string
  }
  transactions: {
    transactionsList: string
    createTransactions: string
    getTransactionById: string
    transactionLedger: string
  }
  inventory: {
    inventoryList: string
    createInventory: string
    updateInventory: string
    deleteInventory: string
    getInventoryById: string
    inventoryTrackingById: string
  }
  expense: {
    expenseList: string
    createExpense: string
    updateExpense: string
    deleteExpense: string
    getExpenseById: string
  }
  user: {
    userList: string
    allRoles: string
    createUser: string
    changePassword: string
  }
  subscriptionPlans: {
    subscriptionList: string
    createSubscriptionPlan: string
    updateSubscriptionPlan: string
    getSubscriptionPlanById: string
    deleteSubscriptionPlan: string
  }
  reports: {
    reportTransactions: string
    reportStocks: string
    reportStockTrack: string
    reportExpenses: string
    reportBalanceSheet: string
  }
  product: {
    productList: string
    createProduct: string
    updateProduct: string
    deleteProduct: string
    getProductById: string
  }
}