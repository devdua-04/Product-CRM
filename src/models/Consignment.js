const mongoose = require("mongoose");

const ConsignmentSchema = mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  deliveryDate: {
    type: Date,
    required: true,
  },
  overallStatus:{
    type:String,
    required:true,
    default:"pending"
  },
  consignmentItems: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      status: {
        type: String,
        default: "pending",
      },
      deliveredQuantity: {
        type: Number,
        default: 0,
      },
      dispatchedQuantity: {
        type: Number,
        default: 0,
      },
    },
  ],
});

module.exports =
  mongoose.models["Consignment"] ||
  mongoose.model("Consignment", ConsignmentSchema);
