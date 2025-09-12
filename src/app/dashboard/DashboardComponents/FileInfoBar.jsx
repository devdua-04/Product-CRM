import {
  BadgeIndianRupee,
  ChartColumn,
  ChartNoAxesCombined,
  IndianRupee,
  ListCheck,
  ListChecks,
  ListOrdered,
  Package,
  User,
} from "lucide-react";
import React from "react";

function FileInfoBar({ elements }) {
  const objectToTextMap = {
    customerCount: "Total Customers",
    pendingOrdersCount: "Pending Orders",
    completedOrdersCount: "complete Orders",
    partialCompletedOrdersCount: "Partial complete",
    totalProductsCount: "Total Products",
    salesCount: "Total Sales",
    producerUsersCount: "Producer Users",
    regularUsersCount: "Regular Users",
    totalRevenue: "Total Revenue",
    revenueThisMonth: "Revenue This Month",
  };

  const objectToIconMap = {
    customerCount: <User />,
    pendingOrdersCount: <ListOrdered />,
    completedOrdersCount: <ListCheck />,
    partialCompletedOrdersCount: <ListChecks />,
    totalProductsCount: <Package />,
    salesCount: <ChartColumn/>,
    producerUsersCount: "Producer Users",
    regularUsersCount: "Regular Users",
    totalRevenue: <IndianRupee />,
    revenueThisMonth: <ChartNoAxesCombined />,
  };
  return (
    <div className="flex justify-evenly items-center px-10 h-24 w-full my-10">
      {Object.keys(elements).map((key, index) => (
        <div
          key={index}
          className="shadow-md h-full flex-1 m-2 px-5 hover:scale-105 transition ease-in flex justify-between items-center bg-white rounded-2xl border border-gray-200"
        >
          <div className="h-full flex flex-col justify-evenly">
          <h1 className="text-sm font-semibold">{objectToTextMap[key]}</h1>

            <div className="h-10 w-10 rounded-full border border-gray-300 flex justify-center items-center bg-purple-100">
                {objectToIconMap[key]}
            </div>
          </div>
          <p className="text-lg">{elements[key]}</p>
        </div>
      ))}
    </div>
  );
}

export default FileInfoBar;
