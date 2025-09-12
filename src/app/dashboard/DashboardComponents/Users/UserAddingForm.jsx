"use client";

import FormInputField from "@/Components/UI/FormInputField";
import FormSelectField from "@/Components/UI/FormSelectField";
import React, { useState } from "react";

const UserAddingForm = ({ setShowForm }) => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
    enabled: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roles = [
    "admin",
    "user",
    "sales",
    "dispatch",
    "quality_control",
    "production",
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserData({ ...userData, [name]: type === "checkbox" ? checked : value });
  };

  const submitUser = async () => {
    setLoading(true);
    setError("");

    if (
      !userData.name ||
      !userData.email ||
      !userData.phone ||
      !userData.password
    ) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!res.ok) throw new Error("Failed to add user.");

      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 py-10 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white h-full overflow-y-scroll p-6 rounded-lg shadow-lg w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Add New User</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="space-y-4">
          <FormInputField
            label="User Name"
            inputType="text"
            value={userData.name}
            onChange={handleChange}
            name="name"
          />
          <FormInputField
            label="Email"
            inputType="email"
            value={userData.email}
            onChange={handleChange}
            name="email"
          />
          <FormInputField
            label="Phone Number"
            inputType="tel"
            value={userData.phone}
            onChange={handleChange}
            name="phone"
          />
          <FormInputField
            label="Password"
            inputType="password"
            value={userData.password}
            onChange={handleChange}
            name="password"
          />

          <FormSelectField
            label="Role"
            value={userData.role}
            onchange={(e) => setUserData({ ...userData, role: e.target.value })}
            options={roles.map((el) => ({ name: el, value: el }))}
          />

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="enabled"
              checked={userData.enabled}
              onChange={handleChange}
              className="h-5 w-5"
            />
            <label className="text-gray-700 font-medium">Enabled</label>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={() => setShowForm(false)}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={submitUser}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add User"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserAddingForm;
