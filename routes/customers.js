let router = require("express").Router();
let Customer = require("../models/customer");

router.get('/', function(req, res) {
  Customer.find({}, function(err, customers) {
    if (err) return console.log(err);
    res.render("customers", {customers});
  });
});

router.get("/:id", function(req, res) {
  console.log("You requested for category with the id: " + req.params.id);
});

module.exports = router;