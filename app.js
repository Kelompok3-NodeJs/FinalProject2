const express = require('express');
const app = express();

const router = require('./routes/index');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(router);
const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", function () {
    console.log(`This App listening on port ${port}`);
  });