var router = require("express").Router();
const UserController = require("../controllers/UserController.js");
const TeacherController = require("../controllers/TeacherController.js");
const ClassController = require("../controllers/ClassController.js");
const StudentController = require("../controllers/StudentController.js");
const SubjectController = require("../controllers/SubjectController.js");
const TimeControlController = require("../controllers/TimeControlController.js");
const ReportController = require("../controllers/ReportController.js");

router.post("/login", UserController.login);
router.post("/users", UserController.createUser);

router.post("/teachers", TeacherController.create);

router.post("/students", StudentController.create);

router.post("/classes", ClassController.create)
router.get("/classes", ClassController.list)
router.get("/classes/status", ClassController.getWithStatus)
router.get("/classes/:id", ClassController.findWithTimeControl)
router.get("/classes/:teacher_id/open", ClassController.findOpenClass)

router.post("/subjects", SubjectController.create)
router.get("/subjects", SubjectController.list)

router.post("/time-control/entry", TimeControlController.registerEntry)
router.post("/time-control/exit", TimeControlController.registerExit)

router.get("/reports", ReportController.getData)
router.get("/reports/download", ReportController.download)

module.exports = router