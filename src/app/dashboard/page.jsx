"use client";

import { useEffect, useState } from "react";
import FileInfoBar from "@/app/dashboard/DashboardComponents/FileInfoBar";
import OrderHolder from "@/app/dashboard/DashboardComponents/Orders/OrderHolder";
import SideBar from "./DashboardComponents/SideBar";
import OrderAddingForm from "./DashboardComponents/Orders/OrderAddingForm";
import CustomerHolder from "./DashboardComponents/Customer/CustomerHolder";
import CustomerAddingForm from "./DashboardComponents/Customer/CustomerAddingForm";
import { useDashBoard } from "@/Contexts/DashBoardContext";
import DispatchHolder from "./DashboardComponents/Dispatch/DispatchHolder";
import DispatchForm from "./DashboardComponents/Dispatch/DispatchForm";
import ProductHolder from "./DashboardComponents/Product/ProductHolder";
import ProductAddingForm from "./DashboardComponents/Product/ProductAddingForm";
import { MenuIcon, X } from "lucide-react";
import ConfigEditor from "./DashboardComponents/Config/ConfigEditor";
import UserHolder from "./DashboardComponents/Users/UserHolder";
import { useAuth } from "@/Contexts/AuthContext";
import UserAddingForm from "./DashboardComponents/Users/UserAddingForm";

export default function App() {
  const { tab, update, stats, setStats, add, setAdd } = useDashBoard();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  let touchStartX = 0;
  let touchEndX = 0;

  const { user } = useAuth();
  const { role, enabled } = user || {
    role: "user",
    enabled: false,
  };

  useEffect(() => {
    // fetchStats();
  }, [update]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Handle touch start
  const handleTouchStart = (e) => {
    touchStartX = e.changedTouches[0].screenX;
  };

  // Handle touch end
  const handleTouchEnd = (e) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchEndX - touchStartX > 100) {
      setIsSidebarOpen(true); // Swipe right → open sidebar
    } else if (touchStartX - touchEndX > 100) {
      setIsSidebarOpen(false); // Swipe left → close sidebar
    }
  };

  // Role-Based Access Control (RBAC)
  const accessControl = {
    admin: [1, 2, 3, 4, 5, 6], // Full access
    user: [], // No access
    sales: [1, 2, 3, 4, 5], // Orders, Customers, Products
    production: [1, 3], // Orders & Dispatch
    quality_control: [1, 3],
    dispatch: [1, 2, 3, 4],
  };

  // If user is not enabled, show request approval message
  if (role === "user" || !enabled) {
    return (
      <div className="flex items-center justify-center h-screen text-center">
        <div className="max-w-lg p-6 bg-white shadow-md rounded-lg">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2 text-gray-600">
            Your account is not yet approved. Please request an admin to approve
            your access to the CRM.
          </p>
        </div>
      </div>
    );
  }

  // If the selected tab is not in the user's allowed access, block access
  if (!accessControl[role]?.includes(tab)) {
    return (
      <div className="flex items-center justify-center h-screen text-center">
        <div className="max-w-lg p-6 bg-white shadow-md rounded-lg">
          <h1 className="text-2xl font-bold text-red-600">Access Restricted</h1>
          <p className="mt-2 text-gray-600">
            You do not have permission to access this section.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-full w-screen md:p-10 p-1 relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Sidebar with Mobile Swipe Support */}
      <div
        className={`fixed top-0 left-0 py-10 md:py-2 md:relative z-10 h-full w-64 bg-gray-100 p-2 rounded-lg shadow-lg transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="w-full h-8 relative md:hidden">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="top-4 right-4 fixed text-gray-600 md:hidden"
          >
            <X />
          </button>
        </div>
        <SideBar accessControl={accessControl} />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pt-4 md:px-6 p-1 scroll-bar-hide">
        {/* Sidebar Toggle Button for Mobile */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-4 right-4 text-gray-600 md:hidden bg-gray-200 p-2 rounded-md shadow-md"
          >
            <MenuIcon />
          </button>
        )}

        {/* Role-Based Tab Rendering */}
        {
          {
            1: <OrderHolder />,
            2: <CustomerHolder />,
            3: <DispatchHolder />,
            4: <ProductHolder />,
            5: <ConfigEditor />,
            6: <UserHolder />,
          }[tab]
        }

        {/* Role-Based Form Rendering */}
        {add &&
          {
            1: <OrderAddingForm setShowForm={setAdd} />,
            2: <CustomerAddingForm setShowForm={setAdd} />,
            3: <DispatchForm setShowForm={setAdd} />,
            4: <ProductAddingForm setShowForm={setAdd} />,
            6: <UserAddingForm setShowForm={setAdd} />,
          }[tab]}
      </div>
    </div>
  );
}
