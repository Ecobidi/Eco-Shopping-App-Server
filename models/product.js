let mongoose = require("mongoose");

let productSchema = mongoose.Schema({
  name: {
    required: true,
    type: String,
  },
  sellingPrice: {
    type: Number,
    required: true,
  },
  regularPrice: {
    type: Number,
    required: true,
  },  
  description: {
    type: String,
    required: true,
  },
  image: [String],
  category: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  orderLimit: {
    type: Number,
    default: 10,
    required: true
  },
  size: Number,
  color: String,
});

module.exports = mongoose.model("product", productSchema);