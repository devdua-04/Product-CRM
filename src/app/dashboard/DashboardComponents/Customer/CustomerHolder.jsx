"use client";
import React, { useEffect, useState } from "react";
import CustomerDetailsComponent from "./CustomerDetailsComponent";
import { useDashBoard } from "@/Contexts/DashBoardContext";
import { useAuth } from "@/Contexts/AuthContext";

function CustomerHolder() {
  const [CustomerData, setCustomerData] = useState([]);
  const { selectedCustomer, setSelectedCustomer, setAdd } = useDashBoard();

  const { user } = useAuth();
  const role = user?.role;
  const hasAccess = ["sales", "admin"].includes(role);

  const fetchCustomerData = async () => {
    try {
      const Customers = await fetch("/api/customer"); // Fetching Customers from the server
      const data = await Customers.json();
      setCustomerData(data);
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      {selectedCustomer ? (
        <CustomerDetailsComponent />
      ) : (
        <>
          {/* Header */}
          <div className="w-full flex flex-col md:flex-row justify-between items-center px-4 py-4 bg-white shadow-md">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              Customers
            </h1>
            {hasAccess && (
              <button
                onClick={() => setAdd(true)}
                className="mt-2 md:mt-0 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all focus:ring-2 focus:ring-green-500"
              >
                Add Customer
              </button>
            )}
          </div>

          {/* Scrollable Table Container */}
          <div className="border-2 border-gray-300 rounded-2xl mt-5 overflow-y-auto w-full h-[60vh] bg-gray-50">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                {/* Table Header */}
                <thead className="bg-gray-200 text-gray-700 font-semibold sticky top-0">
                  <tr className="text-sm">
                    <th className="p-3 text-left whitespace-nowrap">
                      Customer
                    </th>
                    <th className="p-3 text-left whitespace-nowrap">Phone</th>
                    <th className="p-3 text-left whitespace-nowrap">Email</th>
                    <th className="p-3 text-left whitespace-nowrap">Address</th>
                    <th className="p-3 text-left whitespace-nowrap">City</th>
                    <th className="p-3 text-left whitespace-nowrap">State</th>
                    <th className="p-3 text-left whitespace-nowrap">
                      Customer Type
                    </th>
                    <th className="p-3 text-left whitespace-nowrap">
                      Export Type
                    </th>
                    <th className="p-3 text-left whitespace-nowrap">GST No.</th>
                    <th className="p-3 text-left whitespace-nowrap">MSME</th>
                    <th className="p-3 text-left whitespace-nowrap">Actions</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {CustomerData.length === 0 ? (
                    <tr>
                      <td
                        colSpan="9"
                        className="text-center py-4 text-gray-500"
                      >
                        No customers found.
                      </td>
                    </tr>
                  ) : (
                    CustomerData.map((el, index) => (
                      <tr
                        key={index}
                        className="border-t text-gray-800 text-sm hover:bg-gray-100"
                      >
                        <td className="p-3">{el.name}</td>
                        <td className="p-3">{el.phone}</td>
                        <td className="p-3">{el.email || "N/A"}</td>
                        <td className="p-3">{el.address || "N/A"}</td>
                        <td className="p-3">{el.city || "N/A"}</td>
                        <td className="p-3">{el.state || "N/A"}</td>
                        <td className="p-3">{el.type || "N/A"}</td>
                        <td className="p-3">{el.gstNo || "N/A"}</td>
                        <td className="p-3">{el.msme ? "Yes" : "No"}</td>
                        <td className="p-3 text-center">
                          <button
                            className="text-blue-600 font-medium hover:underline"
                            onClick={() => setSelectedCustomer(el._id)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CustomerHolder;
