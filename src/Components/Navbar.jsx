"use client";

import { useAuth } from "@/Contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { logged, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between bg-white px-6 py-4  absolute top-0 w-full shadow-md backdrop-blur-md">
      <div className="flex items-center">
        {/* Logo with fixed size */}
        <div className="relative h-10 w-10 mr-3">
          <Image
            src="/logo.jpg"
            alt="MEHK Chemicals Logo"
            layout="fill"
            objectFit="contain"
            priority
          />
        </div>

        {/* Company name */}
        <Link
          href="/"
          className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
        >
          MEHK CHEMICALS
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {/* Navigation links could go here */}
        {/* <Link
          href="/products"
          className="text-gray-600 hover:text-blue-600 transition-colors"
        >
          Products
        </Link>
        <Link
          href="/about"
          className="text-gray-600 hover:text-blue-600 transition-colors"
        >
          About
        </Link>
        <Link
          href="/contact"
          className="text-gray-600 hover:text-blue-600 transition-colors"
        >
          Contact
        </Link> */}

        {/* Logout button conditionally rendered */}
        {logged ? (
          <button
            onClick={logout}
            className="px-4 py-2 bg-blue-600 sm:block hidden text-white rounded hover:bg-blue-700 transition-colors"
          >
            Logout
          </button>
        ) : (
          <Link
            href="/login"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
