import User from "@/models/User";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/DataBase";
import bcrypt from "bcrypt";

export const GET = async (req) => {
  await connectToDatabase();
  const users = await User.find({});
  return NextResponse.json({
    users,
  });
};

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

    if (role !== "admin") {
      return NextResponse.json(
        { error: "You Dont have Access to Add Users ask Admins to do So" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const hashedPassword = await bcrypt.hash(body.password, 10);
    const userObj = await User.create({
      ...body,
      password: hashedPassword,
    });

    await userObj.save();
    return NextResponse.json({ ...userObj }, { status: 200 });
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
