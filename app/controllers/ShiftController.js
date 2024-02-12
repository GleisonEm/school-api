const db = require('../models')
const Shift = db.shifts;

const ShiftController = {
    async list(req, res) {
        try {
            const shifts = await Shift.findAll();
            return res.status(200).json(shifts);
        } catch (error) {
            console.error('Erro ao listar turnos:', error);
            return res.status(500).json({ message: 'Erro interno do servidor. ' + error });
        }
    },
    async create(req, res) {
        try {
            const { name } = req.body;

            const newShift = await Shift.create({
                name
            });
            return res.status(201).json(newShift);
        } catch (error) {
            console.error('Erro ao criar o turno:', error);
            return res.status(400).json({ message: 'Erro interno do servidor. ' + error });
        }
    }
}

module.exports = ShiftController