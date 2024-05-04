const express = require("express");
var cors = require("cors");
let http = require("http");
// _lodash = require('lodash');
// var useragent = require('express-useragent');

const app = express();

//var corsOptions = {
//origin: '*',
//};

//app.use(cors(corsOptions));
app.use(cors());
// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// app.use(useragent.express());
//server static files
app.use(express.static("public"));

//Adding Middleware for authenticate request
app.use("/api", require("./app/middelware/auth"));

const db = require("./app/models");

let routes = require("./app/routes");

db.mongoose.set("strictQuery", false);
console.log(db.url);
db.mongoose
  .connect(db.url, {
    // useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "🚀 Hola Amigo, Kaise hoo theek ho 🚀" });
});

app.use("/api", routes);

// set port, listen for requests
const PORT = process.env.PORT || 6069;

let startServer = http.createServer(app);
// socketService.initializeSocket(startServer)

startServer.listen(PORT, function () {
  console.log(`Server is running on port ${PORT}.`);
});
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}.`);
// });

// app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;
