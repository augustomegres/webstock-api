const express = require("express");
const routes = require("./routes");
const cors = require("cors");
require("dotenv").config();

require("./database/index");

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

app.listen(process.env.PORT || 3333, () => {
  console.log("Servidor online!");
});
