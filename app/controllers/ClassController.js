const db = require("../models");
const Class = db.classes;

const ClassController = {
    // Função de listagem
    async list(req, res) {
        try {
            const classes = await Class.findAll();
            return res.status(200).json(classes);
        } catch (error) {
            console.error('Erro ao listar classes:', error);
            return res.status(500).json({ message: 'Erro interno do servidor. ' + error });
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

    // Função de criação
    async create(req, res) {
        try {
            const { class_name, academic_year } = req.body;

            const newClass = await Class.create({
                class_name,
                academic_year
            });
            return res.status(201).json(newClass);
        } catch (error) {
            console.error('Erro ao criar classe:', error);
            return res.status(400).json({ message: 'Erro interno do servidor. ' + error });
        }
    }
};

module.exports = ClassController;
