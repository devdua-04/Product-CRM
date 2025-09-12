"use client";

import { useState } from "react";
import FileInfoBar from "@/app/dashboard/DashboardComponents/FileInfoBar";
import OrderHolder from "@/app/dashboard/DashboardComponents/Orders/OrderHolder";
import Link from "next/link";

export default function App() {
  const [transcribe, setTranscribe] = useState(false);
  const [tab, setTab] = useState(1);

  const toggleTranscribe = () => {
    setTranscribe(!transcribe);
  };

  const handleTabChange = (tabNumber) => {
    setTab(tabNumber);
  };

  return (
    <>
      <div className="flex h-full w-screen p-10">
        <Link href="/dashboard">Go TO DashBoard</Link>
      </div>
    </>
  );
}

function SidebarButton({ label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={isActive}
      className={`flex items-center px-4 py-2 rounded-lg w-full text-left ${
        isActive
          ? "bg-blue-100 text-blue-700 cursor-not-allowed"
          : "hover:bg-gray-200"
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
