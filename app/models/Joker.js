const { QueryTypes } = require("sequelize");
const db = require("../models");

const Joker = {
    query: (sql) => {
        return db.sequelize.query(sql, { type: QueryTypes.SELECT })
        .then(results => {
            return results;

        })
        .catch(error => {
            console.error('Error: ', error);
            return null;
        });
    }
}

module.exports = Joker