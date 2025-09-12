import Customer from "@/models/Customer";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const GET = async () => {
  try {
    // Get the start and end of the current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1); // First day of the month
    startOfMonth.setHours(0, 0, 0, 0); // Midnight
    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1); // First day of the next month
    endOfMonth.setDate(0); // Last day of the month

    // Fetch required statistics
    const [
      customerCount,
      pendingOrdersCount,
      completedOrdersCount,
      partialCompletedOrdersCount,
      totalProductsCount,
      salesCount,
      producerUsersCount,
      regularUsersCount,
      totalRevenue,
      revenueThisMonth
    ] = await Promise.all([
      Customer.countDocuments(), // Count of customers
      Order.countDocuments({ status: "pending" }), // Pending orders count
      Order.countDocuments({ status: "complete" }), // complete orders count
      Order.countDocuments({ status: "partial_complete" }), // Partial complete orders count
      Product.countDocuments(), // Total products count
      Order.aggregate([
        { $unwind: "$orderItems" }, // Unwind order items
        { $group: { _id: null, count: { $sum: "$orderItems.quantity" } } } // Sum quantities of all products sold
      ]).then((result) => (result[0]?.count || 0)), // Sales count
      User.countDocuments({ role: "production" }), // Count of production users
      User.countDocuments({ role: "regular" }), // Count of regular users
      Order.aggregate([
        { $group: { _id: null, revenue: { $sum: "$total" } } } // Sum revenue from all orders
      ]).then((result) => (result[0]?.revenue || 0)), // Total revenue
      Order.aggregate([
        { $match: { orderDate: { $gte: startOfMonth, $lt: endOfMonth } } }, // Match orders in the current month
        { $group: { _id: null, revenue: { $sum: "$total" } } } // Sum revenue for the month
      ]).then((result) => (result[0]?.revenue || 0)) // Revenue for this month
    ]);

    // Construct the response
    const stats = {
      customerCount,
      pendingOrdersCount,
      completedOrdersCount,
      partialCompletedOrdersCount,
      totalProductsCount,
      salesCount,
      producerUsersCount,
      regularUsersCount,
      totalRevenue,
      revenueThisMonth
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
};
