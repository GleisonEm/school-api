const db = require("../models");
const TimeControl = db.timeControl;
const Teacher = db.teachers;
const moment = require('moment-timezone');
const Joker = require("../models/Joker");

const TimeControlController = {

    async registerEntry(req, res) {
        try {
            const { teacher_id, class_id, entry_datetime } = req.body;
            const entry = moment(entry_datetime).tz("America/Recife");

            const userFind = await Joker.query(`SELECT * FROM teachers WHERE user_id = ${teacher_id}`);

            if (!userFind) {
                return res.status(404).json({ error: 'Teacher not found' });
            }

            const newTimeControl = await TimeControl.create({
                teacher_id: userFind.id,
                class_id,
                entry_datetime: entry
            });

            return res.status(201).json(newTimeControl);
        } catch (error) {
            console.error('Erro ao registrar controle de tempo:', error);
            return res.status(400).json({ message: 'Erro interno do servidor. ' + error });
        }
    }
};

module.exports = TimeControlController;
