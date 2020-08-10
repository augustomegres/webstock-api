const express = require("express");
const routes = require("./routes");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv")
dotenv.config()

app.use(cors());
app.use(express.json());
app.use(routes);

require("./database/index");

console.log(process.env)

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`[API] - Servidor online! Porta: ${PORT}`);
});

module.exports = app;
