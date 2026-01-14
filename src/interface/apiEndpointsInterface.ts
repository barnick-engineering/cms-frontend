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
  }
  vendor: {
    vendorList: string
    createVendor: string
    updateVendor: string
    deleteVendor: string
    getVendorById: string
  }
  workOrder: {
    workOrderList: string
    createWorkOrder: string
    updateWorkOrder: string
    deleteWorkOrder: string
    getWorkOrderById: string
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
    deleteExpense: string
  }
  team: {
    teamList: string
  }
  user: {
    changePassword: string
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