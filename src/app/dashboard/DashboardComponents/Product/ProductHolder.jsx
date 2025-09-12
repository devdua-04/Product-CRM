"use client";
import React, { useEffect, useState } from "react";
import { useDashBoard } from "@/Contexts/DashBoardContext";
import ProductDetailsComponent from "./ProductDetails";
import { useAuth } from "@/Contexts/AuthContext";

function ProductHolder() {
  const [productData, setProductData] = useState([]);
  const { selectedProduct, setSelectedProduct, setAdd, add } = useDashBoard();

  const { user } = useAuth();
  const role = user?.role;
  const hasAccess = ["sales", "admin"].includes(role);

  const fetchProductData = async () => {
    try {
      const response = await fetch("/api/product"); // Fetching products
      const data = await response.json();
      setProductData(data);
    } catch (error) {
      console.error("Error fetching product data:", error);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [add]);

  return (
    <div className="w-full h-full flex flex-col">
      {selectedProduct ? (
        <ProductDetailsComponent />
      ) : (
        <>
          <div className="w-full p-1 md:p-5 flex justify-between items-center bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-bold text-gray-800">Products</h1>
            {hasAccess && (
              <button
                onClick={() => setAdd(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
              >
                + Add Product
              </button>
            )}
          </div>

          {/* Scrollable Table for Mobile */}
          <div className="w-full p-1 md:p-5 border-2 border-gray-300 rounded-lg mt-5 overflow-y-auto bg-gray-50 shadow-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-gray-200 text-gray-700 font-semibold sticky top-0">
                  <tr className="text-sm">
                    <th className="p-3 text-left whitespace-nowrap">
                      Product Name
                    </th>
                    <th className="p-3 text-left whitespace-nowrap">
                      CAS Number
                    </th>
                    <th className="p-3 text-left whitespace-nowrap">
                      Description
                    </th>
                    <th className="p-3 text-left whitespace-nowrap"></th>
                  </tr>
                </thead>
                <tbody>
                  {productData.map((product) => (
                    <tr
                      key={product._id}
                      className="border-t text-gray-800 text-sm hover:bg-gray-100"
                    >
                      <td className="p-3">{product.name}</td>
                      <td className="p-3">{product.casNumber}</td>
                      <td className="p-3">{product.description}</td>
                      <td className="p-3">
                        <button
                          onClick={() => setSelectedProduct(product._id)}
                          className="text-blue-600 hover:underline"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ProductHolder;
