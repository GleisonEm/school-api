module.exports = (sequelize, DataTypes) => {
    const Teacher = sequelize.define('Teacher', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        qualifications: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        code: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        admission_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users', // nome da tabela referenciada
                key: 'id'      // campo da tabela referenciada
            }
        }
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        tableName: 'teachers'
    });

    return Teacher;
};
