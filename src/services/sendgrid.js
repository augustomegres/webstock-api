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
  },
  sendRecoverEmail(to, token) {
    const msg = {
      to,
      from: "naoresponda@webstock.com.br",
      subject: "Link para recuperação de senha",
      text: `Para recuperar sua senha, clique no link http://localhost:3000/recuperar-senha?token=${token}`
    };

    sendgrid.send(msg);
  }
};
