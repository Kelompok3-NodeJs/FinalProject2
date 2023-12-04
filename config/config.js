require('dotenv').config()
module.exports ={
    "development": {
      "username": "postgres",
      "password": "admin",
      "database": "mygram",
      "host": "127.0.0.1",
      "dialect": "postgres"
    },
    "test": {
      "username": process.env.PGUSER_TEST,
      "password": process.env.PGPASSWORD_TEST,
      "database": process.env.PGDATABASE_TEST,
      "host": process.env.PGHOST_TEST,
      "dialect": process.env.PGDIALECT_TEST
    },
    "production": {
      "username": process.env.PGUSER,
      "password": process.env.PGPASSWORD,
      "database": process.env.PGDATABASE,
      "host": process.env.PGHOST,
      "port": process.env.PGPORT,
      "dialect": "postgres"
    }
  }
  