let mongoose = require("mongoose");
let Store = require("../models/store");

// create db connection
mongoose.connect("mongodb://localhost:27017/eco-mall-test-db");

mongoose.connection.on('error',function (err) {
  console.log('Mongoose connection error: ' + err);
});

Store.find({}, function(err, stores) {
  if (stores.length > 0) return;

  Store.create({
    name: "Eco-Shopping-Mall",
    address: "No. 1 shopping lane",
    phone: "123456789",
  });

});
