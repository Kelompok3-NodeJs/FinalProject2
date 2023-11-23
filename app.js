require("dotenv").config()
process.env.NODE_ENV = 'development';
process.env.DATABASE_URL = 'postgres://postgres:G2AEAf-gbD66Eg415dDB2552f5aEC-Bg@monorail.proxy.rlwy.net:54208/railway';

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const router = require('./routes/index');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(router);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    });

