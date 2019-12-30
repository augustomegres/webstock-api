const express = require("express");
const routes = require("./routes");
const cors = require("cors");
const app = express();

require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(routes);

require("./database/index");

app.listen(process.env.PORT || 3333, () => {
  console.log("Servidor online!");
});
