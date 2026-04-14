// API Adapters - Transform API responses to UI format
// Simple field mapping functions for each resource type

// ──────────────────────────────────────────────
// Products Adapter
// ──────────────────────────────────────────────

export function adaptProduct(apiProduct) {
  if (!apiProduct) return null;
  return {
    id: apiProduct.productId,
    productId: apiProduct.productId,
    serialNumber: apiProduct.serialNumber,
    name: apiProduct.productName,
    productName: apiProduct.productName,
    barcode: apiProduct.barcode,
    categoryId: apiProduct.categoryId,
    category: apiProduct.categoryName,
    categoryName: apiProduct.categoryName,
    subcategoryId: apiProduct.subcategoryId,
    subcategory: apiProduct.subcategoryName,
    subcategoryName: apiProduct.subcategoryName,
    buyPrice: apiProduct.buyingPrice,
    buyingPrice: apiProduct.buyingPrice,
    sellPrice: apiProduct.sellingPrice,
    sellingPrice: apiProduct.sellingPrice,
    barcode: apiProduct.barcode,
    unit: apiProduct.unit,
    reorderLevel: apiProduct.reorderLevel,
    imageUrl: apiProduct.imageUrl,
    notes: apiProduct.notes,
    status: apiProduct.isActive ? "Active" : "Inactive",
    isActive: apiProduct.isActive,
    qtyOnHand: apiProduct.qtyOnHand,
    stock: apiProduct.qtyOnHand,
    createdAt: apiProduct.createdAt,
    updatedAt: apiProduct.updatedAt,
  };
}

export function adaptProducts(apiProducts) {
  return Array.isArray(apiProducts) ? apiProducts.map(adaptProduct) : [];
}

// ──────────────────────────────────────────────
// Categories Adapter
// ──────────────────────────────────────────────

export function adaptCategory(apiCategory) {
  if (!apiCategory) return null;
  return {
    id: apiCategory.categoryId,
    categoryId: apiCategory.categoryId,
    code: apiCategory.categoryCode || "",
    categoryCode: apiCategory.categoryCode || "",
    name: apiCategory.categoryName || "",
    categoryName: apiCategory.categoryName || "",
    status: apiCategory.isActive ? "Active" : "Inactive",
    isActive: apiCategory.isActive,
    createdAt: apiCategory.createdAt,
    updatedAt: apiCategory.updatedAt,
  };
}

export function adaptCategories(apiCategories) {
  return Array.isArray(apiCategories) ? apiCategories.map(adaptCategory) : [];
}

// ──────────────────────────────────────────────
// Subcategories Adapter
// ──────────────────────────────────────────────

export function adaptSubcategory(apiSubcategory) {
  if (!apiSubcategory) return null;
  return {
    id: apiSubcategory.subcategoryId,
    subcategoryId: apiSubcategory.subcategoryId,
    categoryId: apiSubcategory.categoryId,
    category: apiSubcategory.categoryName || "",
    categoryName: apiSubcategory.categoryName || "",
    code: apiSubcategory.subcategoryCode || "",
    subcategoryCode: apiSubcategory.subcategoryCode || "",
    name: apiSubcategory.subcategoryName || "",
    subcategoryName: apiSubcategory.subcategoryName || "",
    status: apiSubcategory.isActive ? "Active" : "Inactive",
    isActive: apiSubcategory.isActive,
    createdAt: apiSubcategory.createdAt,
    updatedAt: apiSubcategory.updatedAt,
  };
}

export function adaptSubcategories(apiSubcategories) {
  return Array.isArray(apiSubcategories)
    ? apiSubcategories.map(adaptSubcategory)
    : [];
}

// ──────────────────────────────────────────────
// Suppliers Adapter
// ──────────────────────────────────────────────

export function adaptSupplier(apiSupplier) {
  if (!apiSupplier) return null;
  return {
    id: apiSupplier.supplierId,
    supplierId: apiSupplier.supplierId,
    code: apiSupplier.supplierCode,
    supplierCode: apiSupplier.supplierCode,
    name: apiSupplier.supplierName,
    supplierName: apiSupplier.supplierName,
    company: apiSupplier.supplierName || "",
    contactName: apiSupplier.contactName || "",
    phone: apiSupplier.phone,
    email: apiSupplier.email || "",
    address: apiSupplier.address,
    taxNumber: apiSupplier.taxNumber,
    status: apiSupplier.isActive ? "Active" : "Inactive",
    isActive: apiSupplier.isActive,
  };
}

export function adaptSuppliers(apiSuppliers) {
  return Array.isArray(apiSuppliers) ? apiSuppliers.map(adaptSupplier) : [];
}

// ──────────────────────────────────────────────
// Warehouse Locations Adapter
// ──────────────────────────────────────────────

export function adaptLocation(apiLocation) {
  if (!apiLocation) return null;
  return {
    id: apiLocation.locationId,
    locationId: apiLocation.locationId,
    code: apiLocation.locationCode,
    location: apiLocation.locationCode,
    locationCode: apiLocation.locationCode,
    block: apiLocation.block,
    aisle: apiLocation.aisle,
    shelf: apiLocation.shelf,
    description: apiLocation.description || "",
    maxCapacity: apiLocation.maxCapacity,
    status: apiLocation.isActive ? "Active" : "Inactive",
    isActive: apiLocation.isActive,
    createdAt: apiLocation.createdAt,
  };
}

export function adaptLocations(apiLocations) {
  return Array.isArray(apiLocations) ? apiLocations.map(adaptLocation) : [];
}

// ──────────────────────────────────────────────
// Stock Ledger Adapter
// ──────────────────────────────────────────────

export function adaptStockItem(apiStock) {
  if (!apiStock) return null;
  return {
    id: apiStock.ledgerId,
    ledgerId: apiStock.ledgerId,
    productId: apiStock.productId,
    serial: apiStock.serialNumber || "",
    serialNumber: apiStock.serialNumber || "",
    product: apiStock.productName || "",
    productName: apiStock.productName || "",
    locationId: apiStock.locationId,
    location: apiStock.locationCode,
    locationCode: apiStock.locationCode,
    block: apiStock.block,
    aisle: apiStock.aisle,
    shelf: apiStock.shelf,
    qty: apiStock.qtyOnHand,
    quantity: apiStock.qtyOnHand,
    qtyOnHand: apiStock.qtyOnHand,
    reorder: apiStock.reorderLevel,
    reorderLevel: apiStock.reorderLevel,
    isLowStock: apiStock.isLowStock,
    lastMovedAt: apiStock.lastMovedAt,
    updatedAt: apiStock.updatedAt,
  };
}

export function adaptStockItems(apiStockItems) {
  return Array.isArray(apiStockItems) ? apiStockItems.map(adaptStockItem) : [];
}

// ──────────────────────────────────────────────
// Purchase Invoice Adapter
// ──────────────────────────────────────────────

export function adaptPurchaseInvoice(apiInvoice) {
  if (!apiInvoice) return null;
  return {
    id: String(apiInvoice.invoiceNumber || apiInvoice.purchaseInvoiceId || ""),
    purchaseInvoiceId: apiInvoice.purchaseInvoiceId,
    invoiceNumber: apiInvoice.invoiceNumber,
    supplierId: apiInvoice.supplierId,
    supplier: apiInvoice.supplierName,
    supplierName: apiInvoice.supplierName,
    date: apiInvoice.invoiceDate,
    invoiceDate: apiInvoice.invoiceDate,
    total: apiInvoice.subTotal,
    subTotal: apiInvoice.subTotal,
    discount: apiInvoice.discountAmount,
    discountAmount: apiInvoice.discountAmount,
    tax: apiInvoice.taxAmount,
    taxAmount: apiInvoice.taxAmount,
    grandTotal: apiInvoice.totalAmount,
    totalAmount: apiInvoice.totalAmount,
    status: apiInvoice.status,
    notes: apiInvoice.notes,
    lines: Array.isArray(apiInvoice.lines)
      ? apiInvoice.lines.map((line) => ({
          id: line.lineId,
          lineId: line.lineId,
          productId: line.productId,
          productName: line.productName,
          locationId: line.locationId,
          locationName: line.locationName,
          quantity: line.quantity,
          unitBuyingPrice: line.unitBuyingPrice,
          discountPercent: line.discountPercent,
          lineSubTotal: line.lineSubTotal,
          lineDiscount: line.lineDiscount,
          lineTotal: line.lineTotal,
        }))
      : [],
  };
}

export function adaptPurchaseInvoices(apiInvoices) {
  return Array.isArray(apiInvoices) ? apiInvoices.map(adaptPurchaseInvoice) : [];
}

// ──────────────────────────────────────────────
// Sales Invoice Adapter
// ──────────────────────────────────────────────

export function adaptSalesInvoice(apiInvoice) {
  if (!apiInvoice) return null;
  return {
    id: String(apiInvoice.invoiceNumber || apiInvoice.salesInvoiceId || ""),
    salesInvoiceId: apiInvoice.salesInvoiceId,
    invoiceNumber: apiInvoice.invoiceNumber,
    date: apiInvoice.invoiceDate,
    invoiceDate: apiInvoice.invoiceDate,
    customer: apiInvoice.customerName,
    customerName: apiInvoice.customerName,
    customerNumber: apiInvoice.customerPhone,
    customerPhone: apiInvoice.customerPhone,
    total: apiInvoice.subTotal,
    subTotal: apiInvoice.subTotal,
    discount: apiInvoice.discountAmount,
    discountAmount: apiInvoice.discountAmount,
    tax: apiInvoice.taxAmount,
    taxAmount: apiInvoice.taxAmount,
    grandTotal: apiInvoice.totalAmount,
    totalAmount: apiInvoice.totalAmount,
    payment: apiInvoice.paymentMethod,
    paymentMethod: apiInvoice.paymentMethod,
    cashier: apiInvoice.cashierName,
    cashierName: apiInvoice.cashierName,
    status: apiInvoice.status,
    notes: apiInvoice.notes,
    lines: Array.isArray(apiInvoice.lines)
      ? apiInvoice.lines.map((line) => ({
          id: line.lineId,
          lineId: line.lineId,
          productId: line.productId,
          productName: line.productName,
          locationId: line.locationId,
          locationName: line.locationName,
          quantity: line.quantity,
          unitSellingPrice: line.unitSellingPrice,
          discountPercent: line.discountPercent,
          lineSubTotal: line.lineSubTotal,
          lineDiscount: line.lineDiscount,
          lineTotal: line.lineTotal,
        }))
      : [],
  };
}

export function adaptSalesInvoices(apiInvoices) {
  return Array.isArray(apiInvoices) ? apiInvoices.map(adaptSalesInvoice) : [];
}

// ──────────────────────────────────────────────
// Dashboard & Reports Adapters
// ──────────────────────────────────────────────

export function adaptDashboardStats(apiStats) {
  if (!apiStats) {
    return {
      totalRevenue: 0,
      totalCOGS: 0,
      totalProfit: 0,
      totalSalesCount: 0,
      activeProductsCount: 0,
      totalInventoryValue: 0,
      todaysRevenue: 0,
      todayRevenue: 0,
      pendingPOCount: 0,
      pendingPurchases: 0,
      slowMovingItemsCount: 0,
      lowStockAlerts: 0,
    };
  }
  return {
    totalRevenue: apiStats.totalRevenue || 0,
    totalCOGS: apiStats.totalCOGS || 0,
    totalProfit: apiStats.totalProfit || 0,
    totalSalesCount: apiStats.totalSalesCount || 0,
    activeProductsCount: apiStats.activeProductsCount || 0,
    totalInventoryValue: apiStats.totalInventoryValue || 0,
    todaysRevenue: apiStats.todaysRevenue || 0,
    todayRevenue: apiStats.todaysRevenue || 0,
    pendingPOCount: apiStats.pendingPOCount || 0,
    pendingPurchases: apiStats.pendingPOCount || 0,
    slowMovingItemsCount: apiStats.slowMovingItemsCount || 0,
    lowStockAlerts: apiStats.slowMovingItemsCount || 0,
  };
}

export function adaptStockAlerts(apiAlerts) {
  return Array.isArray(apiAlerts)
    ? apiAlerts.map((apiAlert) => ({
        productId: apiAlert.productId,
        productName: apiAlert.productName,
        qtyOnHand: apiAlert.qtyOnHand,
        reorderLevel: apiAlert.reorderLevel,
        locationName: apiAlert.locationName,
      }))
    : [];
}

export function adaptSalesTrends(apiDataList) {
  return Array.isArray(apiDataList)
    ? apiDataList.map((apiData) => ({
        month: apiData.month,
        salesAmount: apiData.salesAmount,
        orderCount: apiData.orderCount,
      }))
    : [];
}

export function adaptMonthlyRevenue(apiData) {
  if (!apiData) return null;
  return {
    month: apiData.month,
    transactions: apiData.transactions,
    revenue: apiData.revenue,
    cogs: apiData.cogs,
    profit: apiData.grossProfit,
    grossProfit: apiData.grossProfit,
  };
}

export function adaptMonthlyRevenues(apiDataList) {
  return Array.isArray(apiDataList) ? apiDataList.map(adaptMonthlyRevenue) : [];
}

export function adaptBestSellingProduct(apiData) {
  if (!apiData) return null;
  return {
    rank: apiData.rank,
    productName: apiData.productName,
    quantitySold: apiData.quantitySold,
    revenue: apiData.revenue,
    cogs: apiData.cogs,
    profit: apiData.profit,
  };
}

export function adaptBestSellingProducts(apiDataList) {
  return Array.isArray(apiDataList) ? apiDataList.map(adaptBestSellingProduct) : [];
}


// ──────────────────────────────────────────────
// Stock Ledger Adapter
// ──────────────────────────────────────────────

export function adaptStockItem(apiStock) {
  if (!apiStock) return null;
  return {
    id: apiStock.ledgerId,
    ledgerId: apiStock.ledgerId,
    productId: apiStock.productId,
    serial: apiStock.serialNumber || "",
    serialNumber: apiStock.serialNumber || "",
    product: apiStock.productName || "",
    productName: apiStock.productName || "",
    locationId: apiStock.locationId,
    location: apiStock.locationCode,
    locationCode: apiStock.locationCode,
    block: apiStock.block,
    aisle: apiStock.aisle,
    shelf: apiStock.shelf,
    qty: apiStock.qtyOnHand,
    quantity: apiStock.qtyOnHand,
    qtyOnHand: apiStock.qtyOnHand,
    reorder: apiStock.reorderLevel,
    reorderLevel: apiStock.reorderLevel,
    isLowStock: apiStock.isLowStock,
    lastMovedAt: apiStock.lastMovedAt,
    updatedAt: apiStock.updatedAt,
  };
}

export function adaptStockItems(apiStockItems) {
  return Array.isArray(apiStockItems) ? apiStockItems.map(adaptStockItem) : [];
}

// ──────────────────────────────────────────────
// Purchase Invoice Adapter
// ──────────────────────────────────────────────

export function adaptPurchaseInvoice(apiInvoice) {
  if (!apiInvoice) return null;
  return {
    id: String(apiInvoice.invoiceNumber || apiInvoice.purchaseInvoiceId || ""),
    purchaseInvoiceId: apiInvoice.purchaseInvoiceId,
    invoiceNumber: apiInvoice.invoiceNumber,
    supplierId: apiInvoice.supplierId,
    supplier: apiInvoice.supplierName,
    supplierName: apiInvoice.supplierName,
    date: apiInvoice.invoiceDate,
    deliveryDate: apiInvoice.deliveryDate,
    invoiceDate: apiInvoice.invoiceDate,
    total: apiInvoice.subTotal,
    subTotal: apiInvoice.subTotal,
    discount: apiInvoice.discountAmount,
    discountAmount: apiInvoice.discountAmount,
    tax: apiInvoice.taxAmount,
    taxAmount: apiInvoice.taxAmount,
    grandTotal: apiInvoice.totalAmount,
    totalAmount: apiInvoice.totalAmount,
    status: apiInvoice.status,
    notes: apiInvoice.notes,
    lines: Array.isArray(apiInvoice.lines)
      ? apiInvoice.lines.map((line) => ({
          id: line.lineId,
          lineId: line.lineId,
          productId: line.productId,
          productName: line.productName,
          locationId: line.locationId,
          locationName: line.locationName,
          quantity: line.quantity,
          unitBuyingPrice: line.unitBuyingPrice,
          discountPercent: line.discountPercent,
          lineSubTotal: line.lineSubTotal,
          lineDiscount: line.lineDiscount,
          lineTotal: line.lineTotal,
        }))
      : [],
  };
}

export function adaptPurchaseInvoices(apiInvoices) {
  return Array.isArray(apiInvoices)
    ? apiInvoices.map(adaptPurchaseInvoice)
    : [];
}

// ──────────────────────────────────────────────
// Sales Invoice Adapter
// ──────────────────────────────────────────────

export function adaptSalesInvoice(apiInvoice) {
  if (!apiInvoice) return null;
  return {
    id: String(apiInvoice.invoiceNumber || apiInvoice.salesInvoiceId || ""),
    salesInvoiceId: apiInvoice.salesInvoiceId,
    invoiceNumber: apiInvoice.invoiceNumber,
    date: apiInvoice.invoiceDate,
    invoiceDate: apiInvoice.invoiceDate,
    customer: apiInvoice.customerName,
    customerName: apiInvoice.customerName,
    customerNumber: apiInvoice.customerPhone,
    customerPhone: apiInvoice.customerPhone,
    total: apiInvoice.subTotal,
    subTotal: apiInvoice.subTotal,
    discount: apiInvoice.discountAmount,
    discountAmount: apiInvoice.discountAmount,
    tax: apiInvoice.taxAmount,
    taxAmount: apiInvoice.taxAmount,
    grandTotal: apiInvoice.totalAmount,
    totalAmount: apiInvoice.totalAmount,
    payment: apiInvoice.paymentMethod,
    paymentMethod: apiInvoice.paymentMethod,
    cashier: apiInvoice.cashierName,
    cashierName: apiInvoice.cashierName,
    status: apiInvoice.status,
    notes: apiInvoice.notes,
    lines: Array.isArray(apiInvoice.lines)
      ? apiInvoice.lines.map((line) => ({
          id: line.lineId,
          lineId: line.lineId,
          productId: line.productId,
          productName: line.productName,
          locationId: line.locationId,
          locationName: line.locationName,
          quantity: line.quantity,
          unitSellingPrice: line.unitSellingPrice,
          discountPercent: line.discountPercent,
          lineSubTotal: line.lineSubTotal,
          lineDiscount: line.lineDiscount,
          lineTotal: line.lineTotal,
        }))
      : [],
  };
}

export function adaptSalesInvoices(apiInvoices) {
  return Array.isArray(apiInvoices) ? apiInvoices.map(adaptSalesInvoice) : [];
}

// ──────────────────────────────────────────────
// Reports Adapter
// ──────────────────────────────────────────────

export function adaptMonthlyRevenue(apiData) {
  if (!apiData) return null;
  return {
    month: apiData.month,
    transactions: apiData.transactions,
    revenue: apiData.revenue,
    cogs: apiData.cogs,
    profit: apiData.grossProfit,
    grossProfit: apiData.grossProfit,
  };
}

export function adaptMonthlyRevenues(apiDataList) {
  return Array.isArray(apiDataList) ? apiDataList.map(adaptMonthlyRevenue) : [];
}

export function adaptBestSellingProduct(apiData) {
  if (!apiData) return null;
  return {
    rank: apiData.rank,
    productName: apiData.productName,
    quantitySold: apiData.quantitySold,
    revenue: apiData.revenue,
    cogs: apiData.cogs,
    profit: apiData.profit,
  };
}

export function adaptBestSellingProducts(apiDataList) {
  return Array.isArray(apiDataList)
    ? apiDataList.map(adaptBestSellingProduct)
    : [];
}

// ──────────────────────────────────────────────
// Dashboard Adapter
// ──────────────────────────────────────────────

export function adaptDashboardStats(apiStats) {
  if (!apiStats) return null;
  return {
    totalRevenue: apiStats.totalRevenue || 0,
    totalCOGS: apiStats.totalCOGS || 0,
    totalProfit: apiStats.totalProfit || 0,
    totalSalesCount: apiStats.totalSalesCount || 0,
    activeProductsCount: apiStats.activeProductsCount || 0,
    totalInventoryValue: apiStats.totalInventoryValue || 0,
    todaysRevenue: apiStats.todaysRevenue || 0,
    todayRevenue: apiStats.todaysRevenue || 0, // Alternative naming
    pendingPOCount: apiStats.pendingPOCount || 0,
    pendingPurchases: apiStats.pendingPOCount || 0, // Alternative naming
    slowMovingItemsCount: apiStats.slowMovingItemsCount || 0,
    lowStockAlerts: apiStats.slowMovingItemsCount || 0, // Alternative naming
  };
}

export function adaptStockAlert(apiAlert) {
  if (!apiAlert) return null;
  return {
    productId: apiAlert.productId,
    productName: apiAlert.productName,
    qtyOnHand: apiAlert.qtyOnHand,
    reorderLevel: apiAlert.reorderLevel,
    locationName: apiAlert.locationName,
  };
}

export function adaptStockAlerts(apiAlerts) {
  return Array.isArray(apiAlerts) ? apiAlerts.map(adaptStockAlert) : [];
}

export function adaptTopSellingProduct(apiData) {
  if (!apiData) return null;
  return {
    productName: apiData.productName,
    totalQuantitySold: apiData.totalQuantitySold,
    totalRevenueGenerated: apiData.totalRevenueGenerated,
  };
}

export function adaptTopSellingProducts(apiDataList) {
  return Array.isArray(apiDataList)
    ? apiDataList.map(adaptTopSellingProduct)
    : [];
}

export function adaptSalesTrend(apiData) {
  if (!apiData) return null;
  return {
    month: apiData.month,
    salesAmount: apiData.salesAmount,
    orderCount: apiData.orderCount,
  };
}

export function adaptSalesTrends(apiDataList) {
  return Array.isArray(apiDataList) ? apiDataList.map(adaptSalesTrend) : [];
}
