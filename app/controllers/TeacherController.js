// Importe os modelos e quaisquer outros módulos necessários
const db = require("../models");
const Joker = require("../models/Joker");
const Teacher = db.teachers;
const User = db.users;
const UserService = require("../services/UserService");
const { find } = require("./ClassController");
const sequelize = db.sequelize

const TeacherController = {
    async get(req, res) {
        try {
            const studentsSql = `
                SELECT t.*, u.name
                FROM teachers AS t
                JOIN users AS u ON t.user_id = u.id;
            `;
            const students = await Joker.query(studentsSql);
            return res.json(students);

        } catch (error) {
            console.error('Erro ao listar professores:', error);
            return res.status(500).json({ message: 'Erro interno do servidor. ' + error });
        }
    },
    async create(req, res) {
        const transaction = await sequelize.transaction(); // Iniciar uma nova transação

        try {
            // Dados do professor extraídos do corpo da requisição
            const { qualifications, code } = req.body;

            // Criar usuário com transação
            const createUser = await UserService.createUser({ ...req.body, type: 'professor' }, false, transaction);
            if (!createUser) {
                await transaction.rollback(); // Rollback se não criar o usuário
                return res.status(400).json({ message: 'Erro ao criar usuário.' });
            }

            // Criar o professor com a mesma transação
            const teacher = await Teacher.create({
                qualifications,
                admission_date: null,
                user_id: createUser.dataValues.id,
                code
            }, { transaction });

            await transaction.commit(); // Commit da transação se tudo correr bem
            return res.status(201).json(teacher);
        } catch (error) {
            await transaction.rollback(); // Rollback se ocorrer um erro
            console.error('Erro ao criar professor:', error);
            return res.status(400).json({ message: 'Erro interno do servidor. ' + error });
        }
    },
    async delete(req, res) {
        const transaction = await sequelize.transaction(); // Iniciar uma nova transação

        try {
            // Dados do professor extraídos do corpo da requisição
            const userId = req.params.user_id;

            // Criar usuário com transação
            const findUser = await User.findByPk(userId);
            console.log(findUser)
            if (!findUser) {
                await transaction.rollback(); // Rollback se não criar o usuário
                return res.status(400).json({ message: 'Erro ao deletar professor.' });
            }

            await findUser.destroy({ transaction }); // Correção aqui

            // Criar o professor com a mesma transação
            const teacher = await Teacher.findOne({ where: { user_id: userId } }, { transaction });

            await teacher.destroy({ transaction }); // Correção aqui

            await transaction.commit(); // Commit da transação se tudo correr bem
            return res.status(201).json(teacher);
        } catch (error) {
            console.log(error);
            await transaction.rollback(); // Rollback se ocorrer um erro
            console.error('Erro ao deletar professor:', error);
            return res.status(400).json({ message: 'Erro interno do servidor. ' + error });
        }
    }

};

module.exports = TeacherController;

