require("dotenv").config()
const express = require('express');
const app = express();
const port = process.env.PORT;
const router = require('./routes/index');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(router);

// app.listen(port, "127.0.0.1", function () {
//     console.log(`This App listening on port ${port}`);
//   });

module.exports = app;