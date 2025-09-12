import { NextResponse } from "next/server";
import Dispatch from "@/models/Dispatch";
import DispatchItem from "@/models/DispatchItem";
import Order from "@/models/Order";
import OrderItem from "@/models/OrderItem";
import { connectToDatabase } from "@/DataBase";
import Consignment from "@/models/Consignment";
import Customer from "@/models/Customer";


export const POST = async (req) => {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { orderId, customerId, items, consignmentId, invoiceNo, dispatchDate } = body;

    if (!orderId || !customerId || !items || items.length === 0 || !consignmentId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 404 });
    }

    const consignment = await Consignment.findById(consignmentId);
    if (!consignment) {
      return NextResponse.json({ error: "Invalid consignment ID" }, { status: 404 });
    }


    // Create Dispatch
    const dispatch = await Dispatch.create({
      invoiceNo,
      orderId,
      customerId,
      consignment: consignmentId,
      dispatchDate,
    });

    // Create Dispatch Items
    const dispatchItems = await Promise.all(
      items.map(async (item) => {
        if (!item.product) {
          throw new Error("Each item must have a product field.");
        }
        return await DispatchItem.create({
          order: orderId,
          consignment: consignmentId,
          dispatchId: dispatch._id,
          product: item.product,
          quantity: item.quantitySupplied,
          status: "Delivered",
        });
      })
    );

    // Assign dispatch items to dispatch and save
    dispatch.items = dispatchItems.map((item) => item._id);
    await dispatch.save(); // FIX: Save the dispatch after assigning items

    let areAllDelivered = true;


    // Update Consignment Items
    consignment.consignmentItems.forEach((consignmentItem) => {
      const dispatchedItem = dispatchItems.find(
        (item) => item.product.toString() === consignmentItem.product.toString()
      );
      if (dispatchedItem) {
        consignmentItem.deliveredQuantity += dispatchedItem.quantity;
        if (consignmentItem.deliveredQuantity >= consignmentItem.dispatchedQuantity) {
          consignmentItem.status = "complete";
        } else {
          consignmentItem.status = "partial_complete";
          areAllDelivered = false;
        }
      }
    });

    // Update Consignment Status
    consignment.overallStatus = areAllDelivered ? "complete" : "partial_complete";
    await consignment.save();

    // Check overall order status
    const allConsignments = await Consignment.find({ order: orderId });
    const incompleteConsignments = allConsignments.filter((c) => c.overallStatus !== "complete");

    order.status = incompleteConsignments.length === 0 ? "complete" : "partial_complete";
    await order.save();

    return NextResponse.json(
      { message: "Dispatch created successfully", dispatch, dispatchItems },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating dispatch:", error);
    return NextResponse.json(
      { error: "Failed to create dispatch", details: error.message },
      { status: 500 }
    );
  }
};


export const GET = async (req) => {
  try {
    await connectToDatabase();

    // Fetch all dispatches and populate relevant fields
    const dispatches = await Dispatch.find({})
      .populate({
        path: "customerId",
        select: "name email phone address", // Fetch relevant customer details
      })
      .populate({
        path: "orderId",
        select: "poNumber orderDate status", // Fetch order details
      })
      .populate({
        path: "items",
        populate: {
          path: "product",
          select: "name casNumber description", // Fetch product details
        },
      })
      .populate("consignment"); // If consignment details are required

    return NextResponse.json(dispatches, { status: 200 });
  } catch (error) {
    console.error("Error fetching dispatches:", error);
    return NextResponse.json(
      { error: "Failed to fetch dispatches", details: error.message },
      { status: 500 }
    );
  }
};
