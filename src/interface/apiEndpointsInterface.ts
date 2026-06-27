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
    addWorkOrderPayment: string
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
  }
  loan: {
    loanList: string
    createLoan: string
    updateLoan: string
    deleteLoan: string
    getLoanById: string
  }
  team: {
    teamList: string
  }
  user: {
    changePassword: string
    createUser: string
  }
  reports: {
    reportTransactions: string
    reportStocks: string
    reportStockTrack: string
    reportExpenses: string
    reportBalanceSheet: string
    customerWorkOrders: string
    balanceSheet: string
    workOrderDetails: string
    expenses: string
    trending: string
  }
  product: {
    productList: string
    createProduct: string
    updateProduct: string
    deleteProduct: string
    getProductById: string
  }
  aiAgent: {
    chat: string
  }
  sampleHub: {
    list: string
    upload: string
    delete: string
  }
  kanban: {
    board: string
    taskList: string
    createTask: string
    getTaskById: string
    updateTask: string
    deleteTask: string
    moveTask: string
  }
  billing: {
    documents: string
    prefill: string
    getDocumentById: string
    updateDocument: string
    deleteDocument: string
    finalizeDocument: string
  }
}