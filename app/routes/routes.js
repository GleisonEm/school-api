var router = require("express").Router();
const UserController = require("../controllers/UserController.js");
const TeacherController = require("../controllers/TeacherController.js");
const ClassController = require("../controllers/ClassController.js");
const StudentController = require("../controllers/StudentController.js");
const SubjectController = require("../controllers/SubjectController.js");
const TimeControlController = require("../controllers/TimeControlController.js");

router.post("/login", UserController.login);
router.post("/users", UserController.createUser);

router.post("/teachers", TeacherController.create);

router.post("/students", StudentController.create);

router.post("/classes", ClassController.create)
router.get("/classes", ClassController.list)
router.get("/classes/:id", ClassController.find)

router.post("/subjects", SubjectController.create)
router.get("/subjects", SubjectController.list)

router.post("/time-control/entry", TimeControlController.registerEntry)

module.exports = router