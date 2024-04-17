const { Sequelize } = require("sequelize");

// Option 3: Passing parameters separately (other dialects)
/* const sequelize = new Sequelize('nhatit', 'root', null, {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
});
 */
const sequelize = new Sequelize(
  "b1gtnii09lrzixp4r3g2",
  "u1x2uwfspy0trykt",
  "9k4uZAmwq0LcYKe3EfXY",
  {
    host: "b1gtnii09lrzixp4r3g2-mysql.services.clever-cloud.com",
    dialect: "mysql",
    logging: false,
  }
);

let connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

module.exports = connectDB;
