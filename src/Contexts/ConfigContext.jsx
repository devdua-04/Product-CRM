"use client";
import { createContext, useContext, useState, useEffect } from "react";

const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  const [paymentTermsData, setPaymentTermsData] = useState([]);
  const [incoTermsData, setIcoTermsData] = useState([]);
  const [packagingData, setPackagingData] = useState([]);
  const [currencyData, setCurrencyData] = useState([
    {
      full_name: "United States Dollar",
      shorthand: "USD",
      value_in_usd: 1,
    },
  ]);

  const [applicationData,setApplicationsData] = useState([])

  const fetchConfig = async () => {
    try {
      const response = await fetch("/api/config");
      const data = await response.json(); // Ensure we're getting the right key
      if (!data) {
        alert("Cannot Fetch Config");
      }
      const config = data;
      setIcoTermsData(config.incoTerms || []);
      setPaymentTermsData(config.paymentTerms || []);
      setPackagingData(config.packagings || []);
      setCurrencyData(config.currencies);
      setApplicationsData(config.applications)
    } catch (error) {
      console.error("Failed to fetch config:", error);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <ConfigContext.Provider
      value={{
        paymentTermsData,
        currencyData,
        incoTermsData,
        applicationData,
        packagingData,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within an ConfigProvider");
  }
  return context;
};
