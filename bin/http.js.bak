require("dotenv").config()
process.env.NODE_ENV = 'development';

process.env.DATABASE_URL = 'postgres://postgres:G2AEAf-gbD66Eg415dDB2552f5aEC-Bg@monorail.proxy.rlwy.net:54208/railway';

const app = require("../app")
const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log("App running on port:  ", PORT);
})