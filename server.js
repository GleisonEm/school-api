const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const bodyParser = require("body-parser");
const validateAuth = require("./app/middleware/auth");
const router = require("./app/routes/routes.js");

app.use(cors());
app.use(bodyParser.json({ limit: "60mb" }));
app.use(bodyParser.urlencoded({ limit: "60mb", extended: true }));
// app.use(validateAuth)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router)

app.get("/", (req, res) => {
  res.json({ message: "SCHOOL API" });
});

const PORT = process.env.PORT || 3022;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
  console.log(`Versão do Node.js: ${process.version}`);
});
