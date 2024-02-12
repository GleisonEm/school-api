const db = require("../models");
const Joker = require("../models/Joker");
const Class = db.classes;
const moment = require('moment-timezone');

const ClassController = {
    // Função de listagem
    async list(req, res) {
        try {

            if (req.query.with_shift) {
                const classes = await Joker.query(`SELECT c.id, c.class_name, c.academic_year, s.name AS shift_name FROM classes c JOIN shifts s ON c.shift_id = s.id ORDER BY c.class_name;`)

                return res.status(200).json(classes);
            }

            const classes = await Class.findAll();

            return res.status(200).json(classes);
        } catch (error) {
            console.error('Erro ao listar classes:', error);
            return res.status(500).json({ message: 'Erro interno do servidor. ' + error });
        }
    },
    getWithStatus: async (req, res) => {
        try {

            const shift = req.query.shift ? req.query.shift : null;
            console.log(req.query)
            let conditionalQuery = ''

            if (shift) {
                conditionalQuery = `WHERE c.shift_id = ${parseInt(shift)}`
            }

            const classes = await Joker.query(`SELECT c.id, c.class_name, c.academic_year, CASE WHEN tc.class_id IS NOT NULL THEN 'busy' ELSE 'free' END AS status, s.name AS shift_name FROM classes c LEFT JOIN (SELECT DISTINCT class_id FROM time_control WHERE exit_datetime IS NULL) tc ON c.id = tc.class_id JOIN shifts s ON c.shift_id = s.id ${conditionalQuery} ORDER BY c.class_name;`)

            return res.status(200).json({ classes: classes });
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    },
    findOpenClass: async (req, res) => {
        try {
            const teacher_id = req.params.teacher_id;
            const classFind = await Joker.query("SELECT c.id, c.class_name, c.academic_year, tc.entry_datetime, s.name AS subject_name, s.id AS subject_id FROM classes c LEFT JOIN (SELECT DISTINCT class_id, teacher_id, subject_id, entry_datetime FROM time_control WHERE exit_datetime IS NULL) tc ON c.id = tc.class_id LEFT JOIN subjects s ON tc.subject_id = s.id WHERE tc.teacher_id = " + teacher_id + ";")

            return res.status(200).json(classFind);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    },
    find: async (req, res) => {
        try {
            const classFind = await Class.findByPk(req.params.id);
            if (!classFind) {
                return res.status(404).json({ error: 'Class not found' });
            }
            return res.status(200).json(classFind);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    },
    findWithTimeControl: async (req, res) => {
        try {

            const classId = req.params.id
            let classIsbusy = false
            let classFind = await Joker.query("SELECT c.id, c.class_name, c.academic_year, tc.entry_datetime, s.name AS subject_name, s.id AS subject_id, u.name AS teaching_in_the_room, t.id AS teaching_in_the_room_id, tc.id AS time_control_id FROM classes c LEFT JOIN (SELECT DISTINCT id, class_id, teacher_id, subject_id, entry_datetime FROM time_control WHERE exit_datetime IS NULL) tc ON c.id = tc.class_id LEFT JOIN subjects s ON tc.subject_id = s.id LEFT JOIN teachers t ON tc.teacher_id = t.id LEFT JOIN users u ON t.user_id = u.id WHERE c.id = " + classId + ";")

            if (!classFind) {
                return res.status(404).json({ error: 'Turma não encontrada' });
            }

            classFind = classFind.shift()

            if (classFind.entry_datetime) {
                classFind.entry_datetime = moment(classFind.entry_datetime).tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');
            }

            if (classFind.entry_datetime) {
                classIsbusy = true
            }

            return res.status(200).json({ ...classFind, is_busy: classIsbusy });
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    },

    // Função de criação
    async create(req, res) {
        try {
            const { class_name, academic_year, shift_id } = req.body;

            const newClass = await Class.create({
                class_name,
                academic_year,
                shift_id
            });
            return res.status(201).json(newClass);
        } catch (error) {
            console.error('Erro ao criar classe:', error);
            return res.status(400).json({ message: 'Erro interno do servidor. ' + error });
        }
    }
};

module.exports = ClassController;
