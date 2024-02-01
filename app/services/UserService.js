// userService.js
const bcrypt = require('bcryptjs');
const db = require("../models");
const User = db.users;// Ajuste o caminho conforme sua estrutura de projeto

const UserService = {
    async createUser(userData, generatePassword = false, transaction = null) {
        try {
            const email = userData.email ? userData.email : '';
            const findUser = await User.findOne({ where: { email } });

            if (findUser) {
                throw new Error('Usuário já existe: ' + email);
            }

            const hashedPassword = await bcrypt.hash(!generatePassword ? userData.password : '123456', 10);
            const newUser = {
                ...userData,
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
