const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
  underscored: true
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.photos = require("./Photo.js")(sequelize, Sequelize);
db.users = require("./User.js")(sequelize, Sequelize);
db.teachers = require("./Teacher.js")(sequelize, Sequelize);
db.students = require("./Student.js")(sequelize, Sequelize);
db.classes = require("./Class.js")(sequelize, Sequelize);
db.subjects = require("./Subject.js")(sequelize, Sequelize);
db.timeControl = require("./TimeControl.js")(sequelize, Sequelize);

module.exports = db;
