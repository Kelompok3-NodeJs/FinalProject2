const Sequelize = require('sequelize');
const dotenv = require('dotenv');
const { sequelize } = require('../models');

const {
    PGDATABASE,
    PGUSER,
    PGPASSWORD,
    DATABASE_URL,
    PGPORT
}= process.env

const db= new sequelize(DATABASE_URL,{
    define:{
        timestamps:false
    }
})

module.exports = db;