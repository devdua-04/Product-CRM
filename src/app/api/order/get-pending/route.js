import Order from "@/models/Order";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    const { customerId } = await req.json();

    const orders = await Order.find({
      customer: customerId,
      status: { $in: ["pending", "partial_complete"] },
    })
      .populate({
        path: "orderItems",
        populate: {
          path: "product", // Populating product details inside orderItems
          select: "name casNumber", // Selecting only required fields
        },
      });

    return NextResponse.json(
      { orders },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
};
