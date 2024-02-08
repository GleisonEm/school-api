const db = require("../models");
const TimeControl = db.timeControl;
const Teacher = db.teachers;
const moment = require('moment-timezone');
const Joker = require("../models/Joker");

const TimeControlController = {

    async registerEntry(req, res) {
        try {
            const { teacher_id, class_id, entry_datetime, subject_id } = req.body;
            const entry = moment(entry_datetime).tz("America/Recife");

            const teacherFind = (await Joker.query(`SELECT t.id as id, t.user_id as user_id, u.name as name FROM teachers t JOIN users u ON t.user_id = u.id WHERE t.user_id = ${teacher_id}`)).shift();

            if (!teacherFind) {
                return res.status(404).json({ message: 'Professor não encontrado' });
            }

            const findTimeControl = await TimeControl.findOne({ where: { class_id: class_id, exit_datetime: null } });

            if (findTimeControl) {
                const message = findTimeControl.teacher_id != teacherFind.id ? `Essa sala está ocupada no momento com o professor: ${teacherFind.name}, qualquer problema entre em contato com a diretoria.` :
                    `Você já está registrado nessa sala, encerre e entre novamente se quiser ministrar outra matéria, qualquer problema entre em contato com a diretoria.`

                return res.status(400).json({ message: message });
            }

            const findTimeControlByTeacher = await TimeControl.findOne({ where: { teacher_id: teacher_id, exit_datetime: null } });

            if (findTimeControlByTeacher) {
                return res.status(400).json({ message: 'Você já tem uma turma em aberto, finalize ela antes de entrar em outra, qualquer problema entre em contato com a diretoria.' });
            }

            const newTimeControl = await TimeControl.create({
                teacher_id: teacherFind.id,
                class_id,
                subject_id,
                entry_datetime: entry
            });

            return res.status(201).json(newTimeControl);
        } catch (error) {
            console.error('Erro ao registrar controle de tempo:', error);
            return res.status(400).json({ message: 'Erro interno do servidor. ' + error });
        }
    },
    async registerExit(req, res) {
        try {
            const { teacher_id, class_id, exit_datetime } = req.body;
            const exit = moment(exit_datetime).tz("America/Recife");

            // Verifica se o professor existe
            const teacherFind = (await Joker.query(`SELECT t.id as id, t.user_id as user_id, u.name as name FROM teachers t JOIN users u ON t.user_id = u.id WHERE t.user_id = ${teacher_id}`)).shift();

            if (!teacherFind) {
                return res.status(404).json({ message: 'Professor não encontrado' });
            }

            // Verifica se existe um controle de tempo aberto para esse professor e essa sala
            const findTimeControl = await TimeControl.findOne({ where: { teacher_id: teacherFind.id, class_id: class_id, exit_datetime: null } });

            if (!findTimeControl) {
                return res.status(400).json({ message: 'Não há registro de entrada para este professor nesta sala.' });
            }

            // Verifica se a data/hora de saída é posterior à data/hora de entrada
            if (exit.isBefore(moment(findTimeControl.entry_datetime))) {
                return res.status(400).json({ message: 'A hora de saída não pode ser anterior à hora de entrada.' });
            }

            // Calcula as horas trabalhadas
            const totalHoursWorked = exit.diff(moment(findTimeControl.entry_datetime), 'hours', true);

            // Atualiza o registro com a hora de saída e as horas trabalhadas
            await TimeControl.update(
                {
                    exit_datetime: exit,
                    total_hours_worked: totalHoursWorked
                },
                { where: { id: findTimeControl.id } }
            );

            return res.status(200).json({ message: 'Saída registrada com sucesso.' });

        } catch (error) {
            console.error('Erro ao registrar saída:', error);
            return res.status(500).json({ message: 'Erro interno do servidor. ' + error });
        }
    }
};

module.exports = TimeControlController;
