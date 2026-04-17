// API Service Layer - Real API Integration

// Base URL for all API calls
const API_BASE_URL = "https://inventra.runasp.net";
// https://inventra.runasp.net
/**
 * Get JWT token from localStorage
 */
function getToken() {
  try {
    const user = JSON.parse(localStorage.getItem("inventra_user"));
    return user?.token || null;
  } catch {
    return null;
  }
}

/**
 * Read API responses safely.
 * Some successful write endpoints return no JSON body.
 */
async function parseResponseBody(response) {
  if (response.status === 204) return null;

  const text = await response.text();
  if (!text) return null;

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getErrorMessage(response, data) {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data && typeof data === "object") {
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }
    if (typeof data.title === "string" && data.title.trim()) {
      return data.title;
    }
    if (data.errors && typeof data.errors === "object") {
      const firstError = Object.values(data.errors).flat()[0];
      if (typeof firstError === "string" && firstError.trim()) {
        return firstError;
      }
    }
  }

  return `API Error: ${response.status} ${response.statusText}`;
}

/**
 * Generic fetch wrapper
 * Handles headers, authentication, and safe response parsing.
 */
async function apiFetch(endpoint, options = {}) {
  const { method = "GET", body, includeAuth = true } = options;

  const headers = {
    ...options.headers,
  };

  if (body !== undefined && body !== null && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const config = {
    method,
    headers,
  };

  if (body !== undefined && body !== null) {
    config.body =
      headers["Content-Type"] === "application/json"
        ? JSON.stringify(body)
        : body;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await parseResponseBody(response);

    if (!response.ok) {
      throw new Error(getErrorMessage(response, data));
    }

    return { success: true, data };
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, error: error.message || "Request failed" };
  }
}

function mapProduct(apiProduct) {
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

function mapProducts(apiProducts) {
  return Array.isArray(apiProducts) ? apiProducts.map(mapProduct) : [];
}

function mapCategory(apiCategory) {
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

function mapCategories(apiCategories) {
  return Array.isArray(apiCategories) ? apiCategories.map(mapCategory) : [];
}

function mapSubcategory(apiSubcategory) {
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

function mapSubcategories(apiSubcategories) {
  return Array.isArray(apiSubcategories)
    ? apiSubcategories.map(mapSubcategory)
    : [];
}

function mapSupplier(apiSupplier) {
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
    industry: apiSupplier.industry || "",
    status: apiSupplier.isActive ? "Active" : "Inactive",
    isActive: apiSupplier.isActive,
  };
}

function mapSuppliers(apiSuppliers) {
  return Array.isArray(apiSuppliers) ? apiSuppliers.map(mapSupplier) : [];
}

function mapLocation(apiLocation) {
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

function mapLocations(apiLocations) {
  return Array.isArray(apiLocations) ? apiLocations.map(mapLocation) : [];
}

function mapStockItem(apiStock) {
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

function mapStockItems(apiStockItems) {
  return Array.isArray(apiStockItems) ? apiStockItems.map(mapStockItem) : [];
}

function mapPurchaseInvoice(apiInvoice) {
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

function mapPurchaseInvoices(apiInvoices) {
  return Array.isArray(apiInvoices) ? apiInvoices.map(mapPurchaseInvoice) : [];
}

function mapSalesInvoice(apiInvoice) {
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

function mapSalesInvoices(apiInvoices) {
  return Array.isArray(apiInvoices) ? apiInvoices.map(mapSalesInvoice) : [];
}

function mapMonthlyRevenue(apiData) {
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

function mapMonthlyRevenues(apiDataList) {
  return Array.isArray(apiDataList) ? apiDataList.map(mapMonthlyRevenue) : [];
}

function mapBestSellingProduct(apiData) {
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

function mapBestSellingProducts(apiDataList) {
  return Array.isArray(apiDataList)
    ? apiDataList.map(mapBestSellingProduct)
    : [];
}

function mapDashboardStats(apiStats) {
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

function mapStockAlerts(apiAlerts) {
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

function mapSalesTrends(apiDataList) {
  return Array.isArray(apiDataList)
    ? apiDataList.map((apiData) => ({
        month: apiData.month,
        salesAmount: apiData.salesAmount,
        orderCount: apiData.orderCount,
      }))
    : [];
}

function mapSlowMovingProduct(apiData) {
  if (!apiData) return null;

  return {
    serialNumber: apiData.serialNumber,
    productName: apiData.productName,
    categoryName: apiData.categoryName,
    qtyOnHand: apiData.qtyOnHand,
    lastSaleDate: apiData.lastSaleDate,
    daysIdle: apiData.daysIdle,
  };
}

function mapSlowMovingProducts(apiDataList) {
  return Array.isArray(apiDataList)
    ? apiDataList.map(mapSlowMovingProduct)
    : [];
}

function mapInventoryValuation(apiData) {
  if (!apiData) return null;

  return {
    productName: apiData.productName,
    categoryName: apiData.categoryName,
    quantity: apiData.quantity,
    unitCost: apiData.unitCost,
    totalValue: apiData.totalValue,
  };
}

function mapInventoryValuations(apiDataList) {
  return Array.isArray(apiDataList)
    ? apiDataList.map(mapInventoryValuation)
    : [];
}

function mapSupplierBalance(apiData) {
  if (!apiData) return null;

  return {
    supplierId: apiData.supplierId,
    supplierName: apiData.supplierName,
    totalInvoiced: apiData.totalInvoiced,
    totalPaid: apiData.totalPaid,
    balance: apiData.balance,
  };
}

function mapSupplierBalances(apiDataList) {
  return Array.isArray(apiDataList) ? apiDataList.map(mapSupplierBalance) : [];
}

function mapStockByLocation(apiData) {
  if (!apiData) return null;

  return {
    locationCode: apiData.locationCode,
    block: apiData.block,
    aisle: apiData.aisle,
    shelf: apiData.shelf,
    productName: apiData.productName,
    quantity: apiData.quantity,
    maxCapacity: apiData.maxCapacity,
  };
}

function mapStockByLocations(apiDataList) {
  return Array.isArray(apiDataList) ? apiDataList.map(mapStockByLocation) : [];
}

function mapReorderAlert(apiData) {
  if (!apiData) return null;

  return {
    productName: apiData.productName,
    categoryName: apiData.categoryName,
    currentQuantity: apiData.currentQuantity,
    reorderLevel: apiData.reorderLevel,
    recommendedOrderQty: apiData.recommendedOrderQty,
  };
}

function mapReorderAlerts(apiDataList) {
  return Array.isArray(apiDataList) ? apiDataList.map(mapReorderAlert) : [];
}

export const authService = {
  async login(userName, password) {
    const result = await apiFetch("/api/Account/login", {
      method: "POST",
      body: { userName, password },
      includeAuth: false,
    });

    if (result.success) {
      const { token, expiration } = result.data || {};

      const decoded = decodeToken(token);
      const user = {
        token,
        id: decoded.userId,
        username: decoded.userName,
        role: decoded.role,
        expiration,
      };

      localStorage.setItem("inventra_user", JSON.stringify(user));
      return { success: true, user };
    }

    return { success: false, message: result.error || "Login failed" };
  },

  async register(userName, email, password) {
    const result = await apiFetch("/api/Account/register", {
      method: "POST",
      body: { userName, email, password },
      includeAuth: false,
    });

    if (result.success) {
      return { success: true, message: "Registration successful" };
    }

    return { success: false, message: result.error || "Registration failed" };
  },

  logout() {
    localStorage.removeItem("inventra_user");
  },

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem("inventra_user"));
    } catch {
      return null;
    }
  },
};

export const dashboardService = {
  async getStats() {
    const result = await apiFetch("/api/Dashboard/summary");
    return result.success
      ? mapDashboardStats(result.data)
      : mapDashboardStats(null);
  },

  async getRecentSales() {
    const result = await apiFetch("/api/Sales");
    if (!result.success) return [];

    const sales = mapSalesInvoices(result.data);
    return sales.length > 5 ? sales.slice(-5).reverse() : sales.reverse();
  },

  async getLowStockAlerts() {
    const result = await apiFetch("/api/Dashboard/stock-alerts");
    return result.success ? mapStockAlerts(result.data) : [];
  },

  async getSalesTrend() {
    // Backend endpoint takes NO parameters - returns last 12 months by default
    // Per OpenAPI spec: GET /api/Dashboard/sales-trend (no query parameters)
    const result = await apiFetch("/api/Dashboard/sales-trend");
    return result.success ? mapSalesTrends(result.data) : [];
  },
};

export const productService = {
  async getAll(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.categoryId) query.append("categoryId", params.categoryId);
    if (params.subcategoryId)
      query.append("subcategoryId", params.subcategoryId);
    if (params.isActive !== undefined)
      query.append("isActive", params.isActive);

    const result = await apiFetch(
      `/api/Products${query.toString() ? "?" + query.toString() : ""}`,
    );
    return result.success ? mapProducts(result.data) : [];
  },

  async getById(id) {
    const result = await apiFetch(`/api/Products/${id}`);
    return result.success ? mapProduct(result.data) : null;
  },

  async create(data) {
    const result = await apiFetch("/api/Products", {
      method: "POST",
      body: data,
    });
    return result.success ? mapProduct(result.data) : null;
  },

  async update(id, data) {
    const result = await apiFetch(`/api/Products/${id}`, {
      method: "PUT",
      body: data,
    });
    return result.success ? mapProduct(result.data) : null;
  },

  async delete(id) {
    const result = await apiFetch(`/api/Products/${id}`, {
      method: "DELETE",
    });
    return result.success;
  },

  async lookup(search) {
    const result = await apiFetch(
      `/api/Products/lookup${search ? `?search=${encodeURIComponent(search)}` : ""}`,
    );
    return result.success ? mapProducts(result.data) : [];
  },

  async deactivate(id) {
    const result = await apiFetch(`/api/Products/${id}/deactivate`, {
      method: "PATCH",
    });
    return result.success ? mapProduct(result.data) : null;
  },
};

export const categoryService = {
  async getAll() {
    const result = await apiFetch("/api/Categories");
    return result.success ? mapCategories(result.data) : [];
  },

  async getById(id) {
    const result = await apiFetch(`/api/Categories/${id}`);
    return result.success ? mapCategory(result.data) : null;
  },

  async create(data) {
    const result = await apiFetch("/api/Categories", {
      method: "POST",
      body: data,
    });
    return result.success ? mapCategory(result.data) : null;
  },

  async update(id, data) {
    const result = await apiFetch(`/api/Categories/${id}`, {
      method: "PUT",
      body: data,
    });
    return result.success ? mapCategory(result.data) : null;
  },

  async delete(id) {
    const result = await apiFetch(`/api/Categories/${id}`, {
      method: "DELETE",
    });
    return result.success;
  },

  async getAllSubcategories(categoryId) {
    const result = await apiFetch(
      `/api/Categories/${categoryId}/subcategories`,
    );
    return result.success ? mapSubcategories(result.data) : [];
  },

  async createSubcategory(data) {
    return subcategoryService.create(data);
  },

  async updateSubcategory(id, data) {
    return subcategoryService.update(id, data);
  },

  async deleteSubcategory(id) {
    return subcategoryService.delete(id);
  },
};

export const subcategoryService = {
  async getAll() {
    const result = await apiFetch("/api/Subcategories");
    return result.success ? mapSubcategories(result.data) : [];
  },

  async getById(id) {
    const result = await apiFetch(`/api/Subcategories/${id}`);
    return result.success ? mapSubcategory(result.data) : null;
  },

  async create(data) {
    const result = await apiFetch("/api/Subcategories", {
      method: "POST",
      body: data,
    });
    return result.success ? mapSubcategory(result.data) : null;
  },

  async update(id, data) {
    const result = await apiFetch(`/api/Subcategories/${id}`, {
      method: "PUT",
      body: data,
    });
    return result.success ? mapSubcategory(result.data) : null;
  },

  async delete(id) {
    const result = await apiFetch(`/api/Subcategories/${id}`, {
      method: "DELETE",
    });
    return result.success;
  },
};

export const purchaseService = {
  async getAll() {
    const result = await apiFetch("/api/Purchases");
    return result.success ? mapPurchaseInvoices(result.data) : [];
  },

  async getById(id) {
    const result = await apiFetch(`/api/Purchases/${id}`);
    return result.success ? mapPurchaseInvoice(result.data) : null;
  },

  async getBySupplierId(supplierId) {
    const result = await apiFetch(`/api/Purchases/supplier/${supplierId}`);
    return result.success ? mapPurchaseInvoices(result.data) : [];
  },

  async create(data) {
    const result = await apiFetch("/api/Purchases", {
      method: "POST",
      body: data,
    });
    return result.success ? mapPurchaseInvoice(result.data) : null;
  },

  async confirm(id) {
    const result = await apiFetch(`/api/Purchases/${id}/confirm`, {
      method: "PUT",
    });
    return result.success ? mapPurchaseInvoice(result.data) : null;
  },

  async cancel(id) {
    const result = await apiFetch(`/api/Purchases/${id}/cancel`, {
      method: "DELETE",
    });
    return result.success ? mapPurchaseInvoice(result.data) : null;
  },
};

export const salesService = {
  async getAll() {
    const result = await apiFetch("/api/Sales");
    return result.success ? mapSalesInvoices(result.data) : [];
  },

  async getById(id) {
    const result = await apiFetch(`/api/Sales/${id}`);
    return result.success ? mapSalesInvoice(result.data) : null;
  },

  async create(data) {
    const result = await apiFetch("/api/Sales", {
      method: "POST",
      body: data,
    });
    return result.success ? mapSalesInvoice(result.data) : null;
  },

  async processRefund(id) {
    const result = await apiFetch(`/api/Sales/${id}/refund`, {
      method: "POST",
    });
    return result.success ? mapSalesInvoice(result.data) : null;
  },

  async voidInvoice(id) {
    const result = await apiFetch(`/api/Sales/${id}/void`, {
      method: "POST",
    });
    return result.success ? mapSalesInvoice(result.data) : null;
  },
};

export const reportService = {
  async getMonthlyRevenueProfit() {
    const result = await apiFetch("/api/Reports/monthly-revenue-profit");
    return result.success ? mapMonthlyRevenues(result.data) : [];
  },

  async getBestSellingProducts() {
    const result = await apiFetch("/api/Reports/best-selling-products");
    return result.success ? mapBestSellingProducts(result.data) : [];
  },

  async getSlowMovingProducts() {
    const result = await apiFetch("/api/Reports/slow-moving-products");
    return result.success ? mapSlowMovingProducts(result.data) : [];
  },

  async getInventoryValuation() {
    const result = await apiFetch("/api/Reports/inventory-valuation");
    return result.success ? mapInventoryValuations(result.data) : [];
  },

  async getSupplierBalances() {
    const result = await apiFetch("/api/Reports/supplier-balances");
    return result.success ? mapSupplierBalances(result.data) : [];
  },

  async getStockByLocation() {
    const result = await apiFetch("/api/Reports/stock-by-location");
    return result.success ? mapStockByLocations(result.data) : [];
  },

  async getReorderAlerts() {
    const result = await apiFetch("/api/Reports/reorder-alerts");
    return result.success ? mapReorderAlerts(result.data) : [];
  },
};

export const stockService = {
  async getAll(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.block) query.append("block", params.block);
    if (params.aisle) query.append("aisle", params.aisle);
    if (params.lowStockOnly) query.append("lowStockOnly", params.lowStockOnly);

    const result = await apiFetch(
      `/api/Warehouse/stock${query.toString() ? "?" + query.toString() : ""}`,
    );
    return result.success ? mapStockItems(result.data) : [];
  },

  async getByProductId(productId) {
    const result = await apiFetch(
      `/api/Warehouse/stock/by-product/${productId}`,
    );
    return result.success ? mapStockItems(result.data) : [];
  },

  async getByLocationId(locationId) {
    const result = await apiFetch(
      `/api/Warehouse/stock/by-location/${locationId}`,
    );
    return result.success ? mapStockItems(result.data) : [];
  },

  async transfer(productId, fromLocationId, toLocationId, quantity, notes) {
    const result = await apiFetch("/api/Warehouse/stock/transfer", {
      method: "POST",
      body: {
        productId,
        fromLocationId,
        toLocationId,
        quantity,
        notes,
      },
    });
    return result.success ? result.data : null;
  },
};

export const locationService = {
  async getAll(params = {}) {
    const query = new URLSearchParams();
    if (params.block) query.append("block", params.block);
    if (params.isActive !== undefined)
      query.append("isActive", params.isActive);

    const result = await apiFetch(
      `/api/Warehouse/locations${query.toString() ? "?" + query.toString() : ""}`,
    );
    return result.success ? mapLocations(result.data) : [];
  },

  async getById(id) {
    const result = await apiFetch(`/api/Warehouse/locations/${id}`);
    return result.success ? mapLocation(result.data) : null;
  },

  async create(data) {
    const result = await apiFetch("/api/Warehouse/locations", {
      method: "POST",
      body: data,
    });
    return result.success ? mapLocation(result.data) : null;
  },

  async update(id, data) {
    const result = await apiFetch(`/api/Warehouse/locations/${id}`, {
      method: "PUT",
      body: data,
    });
    return result.success ? mapLocation(result.data) : null;
  },

  async delete(id) {
    const result = await apiFetch(`/api/Warehouse/locations/${id}`, {
      method: "DELETE",
    });
    return result.success;
  },
};

export const supplierService = {
  async getAll() {
    const result = await apiFetch("/api/Suppliers");
    return result.success ? mapSuppliers(result.data) : [];
  },

  async getById(id) {
    const result = await apiFetch(`/api/Suppliers/${id}`);
    return result.success ? mapSupplier(result.data) : null;
  },

  async create(data) {
    const result = await apiFetch("/api/Suppliers", {
      method: "POST",
      body: data,
    });
    return result.success ? mapSupplier(result.data) : null;
  },

  async update(id, data) {
    const result = await apiFetch(`/api/Suppliers/${id}`, {
      method: "PUT",
      body: data,
    });
    return result.success ? mapSupplier(result.data) : null;
  },

  async delete(id) {
    const result = await apiFetch(`/api/Suppliers/${id}`, {
      method: "DELETE",
    });
    return result.success;
  },
};

export const paymentService = {
  async getAll() {
    const result = await apiFetch("/api/SupplierPayments");
    return result.success ? result.data : [];
  },

  async getBySupplierId(supplierId) {
    const result = await apiFetch(
      `/api/SupplierPayments/supplier/${supplierId}`,
    );
    return result.success ? result.data : [];
  },

  async create(data) {
    const result = await apiFetch("/api/SupplierPayments", {
      method: "POST",
      body: data,
    });
    return result.success ? result.data : null;
  },
};

/**
 * Decode JWT token to extract claims
 * This is a simple base64 decode - not for security validation
 */
function decodeToken(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return {};

    const decoded = JSON.parse(atob(parts[1]));

    return {
      userId:
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ],
      userName:
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
      role: decoded[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ],
    };
  } catch {
    return {};
  }
}
