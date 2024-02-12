// models/class.js
module.exports = (sequelize, DataTypes) => {
    const Shift = sequelize.define('Shift', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        tableName: 'shifts'
    });

    return Shift;
};
