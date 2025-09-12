"use client";
import FormInputField from "@/Components/UI/FormInputField";
import { useAuth } from "@/Contexts/AuthContext";
import { useDashBoard } from "@/Contexts/DashBoardContext";
import { calculateQuantity } from "@/utils/caclulateQuantity";
import { uploadToS3 } from "@/utils/uploadToS3";
import { ArrowLeft, Check, Trash } from "lucide-react";
import React, { useEffect, useState } from "react";

const OrderDetailsComponent = () => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editAccess, setEditAccess] = useState(false);
  const [products, setProducts] = useState([]); // State to store fetched products
  const { setSelectedOrder, selectedOrder } = useDashBoard();
  const { user } = useAuth();
  const role = user?.role;
  const hasAccess = ["sales", "admin"].includes(role);
  const canViewPrices = ["sales", "admin", "dispatch"].includes(role);

  const orderKeys = ["poNumber", "incoTerms", "paymentTerms", "status"];
  const orderItemKeys = canViewPrices
    ? ["Product", "CAS Number", "Quantity", "Pending", "Dispatched", "Price"]
    : ["Product", "CAS Number", "Quantity", "Pending", "Dispatched"];

  const downloadPOFile = async () => {
    const fileUrl = orderDetails.poFile;
    if (!fileUrl) {
      alert("No PO file uploaded for this Order");
      return;
    }

    try {
      // Fetch the file from the given URL
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Failed to download file");

      // Convert response to Blob
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const a = document.createElement("a");
      a.href = blobUrl;

      // Extract filename from URL or set a default one
      const fileName = fileUrl.split("/").pop() || "purchase-order.pdf";
      a.download = fileName;

      // Append to document and trigger download
      document.body.appendChild(a);
      a.click();

      // Cleanup
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error downloading the file. Please try again.");
    }
  };

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`/api/order/${selectedOrder}`);
      if (!res.ok) {
        alert("Failed to Fetch The order");
        return;
      }
      const data = await res.json();
      const modifiedData = calculateQuantity(data);
      setOrderDetails(modifiedData);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch order details:", err);
      setError("Failed to fetch order details.");
      setLoading(false);
    }
  };
  // Fetch order details
  useEffect(() => {
    fetchOrderDetails();
  }, [selectedOrder]);

  // Fetch products for the select field
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/product");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };

    fetchProducts();
  }, []);

  const handleConsignmentDateChange = (consIndex, value) => {
    setOrderDetails((prev) => {
      const updatedConsignments = [...prev.consignments];
      updatedConsignments[consIndex].deliveryDate = value;
      return { ...prev, consignments: updatedConsignments };
    });
  };

  const handleConsignmentItemChange = async (
    consIndex,
    itemIndex,
    field,
    value
  ) => {
    setOrderDetails((prev) => {
      const updatedConsignments = [...prev.consignments];
      updatedConsignments[consIndex].consignmentItems[itemIndex][field] = value;
      return { ...prev, consignments: updatedConsignments };
    });

    // Update orderItems if the quantity is changed
    if (field === "dispatchedQuantity" || field === "deliveredQuantity") {
      const consignmentItem =
        orderDetails.consignments[consIndex].consignmentItems[itemIndex];
      const orderItem = orderDetails.orderItems.find(
        (item) => item.product._id === consignmentItem.product._id
      );

      if (orderItem) {
        try {
          const res = await fetch(`/api/orderitem/${orderItem._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              [field]: value,
            }),
          });

          if (!res.ok) throw new Error("Failed to update order item");
        } catch (error) {
          console.error("Update error:", error);
          alert("Failed to update order item.");
        }
      }
    }
  };

  const saveConsignmentChanges = async (consignmentId, consignmentData) => {
    try {
      const res = await fetch(`/api/consignment/${consignmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(consignmentData),
      });

      if (!res.ok) throw new Error("Failed to update consignment");

      alert("Consignment updated successfully!");
      fetchOrderDetails(); // Refresh the data
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update consignment.");
    }
  };

  const updatePOFile = async (e) => {
    try {
      const poFileUrl = await uploadToS3(e.target.files[0]);
      const res = await fetch(`/api/order/${orderDetails._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataToUpdate: { poFile: poFileUrl } }),
      });

      if (!res.ok) throw new Error("Failed to update order status");

      alert(`Order status updated Successfully`);
      fetchOrderDetails(); // Refresh the data
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update order status.");
    }
  };

  const updateOrderStatus = async (status) => {
    try {
      const res = await fetch(`/api/order/${orderDetails._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataToUpdate: { status } }),
      });

      if (!res.ok) throw new Error("Failed to update order status");

      alert(`Order status updated to ${status}`);
      fetchOrderDetails(); // Refresh the data
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update order status.");
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`;
  };

  if (loading)
    return (
      <div className="text-center text-gray-600">Loading order details...</div>
    );
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="w-full h-full flex flex-col bg-gray-100 p-4 rounded-lg">
      {/* Back Button & Edit Toggle */}
      <div className="w-full p-4 flex justify-between bg-white rounded-lg shadow-md">
        <button
          onClick={() => setSelectedOrder(null)}
          className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-all flex items-center"
        >
          <ArrowLeft className="mr-2" />
          Back
        </button>

        {hasAccess && (
          <button
            onClick={() => setEditAccess(!editAccess)}
            className="p-2 px-4 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition"
          >
            {editAccess ? "Cancel Edit" : "Edit Order"}
          </button>
        )}
      </div>

      {/* Customer Information */}
      <div className="w-full p-4 mx-auto bg-white shadow-md rounded-lg mt-4">
        <h2 className="text-2xl font-semibold mb-4">Customer Information</h2>
        <div className="border p-4 rounded-md bg-gray-50">
          {["name", "email", "phone", "address", "city", "state"].map(
            (field) => (
              <p key={field} className="mb-2">
                <strong>
                  {field.charAt(0).toUpperCase() + field.slice(1)}:
                </strong>{" "}
                {orderDetails.customer[field]}
              </p>
            )
          )}
        </div>
      </div>

      {/* Order Summary */}
      <div className="w-full p-4 mx-auto bg-white shadow-md rounded-lg mt-4">
        <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
        <div className="border p-4 rounded-md bg-gray-50">
          {orderKeys.map((field) => (
            <p key={field} className="mb-2">
              <strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong>{" "}
              {orderDetails[field]}
            </p>
          ))}
          {canViewPrices && (
            <p className="mb-2">
              <strong>Total:</strong> {orderDetails["total"]}{" "}
              {orderDetails["currency"]?.shorthand}
            </p>
          )}
          <button
            className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-all flex items-center"
            onClick={downloadPOFile}
          >
            Download PO File
          </button>
          {editAccess && (
            <FormInputField
              label="Update PO File"
              inputType="file"
              onChange={updatePOFile}
            />
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="w-full p-4 mx-auto bg-white shadow-md rounded-lg mt-4">
        <h2 className="text-2xl font-semibold mb-4">Order Items</h2>
        <table className="min-w-full border border-gray-200 rounded-md bg-white shadow-md">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr className="text-sm">
              {orderItemKeys.map((head) => (
                <th key={head} className="p-2 border">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orderDetails.orderItems.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-50 text-sm">
                <td className="p-2 border">{item.product.name}</td>
                <td className="p-2 border">{item.product.casNumber}</td>
                <td className="p-2 border">{item.initialQuantity}</td>
                <td className="p-2 border">{item.remainingQuantity}</td>
                <td className="p-2 border">{item.deliveredQuantity}</td>
                {canViewPrices && (
                  <td className="p-2 border">{item.price.toFixed(2)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Consignments */}
      <div className="w-full p-4 mx-auto bg-white shadow-md rounded-lg mt-4">
        <h2 className="text-2xl font-semibold mb-4">Consignments</h2>
        {orderDetails.consignments.map((consignment, consIndex) => (
          <div
            key={consignment._id}
            className="border p-4 rounded-md bg-gray-50 mt-2"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">
                Delivery Date:{" "}
                {editAccess ? (
                  <input
                    type="date"
                    value={consignment.deliveryDate}
                    onChange={(e) =>
                      handleConsignmentDateChange(consIndex, e.target.value)
                    }
                    className="p-1 border rounded-lg"
                  />
                ) : (
                  formatDate(consignment.deliveryDate)
                )}
              </h3>
            </div>
            {consignment.consignmentItems.map((item, itemIndex) => (
              <div key={item._id} className="flex items-center space-x-4 mt-2">
                <>
                  <span className="text-gray-700">{item.product.name}</span>
                  <span className="bg-gray-200 px-3 py-1 rounded">
                    {item.dispatchedQuantity}
                  </span>
                  {item.deliveredQuantity === item.dispatchedQuantity ? (
                    <Check className="text-green-600 w-8 h-8" />
                  ) : (
                    <span className="text-gray-700">
                      {item.deliveredQuantity}
                    </span>
                  )}
                </>
              </div>
            ))}
            {editAccess && (
              <button
                onClick={() =>
                  saveConsignmentChanges(consignment._id, consignment)
                }
                className="w-full py-2 mt-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-md"
              >
                Save Consignment Changes
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Order Actions */}
      {hasAccess && (
        <div className="w-full p-4 mx-auto bg-white shadow-md rounded-lg mt-4">
          <h2 className="text-2xl font-semibold mb-4">Order Actions</h2>
          <div className="flex space-x-4">
            <button
              disabled={orderDetails.status === "cancelled"}
              onClick={() => updateOrderStatus("cancelled")}
              className="p-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Cancel Order
            </button>
            <button
              onClick={() => updateOrderStatus("short_closed")}
              className="p-2 px-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              Short Close Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailsComponent;
