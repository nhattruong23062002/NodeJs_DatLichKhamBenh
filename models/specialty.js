'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Specialty extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Specialty.hasMany(models.Doctor_Infor,{foreignKey:'specialtyId', as:'specialtyData'})

    }
  }
  Specialty.init({ 
    name: DataTypes.STRING,
    image: DataTypes.STRING,
    descriptionMarkdown: DataTypes.TEXT('long'),
    descriptionHTML: DataTypes.TEXT('long'),
  }, {
    sequelize,
    modelName: 'Specialty',
  });
  return Specialty;
};