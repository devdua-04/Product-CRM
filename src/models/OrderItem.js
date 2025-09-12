const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  remark: {
    type: String,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  initialQuantity: {
    type: Number,
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
  packaging: {
    type: String,
    required: true,
  },
  noOfPackages: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "Pending",
    enum: ["Pending", "Delivered"],
  },
  price: {
    type: Number,
    required: true,
  },
});

module.exports =
  mongoose.models["OrderItem"] || mongoose.model("OrderItem", OrderItemSchema);
