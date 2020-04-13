let path = require("path");
let express = require("express");
let mongoose = require("mongoose");
let expHbs = require("express-handlebars");
let bodyParser = require("body-parser");
let expressValidator = require("express-validator");
let expressSession = require("express-session");
let cookieParser = require("cookie-parser");
let connectFlash = require("connect-flash");
let fileUpload = require("express-fileupload");

let apiRouter = require("./routes/api/index");
let productRouter = require("./routes/products");
let categoryRouter = require("./routes/categories");
let orderRouter = require("./routes/orders");
let customerRouter = require("./routes/customers");
let storeRouter = require("./routes/store");
let reportRouter = require("./routes/reports");
let notificationRouter = require("./routes/notification");

let config = require("./config");

let Customer = require("./models/customer");

// create db connection
mongoose.connect("mongodb://localhost:27017/eco-mall-test-db");

mongoose.connection.once("connected", function() {
  console.log("Connected to database");
});

mongoose.connection.on('error',function (err) {
  console.log('Mongoose connection error: ' + err);
});

// initialize express app
let app = express();

// express-handlebars middleware
app.engine("hbs", expHbs({defaultLayout: "main", extname: ".hbs"}));
app.set("view engine", "hbs");

// body-parser middleware
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.use(fileUpload());

// express session middleware
app.use(expressSession({
  secret: 'keyboard cat',
  cookie: {}
}));

// express validator middleware
app.use(expressValidator());

// connect flash middleware
app.use(connectFlash());

// global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// Routes 
app.get("/signin", function(req, res) {
  res.render("admin-signin");
});

app.post("/signin", function(req, res) {
  console.log(req.body);
  Customer.findOne({username: req.body.username}, function(err, user) {
    if (err) return console.log(err);
    if(user && user.password == req.body.password) {
      req.session.user = user;
      res.send(user._id);
    }
  });
});

app.get("/signup", function(req, res) {
  res.render("i-customer-signup");
});

app.post("/signup", function(req, res) {
  console.log(req.body);    
  Customer.findOne({username: req.body.username}, function(err, user) {
    if (err) return console.log(err);
    if (user) return res.status(404).end(); // user already registered
    if (req.body.password == req.body.confirmPassword) {
      let photoName;
      if (req.files && req.files.photo) {
        photoName = "pp_" + new Date().getTime() + "_" + req.files.photo.name;
        req.files.photo.mv(config.profilePhotoPath + photoName, function(err) {
        if(err) console.log(err);
        Customer.create({
          username: req.body.username,
          password: req.body.password,
          email: req.body.email,
          name: req.body.name,
          phone: req.body.phone,
          photo: photoName,
          cart: [], wishlist: [], orders: [], recentViews: [],
          address: {
            state: req.body.state,
            city: req.body.city,
            street: req.body.street
            }
          }, function(err, doc) {
            if (err) return console.log(err);
            console.log("user signup successful");
            res.locals.success = "Signup successful";
            res.redirect("/signup");
          });
        });
      }
    }
  });
});

app.use("/", reportRouter);

app.use("/api", apiRouter);

app.use("/reports", reportRouter);

app.use ("/orders", orderRouter);

app.use("/products", productRouter);

app.use("/categories", categoryRouter);

app.use("/customers", customerRouter);

app.use("/store-settings", storeRouter);

app.use("/notifications", notificationRouter);

// express-static middleware
app.use(express.static(path.join(__dirname, "public")));

// listen to port
app.listen(3000, function() {
   console.log("eco-shopping-mall server running on port 3000");
});