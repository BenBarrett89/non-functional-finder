module.exports = (sequelize, DataTypes) => {
  const ScaleDefinition = sequelize.define(
    'ScaleDefinition',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
        unique: true
      },
      name: DataTypes.STRING,
      intervals: DataTypes.ARRAY(DataTypes.INTEGER),
      distances: DataTypes.ARRAY(DataTypes.INTEGER),
      modes: DataTypes.ARRAY(DataTypes.STRING)
    },
    {
      timestamps: false
    }
  )

  return ScaleDefinition
}
