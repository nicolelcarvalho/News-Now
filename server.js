var express = require("express");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var logger = require("morgan");
var mongoose = require("mongoose");
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newsdb";

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));

// Use body-parser for handling form submissions
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));
// app.use(bodyParser.urlencoded({ extended: false }));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
// mongodb://heroku_gg00x1rn:a7dr0bshm9ds56btlshf8r1cc9@ds237815.mlab.com:37815/heroku_gg00x1rn

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});

// Routes
// =============================================================
require("./routes/api-routes.js")(app);

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
