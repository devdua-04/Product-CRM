"use client";
import { useAuth } from "@/Contexts/AuthContext";
import { useDashBoard } from "@/Contexts/DashBoardContext";
import { ArrowLeft } from "lucide-react";
import React, { useEffect, useState } from "react";

const CustomerDetailsComponent = () => {
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  const { user } = useAuth();
  const role = user?.role;
  const hasAccess = ["sales", "admin"].includes(role);

  const {
    handleTabChange,
    selectedCustomer,
    setSelectedCustomer,
    setSelectedOrder,
  } = useDashBoard();
  const fetchCustomerDetails = async () => {
    try {
      const res = await fetch(`/api/customer/${selectedCustomer}`);
      const data = await res.json();
      setCustomerDetails(data);
    } catch (error) {
      console.error("Error fetching customer details:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!selectedCustomer) return;
    setLoading(true);
    fetchCustomerDetails();
  }, [selectedCustomer]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/customer/${selectedCustomer}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerDetails.customer),
      });

      if (!res.ok) throw new Error("Failed to update customer.");

      setLoading(true);
      setIsEditing(false);
      // Refresh the data
      await fetch(`/api/customer/${selectedCustomer}`);
      fetchCustomerDetails();
    } catch (err) {
      console.error("Failed to update customer:", err);
      setError("Failed to update customer.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails((prev) => ({
      ...prev,
      customer: {
        ...prev.customer,
        [name]: value,
      },
    }));
  };

  const handleMsneChange = (e) => {
    const value = e.target.value === "true";
    setCustomerDetails((prev) => ({
      ...prev,
      customer: {
        ...prev.customer,
        msme: value,
      },
    }));
  };

  if (loading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  if (!customerDetails) {
    return (
      <div className="w-full p-1 md:p-4 mx-auto bg-white shadow-md rounded-lg">
        <button
          onClick={() => {
            setSelectedCustomer(null);
          }}
          className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-all"
        >
          <ArrowLeft />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Back Button */}
      <div className="w-full p-1 md:p-4 flex justify-between bg-white shadow-md">
        <button
          onClick={() => setSelectedCustomer(null)}
          className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-all"
        >
          <ArrowLeft />
        </button>
        {!isEditing && hasAccess && (
          <button
            onClick={handleEdit}
            className="p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-all"
          >
            Edit
          </button>
        )}
      </div>

      {/* Customer Details */}
      <div className="w-full p-1 md:p-4 mx-auto bg-white shadow-md rounded-lg mt-2">
        <h2 className="p-1 md:p-4 text-2xl font-semibold mb">
          Customer Details
        </h2>
        <div className="p-1 md:p-4 rounded-md bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={customerDetails.customer.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                />
              ) : (
                <p>{customerDetails.customer.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={customerDetails.customer.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                />
              ) : (
                <p>{customerDetails.customer.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="phone"
                  value={customerDetails.customer.phone}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                />
              ) : (
                <p>{customerDetails.customer.phone}</p>
              )}
            </div>

            {/* Address */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={customerDetails.customer.address}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                />
              ) : (
                <p>{customerDetails.customer.address}</p>
              )}
            </div>

            {/* City */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="city"
                  value={customerDetails.customer.city}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                />
              ) : (
                <p>{customerDetails.customer.city}</p>
              )}
            </div>

            {/* State */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="state"
                  value={customerDetails.customer.state}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                />
              ) : (
                <p>{customerDetails.customer.state}</p>
              )}
            </div>

            {/* GST No */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GST No
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="gstNo"
                  value={customerDetails.customer.gstNo}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                />
              ) : (
                <p>{customerDetails.customer.gstNo}</p>
              )}
            </div>

            {/* MSME */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                MSME
              </label>
              {isEditing ? (
                <select
                  name="msme"
                  value={customerDetails.customer.msme}
                  onChange={handleMsneChange}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value={true}>Yes</option>
                  <option value={false}>No</option>
                </select>
              ) : (
                <p>{customerDetails.customer.msme ? "Yes" : "No"}</p>
              )}
            </div>

            {/* Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              {isEditing ? (
                <select
                  name="type"
                  value={customerDetails.customer.type}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="Manufacturer">Manufacturer</option>
                  <option value="Trader">Trader</option>
                </select>
              ) : (
                <p>{customerDetails.customer.type}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Order History */}
      <div className="w-full p-1 md:p-4 mx-auto bg-white shadow-md rounded-lg mt-4">
        <h3 className="text-xl font-semibold mb-4">Order History</h3>
        {customerDetails.orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full rounded-md">
              <thead className="bg-gray-100 text-gray-700 font-semibold sticky top-0">
                <tr className="text-sm">
                  <th className="p-2 border whitespace-nowrap">Order ID</th>
                  <th className="p-2 border whitespace-nowrap">Order Date</th>
                  <th className="p-2 border whitespace-nowrap">
                    Delivery Date
                  </th>
                  <th className="p-2 border whitespace-nowrap">Total</th>
                  <th className="p-2 border whitespace-nowrap">Status</th>
                  <th className="p-2 border whitespace-nowrap"></th>
                </tr>
              </thead>
              <tbody>
                {customerDetails.orders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b hover:bg-gray-50 text-sm"
                  >
                    <td className="p-2 border">{order._id}</td>
                    <td className="p-2 border">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="p-2 border">
                      {new Date(order.deliveryDate).toLocaleDateString()}
                    </td>
                    <td className="p-2 border">
                      ${order.total.toLocaleString()}
                    </td>
                    <td
                      className={`p-2 border font-semibold ${
                        order.status === "complete"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </td>
                    <td className="p-2 border">
                      <button
                        onClick={() => {
                          setSelectedOrder(order._id);
                          handleTabChange(1);
                        }}
                        className="text-blue-600 font-medium hover:underline"
                      >
                        View Order
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 mt-4">No orders found.</p>
        )}
      </div>
    </div>
  );
};

export default CustomerDetailsComponent;
