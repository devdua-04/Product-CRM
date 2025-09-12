"use client";

import { useEffect, useState } from "react";
import { PlusCircle, Save, Trash2, RefreshCw } from "lucide-react";

const ConfigEditor = () => {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("");

  // Fetch Config Data with Error Handling
  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/config");

      if (!response.ok) {
        throw new Error(`Server Error: ${response.status} ${response.statusText}`);
      }

      const configData = await response.json();

      if (typeof configData !== "object" || Array.isArray(configData)) {
        throw new Error("Invalid API response format.");
      }

      // Ensure each key has an array, defaulting to an empty array
      const formattedConfig = Object.keys(configData).reduce((acc, key) => {
        if (!["_id", "__v"].includes(key)) {
          acc[key] = Array.isArray(configData[key]) ? configData[key] : [];
        }
        return acc;
      }, {});
      setConfig(formattedConfig);
      setActiveTab(Object.keys(formattedConfig)[0] || ""); // Set first category as active if available
    } catch (err) {
      setError(err.message || "An unexpected error occurred while fetching configuration.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Update Config in API with Error Handling
  const saveConfig = async () => {
    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(`Failed to save configuration: ${response.status}`);
      }

      alert("Configuration saved successfully!");
    } catch (err) {
      setError(err.message || "Error saving configuration.");
    } finally {
      setSaving(false);
    }
  };

  // Handle field updates dynamically
  const handleUpdate = (category, index, field, value) => {
    setConfig((prev) => {
      const updatedCategory = [...prev[category]];
      updatedCategory[index][field] = value;
      return { ...prev, [category]: updatedCategory };
    });
  };

  // Add new item dynamically based on existing keys
  const handleAddItem = (category) => {
    if (!config[category] || config[category].length === 0) return;
    const keys = Object.keys(config[category][0]).filter(key => !["_id", "__v"].includes(key));
    const newItem = keys.reduce((acc, key) => ({ ...acc, [key]: "" }), {});
    setConfig((prev) => ({
      ...prev,
      [category]: [newItem, ...prev[category]],
    }));
  };

  // Remove item
  const handleRemoveItem = (category, index) => {
    setConfig((prev) => {
      const updatedCategory = prev[category].filter((_, i) => i !== index);
      return { ...prev, [category]: updatedCategory };
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Configuration Editor
      </h1>

      {/* Display API Error with Retry Button */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 flex justify-between items-center rounded-lg">
          <p>{error}</p>
          <button
            onClick={fetchConfig}
            className="text-blue-600 hover:underline flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" /> Retry
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-4">
          {Object.keys(config).map((category) => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === category
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {category.replace(/([A-Z])/g, " $1").trim()}
            </button>
          ))}
        </nav>
      </div>

      {/* Configuration Sections */}
      {activeTab && config[activeTab] && (
        <ConfigSection
          title={activeTab.replace(/([A-Z])/g, " $1").trim()}
          data={config[activeTab]}
          category={activeTab}
          onUpdate={handleUpdate}
          onAdd={() => handleAddItem(activeTab)}
          onRemove={handleRemoveItem}
        />
      )}

      {/* Save Button */}
      <button
        onClick={saveConfig}
        disabled={saving}
        className="w-full mt-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center justify-center"
      >
        {saving ? "Saving..." : <><Save className="w-5 h-5 mr-2" /> Save Configuration</>}
      </button>
    </div>
  );
};

// Config Section (Filters out _id and __v keys)
const ConfigSection = ({ title, data, category, onUpdate, onAdd, onRemove }) => {
  if (!Array.isArray(data)) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">{title}</h2>
        <p className="text-gray-500 italic">Invalid data format. Please check API response.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-700">{title}</h2>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Add New
        </button>
      </div>

      <div className="space-y-4">
        {data.length === 0 ? (
          <p className="text-gray-500 italic">No items available. Click "Add New" to start.</p>
        ) : (
          data.map((item, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                {Object.keys(item)
                  .filter((key) => !["_id", "__v"].includes(key))
                  .map((key) => (
                    <input
                      key={key}
                      type="text"
                      value={item[key] || ""}
                      onChange={(e) => onUpdate(category, index, key, e.target.value)}
                      placeholder={`Enter ${key}`}
                      className="w-full mr-2 p-2 border rounded-lg focus:ring-2 focus:ring-blue-300"
                    />
                  ))}
                <button
                  onClick={() => onRemove(category, index)}
                  className="p-2 text-red-500 hover:text-red-700 transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const LoadingSpinner = () => <div className="flex justify-center h-12">Loading...</div>;

export default ConfigEditor;
