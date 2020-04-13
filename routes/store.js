let router = require("express").Router();
let Store = require("../models/store");

router.get("/", function(req, res) {
  Store.findOne({name: "Eco-Shopping-Mall"}, function(err, store) {
    if (err) return console.error(err);
    if (store == null) {
      res.render("store-settings", new Store()); // send empty store obj
    } else {
      res.render("store-settings", store); // send retrieved store
    }
  });
});

router.post("/", function(req, res) {
  console.dir(req.body);
  res.end();
});

module.exports = router;