let mongoose = require("mongoose");

let orderSchema = mongoose.Schema({
  customerID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  productID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: Number, // -1 => cancelled, 0 => inprogress, 1 => fulfilled
    required: true,
  },
  image: String,
});

module.exports = mongoose.model("order", orderSchema);