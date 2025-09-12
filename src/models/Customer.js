import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    gstNo: { type: String },
    type: { type: String },
    exportType: { type: String },
    msme: { type: Boolean, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    type: { type: String, required: true, enum: ["Manufacturer", "Trader"] },
  },
  { timestamps: true }
);

// Ensure Customer model is registered
const Customer =
  mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);

export default Customer;
