const validateAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log(typeof authHeader, typeof process.env.TOKEN)
    if (!authHeader) {
        return res.status(401).send('Acesso negado. Nenhum token fornecido.');
    }

    // Substitua esta parte pela sua lógica de verificação de token
    if (authHeader !== process.env.TOKEN) {
        return res.status(403).send('Acesso negado. Token inválido.');
    }

    // Token válido, continue com a próxima função middleware
    next();
};

module.exports = validateAuth;