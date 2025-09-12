import { connectToDatabase } from "@/DataBase";
import Config from "@/models/Config";
import { NextResponse } from "next/server";
import configData from "../../../Data/configData.json"

async function seedDatabase() {
    try {
      await Config.deleteMany({});
      await Config.create(configData);
      console.log("✅ Config data inserted successfully!");
    } catch (error) {
      console.error("❌ Error inserting config data:", error);
    }
  }

export const GET = async () => {
  try {
    await connectToDatabase(); // Ensure the database is connected
    const config = await Config.findOne(); // Await the database call
    if (!config) {
      await seedDatabase()
      return NextResponse.json({ message: "No config found. Generating Config Reload the website" }, { status: 404 });
    }
    return NextResponse.json(config, { status: 200 });
  } catch (error) {
    console.error("Error fetching config:", error);
    return NextResponse.json(
      { error: "Failed to fetch config" },
      { status: 500 }
    );
  }
};

export const PATCH = async (req) => {
  try {
    await connectToDatabase(); // Ensure DB connection
    const data = await req.json();

    const updatedConfig = await Config.findOneAndUpdate({}, data, {
      new: true, // Return the updated document
      upsert: true, // Create if it doesn't exist
      runValidators: true,
    });

    return NextResponse.json(
      { message: "Config updated successfully", config: updatedConfig },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating config:", error);
    return NextResponse.json(
      { error: "Failed to update config" },
      { status: 500 }
    );
  }
};
