// userService.js
const bcrypt = require('bcryptjs');
const db = require("../models");
const { gerarNumeroAleatorio } = require('../utils/Helper');
const User = db.users;// Ajuste o caminho conforme sua estrutura de projeto

const UserService = {
    async createUser(userData, generatePassword = false, transaction = null) {
        try {

            const username = userData.username ? userData.username : userData.name.trim().toLowerCase() + gerarNumeroAleatorio();
            const findUser = await User.findOne({ where: { username } });

            if (findUser) {
                throw new Error('Usuário com esse username já existe: ' + username);
            }

            if (userData.email) {
                const findUserEmail = await User.findOne({ where: { email: userData.email } });

                if (findUserEmail) {
                    throw new Error('Usuário com esse email já existe: ' + userData.email);
                }
            }

            if (userData.cpf) {
                const findUserEmail = await User.findOne({ where: { cpf: userData.cpf } });

                if (findUserEmail) {
                    throw new Error('Usuário com esse cpf já existe: ' + userData.cpf);
                }
            }

            if (userData.rg) {
                const findUserEmail = await User.findOne({ where: { rg: userData.rg } });

                if (findUserEmail) {
                    throw new Error('Usuário com esse rg já existe: ' + userData.rg);
                }
            }

            const hashedPassword = await bcrypt.hash(!generatePassword ? userData.password : '123456', 10);
            const newUser = {
                ...userData,
                username: username,
                password: hashedPassword
            };

            if (transaction) {
                const user = await User.create(newUser, { transaction: transaction });
                return { ...user, password: undefined };
            }

            const user = await User.create(newUser);
            return { ...user, password: undefined }; // Remover a senha antes de retornar
        } catch (error) {
            throw error;
        }
    }
};

module.exports = UserService;
