// Importe os modelos e quaisquer outros módulos necessários
const db = require("../models");
const Teacher = db.teachers;
const User = db.users;
const UserService = require("../services/UserService");
const sequelize = db.sequelize
const TeacherController = {
    async create(req, res) {
        const transaction = await sequelize.transaction(); // Iniciar uma nova transação

        try {
            // Dados do professor extraídos do corpo da requisição
            const { qualifications } = req.body;

            // Criar usuário com transação
            const createUser = await UserService.createUser({ ...req.body, type: 'professor' }, true, transaction);
            if (!createUser) {
                await transaction.rollback(); // Rollback se não criar o usuário
                return res.status(400).json({ message: 'Erro ao criar usuário.' });
            }

            // Criar o professor com a mesma transação
            const teacher = await Teacher.create({
                qualifications,
                admission_date: null,
                user_id: createUser.id
            }, { transaction });

            await transaction.commit(); // Commit da transação se tudo correr bem
            return res.status(201).json(teacher);
        } catch (error) {
            await transaction.rollback(); // Rollback se ocorrer um erro
            console.error('Erro ao criar professor:', error);
            return res.status(400).json({ message: 'Erro interno do servidor. ' + error });
        }
    }
};

module.exports = TeacherController;

