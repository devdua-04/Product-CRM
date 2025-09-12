import { connectToDatabase } from "@/DataBase";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import OrderItem from "@/models/OrderItem";
import Product from "@/models/Product";
import Consignment from "@/models/Consignment";
import Dispatch from "@/models/Dispatch";
import DispatchItem from "@/models/DispatchItem";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// GET Order By Id with full details
export async function GET(req) {
  try {
    await connectToDatabase();
    // Fetch orders and populate customer, orderItems, and the product field inside orderItems
    const orders = await Order.find({})
      .populate("customer") // Populate the customer information
      .populate({
        path: "orderItems", // Populate the orderItems field
        populate: {
          path: "product", // Populate the product field inside orderItems
        },
      })
      .populate("consignments"); // Populate the consignments field
    return NextResponse.json(
      {
        orders: orders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      {
        status: 500,
      }
    );
  }
}
/** ✅ **Generate Order Items & Save in DB** **/
const generateOrderItems = async (orderId, orderItems) => {
  const newOrderItems = orderItems.map(async (item) => {
    const newItem = await OrderItem.create({
      orderId: orderId,
      product: item.product,
      initialQuantity: item.quantity,
      quantity: item.quantity,
      noOfPackages: item.noOfPackages,
      packaging: item.packaging || "Standard",
      price: item.price,
    });
    return newItem._id;
  });
  return await Promise.all(newOrderItems);
};

/** ✅ **Generate Consignments & Save in DB** **/
const generateConsignments = async (orderId, consignments) => {
  if (!consignments || consignments.length === 0) return [];

  const newConsignments = consignments.map(async (consignment) => {
    if (
      !consignment.deliveryDate ||
      isNaN(new Date(consignment.deliveryDate).getTime())
    ) {
      throw new Error("Invalid delivery date in consignments.");
    }

    const newConsignment = await Consignment.create({
      order: orderId,
      deliveryDate: consignment.deliveryDate,
      consignmentItems: consignment.consignmentItems.map((item) => ({
        product: item.product,
        dispatchedQuantity: item.dispatchedQuantity,
      })),
    });

    return newConsignment._id;
  });

  return await Promise.all(newConsignments);
};

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    console.log(body);
    const {
      customer,
      orderItems,
      total,
      deliveryDate,
      orderDate,
      orderType,
      currency,
      singleConsignment,
      consignments,
      incoTerms,
      paymentTerms,
      poNumber,
      poFile,
    } = body;

    /** ✅ **Step 1: Validation** **/
    if (!customer || !mongoose.Types.ObjectId.isValid(customer)) {
      return NextResponse.json(
        { error: "Valid Customer ID is required." },
        { status: 400 }
      );
    }

    if (!poNumber || typeof poNumber !== "string") {
      return NextResponse.json(
        { error: "PO Number is required and must be a string." },
        { status: 400 }
      );
    }

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json(
        { error: "At least one order item is required." },
        { status: 400 }
      );
    }

    if (!total || total <= 0) {
      return NextResponse.json(
        { error: "Total amount must be greater than zero." },
        { status: 400 }
      );
    }

    if (!deliveryDate || isNaN(new Date(deliveryDate).getTime())) {
      return NextResponse.json(
        { error: "Valid delivery date is required." },
        { status: 400 }
      );
    }

    if (!incoTerms) {
      return NextResponse.json(
        { error: "Incoterms selection is required." },
        { status: 400 }
      );
    }

    if (!paymentTerms) {
      return NextResponse.json(
        { error: "Payment terms selection is required." },
        { status: 400 }
      );
    }

    /** ✅ **Step 2: Generate a New Order ID** **/
    const newOrderId = new mongoose.Types.ObjectId();

    /** ✅ **Step 3: Generate Order Items & Consignments** **/
    const orderItemsIds = await generateOrderItems(newOrderId, orderItems);
    const consignmentsIds = await generateConsignments(
      newOrderId,
      consignments
    );
    /** ✅ **Step 4: Create Order in DB** **/
    const order = await Order.create({
      _id: newOrderId,
      customer,
      poNumber,
      orderItems: orderItemsIds,
      total,
      incoTerms,
      orderType,
      currency,
      paymentTerms,
      poFile,
      singleConsignment,
      consignments: consignmentsIds,
      status: "pending",
      orderDate: orderDate || new Date(),
      deliveryDate,
    });

    /** ✅ **Step 5: Populate the Order Before Sending Response** **/
    const populatedOrder = await Order.findById(order._id)
      .populate("customer")
      .populate({
        path: "orderItems",
        populate: { path: "product" },
      })
      .populate({
        path: "consignments",
        populate: {
          path: "consignmentItems.product",
        },
      });

    return NextResponse.json(
      { message: "Order created successfully", order: populatedOrder },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Failed to create order:", error);
    return NextResponse.json(
      {
        error:
          error.message || "Failed to create order. Please try again later.",
      },
      { status: 500 }
    );
  }
}

export const DELETE = async (req) => {
  try{
    await connectToDatabase();
    const id = req.url.split("/").pop();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid Order ID" },
        { status: 400 }
      );
    }
    // Delete the order and its associated items
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Order deleted successfully" },
      { status: 200 }
    );
  }catch(error){
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}