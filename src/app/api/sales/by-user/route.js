import { connectToDatabase } from "@/DataBase";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import OrderItem from "@/models/OrderItem";
import Product from "@/models/Product";
import { NextResponse } from "next/server";


export async function GET(req) {
    try {
      await connectToDatabase();
  
      // Fetch all orders and populate customer and orderItems
      const orders = await Order.find({})
        .populate("customer")
        .populate({
          path: "orderItems",
          populate: {
            path: "product",
            model: "Product",
          },
        });
  
      // Aggregate orders by customer and month
      const customerOrders = {};
  
      orders.forEach((order) => {
        const orderMonth = new Date(order.orderDate).toISOString().slice(0, 7); // Extract year-month (e.g., "2025-01")
        const customerId = order.customer._id.toString();
        const customerName = order.customer.name;
  
        if (!customerOrders[customerId]) {
          customerOrders[customerId] = {
            name: customerName,
            monthlyOrders: {},
          };
        }
  
        if (!customerOrders[customerId].monthlyOrders[orderMonth]) {
          customerOrders[customerId].monthlyOrders[orderMonth] = [];
        }
  
        // Add the order to the customer's monthly orders
        customerOrders[customerId].monthlyOrders[orderMonth].push(order);
      });
  
      // Convert customerOrders object into an array for better readability
      const customerOrdersArray = Object.keys(customerOrders).map((customerId) => ({
        customerId,
        name: customerOrders[customerId].name,
        monthlyOrders: customerOrders[customerId].monthlyOrders,
      }));
  
      return NextResponse.json(customerOrdersArray, { status: 200 });
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      return NextResponse.json(
        { error: "Failed to fetch customer orders", details: error.message },
        { status: 500 }
      );
    }
  }
  