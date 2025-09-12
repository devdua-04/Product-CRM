const mongoose = require("mongoose");

const ConfigSchema = mongoose.Schema({
  paymentTerms: [],
  incoTerms: [],
  currencies: [],
  packagings: [],
  applications: {
    type: Array,
    default: [],
  },
});

module.exports =
  mongoose.models["Config"] || mongoose.model("Config", ConfigSchema);
