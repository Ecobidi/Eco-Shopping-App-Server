let fs = require("fs");
let router = require("express").Router();
let Product = require("../models/product");
let Category = require("../models/category");
let config = require("../config");

router.get('/', function(req, res) {
  let products = [];
  Product.find({})
    .sort("-_id")
    //.limit(10)
    .stream()
    .on("data", (product) => {
      product.image = product.image[0];
      products.push(product);
    })
    .on("end", () => {
      res.render("products", {products})
    })
});

router.get("/new", function(req, res) {
  Category.find({})
    .select("name")
    .exec(function(err, categories) {
      res.render("add-product", {categories});
    });
});

router.post("/new", function(req, res) {
  if (req.files && req.files.image) {
    let photoName = Date.now() + req.files.image.name;
    req.files.image.mv(config.productImagePath + photoName, function(err) {
      let product = new Product();
      let keys = Object.keys(req.body);
      keys.forEach(key => product[key] = req.body[key]);
      product.image = photoName;
      Product.create(product, function(err, newProduct) {
        if (err) return console.log(err);
        Category.findOneAndUpdate({name: newProduct.category},
          {$push: { products: newProduct._id }, $inc: { productsCounter: 1}})
          // .select("-products -productsCounter -name -image")
          .exec(function(err, doc) {
            res.redirect("/products");
          });
      });
    });
  } else {
    let product = new Product();
      let keys = Object.keys(req.body);
      keys.forEach(key => product[key] = req.body[key]);
      Product.create(product, function(err, newProduct) {
        if (err) return console.log(err);
        Category.findOneAndUpdate({name: newProduct.category},
          {$push: { products: newProduct._id }, $inc: { productsCounter: 1}})
          // .select("-products -productsCounter -name -image")
          .exec(function(err, doc) {
            res.redirect("/products");
          });
      });
  }
});

router.get("/edit", function(req, res) {
  //let categoryArray = [];
  Product.findById(req.query._id)
    .exec(function(err, product) {
      console.log(product);
      // Category.find({})
      // .select("name")
      // .stream()
      // .on("data", function(category) {
      //   if (product.category && product.category.indexOf(category.name) != -1) category.isAlreadySelected = true;
      //   categoryArray.push(category);
      // })
      // .on("end", function() {
      //   console.log(product);
      //   res.render("edit-product", {product, categoryArray})
      // });
      res.render("edit-product", {product});
    });
});

router.post("/edit", function(req, res) {
  Product.findById(req.query._id, function(err, product) {
    console.log(Object.keys(req.body));
    Object.keys(req.body).forEach((key) => { // populate updated data
      (key != "image") ? product[key] = req.body[key] : null;
    });
    if (req.files && req.files.image) { // new product images? delete old ones
      let oldImage = req.query.oldImage;
      if (Array.isArray(req.files.image)) { // multiple images received?
        let newImages = req.files.image;
        console.log("multiple images received");
        deleteOldImage(oldImage); // remove old images
        product.images = []; // reset product images
        newImages.forEach((newImage) => {
          let imageName = req.body.name +"_"+ Date.now() + "_" + newImage.name;
          let filename = config.productImagePath + imageName;
        
          let numberOfBytesWritten = fs.writeFileSync(filename, newImage.data, {flags: "w"});
          console.log("wrote " + numberOfBytesWritten + " number of bytes");
          product.image.push(imageName);
        });
        updateProduct(product, res);
      } else { // single image received
        let imageName = req.body.name +"_"+ Date.now() + "_" + req.files.image.name;
        req.files.image.mv(config.productImagePath + imageName, function(err) {
          product.image = imageName;
          updateProduct(product, res);      
        });
      }
    } else { // no image
      updateProduct(product, res);
    }
  })
});

function saveProduct(product, res) {
  product.save(function(err, doc) {
    if (err) return console.log(err);
    res.redirect("/products");
  })
}

function deleteOldImage(oldImage) {
  if (oldImage == undefined) {
    // do nothing
  } else if (typeof oldImage == "string") {
    fs.unlinkSync(config.productImagePath + oldImage);
  } else { // delete multiple old images
    for (let i = 0, len = oldImage.length; i < len; i++) {
      fs.unlinkSync(config.productImagePath + oldImage[i]);
      console.log("image deleted: " + oldImage[i]);
    }
  }
}

function updateProduct(updateProduct, res) {
  Product.findOneAndUpdate({_id: updateProduct._id}, updateProduct, function(err, doc) {
    console.log("updated product");
    console.log(doc);
    res.redirect("/products");
  });
}

module.exports = router;