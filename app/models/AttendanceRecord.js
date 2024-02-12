// models/attendance_record.js
module.exports = (sequelize, DataTypes) => {
    const AttendanceRecord = sequelize.define('AttendanceRecord', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        time_control_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'time_control',
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
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        tableName: 'attendance_records'
    });

    return AttendanceRecord;
};
