import { useDashBoard } from "@/Contexts/DashBoardContext";
import { useAuth } from "@/Contexts/AuthContext";
import {
  HomeIcon,
  ListOrdered,
  LogOutIcon,
  PackageIcon,
  Settings,
  TestTube2,
  User,
  User2,
} from "lucide-react";
import React from "react";

const SideBar = ({accessControl}) => {
  const { tab, handleTabChange } = useDashBoard();
  const { user, logout } = useAuth();
  const { role, enabled } = user;


  // If user is not enabled, show request approval message
  if (role === "user" && !enabled) {
    return (
      <div className="flex items-center justify-center h-screen text-center p-4">
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

  return (
    <div className="h-full flex justify-between flex-col">
      <div className="space-y-4">
        {accessControl[role]?.includes(1) && (
          <SidebarButton
            icon={<ListOrdered />}
            label="Orders"
            isActive={tab === 1}
            onClick={() => handleTabChange(1)}
          />
        )}
        {accessControl[role]?.includes(2) && (
          <SidebarButton
            icon={<User />}
            label="Customers"
            isActive={tab === 2}
            onClick={() => handleTabChange(2)}
          />
        )}
        {accessControl[role]?.includes(3) && (
          <SidebarButton
            icon={<PackageIcon />}
            label="Dispatches"
            isActive={tab === 3}
            onClick={() => handleTabChange(3)}
          />
        )}
        {accessControl[role]?.includes(4) && (
          <SidebarButton
            icon={<TestTube2 />}
            label="Products"
            isActive={tab === 4}
            onClick={() => handleTabChange(4)}
          />
        )}
        {accessControl[role]?.includes(5) && (
          <SidebarButton
            icon={<Settings />}
            label="Config"
            isActive={tab === 5}
            onClick={() => handleTabChange(5)}
          />
        )}
        {accessControl[role]?.includes(6) && (
          <SidebarButton
            icon={<User2 />}
            label="Users"
            isActive={tab === 6}
            onClick={() => handleTabChange(6)}
          />
        )}
      </div>
      <div className="bg-blue-100 md:hidden p-6 rounded-lg text-center">
        <button
          onClick={logout}
          className="w-full py-2 flex justify-evenly items-center bg-red-700 text-white rounded-lg hover:bg-red-800 transition"
        >
          <LogOutIcon /> Logout
        </button>
      </div>
    </div>
  );
};

function SidebarButton({ label, isActive, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      disabled={isActive}
      className={`flex items-center px-4 gap-4 py-2 rounded-lg w-full text-left ${
        isActive
          ? "bg-blue-100 text-blue-700 underline cursor-not-allowed"
          : "hover:bg-gray-200"
      }`}
    >
      {icon}
      <p>{label}</p>
    </button>
  );
}

export default SideBar;
