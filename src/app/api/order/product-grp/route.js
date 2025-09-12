import Order from "@/models/Order";
import { NextResponse } from "next/server";

// GET total quantities of all products in all orders
export const GET = async (req) => {
  try {
    // Fetch orders and deeply populate `orderItems` and `product`
    const orders = await Order.find({
      orderItems: { $exists: true, $not: { $size: 0 } },
    }).populate({
      path: "orderItems",
      populate: {
        path: "product",
        model: "Product", // Ensure it uses the Product schema
      },
    });

    // Aggregate the total quantities for all products
    const productQuantities = {};

    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        if (item.product && item.product._id) {
          const productId = item.product._id.toString();

          // Add or update the quantity in the accumulator
          productQuantities[productId] =
            (productQuantities[productId] || 0) + item.quantity;
        }
      });
    });

    // Return the aggregated quantities as a JSON response
    return NextResponse.json(productQuantities, { status: 200 });
  } catch (error) {
    console.error("Error fetching product quantities:", error);
    return NextResponse.json(
      { error: "Failed to fetch order quantities" },
      { status: 500 }
    );
  }
};
