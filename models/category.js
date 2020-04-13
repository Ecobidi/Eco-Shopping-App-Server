let mongoose = require("mongoose");

let categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  image: String,
  products: [{
    type: mongoose.SchemaTypes.ObjectId,
    ref: "product",  
    }
  ],
  productsCounter: {
    type: Number,
    required: true,
    default: 0
  },
  
});

module.exports = mongoose.model("category", categorySchema);