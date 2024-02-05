// models/class.js
module.exports = (sequelize, DataTypes) => {
    const Class = sequelize.define('Class', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        class_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        academic_year: {
            type: DataTypes.INTEGER
        },
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        tableName: 'classes'
    });

    return Class;
};
