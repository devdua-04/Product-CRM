"use client";
import React, { useEffect, useState } from "react";
import { useDashBoard } from "@/Contexts/DashBoardContext";
import DispatchDetails from "./DispatchDetails";
import { EyeIcon } from "lucide-react";
import { useAuth } from "@/Contexts/AuthContext";

function DispatchHolder() {
  const [dispatchData, setDispatchData] = useState([]);
  const { selectedDispatch, setSelectedDispatch, setAdd } = useDashBoard();

  const { user } = useAuth();
  const role = user?.role;
  const hasAccess = ["dispatch"].includes(role);
  const canViewPrices = ["sales","admin","dispatch"].includes(role)

  const fetchDispatchData = async () => {
    try {
      const response = await fetch("/api/dispatch"); // Fetching dispatch records
      if (!response.ok) {
        return;
      }
      const data = await response.json();

      setDispatchData(data);
    } catch (error) {
      console.error("Error fetching dispatch data:", error);
    }
  };

  useEffect(() => {
    fetchDispatchData();
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      {selectedDispatch ? (
        <DispatchDetails />
      ) : (
        <>
          <div className="w-full p-1 md:p-5 flex justify-between items-center bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-bold text-gray-800">
              Dispatch Records
            </h1>
            {hasAccess && (
              <button
                onClick={() => setAdd(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
              >
                + Create Dispatch
              </button>
            )}
          </div>

          {/* Scrollable Table */}
          <div className="w-full p-1 text-left -gray-300 rounded-lg mt-5 overflow-y-auto bg-gray-50 shadow-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full -collapse">
                {/* Table Header */}
                <thead className="bg-gray-200 text-gray-700 font-semibold sticky top-0">
                  <tr className="text-sm">
                    <th className="p-2 whitespace-nowrap">Customer</th>
                    <th className="p-2 whitespace-nowrap">Phone</th>
                    <th className="p-2 whitespace-nowrap">PO Number</th>
                    <th className="p-2 whitespace-nowrap">Invoice Number</th>
                    <th className="p-2 whitespace-nowrap">Product</th>
                    <th className="p-2 whitespace-nowrap">Quantity</th>
                    <th className="p-2 whitespace-nowrap">Status</th>
                    <th className="p-2 whitespace-nowrap">Dispatch Date</th>
                    <th className="p-2 whitespace-nowrap"></th>
                  </tr>
                </thead>

                {/* Dispatch Records */}
                <tbody>
                  {dispatchData.map((dispatch) => {
                    const customer = dispatch.customerId || {};
                    const order = dispatch.orderId || {};

                    return (
                      <tr
                        key={dispatch._id}
                        className="-b hover:bg-gray-100 text-sm"
                      >
                        <td className="p-2 ">{customer.name || "N/A"}</td>
                        <td className="p-2 ">{customer.phone || "N/A"}</td>
                        <td className="p-2 ">{order.poNumber || "N/A"}</td>
                        <td className="p-2 ">{dispatch.invoiceNo || "N/A"}</td>
                        <td className="p-2  flex flex-col justify-between items-center">
                          <div className="flex h-full w-full flex-col justify-between">
                            {dispatch.items?.map((item, index) => (
                              <p key={index}>{item.product.name}</p>
                            )) || "N/A"}
                          </div>
                        </td>
                        <td className="p-2 ">
                          <div className="flex h-full w-full flex-col justify-between">
                            {dispatch.items?.map((item, index) => (
                              <p key={index}>{item.quantity}</p>
                            )) || "N/A"}
                          </div>
                        </td>
                        <td
                          className={`p-2 font-bold rounded-lg ${
                            order.status === "complete"
                              ? "text-green-600 "
                              : order.status === "partial_complete"
                              ? "text-yellow-600 "
                              : "text-red-600 "
                          }`}
                        >
                          {dispatch.consignment.overallStatus || "N/A"}
                        </td>
                        <td className="p-2 ">
                          {dispatch.dispatchDate
                            ? new Date(
                                dispatch.dispatchDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="p-2 ">
                          <button
                            onClick={() => setSelectedDispatch(dispatch._id)}
                          >
                            <EyeIcon />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DispatchHolder;
