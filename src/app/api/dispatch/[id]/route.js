import { connectToDatabase } from "@/DataBase";
import Dispatch from "@/models/Dispatch";
import DispatchItem from "@/models/DispatchItem";
import Order from "@/models/Order";
import OrderItem from "@/models/OrderItem";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

// GET Dispatch By Id
export const GET = async (req) => {
  try {
    const id = req.url.split("/").pop();
    await connectToDatabase();

    // Fetch the dispatch, populating customer and order details
    const dispatch = await Dispatch.findById(id)
      .populate("customerId")
      .populate("orderId");

    if (!dispatch) {
      return NextResponse.json(
        { error: "Dispatch not found" },
        { status: 404 }
      );
    }

    // Fetch related order items for this dispatch, including product details
    const dispatchOrders = await DispatchItem.find({ dispatchId: id }).populate("product", "name casNumber");

    // Construct final response
    const response = {
      _id: dispatch._id,
      orderId: dispatch.orderId ? {
        _id: dispatch.orderId._id,
        orderDate: dispatch.orderId.orderDate,
        deliveryDate: dispatch.orderId.deliveryDate,
        total: dispatch.orderId.total,
        status: dispatch.orderId.status,
      } : null,
      dispatchDate: dispatch.dispatchDate,
      invoiceNo: dispatch.invoiceNo,
      customerId: dispatch.customerId ? {
        _id: dispatch.customerId._id,
        name: dispatch.customerId.name,
        email: dispatch.customerId.email,
        phone: dispatch.customerId.phone,
        address: dispatch.customerId.address,
        city: dispatch.customerId.city,
        state: dispatch.customerId.state,
      } : null,
      items: dispatchOrders.map((item) => ({
        _id: item._id,
        product: item.product ? {
          _id: item.product._id,
          name: item.product.name,
          casNumber: item.product.casNumber,
        } : null,
        quantitySupplied: item.quantity,
      })),
    };

    return NextResponse.json(
      {
        dispatch: response,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching dispatch:", error);
    return NextResponse.json(
      { error: "Failed to fetch dispatch" },
      { status: 500 }
    );
  }
};
