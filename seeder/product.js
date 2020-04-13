let mongoose = require("mongoose");
let Product = require("../models/product");

// create db connection
mongoose.connect("mongodb://localhost:27017/eco-mall-test-db");

mongoose.connection.on('error',function (err) {
  console.log('Mongoose connection error: ' + err);
});

Product.find({}, function(err, products) {
  if (products.length > 0) return;

  Product.create([
    {
      name: "Forbes",
      category: ["books"],
      sellingPrice: 8,
      regularPrice: 9,
      quantity: 5,
    },
    {
      name: "Jack",
      category: ["pets"],
      sellingPrice: 27,
      regularPrice: 39,
      quantity: 1,
    },
    {
      name: "Sherlock Holmes",
      category: ["books"],
      sellingPrice: 18,
      regularPrice: 22,
      quantity: 7,
    },
    {
      name: "Call Of Duty: Mw",
      category: ["PC games", "Video games"],
      sellingPrice: 4,
      regularPrice: 6,
      quantity: 44,
    },
    {
      name: "PES 2018",
      category: ["PC games", "Video games"],
      sellingPrice: 20,
      regularPrice: 32,
      quantity: 33,
    },
    {
      name: "LionHeart",
      category: ["Movie"],
      sellingPrice: 3,
      regularPrice: 5,
      quantity: 11,
    },
  ]);

});
