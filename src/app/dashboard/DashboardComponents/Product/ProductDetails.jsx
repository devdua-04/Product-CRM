"use client";
import { useDashBoard } from "@/Contexts/DashBoardContext";
import { useConfig } from "@/Contexts/ConfigContext"; // Import useConfig
import { ArrowLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/Contexts/AuthContext";

const ProductDetailsComponent = () => {
  const { user } = useAuth();
  const role = user?.role;
  const hasAccess = ["sales", "admin"].includes(role);
  const [productDetails, setProductDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { setSelectedProduct, selectedProduct } = useDashBoard();
  const { applicationData, packagingData } = useConfig(); // Get applicationData and packagingData

  const fetchProductDetails = async () => {
    try {
      const res = await fetch(`/api/product/${selectedProduct}`);
      const data = await res.json();
      setProductDetails(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch product details:", err);
      setError("Failed to fetch product details.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/product/${selectedProduct}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productDetails),
      });

      if (!res.ok) throw new Error("Failed to update product.");

      setIsEditing(false);
      fetchProductDetails(); // Refresh the data
    } catch (err) {
      console.error("Failed to update product:", err);
      setError("Failed to update product.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePackagingSelect = (e) => {
    const packagingId = e.target.value;
    const selectedPackaging = packagingData.find(
      (pkg) => pkg.term === packagingId
    );
    setProductDetails((prev) => ({
      ...prev,
      packaging: selectedPackaging || { term: "", definition: "" },
    }));
  };

  const handleMajorAppSelect = (e) => {
    const appId = e.target.value;
    const selectedApp = applicationData.find((app) => app.term === appId);
    setProductDetails((prev) => ({
      ...prev,
      majorApplication: selectedApp || { term: "", definition: "" },
    }));
  };

  const handleMinorAppSelect = (e) => {
    const appId = e.target.value;
    const selectedApp = applicationData.find((app) => app.term === appId);
    setProductDetails((prev) => ({
      ...prev,
      minorApplication: selectedApp || { term: "", definition: "" },
    }));
  };

  if (loading) {
    return (
      <div className="text-center text-gray-600">
        Loading product details...
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full p-1 md:p-4 flex justify-between bg-white shadow-md">
        <button
          onClick={() => setSelectedProduct(null)}
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

      <div className="w-full p-1 md:p-4 mx-auto bg-white shadow-md rounded-lg mt-2">
        <h2 className="text-2xl font-semibold mb-4">Product Information</h2>
        <div className="border p-4 rounded-md bg-gray-50">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={productDetails.name}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            ) : (
              <p>{productDetails.name}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CAS Number
            </label>
            {isEditing ? (
              <input
                type="text"
                name="casNumber"
                value={productDetails.casNumber}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            ) : (
              <p>{productDetails.casNumber}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            {isEditing ? (
              <textarea
                name="description"
                value={productDetails.description}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                rows="3"
              />
            ) : (
              <p>{productDetails.description}</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Packaging Details</h3>
          <div className="border p-4 rounded-md bg-gray-50">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Term
              </label>
              {isEditing ? (
                <select
                  value={productDetails.packaging.term}
                  onChange={handlePackagingSelect}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Select Packaging</option>
                  {packagingData.map((pkg) => (
                    <option key={pkg.term} value={pkg.term}>
                      {pkg.term} - {pkg.definition}
                    </option>
                  ))}
                </select>
              ) : (
                <p>{productDetails.packaging.term}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Definition
              </label>
              <p>{productDetails.packaging.definition}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Major Application</h3>
          <div className="border p-4 rounded-md bg-gray-50">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Term
              </label>
              {isEditing ? (
                <select
                  value={productDetails.majorApplication.term}
                  onChange={handleMajorAppSelect}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Select Major Application</option>
                  {applicationData.map((app) => (
                    <option key={app.term} value={app.term}>
                      {app.term} - {app.definition}
                    </option>
                  ))}
                </select>
              ) : (
                <p>{productDetails.majorApplication.term}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Definition
              </label>
              <p>{productDetails.majorApplication.definition}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Minor Application</h3>
          <div className="border p-4 rounded-md bg-gray-50">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Term
              </label>
              {isEditing ? (
                <select
                  value={productDetails.minorApplication.term}
                  onChange={handleMinorAppSelect}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Select Minor Application</option>
                  {applicationData.map((app) => (
                    <option key={app.term} value={app.term}>
                      {app.term} - {app.definition}
                    </option>
                  ))}
                </select>
              ) : (
                <p>{productDetails.minorApplication.term}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Definition
              </label>
              <p>{productDetails.minorApplication.definition}</p>
            </div>
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
  );
};

export default ProductDetailsComponent;
