import { connectToDatabase } from "@/DataBase";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import { NextResponse } from "next/server";


export async function PATCH(req) {
  try {
    const id = req.url.split("/").pop();
    const body = await req.json();
    await connectToDatabase();

    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      { ...body },
      { new: true }
    );

    if (!updatedCustomer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json(updatedCustomer, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const id = req.url.split("/").pop();
    await connectToDatabase();

    const deletedCustomer = await Customer.findByIdAndDelete(id);
    if (!deletedCustomer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse(
      { message: "Customer deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete Customer" },
      { status: 500 }
    );
  }
}

// GET Customer Orders
export const GET = async (req, res) => {
  try {
    const id = req.url.split("/").pop();
    await connectToDatabase();
    const customer = await Customer.findById(id);
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    const customerOrders = await Order.find({ customer: id });
    return NextResponse.json({
      customer,
      orders: customerOrders,
    }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
};
