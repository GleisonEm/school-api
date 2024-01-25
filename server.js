const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const bodyParser = require("body-parser");

// app.set("view engine", "ejs");
app.use(bodyParser.json({ limit: "60mb" }));
app.use(bodyParser.urlencoded({ limit: "60mb", extended: true }));

app.use(cors());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

// app.get("/download", function (request, response) {
//   response.sendFile(__dirname + "/public/download.html");
// });

app.get("/download/:referenceId", function (request, response) {
  // response.render(__dirname + "/public/download.ejs", {
  //   photoName: request.params.referenceId,
  // });
  response.sendFile(__dirname + "/public/download.html");
});

app.get("/downloadi", function (request, response) {
  response.sendFile(__dirname + "/public/downloadIphone.html");
});

require("./app/routes/users.routes")(app);
require("./app/routes/external.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 3022;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
