import { connectToDatabase } from "@/DataBase";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // Extract the ID from the URL
    const id = req.nextUrl.pathname.split("/").pop();

    // Connect to the database
    await connectToDatabase();

    // Fetch the order by ID and populate its fields (e.g., customer, orderItems)
    const order = await Order.findById(id)
      .populate("customer")
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
        },
      }).populate({
        path: "consignments",
        populate: {
          path: "consignmentItems",
          populate: {
            path: "product",
          },
        },
      });

    // Handle case where the order is not found
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Return the fetched order
    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("Error fetching order:", error);

    // Handle errors
    return NextResponse.json(
      { error: "Failed to fetch order", details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  const body = await req.json();
  const {dataToUpdate} = body;
  try {
    const id = req.url.split("/").pop();
    await connectToDatabase();

    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(id, dataToUpdate, {
      new: true,
    });

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update order", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const id = req.url.split("/").pop();
    const { status } = await req.json();
    await connectToDatabase();

    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update order", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const id = req.url.split("/").pop();
    await connectToDatabase();

    const deletedOrder = await Order.findByIdAndDelete(id);
    if (!deletedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Order deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
