module.exports = (sequelize, DataTypes) => {
  const Scale = sequelize.define(
    'Scale',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
        unique: true
      },
      name: DataTypes.STRING,
      tonic: DataTypes.INTEGER,
      notes: DataTypes.ARRAY(DataTypes.INTEGER),
      modeNumber: DataTypes.INTEGER,
      modeOf: DataTypes.INTEGER
    },
    {
      timestamps: false
    }
  )

  Scale.associate = models => {
    models.Scale.belongsTo(models.ScaleDefinition, {
      foreignKey: 'scaleOf'
    })
  }

  return Scale
}
