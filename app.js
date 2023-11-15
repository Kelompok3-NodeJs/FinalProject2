const express = require('express');
const dotenv = require('dotenv');
const app = express();
const router = require('./routes/index');
const db = require('./config/db.config');

db.authenticate()
.then(() => {
    console.log('Database connected');
})
.catch(err => {
    console.log(err);
})

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})