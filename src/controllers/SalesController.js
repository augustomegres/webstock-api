const { Op } = require("sequelize");

const User = require("../models/User");
const Product = require("../models/Product");
const Sales = require("../models/Sales");
const ProductSold = require("../models/ProductSold");

module.exports = {
  async index(req, res) {
    const { userId } = req;
    const { min, max, min_date_time, max_date_time } = req.query;

    const loggedUser = await User.findByPk(userId, {
      include: [{ association: "company" }]
    });

    try {
      var sales = await Sales.findAll({
        include: [{ association: "productSold" }],
        where: {
          companyId: loggedUser.company.id,
          total: {
            [Op.and]: {
              [Op.gte]: min ? min : 0,
              [Op.lte]: max ? max : 99999999999999
            }
          },
          date: {
            [Op.and]: {
              [Op.gte]: min_date_time
                ? new Date(`${min_date_time}`)
                : new Date("1980-01-01 00:00:00.000"),
              [Op.lte]: max_date_time
                ? new Date(`${max_date_time}`)
                : new Date("2100-01-01 23:59:59.999")
            }
          }
        }
      });
    } catch (err) {
      return res.status(400).json(err);
    }

    return res.json(sales);
  },
  async store(req, res) {
    const { date, seller, client, freight, products } = req.body;
    const { userId } = req;

    const loggedUser = await User.findByPk(userId, {
      include: [{ association: "company" }]
    });

    //SE NÃO HOUVER O VALOR DO FRETE, ELE SERA IGUAL A 0
    let total = freight ? freight : 0;

    let productIdList = [];

    products.map(product => {
      //Calcula o valor total dos produtos
      total = total + product.quantity * product.unityPrice;

      //Insere todos os ids dentro de um array
      productIdList.push(product.productId);
    });

    // ESTA LINHA REMOVE OS IDS DUPLICADOS DENTRO DO ARRAY
    productIdList = [...new Set(productIdList)];

    /**
     * Nesta sequencia faremos a verificação para ver se há produtos que não
     * sejam da empresa do cliente que está tentando cadastrar.
     *
     * Isto evitará com que alguma pessoa má intencionada tente incluir registros
     * em outras empresas sem ser o proprietário da mesma
     *
     * 🤔 A lógica pertencente a esta linha de código é a seguinte:
     *
     *🔸A variavel "productIdList" é um array contendo os ids dos produtos
     * sem duplicidade.
     *
     *🔸O operador "Op.ne" verifica se o id da empresa do usuario logado não é igual a um dos
     * itens que estão no array da variável "productIdList", se um deles não for
     * igual, quer dizer que o usuario logado está tentando cadastrar um produto
     * que não pertence a empresa dele.
     *
     *🔸Caso o usuario logado esteja tentando cadastrar uma venda de um produto que
     * não pertença a empresa dele, este será bloqueado na condição if, que verifica
     * se há uma ou mais irregularidades e bloqueia o usuario
     */
    const notUserCompanyProduct = await Product.findAll({
      where: {
        id: productIdList,
        companyId: { [Op.ne]: loggedUser.company.id }
      }
    });

    if (notUserCompanyProduct.length) {
      return res.status(400).json({
        error:
          "Você está tentando cadastrar um produto que não pertence a sua empresa!"
      });
    }

    /**
     * Aqui iremos iniciar a verificação, para que o cliente não tente inserir
     * registros de produtos que não existem
     */
    let productsExists = await Product.findAll({
      where: {
        id: productIdList
      }
    });

    if (productsExists.length !== productIdList.length) {
      return res.status(400).json({
        error: "Um ou mais dos produtos que você tentou cadastrar não existem"
      });
    }

    /**
     * Aqui iremos criar um objeto para o auxilio na remoção do estoque de produtos.
     *
     * Caso o mesmo produto seja enviado 2 vezes com preços diferentes por exemplo,
     * iremos fazer a soma das quantidades enviadas, sendo assim o cliente pode enviar
     * o mesmo produto varias vezes, porém com preços diferentes.
     */
    const stockRemove = {};
    products.map(product => {
      if (!stockRemove[product.productId]) {
        stockRemove[product.productId] = 0;
      }
      stockRemove[product.productId] =
        stockRemove[product.productId] + product.quantity;
    });

    var err = [];
    productsExists.map((product, index) => {
      if (stockRemove[product.id] > product.quantity) {
        err.push({
          error: `Você não tem estoque o suficiente do produto "${product.name}"`,
          requested: stockRemove[product.id],
          inStock: product.quantity
        });
      }
    });

    if (err.length > 0) {
      return res.status(400).json(err);
    }

    /** Criação da venda no banco de dados */
    try {
      var Sale = await Sales.create({
        companyId: loggedUser.company.id,
        date,
        seller,
        client,
        freight,
        total
      });
    } catch (e) {
      return res.status(400).json({
        error: "Houve um erro ao tentar inserir o registro!",
        detail: e
      });
    }

    /**
     * Utilizamos a coluna sellId na tabela productSold como uma referencia a venda
     * em que aquele produto foi incluido
     */
    products.map(product => {
      product.sellId = Sale.id;
      product.unityPrice = product.unityPrice.toFixed(2);
    });

    try {
      await ProductSold.bulkCreate(products);
    } catch (e) {
      await Sales.destroy({ where: { id: Sale.id } });
      return res.status(400).json({
        error: "Houve um erro ao tentar inserir o registro!",
        detail: e
      });
    }

    /**
     * Este parse foi necessário pois estava havendo um bug na aplicação, informando
     * que o valor não era um objeto, ao utilizar o parse caiamos em um novo erro,
     * a solução para o problema foi transforma-lo em string e logo após transformalo
     * em um objeto json novamente
     */

    /**
     * Aqui é criado um array com o novo valor de estoque de todos os produtos
     * que foram comprados
     */
    for (var id in stockRemove) {
      productsExists.map((product, index) => {
        if (product.id == id) {
          productsExists[index].quantity -= stockRemove[id];
        }
      });
    }

    /**
     * Fazemos a atualização do produto utilizando o metodo create com o update em
     * caso de duplicidade, porém, os produtos sempre estarão em duplicidade, resultando
     * em uma atualização em 100% das requisições
     */
    try {
      await Product.bulkCreate(JSON.parse(JSON.stringify(productsExists)), {
        updateOnDuplicate: ["quantity"]
      });
    } catch (e) {
      /**
       * Se houver algum erro, o registro da venda é deletado, fazendo assim o registro
       * do produto vendido também ser deletado
       */
      await Sales.destroy({ where: { id: Sale.id } });
      return res
        .status(400)
        .json({ error: "Houve um erro ao finalizar a compra!" });
    }

    return res.status(200).json({ success: "Venda concluída com sucesso!" });
  },
  async delete(req, res) {
    const { userId } = req;
    const { id } = req.params;

    const user = await User.findByPk(userId, {
      include: [{ association: "company" }]
    });

    const sale = await Sales.destroy({
      where: { [Op.and]: { id: id, companyId: user.company.id } }
    });

    if (sale === 1) {
      return res.status(200).json({ success: "Venda deletada com sucesso!" });
    }
    if (sale === 0)
      return res.status(400).json({ error: "Esta venda não existe!" });
  }
};
