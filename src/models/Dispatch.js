const mongoose = require("mongoose");

const DispatchSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  consignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Consignment",
  },
  dispatchDate: {
    type: Date,
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
  },
  invoiceNo: {
    type: String,
  },
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DispatchItem",
    },
  ],
});

module.exports =
  mongoose.models["Dispatch"] || mongoose.model("Dispatch", DispatchSchema);
