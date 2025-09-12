"use client";

import FormInputField from "@/Components/UI/FormInputField";
import FormSelectField from "@/Components/UI/FormSelectField";
import React, { useState } from "react";

const CustomerAddingForm = ({ setShowForm, refreshCustomers }) => {
  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    gstNo: "",
    type: "",
    msme: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setCustomerData({ ...customerData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    setCustomerData({ ...customerData, [e.target.name]: e.target.checked });
  };

  const submitCustomer = async () => {
    setLoading(true);
    setError("");

    if (!customerData.name || !customerData.phone) {
      setError("Name and Phone are required.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      });

      if (!res.ok) throw new Error("Failed to add customer.");

      setShowForm(false);
      window.location.reload(); // Reloading to reflect changes
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 py-10 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white h-full overflow-y-scroll scroll-bar-hide p-6 rounded-lg shadow-lg w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Add New Customer
        </h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Form Fields */}
        <div className="space-y-4">
          <FormInputField
            label="Customer Name"
            inputType="text"
            value={customerData.name}
            onChange={handleChange}
            name="name"
          />
          <FormInputField
            label="Email (optional)"
            inputType="email"
            value={customerData.email}
            onChange={handleChange}
            name="email"
          />
          <FormSelectField
            label={"Customer Type"}
            value={customerData.type}
            onchange={(e) => {
              setCustomerData({ ...customerData, type: e.target.value });
            }}
            options={["Manufacturer", "Trader"].map((el) => ({
              name: el,
              value: el,
            }))}
          />
          <FormInputField
            label="Phone Number"
            inputType="tel"
            value={customerData.phone}
            onChange={handleChange}
            name="phone"
          />
          <FormInputField
            label="GST No."
            inputType="text"
            value={customerData.gstNo}
            onChange={handleChange}
            name="gstNo"
          />

          {/* Checkbox Field */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="msme"
              checked={customerData.msme}
              onChange={handleCheckboxChange}
              className="rounded"
            />
            <span className="text-gray-800">MSME</span>
          </div>

          {/* Address Fields */}
          <FormInputField
            label="Address"
            inputType="text"
            value={customerData.address}
            onChange={handleChange}
            name="address"
          />
          <FormInputField
            label="City"
            inputType="text"
            value={customerData.city}
            onChange={handleChange}
            name="city"
          />
          <FormInputField
            label="State"
            inputType="text"
            value={customerData.state}
            onChange={handleChange}
            name="state"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={() => setShowForm(false)}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={submitCustomer}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:ring-2 focus:ring-green-500"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Customer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerAddingForm;
