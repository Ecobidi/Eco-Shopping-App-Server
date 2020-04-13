let router = require("express").Router();
let Order = require("../models/order");

router.get('/', function(req, res) {
  Order.find({}, function(err, orders) {
    if (err) return console.error(err);
    if (orders.length == 0) {
      res.render("orders.hbs");
    } else {
      res.render("orders", {orders})
    }
  });
});

router.get("/:id", function(req, res) {
  console.log("You requested for category with the id: " + req.params.id);
});

module.exports = router;