// models/student.js
module.exports = (sequelize, DataTypes) => {
    const Student = sequelize.define('Student', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        birth_date: {
            type: DataTypes.DATE
        },
        parent_details: {
            type: DataTypes.TEXT
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users', // nome da tabela referenciada
                key: 'id'      // campo da tabela referenciada
            }
        },
        class_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'classes', // nome da tabela referenciada
                key: 'id'      // campo da tabela referenciada
            }
        },
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        tableName: 'students'
    });

    return Student;
};
