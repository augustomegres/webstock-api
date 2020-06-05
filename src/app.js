const express = require("express");
const routes = require("./routes");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

require("./database/index");

app.listen(process.env.PORT || 3333);
