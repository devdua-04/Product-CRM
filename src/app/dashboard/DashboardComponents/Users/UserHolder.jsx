"use client";

import React, { useEffect, useState } from "react";
import { useDashBoard } from "@/Contexts/DashBoardContext";

const UserHolder = () => {
  const [userData, setUserData] = useState([]);
  const { selectedUser, setSelectedUser, setAdd, add } = useDashBoard();

  // Fetch User Data
  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user");
      const data = await response.json();
      setUserData(data.users || []);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [add]);

  // Handle Role Change
  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`/api/user/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) throw new Error("Failed to update role");

      setUserData((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  // Handle User Activation
  const handleGrantAccess = async (userId, enabled) => {
    try {
      const response = await fetch(`/api/user/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: enabled }),
      });

      if (!response.ok) throw new Error("Failed to enable user");

      setUserData((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, enabled: true } : user
        )
      );
      fetchUserData();
    } catch (error) {
      console.error("Error enabling user:", error);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full p-1 md:p-5 flex justify-between items-center bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold text-gray-800">Users</h1>
        <button
          onClick={() => setAdd(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          + Add User
        </button>
      </div>

      {/* Scrollable Table for Users */}
      <div className="w-full p-1 md:p-5 border-2 border-gray-300 rounded-lg mt-5 overflow-y-auto bg-gray-50 shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-200 text-gray-700 font-semibold sticky top-0">
              <tr className="text-sm">
                <th className="p-3 text-left whitespace-nowrap">Name</th>
                <th className="p-3 text-left whitespace-nowrap">Email</th>
                <th className="p-3 text-left whitespace-nowrap">Role</th>
                <th className="p-3 text-left whitespace-nowrap">Enabled</th>
                <th className="p-3 text-left whitespace-nowrap">Created At</th>
                <th className="p-3 text-left whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {userData.map((user) => (
                <tr
                  key={user._id}
                  className="border-t text-gray-800 text-sm hover:bg-gray-100"
                >
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user._id, e.target.value)
                      }
                      className="border p-1 rounded-lg bg-white"
                    >
                      {[
                        "admin",
                        "user",
                        "sales",
                        "dispatch",
                        "quality_control",
                        "production",
                      ].map((role) => {
                        return (
                          <option key={role} value={role}>
                            {role.toUpperCase()}
                          </option>
                        );
                      })}
                    </select>
                  </td>
                  <td className="p-3">
                    {user.enabled ? (
                      <span className="text-green-600 font-semibold">
                        Active
                      </span>
                    ) : (
                      <span className="text-red-600 font-semibold">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 space-x-2">
                    {!user.enabled ? (
                      <button
                        onClick={() => handleGrantAccess(user._id, true)}
                        className="bg-green-500 text-white px-3 py-1 rounded-lg shadow hover:bg-green-600 transition"
                      >
                        Grant Access
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const p = prompt("Are You Sure you want to revoke access of this User ?")
                          console.log(p);
                          handleGrantAccess(user._id, false)
                        }}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg shadow hover:bg-red-600 transition"
                      >
                        Revoke Access
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserHolder;
