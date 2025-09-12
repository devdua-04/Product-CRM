import { connectToDatabase } from "@/DataBase";
import Consignment from "@/models/Consignment";

const { NextResponse } = require("next/server");

export const POST = async (req) => {
  try {
    await connectToDatabase();
    const { orderId } = await req.json();
    const Consignments = await Consignment.find({ order: orderId }).populate({
      path: "consignmentItems",
      populate: "product",
    });
    return NextResponse.json(Consignments, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to get consignment" },
      { status: 500 }
    );
  }
};
