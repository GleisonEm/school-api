// models/time_control.js
module.exports = (sequelize, DataTypes) => {
    const TimeControl = sequelize.define('TimeControl', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        teacher_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'teachers',
                key: 'id'
            }
        },
        entry_datetime: {
            type: DataTypes.DATE,
            allowNull: false
        },
        exit_datetime: {
            type: DataTypes.DATE
        },
        total_hours_worked: {
            type: DataTypes.DECIMAL(5, 2)
        }
    });

    return TimeControl;
};
