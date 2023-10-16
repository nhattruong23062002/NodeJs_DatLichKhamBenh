'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require('bcrypt');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.belongsTo(models.Allcode,{foreignKey:'positionId',targetKey:'keyMap', as:'positionData'})
      User.belongsTo(models.Allcode,{foreignKey:'gender',targetKey:'keyMap', as:'genderData'})
      User.hasOne(models.Markdown,{foreignKey:'doctorId'})
      User.hasOne(models.Doctor_Infor,{foreignKey:'doctorId'})
      User.hasMany(models.Booking,{foreignKey:'patientId', as:'patientData'})

    }  
    
  }
  User.init({ 
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    address: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    gender: DataTypes.STRING,
    positionId: DataTypes.STRING,
    image: DataTypes.STRING,
    password: DataTypes.STRING,
    roleId: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'User',
  });
  User.prototype.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  return User;
  
};