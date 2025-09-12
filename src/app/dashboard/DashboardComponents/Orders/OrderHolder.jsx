"use client";
import React, { useEffect, useState } from "react";
import OrderDetailsComponent from "./OrderDetailsComponent";
import { useDashBoard } from "@/Contexts/DashBoardContext";
import { EyeIcon, PlusCircle, FilterIcon, Delete, Trash2 } from "lucide-react";
import { useConfig } from "@/Contexts/ConfigContext";
import { convertCurrency } from "@/utils/currencyConverted";
import { useAuth } from "@/Contexts/AuthContext";

function OrderHolder() {
  const [orderData, setOrderData] = useState([]);
  const { selectedOrder, setSelectedOrder, setAdd } = useDashBoard();
  const { currencyData } = useConfig();

  const { user } = useAuth();
  const role = user?.role;
  const hasAccess = ["sales", "admin"].includes(role);
  const canViewPrices = ["sales", "admin"].includes(role);

  // Filter states
  const [startDate, setStartDate] = useState("");
  const [orderType, setOrderType] = useState("all");
  const [endDate, setEndDate] = useState("");
  const [viewType, setViewType] = useState("orders");
  const [showType, setShowType] = useState([
    "pending",
    "partial_complete",
    "complete",
    "short_closed",
    "cancelled",
  ]);
  const [selectedCurrency, setSelectedCurrency] = useState(
    currencyData ? currencyData[0] : null
  );
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [availableCustomers, setAvailableCustomers] = useState([]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);

  const getFilteredOrders = () => {
    return orderData.filter((order) => {
      // Date filtering
      const orderDate = new Date(order.orderDate);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      const dateCondition =
        (!start || orderDate >= start) && (!end || orderDate <= end);

      // Status filtering
      const statusCondition = showType.includes(order.status);

      // Product filtering
      const productCondition =
        selectedProducts.length === 0 ||
        order.orderItems.some((item) =>
          selectedProducts.includes(item.product._id)
        );

      // Order Type filtering
      const orderTypeCondition =
        orderType === "all" || order.orderType === orderType;

      // Customer filtering
      const customerCondition =
        selectedCustomers.length === 0 ||
        selectedCustomers.includes(order.customer._id);

      return (
        dateCondition &&
        statusCondition &&
        productCondition &&
        customerCondition &&
        orderTypeCondition
      );
    });
  };

  // View components mapping
  const viewMap = {
    aggregated: (
      <AggregateView
        showType={showType}
        orderData={getFilteredOrders()}
        startDate={startDate}
        endDate={endDate}
      />
    ),
    consignments: (
      <ConsignmentView
        orderData={getFilteredOrders()}
        startDate={startDate}
        showType={showType}
        endDate={endDate}
      />
    ),
    orders: (
      <OrderView
        canViewPrices={canViewPrices}
        startDate={startDate}
        endDate={endDate}
        selectedCurrency={selectedCurrency}
        orderData={getFilteredOrders()}
        showType={showType}
      />
    ),
  };

  // Fetch orders from API
  const fetchOrderData = async () => {
    try {
      const orders = await fetch("/api/order");
      const data = await orders.json();
      setOrderData(data.orders);

      // Extract unique products and customers for filters
      extractFiltersData(data.orders);
    } catch (error) {
      console.error("Error fetching order data:", error);
    }
  };

  // Extract unique products and customers from orders
  const extractFiltersData = (orders) => {
    const products = new Map();
    const customers = new Map();

    orders.forEach((order) => {
      // Extract customers
      if (order.customer && order.customer._id) {
        customers.set(order.customer._id, order.customer);
      }

      // Extract products
      order.orderItems?.forEach((item) => {
        if (item.product && item.product._id) {
          products.set(item.product._id, item.product);
        }
      });
    });

    setAvailableProducts(Array.from(products.values()));
    setAvailableCustomers(Array.from(customers.values()));
  };

  // Apply all filters to orders

  // Handler for status filter checkboxes
  const handleShowTypeChange = (status) => {
    setShowType((prev) =>
      prev.includes(status)
        ? prev.filter((item) => item !== status)
        : [...prev, status]
    );
  };

  // Handler for product selection
  const handleProductChange = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Handler for customer selection
  const handleCustomerChange = (customerId) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setShowType([
      "pending",
      "partial_complete",
      "complete",
      "short_closed",
      "cancelled",
    ]);
    setSelectedProducts([]);
    setSelectedCustomers([]);
    setSelectedCurrency(currencyData ? currencyData[0] : null);
  };

  useEffect(() => {
    fetchOrderData();
  }, []);

  return (
    <>
      {selectedOrder ? (
        <OrderDetailsComponent />
      ) : (
        <div className="p-4 shadow-md">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-center px-4 py-4 bg-white rounded-lg">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              Orders by Consignment
            </h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-all"
              >
                <FilterIcon className="w-5 h-5" />
                <span>
                  {isFilterExpanded ? "Hide Filters" : "Show Filters"}
                </span>
              </button>
              {hasAccess && (
                <button
                  onClick={() => setAdd(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Add Order</span>
                </button>
              )}
            </div>
          </div>

          {/* Unified Filters Section */}
          {isFilterExpanded && (
            <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg text-gray-700">Filters</h2>
                <button
                  onClick={resetFilters}
                  className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-all"
                >
                  Reset All
                </button>
              </div>

              {/* Basic Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 font-semibold text-sm mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold text-sm mb-1">
                    {startDate > endDate
                      ? "End Date should be greater than Start"
                      : "End Date"}
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300 ${
                      startDate > endDate && "bg-red-200 border-red-400"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold text-sm mb-1">
                    Order Type
                  </label>
                  <select
                    value={orderType}
                    onChange={(e) => {
                      setOrderType(e.target.value);
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
                  >
                    <option value="all">All</option>
                    <option value="Domestic">Domestic</option>
                    <option value="Export">Export</option>
                  </select>
                </div>

                {canViewPrices && (
                  <div>
                    <label className="block text-gray-700 font-semibold text-sm mb-1">
                      Currency Type
                    </label>
                    <select
                      value={JSON.stringify(selectedCurrency)}
                      onChange={(e) => {
                        setSelectedCurrency(JSON.parse(e.target.value));
                      }}
                      className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
                    >
                      {currencyData.map((currency) => (
                        <option
                          key={currency.shorthand}
                          value={JSON.stringify(currency)}
                        >{`${currency.full_name} (${currency.shorthand})`}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-gray-700 font-semibold text-sm mb-1">
                    View Type
                  </label>
                  <select
                    value={viewType}
                    onChange={(e) => setViewType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
                  >
                    <option value="orders">View Orders</option>
                    <option value="aggregated">View Aggregated Products</option>
                    <option value="consignments">View By Consignments</option>
                  </select>
                </div>
              </div>

              {/* Status Filter */}
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold text-sm mb-1">
                  Filter by Status
                </label>
                <div className="flex flex-wrap gap-4 mt-1">
                  {[
                    "pending",
                    "partial_complete",
                    "complete",
                    "short_closed",
                    "cancelled",
                  ].map((status) => (
                    <label
                      key={status}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={showType.includes(status)}
                        onChange={() => handleShowTypeChange(status)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="text-gray-700 text-sm capitalize">
                        {status.replace(/_/g, " ")}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Advanced Filters - Products and Customers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Filter */}
                <div>
                  <label className="block text-gray-700 font-semibold text-sm mb-1">
                    Filter by Products
                  </label>
                  <div className="max-h-32 overflow-y-auto border rounded-lg p-2 bg-white">
                    {availableProducts.length === 0 ? (
                      <p className="text-gray-500 text-sm">
                        No products available
                      </p>
                    ) : (
                      availableProducts.map((product) => (
                        <label
                          key={product._id}
                          className="flex items-center space-x-2 cursor-pointer py-1 hover:bg-gray-50 px-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product._id)}
                            onChange={() => handleProductChange(product._id)}
                            className="w-4 h-4 accent-blue-600"
                          />
                          <span className="text-gray-700 text-sm">
                            {product.name}{" "}
                            {product.casNumber ? `(${product.casNumber})` : ""}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                {/* Customer Filter */}
                <div>
                  <label className="block text-gray-700 font-semibold text-sm mb-1">
                    Filter by Customers
                  </label>
                  <div className="max-h-32 overflow-y-auto border rounded-lg p-2 bg-white">
                    {availableCustomers.length === 0 ? (
                      <p className="text-gray-500 text-sm">
                        No customers available
                      </p>
                    ) : (
                      availableCustomers.map((customer) => (
                        <label
                          key={customer._id}
                          className="flex items-center space-x-2 cursor-pointer py-1 hover:bg-gray-50 px-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCustomers.includes(customer._id)}
                            onChange={() => handleCustomerChange(customer._id)}
                            className="w-4 h-4 accent-blue-600"
                          />
                          <span className="text-gray-700 text-sm">
                            {customer.name}{" "}
                            {customer.type ? `(${customer.type})` : ""}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic View */}
          <div className="mt-6">{viewMap[viewType]}</div>
        </div>
      )}
    </>
  );
}

const OrderView = ({
  canViewPrices,
  startDate,
  endDate,
  orderData,
  showType,
  selectedCurrency,
}) => {
  const { setSelectedOrder } = useDashBoard();
  const orderKeys = canViewPrices
    ? [
        "Customer",
        "PO Number",
        "Order Date",
        "Order Type",
        "Products",
        "Quantity",
        "Price",
        "Total Amount",
        "Status",
        "",
      ]
    : [
        "Customer",
        "PO Number",
        "Order Date",
        "Products",
        "Quantity",
        "Status",
        "",
      ];

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB");
  };

  const deleteSelectedOrder = async (orderId) => {
    const confirmed = confirm(
      "Are you sure you want to delete this order? This action cannot be undone."
    );
    if (confirmed) {
      try {
        const response = await fetch(`/api/order/${orderId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          alert("Order deleted successfully.");
          window.location.reload();
        } else {
          alert("Failed to delete the order. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting order:", error);
      }
    }
  };

  return (
    <div className="border-2 border-gray-300 rounded-2xl mt-5 overflow-y-auto w-full h-[50vh] bg-white shadow-md p-4">
      {orderData.length === 0 ? (
        <div className="flex justify-center items-center h-full">
          <p className="text-gray-500 text-lg">
            No orders match your filter criteria
          </p>
        </div>
      ) : (
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-200 text-gray-700 font-semibold sticky top-0">
            <tr className="text-sm">
              {orderKeys.map((head, index) => (
                <th key={index} className="p-3 text-left">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orderData.map((order, index) => {
              const totalQuantity = order.orderItems.reduce(
                (sum, item) => sum + item.initialQuantity,
                0
              );

              const from = order.currency || {
                full_name: "United States Dollar",
                shorthand: "USD",
                value_in_usd: 1,
              };
              const to = selectedCurrency || {
                ...from,
              };
              const convertedAmount = convertCurrency(order.total, from, to);

              return (
                <tr
                  key={index}
                  className="border-t text-gray-800 text-sm hover:bg-gray-100"
                >
                  <td className="p-3">{order.customer.name}</td>
                  <td className="p-3">{order.poNumber}</td>
                  <td className="p-3">{formatDate(order.orderDate)}</td>
                  <td className="p-3">{order.orderType}</td>

                  <td className="p-2">
                    <div className="flex h-full w-full flex-col justify-between items-start">
                      {order.orderItems?.map((item) => (
                        <p key={item._id}>{item.product.name}</p>
                      )) || "N/A"}
                    </div>
                  </td>
                  <td className="p-2 ">
                    <div className="flex h-full w-full flex-col justify-between items-start">
                      {order.orderItems?.map((item) => (
                        <p key={item._id}>{item.initialQuantity}</p>
                      )) || "N/A"}
                    </div>
                  </td>
                  {canViewPrices && (
                    <td className="p-2 ">
                      <div className="flex h-full w-full flex-col justify-between items-start">
                        {order.orderItems?.map((item) => (
                          <p key={item._id}>
                            {convertCurrency(item.price, from, to)}{" "}
                            {selectedCurrency?.shorthand}
                          </p>
                        )) || "N/A"}
                      </div>
                    </td>
                  )}

                  {canViewPrices && (
                    <td className="p-3">
                      {convertedAmount} {selectedCurrency?.shorthand}
                    </td>
                  )}
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs capitalize ${
                        order.status === "complete"
                          ? "bg-green-100 text-green-800"
                          : order.status === "partial_complete"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "pending"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="p-3 flex justify-evenly items-center">
                    <button
                      onClick={() => setSelectedOrder(order._id)}
                      className="text-blue-600 hover:underline flex items-center space-x-1"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    {canViewPrices && (
                      <button
                        onClick={() => deleteSelectedOrder(order._id)}
                        className="text-red-600 hover:underline flex items-center space-x-1"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

const ConsignmentView = ({ orderData, startDate, endDate, showType }) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`;
  };

  const { setSelectedOrder } = useDashBoard();

  // Extracting consignment-based data from orders
  const getConsignmentData = () => {
    return orderData.flatMap((order) =>
      order.consignments.flatMap((consignment) =>
        consignment.consignmentItems.map((item) => {
          const productDetails = order.orderItems.find(
            (orderItem) => orderItem.product._id === item.product
          );
          return {
            customer: order.customer.name,
            poNumber: order.poNumber,
            product: productDetails?.product.name || "N/A",
            orderDate: formatDate(order.orderDate),
            quantity: item?.dispatchedQuantity || 0,
            status: consignment.overallStatus,
            packaging: productDetails?.packaging || "N/A",
            pendingQty: item?.dispatchedQuantity - item?.deliveredQuantity || 0,
            deliveryDate: formatDate(consignment.deliveryDate),
            consignmentId: consignment._id,
            orderId: order._id,
          };
        })
      )
    );
  };

  const filteredConsignments = getConsignmentData().filter((consignment) => {
    const deliveryDate = new Date(
      consignment.deliveryDate.split("-").reverse().join("-")
    );
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    return (
      (!start || deliveryDate >= start) &&
      (!end || deliveryDate <= end) &&
      showType.includes(consignment.status)
    );
  });

  return (
    <div className="border-2 border-gray-300 rounded-2xl mt-5 overflow-y-auto w-full h-[50vh] bg-white shadow-md p-4">
      {filteredConsignments.length === 0 ? (
        <div className="flex justify-center items-center h-full">
          <p className="text-gray-500 text-lg">
            No consignments match your filter criteria
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-200 text-gray-700 font-semibold sticky top-0">
              <tr className="text-sm">
                <th className="p-3 text-left whitespace-nowrap">Customer</th>
                <th className="p-3 text-left whitespace-nowrap">PO Number</th>
                <th className="p-3 text-left whitespace-nowrap">Product</th>
                <th className="p-3 text-left whitespace-nowrap">Order Date</th>
                <th className="p-3 text-left whitespace-nowrap">Quantity</th>
                <th className="p-3 text-left whitespace-nowrap">Status</th>
                <th className="p-3 text-left whitespace-nowrap">Packaging</th>
                <th className="p-3 text-left whitespace-nowrap">Pending Qty</th>
                <th className="p-3 text-left whitespace-nowrap">
                  Delivery Date
                </th>
                <th className="p-3 text-left whitespace-nowrap"></th>
              </tr>
            </thead>
            <tbody>
              {filteredConsignments
                .sort((a, b) => {
                  const dateA = new Date(
                    a.deliveryDate.split("-").reverse().join("-")
                  );
                  const dateB = new Date(
                    b.deliveryDate.split("-").reverse().join("-")
                  );
                  return dateA - dateB;
                })
                .map((consignment, index) => (
                  <tr
                    key={index}
                    className="border-t text-gray-800 text-sm hover:bg-gray-100"
                  >
                    <td className="p-3">{consignment.customer}</td>
                    <td className="p-3">{consignment.poNumber}</td>
                    <td className="p-3">{consignment.product}</td>
                    <td className="p-3">{consignment.orderDate}</td>
                    <td className="p-3">{consignment.quantity}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs capitalize ${
                          consignment.status === "complete"
                            ? "bg-green-100 text-green-800"
                            : consignment.status === "partial_complete"
                            ? "bg-yellow-100 text-yellow-800"
                            : consignment.status === "pending"
                            ? "bg-blue-100 text-blue-800"
                            : consignment.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {consignment.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="p-3">{consignment.packaging}</td>
                    <td className="p-3">{consignment.pendingQty}</td>
                    <td className="p-3">{consignment.deliveryDate}</td>
                    <td className="p-3">
                      <button
                        onClick={() => setSelectedOrder(consignment.orderId)}
                        className="text-blue-600 hover:underline flex items-center space-x-1"
                      >
                        <EyeIcon className="w-5 h-5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const AggregateView = ({ orderData, startDate, endDate }) => {
  const getAggregatedData = () => {
    const productTotals = {};

    orderData.forEach((order) => {
      order.consignments.forEach((consignment) => {
        const deliveryDate = new Date(consignment.deliveryDate);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (
          (!start || deliveryDate >= start) &&
          (!end || deliveryDate <= end)
        ) {
          consignment.consignmentItems.forEach((item) => {
            if (!productTotals[item.product]) {
              const productDetail = order.orderItems.find(
                (p) => p.product._id === item.product
              );
              productTotals[item.product] = {
                id: item.product,
                name: productDetail?.product.name || "N/A",
                totalRequired: 0,
                casNumber: productDetail?.product.casNumber || "N/A",
                packaging: productDetail?.packaging || "N/A",
              };
            }
            productTotals[item.product].totalRequired +=
              item.dispatchedQuantity - item.deliveredQuantity;
          });
        }
      });
    });

    return Object.values(productTotals).filter(
      (product) => product.totalRequired > 0
    );
  };

  const aggregatedProducts = getAggregatedData();

  return (
    <div className="border-2 border-gray-300 rounded-2xl mt-5 overflow-y-auto w-full h-[50vh] bg-white shadow-md p-4">
      {aggregatedProducts.length === 0 ? (
        <div className="flex justify-center items-center h-full">
          <p className="text-gray-500 text-lg">
            No products to produce based on your filter criteria
          </p>
        </div>
      ) : (
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-200 text-gray-700 font-semibold sticky top-0">
            <tr>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">CAS Number</th>
              <th className="p-3 text-left">Packaging</th>
              <th className="p-3 text-left">Total Quantity Required</th>
            </tr>
          </thead>
          <tbody>
            {aggregatedProducts.map((product, index) => (
              <tr
                key={index}
                className="border-t text-gray-800 text-sm hover:bg-gray-100"
              >
                <td className="p-3">{product.name}</td>
                <td className="p-3">{product.casNumber}</td>
                <td className="p-3">{product.packaging}</td>
                <td className="p-3 font-medium">{product.totalRequired}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderHolder;
