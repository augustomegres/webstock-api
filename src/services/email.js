var config = require("../config/sendgrid");
var sendgrid = require("@sendgrid/mail");

sendgrid.setApiKey(config.sendgridkey);

module.exports = {
  sendWelcomeMsg(to) {
    const msg = {
      to,
      from: "joseaugustomegres@webstock.com.br",
      subject: "Seja bem vindo ao webstock!",
      text: "Não perca 1 minuto sequer, inicie já os testes da aplicação!"
    };

    sendgrid.send(msg);
  }
};
