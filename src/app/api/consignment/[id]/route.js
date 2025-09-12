import Consignment from "@/models/Consignment";
import Order from "@/models/Order";
import Product from "@/models/Product";
const { NextResponse } = require("next/server");
import { connectToDatabase } from "@/DataBase";


export async function PATCH(req) {
  try {
    const id = req.url.split("/").pop();
    const body = await req.json();
    await connectToDatabase();

    console.log("Request Body:", body);

    // Find the consignment by ID
    const consignment = await Consignment.findById(id);

    if (!consignment) {
      return NextResponse.json(
        { error: "Consignment not found" },
        { status: 404 }
      );
    }

    // Update the consignment with the new data
    const updatedConsignment = await Consignment.findByIdAndUpdate(id, body, {
      new: true,
    });

    // Check the status of consignment items
    let allDelivered = true;
    let someDelivered = false;

    updatedConsignment.consignmentItems.forEach((item) => {
      if (item.deliveredQuantity !== item.dispatchedQuantity) {
        allDelivered = false;
      }
      if (item.deliveredQuantity > 0) {
        someDelivered = true;
      }
    });

    // Set the overallStatus based on the conditions
    if (allDelivered) {
      updatedConsignment.overallStatus = "complete";
    } else if (someDelivered) {
      updatedConsignment.overallStatus = "partially delivered";
    } else {
      updatedConsignment.overallStatus = "pending";
    }

    // Save the updated consignment
    await updatedConsignment.save();

    console.log("Updated Consignment:", updatedConsignment);

    return NextResponse.json(updatedConsignment, { status: 200 });
  } catch (error) {
    console.error("Error updating consignment:", error);
    return NextResponse.json(
      { error: "Failed to update Consignment" },
      { status: 500 }
    );
  }
}

export const GET = async (req) => {
  try {

    const id = req.url.split("/").pop();
    await connectToDatabase();
    const consignment = await Consignment.findById(id)
      .populate("ConsignmentId")
      .populate("orderId");
    if (!consignment) {
      return NextResponse.json(
        { error: "Consignment not found" },
        { status: 404 }
      );
    }
    const consignmentOrders = await ConsignmentItem.find({
      consignmentId: id,
    }).populate("product", "name casNumber");
    const response = {
      _id: consignment._id,
      orderId: consignment.orderId
        ? {
            _id: consignment.orderId._id,
            orderDate: consignment.orderId.orderDate,
            deliveryDate: consignment.orderId.deliveryDate,
            total: consignment.orderId.total,
            status: consignment.orderId.status,
          }
        : null,
      consignmentDate: consignment.consignmentDate,
      ConsignmentId: consignment.ConsignmentId
        ? {
            _id: consignment.ConsignmentId._id,
            name: consignment.ConsignmentId.name,
            email: consignment.ConsignmentId.email,
            phone: consignment.ConsignmentId.phone,
            address: consignment.ConsignmentId.address,
            city: consignment.ConsignmentId.city,
            state: consignment.ConsignmentId.state,
          }
        : null,
      items: consignmentOrders.map((item) => ({
        _id: item._id,
        product: item.product
          ? {
              _id: item.product._id,
              name: item.product.name,
              casNumber: item.product.casNumber,
            }
          : null,
        quantitySupplied: item.quantity,
      })),
    };
    return NextResponse.json(
      {
        consignment: response,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch consignment" },
      { status: 500 }
    );
  }
};
