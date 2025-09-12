import User from "@/models/User";
import { NextResponse } from "next/server";

export const PATCH = async (req) => {
  try {
    const userId = req.url.split("/").pop();
    const data = await req.json();

    // Find and update the user
    const updatedUser = await User.findByIdAndUpdate(userId, data, {
      new: true, // Return updated user
    });

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "User updated successfully",
      updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
};
