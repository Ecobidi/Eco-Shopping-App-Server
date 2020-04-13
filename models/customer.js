let mongoose = require("mongoose");

let customerSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  gender: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  cart: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
    },
    quantity : {
      type: Number,
      default: 0
    },
  }],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    unique: true
  }],
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "order",
    unique: true
  }],
  recentViews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    unique: true
  }],
  address: {
    state: String,
    city: String,
    street: String,
  },
  phone: {
    type: String,
    default: 12233449,
    required: true
  },
  photo: String,
});

module.exports = mongoose.model("customer", customerSchema);