// Importando o modelo User
const db = require("../models");
const User = db.users;
const Op = db.Sequelize.Op;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserService = require("../services/UserService");

const usersController = {
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Encontrar o usuário pelo e-mail
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(401).json({ message: 'Authentication failed. User not found.' });
            }

            // Verificar se a senha está correta
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Authentication failed. Wrong password.' });
            }

            // Gerar um token JWT
            const token = jwt.sign({ id: user.id, type: user.type }, process.env.JWT_TOKEN, { expiresIn: '8h' });

            res.status(200).json({ message: 'Authentication successful', token });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    createUser: async (req, res) => {
        try {
            const user = await UserService.createUser(req.body);
            return res.status(201).json(user);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    },

    // Obter um usuário pelo ID
    getUserById: async (req, res) => {
        try {
            const user = await User.findByPk(req.params.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            return res.status(200).json(user);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    },

    // Atualizar um usuário pelo ID
    updateUser: async (req, res) => {
        try {
            const [updated] = await User.update(req.body, {
                where: { id: req.params.id }
            });
            if (updated) {
                const updatedUser = await User.findByPk(req.params.id);
                return res.status(200).json(updatedUser);
            }
            throw new Error('User not found');
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    },

    // Deletar um usuário
    deleteUser: async (req, res) => {
        try {
            const deleted = await User.destroy({
                where: { id: req.params.id }
            });
            if (deleted) {
                return res.status(200).json({ message: 'User deleted' });
            }
            throw new Error('User not found');
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
};

module.exports = usersController;
