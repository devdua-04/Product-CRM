
const { NextResponse } = require("next/server");
import { connectToDatabase } from "@/DataBase";
import OrderItem from "@/models/OrderItem";

export async function PATCH(req) {
  try {
    const id = req.url.split("/").pop();
    const body = await req.json();
    await connectToDatabase();

    const updatedConsignment = await OrderItem.findByIdAndUpdate(
      id,
      { ...body },
      { new: true }
    );

    if (!updatedConsignment) {
      return NextResponse.json(
        { error: "Consignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedConsignment, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update Consignment" },
      { status: 500 }
    );
  }
}
