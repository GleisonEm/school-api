// Importe os modelos e quaisquer outros módulos necessários
const db = require("../models");
const Joker = require("../models/Joker");
const User = db.users;
const Student = db.students;
const AttendanceRecords = db.attendanceRecords;
const UserService = require("../services/UserService");
const sequelize = db.sequelize

const StudentController = {
    async listByClass(req, res) {
        try {
            const classId = req.params.class_id;
            const studentsSql = `
                SELECT s.*, u.name
                FROM students AS s
                JOIN users AS u ON s.user_id = u.id
                WHERE s.class_id = ${classId}
            `;
            const students = await Joker.query(studentsSql);
            return res.json(students);

        } catch (error) {
            console.error('Erro ao listar alunos:', error);
            return res.status(500).json({ message: 'Erro interno do servidor. ' + error });
        }
    },
    async get(req, res) {
        try {
            const studentsSql = `
                SELECT s.*, u.name, c.class_name as class_name, sf.name as shift_name
                FROM students AS s
                JOIN users AS u ON s.user_id = u.id
                JOIN classes AS c ON s.class_id = c.id
                JOIN shifts AS sf ON c.shift_id = sf.id;
            `;
            const students = await Joker.query(studentsSql);
            return res.json(students);

        } catch (error) {
            console.error('Erro ao listar alunos:', error);
            return res.status(500).json({ message: 'Erro interno do servidor. ' + error });
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
                return res.status(400).json({ message: 'Erro ao deletar aluno.' });
            }



            const student = await Student.findOne({ where: { user_id: userId } }, { transaction });

            await AttendanceRecords.destroy({
                where: {
                    student_id: student.id // Condição para filtrar os estudantes que deseja excluir
                }
            });

            await student.destroy({ transaction }); // Correção aqui

            await findUser.destroy({ transaction }); // Correção aqui

            // Criar o professor com a mesma transação


            await transaction.commit(); // Commit da transação se tudo correr bem
            return res.status(201).json(student);
        } catch (error) {
            console.log(error);
            await transaction.rollback(); // Rollback se ocorrer um erro
            console.error('Erro ao deletar aluno:', error);
            return res.status(400).json({ message: 'Erro interno do servidor. ' + error });
        }
    },
    async create(req, res) {
        const transaction = await sequelize.transaction(); // Iniciar uma nova transação

        try {
            // Dados do professor extraídos do corpo da requisição
            const { birth_date, class_id, school_grade } = req.body;

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
                school_grade
            }, { transaction });

            await transaction.commit(); // Commit da transação se tudo correr bem
            return res.status(201).json(student);
        } catch (error) {
            await transaction.rollback(); // Rollback se ocorrer um erro
            console.error('Erro ao criar aluno:', error);
            return res.status(400).json({ message: 'Erro interno do servidor. ' + error });
        }
    },
    async updateClass(req, res) {
        const transaction = await sequelize.transaction();

        try {
            const { studentId } = req.params; // Id do estudante a ser atualizado
            const { class_id } = req.body; // Novo ID da classe

            // Encontre o estudante a ser atualizado
            const student = await Student.findByPk(studentId);
            if (!student) {
                return res.status(404).json({ message: 'Estudante não encontrado.' });
            }

            // Atualize a classe do estudante
            await student.update({ class_id }, { transaction });

            await transaction.commit();
            return res.status(200).json({ message: 'Classe do estudante atualizada com sucesso.' });
        } catch (error) {
            await transaction.rollback();
            console.error('Erro ao atualizar classe do estudante:', error);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }
};

module.exports = StudentController;

