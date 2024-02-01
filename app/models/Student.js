// models/student.js
module.exports = (sequelize, DataTypes) => {
    const Student = sequelize.define('Student', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        birth_date: {
            type: DataTypes.DATE
        },
        parent_details: {
            type: DataTypes.TEXT
        }
    });

    return Student;
};
