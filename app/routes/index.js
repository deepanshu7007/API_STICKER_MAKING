const express = require("express");

const router = express();

router.use("/user", require("./users.routes"));

router.use("/auth", require("./auth.routes"));
router.use("/user/auth",require('../middelware/auth'))
// router.use("/", require("./upload"));
router.use("/card", require("./cards.routes"));
router.use("/faq", require("./faq.routes"));
router.use("/features", require("./features.routes"));
router.use("/plan", require("./plan.routes"));
router.use("/subscriptions", require("./subscriptions.routes"));
router.use("/upload", require("./upload.routes"));
router.use("/department", require("./department.routes"));



// require('./app/routes/users.routes')(router);


module.exports = router;
