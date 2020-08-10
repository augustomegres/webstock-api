const pagarme = require("pagarme");
const User = require("../models/User");

const { cpf: cpfEval } = require("essential-validation");

module.exports = {
  async index(req, res) {
    const { user } = req;

    if (!user.subscription_id) {
      return;
    }

    pagarme.client
      .connect({ api_key: process.env.PAGARME_KEY })
      .then((client) =>
        client.subscriptions.findTransactions({
          id: user.subscription_id,
        })
      )
      .then((transaction) => res.json(transaction));
  },
  async show(req, res) {
    const { user } = req;

    if (!user.subscription_id) {
      return res
        .status(400)
        .json({ error: "O usuário ainda não tem um plano ativo!" });
    }

    pagarme.client
      .connect({ api_key: process.env.PAGARME_KEY })
      .then((client) => client.subscriptions.find({ id: user.subscription_id }))
      .then((subscription) => res.json(subscription));
  },
  async store(req, res) {
    const { user } = req;
    const {
      card_number,
      card_holder_name,
      card_expiration_date,
      card_cvv,
      payment_method,
      plan_id,

      name,
      cpf,
      date_of_birth,
    } = req.body;

    //Atualizando dados do cliente
    if (name ? name.length < 5 : false || cpf ? cpf.length < 14 : false) {
      return { error: "Houve um erro ao atualizar os dados do seu usuário!" };
    }

    if (cpf) {
      let validate = cpfEval.cpfWithPunctuation(cpf);
      if (validate.error) return res.status(400).json(validate.error);
    }

    try {
      await User.update(
        { name, cpf, date_of_birth },
        { where: { id: user.id } }
      );
    } catch (e) {
      return res
        .status(400)
        .json({ error: "Houve um erro ao atualizar os dados do seu usuário!" });
    }

    //Validando se o cliente tem uma assinatura ativa
    if (user.subscription_id) {
      let subscription = await pagarme.client
        .connect({ api_key: process.env.PAGARME_KEY })
        .then((client) =>
          client.subscriptions.find({
            id: user.subscription_id,
          })
        )
        .then((subscription, reject) => {
          if (subscription.status != "canceled") {
            return { error: "Você já possui uma assinatura ativa!" };
          }
        });

      if (subscription) {
        if (subscription.error) {
          return res.status(400).json(subscription);
        }
      }
    }

    //SEPARANDO DDD DO CELULAR
    let ddd;
    let number;

    if (user.phone) {
      phoneNumber = user.phone;
      phoneNumber = phoneNumber
        .replace("(", "")
        .replace(")", "")
        .replace(" ", "")
        .replace("-", "");
      ddd = phoneNumber.substring(0, 2);
      number = phoneNumber.substring(2);
    }

    let customer = {
      external_id: user.id,
      name: name,
      email: user.email,
      document_number: cpf,
      birthday: date_of_birth,
      phone: user.phone
        ? {
            ddd: ddd,
            number: number,
          }
        : undefined,
    };

    if (user.customer_id) customer.id = Number(user.customer_id);

    pagarme.client
      .connect({ api_key: process.env.PAGARME_KEY })
      .then((client) =>
        client.subscriptions.create({
          plan_id: plan_id,
          card_number,
          card_holder_name,
          card_expiration_date,
          card_cvv,
          payment_method,

          customer: customer,
        })
      )
      .then(async (subscription) => {
        await User.update(
          {
            subscription_id: subscription.id,
            customer_id: subscription.customer.id, //2950363
          },
          { where: { id: user.id } }
        );

        return res.json(subscription);
      })
      .catch((error) => res.status(400).json(error));
  },
  async update(req, res) {
    const { user } = req;
    const { plan_id } = req.body;

    pagarme.client
      .connect({ api_key: process.env.PAGARME_KEY })
      .then((client) =>
        client.subscriptions.update({
          id: user.subscription_id,
          plan_id: plan_id,
        })
      )
      .then((subscription) => res.status(200).json(subscription))
      .catch((error) => res.status(400).json(error));
  },
};
