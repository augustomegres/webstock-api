const express = require("express");
const routes = require("./routes");
const cors = require("cors");
const app = express();

var whitelist = ['https://app.webstock.com.br']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(routes);

require("./database/index");

app.listen(process.env.PORT || 3333, () => {
  console.log("Servidor online!");
});
