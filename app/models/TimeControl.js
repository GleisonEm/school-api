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
        class_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'classes',
                key: 'id'
            }
        },
        subject_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'subjects',
                key: 'id'
            }
        },
        entry_datetime: {
            type: DataTypes.DATE,
            allowNull: false
        },
        exit_datetime: {
            type: DataTypes.DATE,
            allowNull: true
        },
        total_hours_worked: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true
        }
    },
        {
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            tableName: 'time_control'
        });

    return TimeControl;
};
