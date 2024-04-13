"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Booking.belongsTo(models.User,{foreignKey:'patientId',targetKey:'id', as:'patientData'})
      Booking.belongsTo(models.User,{foreignKey:'doctorId',targetKey:'id', as:'doctorData'})
      Booking.belongsTo(models.Doctor_Infor,{foreignKey:'doctorId',targetKey:'doctorId', as:'doctorDataInfo'})
      Booking.belongsTo(models.Allcode,{foreignKey:'timeType',targetKey:'keyMap', as:'timeTypeDataPatient'})
      Booking.belongsTo(models.Allcode,{foreignKey:'statusId',targetKey:'keyMap', as:'statusDataPatient'})
      Booking.belongsTo(models.Schedule,{foreignKey:'scheduleId',targetKey:'id', as:'scheduleData'})



    }
  }
  Booking.init(
    {
      statusId: DataTypes.STRING,
      doctorId: DataTypes.INTEGER,
      patientId: DataTypes.INTEGER,
      date: DataTypes.DATE,
      description: DataTypes.STRING,
      token: DataTypes.STRING,
      timeType: DataTypes.STRING,
      scheduleId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Booking",
    }
  );
  return Booking;
};
