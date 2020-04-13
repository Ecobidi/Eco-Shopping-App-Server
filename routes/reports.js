let router = require("express").Router();
let Order = require("../models/order");
let Category = require("../models/category");
let Product = require("../models/product");
let Customer = require("../models/customer");

router.get("/", function(req, res) {
  let recentOrders, recentProducts = new Array();
  // get customers
  Customer.find({}, function(err, customers) {
    if (err) return console.log("Error retrieving customers\n" + err);
    let totalCustomers = customers.length; // customers length
    // get categories
    Category.find({}, function(err, categories) {
      if (err) return console.log("Error retrieving categories\n" + err);
      let totalCategories = categories.length;
      // get products
      Product.find({})
      .sort("-_id") // sort by recent products first
      .exec(function(err, products) {
        if (err) return console.log("Error retrieving products\n" + err);
        let totalProducts = products.length;
        recentProducts = products.slice(0, 10);
        recentProducts.forEach((p) => p.image = p.image[0]);
        // get orders
        Order.find({})
        .sort("_id") // sort by recent orders first
        .exec(function(err, orders) {
          if (err) return console.log("Error retrieving orders\n" + err);
          let totalOrders = orders.length;
          recentOrders = orders.slice(0, 10);

          recentOrders.forEach(function(index, array) {
            recentOrders[index].customer = customers.find((customer, index) => { recentOrders[index].customerID == customer._id});
            recentOrders[index].product = products.find((product, index) => { recentOrders[index].productID == product._id});
          });

          //service user request
          res.render("reports", {
            recentOrders,
            recentProducts,
            totalOrders,
            totalCategories,
            totalProducts,
            totalCustomers
          });
        });
      });
    });
  });
});

module.exports = router;