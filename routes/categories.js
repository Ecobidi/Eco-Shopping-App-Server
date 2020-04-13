let fs = require("fs");
let router = require("express").Router();
let Category = require("../models/category");
let config = require("../config");


router.get('/', function(req, res) {
  Category.find({})
  .select("name image")
  .exec(function(err, categories) {
    res.render("categories", {categories});
  });
});

router.post("/new", function(req, res) {
  let name = req.body.name;
  if (!name) {
    req.flash("error_msg", "No category name provided. Name is required!");
    res.redirect("/categories");
  }

  // check if name is already saved
  Category.findOne({name}, function(err, category) {
    if (err) return console.log(err);
    if (category) { // handle already saved category
      req.flash("error_msg", "The category name is already saved. You should edit it!");
      res.redirect("/categories");
    }
    if (req.files && req.files.photo) { // handle image attached
      let photoName = name + "_" + new Date().getTime() + "_" + req.files.photo.name;
      req.files.photo.mv(config.categoryPhotoPath + photoName, function(err) {
        if (err) console.log(err);
        Category.create({name: name, image: photoName, products:[]}, function(err, doc) {
            if (err) { // remove saved photo and throw err
              fs.unlink(config.categoryPhotoPath + photoName, function(innerErr) {
                if (innerErr) console.log(innerErr);
                return console.log(err);
              })
            }
            res.redirect("/categories");
          })
      });
    } else {
      Category.create({ name: name, image: photoName, products:[]}, function(err, category) {
          res.redirect("/categories")
        });
    }
  });
});

router.post("/edit", function(req, res) {
  let categoryId = req.body.id;
  let name = req.body.name;
  if (!name) {
    req.flash("error_msg", "No category name provided. Name is required!");
    res.redirect("/categories");
  }
  Category.findById(categoryId, function(err, category) {
    console.log(category);
    if (category == undefined || category == null) {
      req.flash("error_msg", "Category ID not found!");
      res.redirect("/categories");
    }
    if (req.files && req.files.photo) { // handle new image uploaded
      let photoName = name + "_" + new Date().getTime() + "_" + req.files.photo.name;
      req.files.photo.mv(config.categoryPhotoPath + photoName, function(err) {
        if (err) console.log(err);
        // delete old category photo after uploading new photo
        fs.unlink(config.categoryPhotoPath + category.image, function(err) {
          if (err) console.error("Error removing " + category.name + " old image");
          // update fields
          category.image = photoName;
          category.name = name;
          category.save(function(err, doc) {
              if (err) { // remove saved photo and throw err
                fs.unlink(config.categoryPhotoPath + photoName, function(innerErr) {
                  if (innerErr) console.log(innerErr);
                  return console.log(err);
                })
              }
              res.redirect("/categories");
            })
        })
      });
    } else { // no new image uploaded
      // update name
      category.name = name;
      category.save(function(err, category) {
          res.redirect("/categories")
        });
    }
  });
})

router.get("/view/:id", function(req, res) {
  console.log("You requested for category with the id: " + req.params.id);
});

router.get("/delete/:categoryId", function(req, res) {
  // Category.findByIdAndRemove(req.params.categoryId, function(err) {
  //   if (err) return console.log(err);
  //   res.redirect("/categories");
  // })
  res.redirect("/categories");
})

module.exports = router;