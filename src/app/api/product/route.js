import { connectToDatabase } from "@/DataBase";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

// Fetch all products or create a new product
export async function GET(req) {
  try {
    await connectToDatabase();
    const products = await Product.find({});
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, casNumber, description, majorApplication, minorApplication ,packaging } =
      body;
    await connectToDatabase();

    const product = await Product.create({
      name,
      casNumber,
      description,
      majorApplication,
      minorApplication,
      packaging
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
