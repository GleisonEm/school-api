var router = require("express").Router();
const UserController = require("../controllers/UserController.js");
const TeacherController = require("../controllers/TeacherController.js");
const ClassController = require("../controllers/ClassController.js");
const StudentController = require("../controllers/StudentController.js");
const SubjectController = require("../controllers/SubjectController.js");
const TimeControlController = require("../controllers/TimeControlController.js");
const ReportController = require("../controllers/ReportController.js");
const AttendanceController = require("../controllers/AttendanceController.js");
const ShiftController = require("../controllers/ShiftController.js");

router.post("/login", UserController.login);
router.post("/teachers/login", UserController.loginTeacher);
router.post("/admin/login", UserController.loginAdmin);
router.post("/users", UserController.createUser);

router.post("/teachers", TeacherController.create);
router.get("/teachers", TeacherController.get);
router.delete("/teachers/:user_id", TeacherController.delete);

router.post("/students", StudentController.create);
router.get("/students/all", StudentController.get);
router.delete("/students/:user_id", StudentController.delete);
router.get("/students/:class_id", StudentController.listByClass);

router.post("/classes", ClassController.create)
router.get("/classes", ClassController.list)
router.delete("/classes/:class_id", ClassController.delete);
router.get("/classes/status", ClassController.getWithStatus)
router.get("/classes/:id", ClassController.find)
router.get("/classes/:id/time-control", ClassController.findWithTimeControl)
router.get("/classes/:teacher_id/open", ClassController.findOpenClass)

router.post("/subjects", SubjectController.create)
router.get("/subjects", SubjectController.list)

router.post("/time-control/entry", TimeControlController.registerEntry)
router.post("/time-control/exit", TimeControlController.registerExit)

router.get("/reports/teachers", ReportController.getDataTeacher)
router.get("/reports/students", ReportController.getDataStudent)
router.get("/reports/download", ReportController.download)

router.post("/shifts", ShiftController.create)
router.get("/shifts", ShiftController.list)

router.get('/students/attendance/:time_control_id', AttendanceController.getAttendanceWithStudents);
// router.post('/attendance_records', AttendanceController.createAttendance);
router.post('/attendance_records',  AttendanceController.updateOrCreateAttendance);

router.get('/attendance-records/time-control/:time_control_id', AttendanceController.getByTimeControl);

module.exports = router