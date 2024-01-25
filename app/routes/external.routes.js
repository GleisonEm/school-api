module.exports = (app) => {
  const UserExternalController = require("../controllers/UserExternalController.js");

  var router = require("express").Router();

  // Create a new Tutorial

  router.get("/report", UserExternalController.report);
  router.get("/zip", UserExternalController.getZipPhotos);

  app.use("/api/external/users", router);
};
