import { connectToDatabase } from "@/DataBase";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET; 

export const POST = async (req) => {
  try {
    await connectToDatabase();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1]; // Get token after 'Bearer'

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 401 });
    }

    // Verify JWT Token (replace 'your-secret-key' with your actual secret)
    const decoded = jwt.verify(token, SECRET_KEY);

    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 403 }
      );
    }

    // Find the user in the database
    const user = decoded._doc;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { name, email, role, enabled, _id } = decoded._doc;

    return NextResponse.json(
      { name, email, role, enabled, _id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
