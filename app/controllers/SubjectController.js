const db = require("../models");
const Subject = db.subjects;

const SubjectController = {
    // Função de listagem
    async list(req, res) {
        try {
            const subjects = await Subject.findAll();
            return res.status(200).json(subjects);
        } catch (error) {
            console.error('Erro ao listar matérias:', error);
            return res.status(500).json({ message: 'Erro interno do servidor. ' + error });
        }
    },

    // Função de criação
    async create(req, res) {
        try {
            const { name, academic_year } = req.body;

            const newSubject = await Subject.create({
                name,
                academic_year
            });

            return res.status(201).json(newSubject);
        } catch (error) {
            console.error('Erro ao criar matéria:', error);
            return res.status(400).json({ message: 'Erro interno do servidor. ' + error });
        }
    }
};

module.exports = SubjectController;
