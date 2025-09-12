"use client";

const { createContext, useContext, useState, useEffect } = require("react");

const DashBoardContext = createContext();

export const DashBoardProvider = ({ children }) => {
  const [transcribe, setTranscribe] = useState(false);
  const [tab, setTab] = useState(1);
  const [update, setUpdate] = useState(false);
  const [stats, setStats] = useState({
    customerCount: 0,
    pendingOrdersCount: 0,
    completedOrdersCount: 0,
    partialCompletedOrdersCount: 0,
    totalProductsCount: 0,
    salesCount: 0,
    producerUsersCount: 0,
    regularUsersCount: 0,
    totalRevenue: 0,
    revenueThisMonth: 0,
  });


  const handleTabChange = (tabNumber) => {
    setTab(tabNumber);
  };
  const [add, setAdd] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedDispatch, setSelectedDispatch] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [id, setId] = useState(null);


  return (
    <DashBoardContext.Provider
      value={{
        selectedProduct,
        setSelectedProduct,
        selectedDispatch,
        setSelectedDispatch,
        id,
        setId,
        selectedCustomer,
        selectedOrder,
        setSelectedCustomer,
        setSelectedOrder,
        selectedOrder,
        handleTabChange,
        transcribe,
        setTranscribe,
        tab,
        selectedCustomer,
        setSelectedCustomer,
        setTab,
        update,
        setUpdate,
        stats,
        setStats,
        add,
        setAdd,
      }}
    >
      {children}
    </DashBoardContext.Provider>
  );
};

export const useDashBoard = () => {
  const context = useContext(DashBoardContext);
  if (!context) {
    throw new Error("useDashBoard must be used within a DashBoardProvider");
  }
  return context;
};
