const express = require("express");
const routes = require("./routes");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

require("./database/index");

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`[API] - Servidor online! Porta: ${PORT}`);
});

module.exports = app;
