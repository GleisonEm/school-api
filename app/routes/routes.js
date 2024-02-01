var router = require("express").Router();
const UserController = require("../controllers/UserController.js");
const TeacherController = require("../controllers/TeacherController.js");

router.post("/login", UserController.login);
router.post("/users", UserController.createUser);

router.post("/teachers", TeacherController.create);
module.exports = router