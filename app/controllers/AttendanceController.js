const db = require("../models");
const Joker = require("../models/Joker");
const Student = db.students;
const AttendanceRecord = db.attendanceRecords;
const { Op } = require('sequelize');

const AttendanceController = {
    async getAttendance(req, res) {
        const date = new Date().toISOString().split('T')[0]; // Formatar a data para YYYY-MM-DD
        const class_id = req.params.class_id;
        try {
            const studentsSql = `
                SELECT s.*, ar.attendance_status
                FROM students AS s
                LEFT JOIN attendance_records AS ar
                ON s.id = ar.student_id AND ar.date = ? AND ar.class_id = ?
            `;
            const students = await db.sequelize.query(studentsSql, {
                replacements: [date, class_id],
                type: db.sequelize.QueryTypes.SELECT
            });
            res.json(students);
        } catch (error) {
            console.error('Error retrieving attendance records:', error);
            res.status(500).send('Internal Server Error');
        }
    },
    async getAttendanceWithStudents(req, res) {
        const date = new Date().toISOString().split('T')[0]; // Formatar a data para YYYY-MM-DD
        const timeControlId = req.params.time_control_id;
        try {
            const studentsSql = `
                SELECT s.*, s.id as student_id, u.name
                FROM students AS s
                JOIN classes AS c ON s.class_id = c.id
                JOIN time_control as tc ON tc.class_id = c.id
                JOIN users as u ON s.user_id = u.id
                WHERE tc.id = ${timeControlId}
            `;
            const students = await Joker.query(studentsSql);
            let attendances = [];

            if (students) {
                const studentsIds = students.map((row) => {
                    return row.id
                })

                console.log(studentsIds, students)
                attendances = await AttendanceRecord.findAll({
                    where: {
                        student_id: {
                            [Op.in]: studentsIds
                        },
                        time_control_id: timeControlId
                    }
                });
            }

            const studentsWithAttendances = students.map((student) => {
                const attendanceRecord = attendances.filter((attendance) => attendance.student_id === student.id)
                return { ...student, attendance: attendanceRecord ? attendanceRecord.shift() : [] }
            })

            return res.json(studentsWithAttendances)
        } catch (error) {
            console.error('Error retrieving attendance records:', error);
            res.status(500).send('Internal Server Error');
        }
    },
    async getByTimeControl(req, res) {
        const timeControlId = req.params.time_control_id
        const date = new Date().toISOString().split('T')[0]; // Formatar a data para YYYY-MM-DD

        try {
            const studentsSql = `
                SELECT s.*, s.id as student_id, ar.attendance_status
                FROM time_control AS tc
                LEFT JOIN attendance_records AS ar ON tc.id = ar.time_control_id
                JOIN students AS s ON ar.student_id = s.id
                WHERE tc.id = ${timeControlId}
            `;
            const students = await Joker.query(studentsSql);
            res.json(students);
        } catch (error) {
            console.error('Error retrieving attendance records:', error);
            res.status(500).send('Internal Server Error');
        }
    },
    // Método para criar um novo registro de presença
    async createAttendance(req, res) {
        const { class_id, student_id, date, attendance_status } = req.body;
        try {
            const insertSql = `
                INSERT INTO attendance_records (class_id, student_id, date, attendance_status)
                VALUES (?, ?, ?, ?)
            `;
            await db.sequelize.query(insertSql, {
                replacements: [class_id, student_id, date, attendance_status]
            });
            res.status(201).send('Attendance record created successfully.');
        } catch (error) {
            console.error('Error creating attendance record:', error);
            res.status(500).send('Internal Server Error');
        }
    },

    // Método para atualizar um registro de presença
    async updateAttendance(req, res) {
        const { attendance_status } = req.body;
        const recordId = req.params.id;
        try {
            const updateSql = `
                UPDATE attendance_records
                SET attendance_status = ?
                WHERE id = ?
            `;
            const result = await db.sequelize.query(updateSql, {
                replacements: [attendance_status, recordId]
            });
            if (result[0].affectedRows === 0) {
                res.status(404).send('Attendance record not found');
            } else {
                res.status(200).send('Attendance record updated successfully.');
            }
        } catch (error) {
            console.error('Error updating attendance record:', error);
            res.status(500).send('Internal Server Error');
        }
    },
    async updateOrCreateAttendance(req, res) {
        const { attendance_status, class_id, time_control_id, student_id, date } = req.body;

        try {
            const findAttendance = await AttendanceRecord.findOne({
                where: {
                    student_id: student_id,
                    time_control_id: time_control_id
                }
            })

            if (findAttendance) {
                const [ hasUpdate ] = await AttendanceRecord.update(
                    {
                        student_id: student_id,
                        time_control_id: time_control_id,
                        date: date,
                        attendance_status: attendance_status
                    },
                    { where: { id: findAttendance.id } }
                );
                console.log(hasUpdate)
                if (!Boolean(hasUpdate)) {
                    return res.status(400).json({ message: "erro ao atualizar os registros" })
                }

                return res.status(200).json({ message: "Registros atualizados com sucesso!" })
            }

            await AttendanceRecord.create(
                {
                    class_id: class_id,
                    student_id: student_id,
                    time_control_id: time_control_id,
                    date: date,
                    attendance_status: attendance_status
                }
            )

            return res.status(200).json({ message: "Registros inseridos com sucesso!" })

        } catch (error) {
            console.error('Error updating attendance record:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}

module.exports = AttendanceController;
