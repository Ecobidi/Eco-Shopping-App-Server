let router = require("express").Router();
let mongoose = require("mongoose");
let Product = require("../../models/product");
let Category = require("../../models/category");
let Order = require("../../models/order");
let Customer = require("../../models/customer");

router.use("/", function(req, res, next) {
  if (!req.session || !req.session.user) res.status(404).end(); // kick unauthenticated user out
  console.log("\n" + req.method + ": " + req.path);
  console.log(req.session);
  next();
});

router.get("/products", function(req, res) {
  let requestedCategory = Array.isArray(req.query.catgory) ? req.query.category : [req.query.category];
  for (let i = 0; i < requestedCategory.length; i++)  {
    requestedCategory[i] = new RegExp(requestedCategory[i], "i");
  }
  Product.find({})
  .sort("-_id")
  .select("_id name sellingPrice regularPrice image category")
  .where("category").in(requestedCategory)
  .exec(function(err, products) {
    if (err) return console.log(err);
    res.json({products});
  });
});

router.get("/products/:id", function(req, res) {
  console.log(req.params.id)
  Product.findOne({_id: req.params.id}, function(err, product) {
    if (err) return console.log(err);
    res.json(product);
  });
});

router.get("/search", function(req, res) {
  let searchQuery = req.query.search;
    if (searchQuery.trim().length >= 2) {
    searchQuery = new RegExp(searchQuery, "i");
    Product.find({"name": searchQuery}, function(err, products) {
      if (err) return console.log(err);
      res.json(products);
    });
  } else {
    res.json([]);
  }
});

router.get("/categories", function(req, res) {
  Category.find({}, function(err, categories) {
    res.json(categories);
  });
});

router.get("/top_categories", function(req, res) {
  Category.find({})
    .sort("-productsCounter")
    .limit(5)
    .populate("products")
    .exec(function(err, categories) {
      if (err) return console.log(err);
      res.json(categories);
    });
});

router.get("/orders/:customerId", function(req, res) {
  Customer.findById(req.params.customerId)
    .select("orders")
    .populate("orders")
    .exec(function(err, customer) {
      if (err) return console.log(err);
      res.json(customer);
    });
});

router.post("/orders/:customerId", function(req, res) {
  // handle orders update
});

router.get("/cart/:customerId", function(req, res) {
  let customerId = req.params.customerId;
  Customer.findById(req.params.customerId)
    .select("cart")
    .populate("cart.product")
    .exec(function(err, customer) {
      if (err) return console.log(err);
      req.session.user.cart = customer.cart;
      res.json(customer.cart);
    });
});

router.post("/cart/:customerId", function(req, res) {
  let productId = req.query.productId;
  let incrementBy = req.query.incrementBy;
  Customer.findById(req.params.customerId)
    .select("cart")
    .exec(function(err, customer) {
      if (err) return console.log(err);
      let index = customer.cart.findIndex((item) => item.product == productId);
      if (index == -1) { // product hasn't been added, thus add it
        customer.cart.push( { product: productId, quantity : 1} );
        customer.save(function() {
          Customer.findById(req.params.customerId)
            .select("cart").populate("cart.product")
            .exec(function(err, doc) {
              req.session.user.cart = doc.cart;
              res.json(doc.cart); 
            });
        });
      } else { // product is already added, thus increment quantity
        customer.cart[index].quantity ++;
        customer.save(function(err, doc) {
           Customer.findById(req.params.customerId)
            .select("cart").populate("cart.product")
            .exec(function(err, doc) {
              req.session.user.cart = doc.cart;
              res.json(doc.cart); 
            });
        });
      }
    });

    // Customer.findOneAndUpdate({_id: customerId, "cart.product": productId},
    //   {"$inc": {"cart.$.quantity": incrementBy}},
    //   {"upsert": true})
    //   .exec(function(err, customer) {
    //     if (err) return console.log(err);
    //     Customer.findById(customerId)
    //       .populate("cart.product")
    //       .exec(function(err, populatedDoc) {
    //         if (err) return console.log(err);
    //         res.json(populatedDoc.cart);
    //       });
    //   }); 
});

router.delete("/cart/:customerId", function(req, res) {
  let productId = req.query.productId;
  console.log(productId);
  Customer.findByIdAndUpdate(req.params.customerId,
    {"$pull": {"cart": {"product": productId} }})
    //.populate("cart.product")
    .select("_id")
    .exec(function(err) {
      if (err) return console.log(err);
      Customer.findById(req.params.customerId)
      .select("cart")
      .populate("cart.product")
      .exec(function(err, doc) {
        if (err) return console.log(err);
        for (let i = 0; i < doc.cart.length; i++) console.log(doc.cart[i].product + " --- " + doc.cart[i].quantity);
        req.session.user.cart = doc.cart;
        res.json(doc.cart);
      })
    })
});

router.get("/wishlist/:customerId", function(req, res) {
  Customer.findById(req.params.customerId)
    .select("wishlist")
    .populate("wishlist")
    .exec(function(err, customer) {
      if (err) return console.log(err);
      req.session.user.wishlist = customer.wishlist;
      res.json({ products: customer.wishlist });
    });
});

router.post("/wishlist/:customerId", function(req, res) {
  let productId = req.query.productId;
  Customer.findByIdAndUpdate(req.params.customerId, {"$addToSet": {"wishlist": productId}})
  .select("wishlist")
  .populate("wishlist")
  .exec(function(err, doc) {
    req.session.user.wishlist = doc.wishlist; 
    res.end();
   });
  // Customer.findById(req.params.customerId)
  //   .exec(function(err, customer) {
  //     if (err) return console.log(err);
  //     let index = customer.wishlist.findIndex((item) => item == productId);
  //     if (index == -1) {
  //       customer.wishlist.push( productId ); // add productId to wishlist if it hasn't been added
  //       customer.save(function(err, doc) {
  //         req.session.user.wishlist = customer.wishlist;
  //         res.end(); 
  //       });
  //     } else {
  //       res.end();
  //     }
  //   });
});

router.delete("/wishlist/:customerId", function(req, res) {
  let productId = req.query.productId;
  Customer.findByIdAndUpdate(req.params.customerId,
    {"$pull": {"wishlist": productId} })
    .select("_id")
    .exec(function(err) {
      if (err) return console.log(err);
      Customer.findById(req.params.customerId)
        .select("wishlist").populate("wishlist")
        .exec(function(err, doc) {
          req.session.user.wishlist = doc.wishlist;
          res.json({products: doc.wishlist});
        })
    })
});

router.get("/profile", function(req, res) {
  Customer.findById(req.query.customerId, function(err, customer) {
    res.json(customer);
  });
});

router.post("/profile", function(req, res) {
  // handle profile update
});

router.get("/recent_views/:customerId", function(req, res) {
  Customer.findById(req.params.customerId)
      .select("recentViews")
      .populate("recentViews")
      .exec(function(err, customer) {
        if (err) return console.log(err);
        req.session.user.recentViews = customer.recentViews;
        res.json(customer.recentViews);
      });
});

router.post("/recent_views/:customerId", function(req, res) {
  let productId = req.query.productId;
  Customer.findByIdAndUpdate(req.params.customerId, {"$addToSet": {"recentViews": productId}})
    .select("recentViews").exec(function(err, doc) {
      if (err) return console.log(err);
      req.session.user.recentViews = doc.recentViews;
      res.end();
    })

  // Customer.findById(req.params.customerId)
  //   .exec(function(err, customer) {
  //     if (err) return console.log(err);
  //     let index = customer.recentViews.findIndex((item) => item == productId);
  //     if (index == -1) { 
  //       customer.recentViews.unshift( productId ); // add productId to top of recentViews
  //       customer.save(function(err, doc) {
  //         req.session.user.recentViews = doc.recentViews;
  //         res.end(); 
  //       });
  //     } else {
  //       customer.recentViews.splice(index, 1); // remove the product from the array
  //       customer.recentViews.unshift( productId ); // add productId to the top of array
  //       customer.save(function(err, doc) {
  //         req.session.user.recentViews = doc.recentViews;
  //         res.end(); 
  //       });
  //     }
  //   });
});

module.exports = router;