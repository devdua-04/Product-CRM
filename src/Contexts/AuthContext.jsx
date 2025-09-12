"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [logged, setLogged] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Ensure useRouter is used inside the component

  const login = async ({ email, password }) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to login");
      }

      const data = await res.json();
      // Save token to local storage or cookies
      localStorage.setItem("token", data.token);
      window.location.reload();
      // Redirect to dashboard or another page
      router.push("/dashboard");
    } catch (err) {
      return err.message;
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      setLogged(true);
    } else {
      setLogged(false);
    }
  }, []);

  const logout = () => {
    try {
      localStorage.removeItem("token");
      router.push("/auth/login");
      setLogged(false);
    } catch (err) {
      console.log("Error Logging Out");
    }
  };

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        if (!window.location.pathname == "/auth/login") {
          router.push("/auth/login");
        }
        return;
      }

      const res = await fetch(`/api/auth/verify-token`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }

      const userData = await res.json();
      setUser(userData);
      router.push("/dashboard");
    } catch (error) {
      console.log("Authentication error:", error);
      setLogged(false)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (logged) return;

    if (window) {
      if (window.location.pathname === "/auth/signup") {
        return;
      } else {
        router.push("/auth/login");
      }
    }
  }, [logged]);

  useEffect(() => {
    if (user) {
      return;
    }
    fetchUser();
  }, [loading]);

  if (loading) {
    return <p className="text-center">Loading...</p>; // Show loading indicator while fetching user
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        logged,
        setLogged,
        setUser,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
