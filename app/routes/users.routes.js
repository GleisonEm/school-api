module.exports = (app) => {
  const UserController = require("../controllers/UserController.js");

  var router = require("express").Router();

  // Create a new Tutorial
  router.post("/upload-file", UserController.UploadPhoto);
  router.post("/upload", UserController.UploadPhotoBase64);

  // // Update a Tutorial with id
  // router.put("/:id", tutorials.update);

  // // Delete a Tutorial with id
  // router.delete("/:id", tutorials.delete);

  // // Delete all Tutorials
  // router.delete("/", tutorials.deleteAll);

  app.use("/api/users", router);
};
