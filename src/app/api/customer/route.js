import { connectToDatabase } from "@/DataBase";
import Customer from "@/models/Customer";
import { NextResponse } from "next/server";



export const POST = async (req, res) => {
  try {
    await connectToDatabase();
    const { name, email, phone, address, city, state,gstNo,msme,type,exportType } = await req.json();
    const customer = await Customer.create({
      name,
      email,
      phone,
      type,
      address,
      city,
      state,
      gstNo,
      msme,
    });
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
};

export const GET = async (req, res) => {
  try {
    await connectToDatabase()
    const customers = await Customer.find({});
    return NextResponse.json(customers, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
};
