"use client";
import { useConfig } from "@/Contexts/ConfigContext";
import React, { useEffect, useState } from "react";

const ProductAddingForm = ({ setShowForm }) => {
  const [productData, setProductData] = useState({
    name: "",
    casNumber: "",
    description: "",
    packaging: {},
    majorApplication: {},
    minorApplication: {}
  });

  const { applicationData, packagingData } = useConfig();
  
  const [selectedPackaging, setSelectedPackaging] = useState("");
  const [selectedMajorApp, setSelectedMajorApp] = useState("");
  const [selectedMinorApp, setSelectedMinorApp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log(JSON.stringify([applicationData, packagingData]));
  }, []);

  const handleChange = (e) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  const handlePackagingSelect = (e) => {
    const packagingId = e.target.value;
    setSelectedPackaging(packagingId);
    
    // Find the selected packaging data
    if (packagingId) {
      const selected = packagingData.find(item => item.term === packagingId);
      if (selected) {
        setProductData(prev => ({
          ...prev,
          packaging: selected
        }));
      }
    } else {
      // Clear packaging if none selected
      setProductData(prev => ({
        ...prev,
        packaging: {}
      }));
    }
  };

  const handleMajorAppSelect = (e) => {
    const appId = e.target.value;
    setSelectedMajorApp(appId);
    
    // Find the selected application data
    if (appId) {
      const selected = applicationData.find(item => item.term === appId);
      if (selected) {
        setProductData(prev => ({
          ...prev,
          majorApplication: selected
        }));
      }
    } else {
      // Clear major application if none selected
      setProductData(prev => ({
        ...prev,
        majorApplication: {}
      }));
    }
  };

  const handleMinorAppSelect = (e) => {
    const appId = e.target.value;
    setSelectedMinorApp(appId);
    
    // Find the selected application data
    if (appId) {
      const selected = applicationData.find(item => item.term === appId);
      if (selected) {
        setProductData(prev => ({
          ...prev,
          minorApplication: selected
        }));
      }
    } else {
      // Clear minor application if none selected
      setProductData(prev => ({
        ...prev,
        minorApplication: {}
      }));
    }
  };

  const isFormValid = () => {
    return (
      productData.name.trim() !== "" &&
      productData.casNumber.trim() !== "" &&
      productData.description.trim() !== "" &&
      productData.packaging.term &&
      productData.majorApplication.term &&
      productData.minorApplication.term
    );
  };

  const submitProduct = async () => {
    if (!isFormValid()) {
      setError("Please fill all required fields including packaging and applications.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (!res.ok) throw new Error("Failed to add product.");

      setShowForm(false);
      // window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed p-1 inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Add New Product</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              placeholder="Product Name"
              value={productData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CAS Number *
            </label>
            <input
              type="text"
              name="casNumber"
              placeholder="CAS Number"
              value={productData.casNumber}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Description *
            </label>
            <textarea
              name="description"
              placeholder="Product Description"
              value={productData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Packaging Type *
            </label>
            <select
              value={selectedPackaging}
              onChange={handlePackagingSelect}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Select Packaging</option>
              {packagingData && packagingData.map((pkg, index) => (
                <option key={index} value={pkg.term}>
                  {pkg.term} - {pkg.definition}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Major Application *
            </label>
            <select
              value={selectedMajorApp}
              onChange={handleMajorAppSelect}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Select Major Application</option>
              {applicationData && applicationData.map((app, index) => (
                <option key={index} value={app.term}>
                  {app.term} - {app.definition}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minor Application *
            </label>
            <select
              value={selectedMinorApp}
              onChange={handleMinorAppSelect}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Select Minor Application</option>
              {applicationData && applicationData.map((app, index) => (
                <option key={index} value={app.term}>
                  {app.term} - {app.definition}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button 
            onClick={() => setShowForm(false)} 
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={submitProduct}
            disabled={!isFormValid() || loading}
            className={`px-4 py-2 text-white rounded-lg ${
              !isFormValid() || loading
                ? "bg-green-400"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Adding..." : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductAddingForm;