require('dotenv').config();

const config = {
  "development": {
    "username": process.env.PGUSER,
    "password": process.env.PGPASSWORD,
    "database": process.env.PGDATABASE,
    "host": process.env.PGHOST,
    "port": process.env.PGPORT,
    "dialect": process.env.DB_DIALECT_DEV,
    "pool":{
        "max": 5,
        "min": 0,
        "idle": 10000,
        "acquire":30000
    },
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "postgres"
  }
}

module.exports = config