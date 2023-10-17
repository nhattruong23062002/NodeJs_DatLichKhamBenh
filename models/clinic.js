'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Clinic extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Clinic.hasMany(models.Doctor_Infor,{foreignKey:'clinicId', as:'clinicData'})
    }
  }
  Clinic.init({ 
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    descriptionMarkdown: DataTypes.TEXT('long'),
    descriptionHTML: DataTypes.TEXT('long'),
    image: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Clinic',
  });
  return Clinic;
};