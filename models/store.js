let mongoose = require("mongoose");

let storeSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  shippingCharge: {
    default: 1,
    type: Number,
  },
  tax: {
    default: 1,
    type: Number,
  },
  currency: {
    type: String,
    default: "$",
  },
  image: String,
});

module.exports = mongoose.model("store", storeSchema);