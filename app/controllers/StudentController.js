// Importe os modelos e quaisquer outros módulos necessários
const db = require("../models");
const Student = db.students;
const UserService = require("../services/UserService");
const sequelize = db.sequelize

const StudentController = {
    async create(req, res) {
        const transaction = await sequelize.transaction(); // Iniciar uma nova transação

        try {
            // Dados do professor extraídos do corpo da requisição
            const { birth_date, class_id } = req.body;

            // Criar usuário com transação
            const createUser = await UserService.createUser({ ...req.body, type: 'aluno' }, true, transaction);
            if (!createUser) {
                await transaction.rollback(); // Rollback se não criar o usuário
                return res.status(400).json({ message: 'Erro ao criar usuário.' });
            }

            // Criar o professor com a mesma transação
            const student = await Student.create({
                birth_date,
                parent_details: null,
                user_id: createUser.dataValues.id,
                class_id: class_id,
            }, { transaction });

            await transaction.commit(); // Commit da transação se tudo correr bem
            return res.status(201).json(student);
        } catch (error) {
            await transaction.rollback(); // Rollback se ocorrer um erro
            console.error('Erro ao criar aluno:', error);
            return res.status(400).json({ message: 'Erro interno do servidor. ' + error });
        }
    }
};

module.exports = StudentController;

