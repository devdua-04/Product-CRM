import { connectToDatabase } from "@/DataBase";
import Order from "@/models/Order";
import OrderItem from "@/models/OrderItem";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectToDatabase();

    // Fetch all orders and deeply populate `orderItems` and `product`
    const orders = await Order.find({})
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
          model: "Product", // Ensure it uses the Product schema
        },
      });

    // Aggregate total sales for each chemical (product) month-wise
    const salesData = {};

    orders.forEach((order) => {
      const orderMonth = new Date(order.orderDate).toISOString().slice(0, 7); // Extract year-month (e.g., "2025-01")

      order.orderItems.forEach((item) => {
        if (item.product && item.product._id) {
          const productId = item.product._id.toString();
          const productName = item.product.name;

          // Initialize the sales data for the product and month if not already done
          if (!salesData[productId]) {
            salesData[productId] = {
              name: productName,
              monthlySales: {},
            };
          }

          if (!salesData[productId].monthlySales[orderMonth]) {
            salesData[productId].monthlySales[orderMonth] = {
              totalSales: 0,
              totalRevenue: 0,
            };
          }

          // Accumulate quantity and revenue for the month
          salesData[productId].monthlySales[orderMonth].totalSales += item.quantity;
          salesData[productId].monthlySales[orderMonth].totalRevenue += item.quantity * item.price;
        }
      });
    });

    // Convert salesData object into an array for better readability
    const salesArray = Object.keys(salesData).map((productId) => ({
      productId,
      name: salesData[productId].name,
      monthlySales: salesData[productId].monthlySales,
    }));

    return NextResponse.json(salesArray, { status: 200 });
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales data", details: error.message },
      { status: 500 }
    );
  }
}
