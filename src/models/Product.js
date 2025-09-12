import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    casNumber: { type: String, required: true },
    description: { type: String, required: true },
    packaging: {
      type: Object,
      required: true,
    },
    majorApplication: {
      type: Object,
      required: true,
    },
    minorApplication: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models["Product"] ||
  mongoose.model("Product", ProductSchema);
