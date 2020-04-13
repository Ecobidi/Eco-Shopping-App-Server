let router = require("express").Router();

router.get("/", function(req, res) {
  res.render("notification");
})
router.get('/simple', function(req, res) {
  res.render("notification");
});

router.get("/custom", function(req, res) {
  res.render("notification");
});

module.exports = router;