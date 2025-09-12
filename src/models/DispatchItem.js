const mongoose = require("mongoose");

const DispatchItemSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  consignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Consignment",
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  dispatchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dispatch",
  },
  status: {
    type: String,
    required: true,
    default: "Delivered",
    enum: ["Pending", "Delivered"],
  },
});

module.exports =
  mongoose.models["DispatchItem"] || mongoose.model("DispatchItem", DispatchItemSchema);
