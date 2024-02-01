// models/attendance_record.js
module.exports = (sequelize, DataTypes) => {
    const AttendanceRecord = sequelize.define('AttendanceRecord', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        class_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'classes',
                key: 'id'
            }
        },
        student_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'students',
                key: 'id'
            }
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        attendance_status: {
            type: DataTypes.ENUM,
            values: ['present', 'absent', 'justified'],
            allowNull: false
        }
    });

    return AttendanceRecord;
};
