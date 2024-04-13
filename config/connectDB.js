const { Sequelize } = require('sequelize');

// Option 3: Passing parameters separately (other dialects)
const sequelize = new Sequelize('nhatit', 'root', null, {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
});

/* const sequelize = new Sequelize('bsdjdwj3bdlkeblpo4of', 'ucc9rwxej6ig2nlu', 'chyeDmw2xTAuytxS766E', {
  host: 'bsdjdwj3bdlkeblpo4of-mysql.services.clever-cloud.com',
  dialect: 'mysql',
  logging: false,
});
 */


let connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
      } catch (error) {
        console.error('Unable to connect to the database:', error);
      }
}


module.exports = connectDB;