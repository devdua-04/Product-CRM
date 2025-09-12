import mongoose from "mongoose";
import Consignment from "./Consignment";
import OrderItem from "./OrderItem";
import Dispatch from "./Dispatch";
import DispatchItem from "./DispatchItem";

const OrderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    poNumber: { type: String, required: true },
    poFile: { type: String },
    incoTerms: { type: String, required: true },
    orderDate: { type: Date, required: true, default: Date.now() },
    orderItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OrderItem",
        required: true,
      },
    ],
    orderType: { type: String },
    paymentTerms: { type: String, required: true },
    singleConsignment: { type: Boolean, required: true, default: true },
    consignments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Consignment",
      },
    ],
    currency: {
      type: Object,
      required: true,
    },
    deliveryDate: { type: Date },
    total: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      enum: ["pending", "complete", "partial_complete", "short_closed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

OrderSchema.pre("deleteOne", async () => {
  const order = await mongoose.models["Order"].findOne(this.getFilter());
  if (order) {
    await Consignment.deleteMany({
      order: order._id,
    });
    await OrderItem.deleteMany({
      orderId: order._id,
    });
    await Dispatch.deleteMany({
      orderId: order._id,
    });
    await DispatchItem.deleteMany({
      order: order._id,
    });
  }
});

export default mongoose.models["Order"] || mongoose.model("Order", OrderSchema);
