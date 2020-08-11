var config = require("../config/sendgrid");
var sendgrid = require("@sendgrid/mail");

sendgrid.setApiKey(config.sendgridkey);

module.exports = {
  sendWelcomeMsg(to) {
    const msg = {
      to,
      from: "joseaugustomegres@webstock.com.br",
      subject: "Seja bem vindo ao webstock!",
      text: "Não perca 1 minuto sequer, inicie já os testes da aplicação!",
      templateId: "d-b701d369521745f68f154d1d05619ee8",
    };

    sendgrid.send(msg);
  },
  sendRecoverEmail(to, token) {
    const msg = {
      to,
      from: "naoresponda@webstock.com.br",
      subject: "Link para recuperação de senha",
      text: `Para recuperar sua senha, clique no link https://webstock.com.br/nova_senha?token=${token}`,
      templateId: "d-b701d369521745f68f154d1d05619ee8",
    };

    sendgrid.send(msg);
  },
};
