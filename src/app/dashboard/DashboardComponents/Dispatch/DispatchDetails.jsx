"use client";
import React, { useEffect, useState } from "react";
import { useDashBoard } from "@/Contexts/DashBoardContext";
import { ArrowLeft } from "lucide-react";

const DispatchDetails = () => {
  const [dispatchDetails, setDispatchDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const { selectedDispatch, setSelectedDispatch } = useDashBoard();

  useEffect(() => {
    if (!selectedDispatch) return;

    setLoading(true);
    const fetchDispatchDetails = async () => {
      try {
        const res = await fetch(`/api/dispatch/${selectedDispatch}`);
        const data = await res.json();

        setDispatchDetails(data.dispatch);
      } catch (error) {
        console.error("Error fetching dispatch details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDispatchDetails();
  }, [selectedDispatch]);

  if (loading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  if (!dispatchDetails) {
    return (
      <div className="w-full p-1 md:p-5 mx-auto bg-white shadow-lg rounded-lg">
        <button 
          onClick={() => setSelectedDispatch(null)} 
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft />
          <span>Back</span>
        </button>
        <p className="text-center text-gray-500 mt-4">No dispatch details found.</p>
      </div>
    );
  }

  const { customerId, orderId, dispatchDate, items,invoiceNo } = dispatchDetails;
  console.log("Dispatch Details:", dispatchDetails);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Back Button */}
      <div className="w-full p-1 md:p-5 flex justify-start bg-white shadow-md">
        <button 
          onClick={() => setSelectedDispatch(null)} 
          className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-all"
        >
          <ArrowLeft />
        </button>
      </div>

      {/* Customer Details */}
      <div className="w-full p-1 md:p-5 mx-auto bg-white shadow-lg rounded-lg mt-2">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Customer Information</h2>
        <div className="border p-4 rounded-lg bg-gray-50">
          <p><strong>Name:</strong> {customerId?.name || "N/A"}</p>
          <p><strong>Email:</strong> {customerId?.email || "N/A"}</p>
          <p><strong>Phone:</strong> {customerId?.phone || "N/A"}</p>
          <p>
            <strong>Address:</strong> {customerId?.address || "N/A"}, {customerId?.city || "N/A"}, {customerId?.state || "N/A"}
          </p>
        </div>
      </div>

      {/* Order Details */}
      <div className="w-full p-1 md:p-5 mx-auto bg-white shadow-lg rounded-lg mt-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Order Information</h3>
        <div className="border p-4 rounded-lg bg-gray-50">
          <p><strong>Order ID:</strong> {orderId?._id || "N/A"}</p>
          <p><strong>Order Date:</strong> {orderId?.orderDate ? new Date(orderId.orderDate).toLocaleDateString() : "N/A"}</p>
          <p><strong>Delivery Date:</strong> {orderId?.deliveryDate ? new Date(orderId.deliveryDate).toLocaleDateString() : "N/A"}</p>
          <p><strong>Total Amount:</strong> ₹{orderId?.total?.toLocaleString() || "N/A"}</p>
          <p>
            <strong>Status:</strong>
            <span className={`px-2 py-1 rounded-md ${orderId?.status === "complete" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}>
              {orderId?.status || "N/A"}
            </span>
          </p>
        </div>
      </div>

      {/* Dispatch Details */}
      <div className="w-full p-1 md:p-5 mx-auto bg-white shadow-lg rounded-lg mt-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Dispatch Information</h3>
        <div className="border p-4 rounded-lg bg-gray-50">
          <p><strong>Invoice Number:</strong> {invoiceNo}</p>
        </div>
        <div className="border p-4 rounded-lg bg-gray-50">
          <p><strong>Dispatch Date:</strong> {dispatchDate ? new Date(dispatchDate).toLocaleDateString() : "N/A"}</p>
        </div>
      </div>

      {/* Dispatched Products */}
      <div className="w-full p-1 md:p-5 mx-auto bg-white shadow-lg rounded-lg mt-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Products Shipped</h3>
        {items && items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
              <thead className="bg-gray-100 text-left text-gray-700">
                <tr className="text-sm">
                  <th className="p-2 border whitespace-nowrap">Product Name</th>
                  <th className="p-2 border whitespace-nowrap">CAS Number</th>
                  <th className="p-2 border whitespace-nowrap">Quantity Supplied</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="border-b hover:bg-gray-50 transition text-sm">
                    <td className="p-2 border">{item?.product?.name || "N/A"}</td>
                    <td className="p-2 border">{item?.product?.casNumber || "N/A"}</td>
                    <td className="p-2 border">{item?.quantitySupplied || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 mt-4">No products were shipped in this dispatch.</p>
        )}
      </div>
    </div>
  );
};

export default DispatchDetails;
