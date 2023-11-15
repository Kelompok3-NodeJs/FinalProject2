
const { Sequelize } = require('sequelize');
const config = require('./config/config');

const sequelize = new Sequelize(config[process.env.NODE_ENV]);

// Test the connection
sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;
