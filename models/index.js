'use strict';
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
/* if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
} */
sequelize = new Sequelize("b1gtnii09lrzixp4r3g2", "u1x2uwfspy0trykt", "9k4uZAmwq0LcYKe3EfXY", config);

/* const customizeConfig = {
  "dialect": "mysql",
  "logging": false,
  "query":{
    "raw": true
  },
  "dialectOptions": {
    "ssl":{
      "required": true,
      "rejectUnauthorized":false
    }
  }
}
sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, customizeConfig); */

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
