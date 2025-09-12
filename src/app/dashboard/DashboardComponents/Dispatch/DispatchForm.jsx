"use client";

import FormInputField from "@/Components/UI/FormInputField";
import React, { useEffect, useState } from "react";

const DispatchForm = ({ setShowForm }) => {
  const [dispatchData, setDispatchData] = useState({
    customerId: "",
    orderId: "",
    invoiceNo: "",
    dispatchDate: new Date().toISOString().split("T")[0],
    selectedItems: {},
  });

  const [pendingOrders, setPendingOrders] = useState([]);
  const [consignments, setConsignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customers, setCustomers] = useState([]);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("/api/customer/");
        const customersData = await res.json();
        setCustomers(customersData);
      } catch (err) {
        console.error("Error fetching customers:", err);
      }
    };
    fetchCustomers();
  }, []);

  // Fetch pending orders for selected customer
  useEffect(() => {
    const fetchPendingOrders = async () => {
      if (!dispatchData.customerId) return;
      setLoading(true);
      setError("");

      try {
        const res = await fetch("/api/order/get-pending", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId: dispatchData.customerId }),
        });

        const data = await res.json();
        setPendingOrders(data.orders || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingOrders();
  }, [dispatchData.customerId]);

  // Fetch consignments for selected order
  useEffect(() => {
    const fetchConsignments = async () => {
      if (!dispatchData.orderId) return;
      try {
        const res = await fetch("/api/order/get-consignments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: dispatchData.orderId }),
        });

        const consignmentData = await res.json();
        setConsignments(consignmentData);
      } catch (err) {
        console.error("Error fetching consignments:", err);
      }
    };

    fetchConsignments();
  }, [dispatchData.orderId]);

  // Handle order item selection
  const handleItemSelection = (consignmentId, productId, quantity) => {
    setDispatchData((prev) => {
      const itemKey = `${consignmentId}_${productId}`;
      const existingItem = prev.selectedItems[itemKey];

      return {
        ...prev,
        selectedItems: {
          ...prev.selectedItems,
          [itemKey]: existingItem
            ? undefined
            : {
                consignmentId,
                productId,
                quantityRequired: quantity,
                quantitySupplied: 0,
              },
        },
      };
    });
  };

  // Handle quantity change
  const handleQuantityChange = (itemKey, value) => {
    const maxQuantity =
      dispatchData.selectedItems[itemKey]?.quantityRequired || 0;
    const newQuantity = Math.min(Math.max(value, 0), maxQuantity);

    setDispatchData((prev) => ({
      ...prev,
      selectedItems: {
        ...prev.selectedItems,
        [itemKey]: {
          ...prev.selectedItems[itemKey],
          quantitySupplied: newQuantity,
        },
      },
    }));
  };

  const submitDispatch = async () => {
    if (
      !dispatchData.customerId ||
      !dispatchData.orderId ||
      !Object.keys(dispatchData.selectedItems).length
    ) {
      setError("Please select a customer, an order, and at least one item.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Group items by consignment
      const dispatchesByConsignment = {};

      Object.entries(dispatchData.selectedItems).forEach(
        ([itemKey, itemData]) => {
          if (!itemData || itemData.quantitySupplied <= 0) return;

          const { consignmentId, productId, quantitySupplied } = itemData;

          if (!dispatchesByConsignment[consignmentId]) {
            dispatchesByConsignment[consignmentId] = {
              dispatchDate: dispatchData.dispatchDate,
              customerId: dispatchData.customerId,
              invoiceNo: dispatchData.invoiceNo,
              orderId: dispatchData.orderId,
              consignmentId: consignmentId,
              items: [],
            };
          }

          dispatchesByConsignment[consignmentId].items.push({
            product: productId,
            quantitySupplied: quantitySupplied,
          });
        }
      );

      // Create dispatch for each consignment
      const dispatchPromises = Object.values(dispatchesByConsignment).map(
        async (dispatchPayload) => {
          const res = await fetch("/api/dispatch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dispatchPayload),
          });

          if (!res.ok)
            throw new Error(
              `Failed to create dispatch for consignment ${dispatchPayload.consignmentId}`
            );

          return res.json();
        }
      );

      await Promise.all(dispatchPromises);

      setShowForm(false);
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-full max-w-4xl p-1 md:p-6 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Create New Dispatch
        </h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="space-y-4">
          <select
            name="customerId"
            value={dispatchData.customerId}
            onChange={(e) =>
              setDispatchData({
                ...dispatchData,
                customerId: e.target.value,
                orderId: "",
                selectedItems: {},
              })
            }
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Customer</option>
            {customers.map((customer) => (
              <option key={customer._id} value={customer._id}>
                {customer.name}
              </option>
            ))}
          </select>
          
          <FormInputField
            name={"dispatchDate"}
            label={"Dispatch Date"}
            inputType={"date"}
            value={dispatchData.dispatchDate}
            onChange={(e) =>
              setDispatchData({
                ...dispatchData,
                dispatchDate: e.target.value,
              })
            }
          />
          <FormInputField
            name={"invoiceNo"}
            label={"Invoice Number"}
            inputType={"text"}
            value={dispatchData.invoiceNo}

            onChange={(e) =>
              setDispatchData({
                ...dispatchData,
                invoiceNo: e.target.value,
              })
            }
          />
          {pendingOrders.length > 0 && (
            <select
              name="orderId"
              value={dispatchData.orderId}
              onChange={(e) =>
                setDispatchData({
                  ...dispatchData,
                  orderId: e.target.value,
                  selectedItems: {},
                })
              }
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Order</option>
              {pendingOrders.map((order) => (
                <option key={order._id} value={order._id}>
                  Order #{order.poNumber} -{" "}
                  {new Date(order.orderDate).toDateString()}
                </option>
              ))}
            </select>
          )}

          {consignments.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold border-b pb-2">
                Available Products by Consignment
              </h3>

              {consignments
                .filter(
                  (consignment) => consignment.overallStatus !== "complete"
                )
                .map((consignment) => {
                  return (
                    <div
                      key={consignment._id}
                      className="border rounded-lg p-4"
                    >
                      <div className="mb-2 bg-gray-100 p-2 rounded">
                        <h4 className="font-medium">
                          {new Date(consignment.deliveryDate).toDateString()}(
                          {consignment.overallStatus})
                        </h4>
                      </div>

                      <div className="space-y-2">
                        {consignment.consignmentItems.map((item) => (
                          <div
                            key={`${consignment._id}_${item.product?._id}`}
                            className="flex flex-col sm:flex-row items-center justify-between p-2 bg-gray-50 rounded-lg shadow"
                          >
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={
                                  !!dispatchData.selectedItems[
                                    `${consignment._id}_${item.product?._id}`
                                  ]
                                }
                                onChange={() =>
                                  handleItemSelection(
                                    consignment._id,
                                    item.product?._id,
                                    item.dispatchedQuantity
                                  )
                                }
                                className="w-5 h-5 accent-blue-600 mr-2"
                              />
                              <div>
                                <p className="font-medium text-gray-800">
                                  {item.product?.name || "Unknown Product"}
                                </p>
                                <p className="text-gray-500 text-sm">
                                  Required:{" "}
                                  {item.dispatchedQuantity -
                                    item.deliveredQuantity}
                                </p>
                              </div>
                            </div>
                            {dispatchData.selectedItems[
                              `${consignment._id}_${item.product?._id}`
                            ] && (
                              <input
                                type="number"
                                min="0"
                                max={
                                  item.dispatchedQuantity -
                                  item.deliveredQuantity
                                }
                                value={
                                  dispatchData.selectedItems[
                                    `${consignment._id}_${item.product?._id}`
                                  ].quantitySupplied
                                }
                                onChange={(e) =>
                                  handleQuantityChange(
                                    `${consignment._id}_${item.product?._id}`,
                                    Number(
                                      Math.min(
                                        e.target.value,
                                        item.dispatchedQuantity -
                                          item.deliveredQuantity
                                      )
                                    )
                                  )
                                }
                                className="w-20 p-2 border rounded-lg"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={() => setShowForm(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>

          <button
            onClick={submitDispatch}
            disabled={
              loading || Object.keys(dispatchData.selectedItems).length === 0
            }
            className={`px-4 py-2 text-white rounded-lg ${
              loading || Object.keys(dispatchData.selectedItems).length === 0
                ? "bg-green-400"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Processing..." : "Create Dispatch"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DispatchForm;
