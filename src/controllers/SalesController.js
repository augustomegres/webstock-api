const { Op } = require("sequelize");

const Product = require("../models/Product");
const Sales = require("../models/Sale");
const ProductSold = require("../models/ProductSold");
const Customer = require("../models/Customer");
const Installments = require("../models/InflowInstallments");
const { Sequelize } = require("sequelize");

module.exports = {
  async index(req, res) {
    const { user } = req;
    const { companyId } = req.params;
    let {
      min,
      max,
      initialDate,
      finalDate,
      customerId,
      productId,
      id,
      columnToSort,
      order,
      paginate,
      page,
      pageSize,
      selectOnly,
    } = req.query;

    /* ---------------------------- TAMANHO DA PÁGINA --------------------------- */

    if (!page) page = 1;
    page--;

    if (!pageSize) pageSize = 12;
    if (pageSize > 100) {
      return res
        .status(400)
        .json({ error: "O tamanho máximo da página é de 100 documentos." });
    }

    /* -------------------------------------------------------------------------- */
    /*                                   FILTROS                                  */
    /* -------------------------------------------------------------------------- */

    let filter = {
      companyId,
    };

    /* --------------------------------- CLIENTE -------------------------------- */

    if (customerId) {
      filter.customerId = { [Op.eq]: customerId };
    }

    /* ----------------------------------- ID ----------------------------------- */

    if (id) {
      let newId = { [Op.eq]: id };
      filter.id = newId;
    }

    /* ---------------------------------- VALOR --------------------------------- */

    if (min || max) {
      filter.total = {
        [Op.and]: {
          [Op.gte]: Number(min),
          [Op.lte]: Number(max),
        },
      };
    }

    /* ---------------------------------- DATA ---------------------------------- */

    if (initialDate || finalDate) {
      initialDate = new Date(initialDate || "01-01-1970").setHours(0, 0, 0, 0);
      finalDate = new Date(finalDate || "01-01-2999").setHours(23, 59, 59, 999);

      filter.date = {
        [Op.and]: {
          [Op.gte]: initialDate,
          [Op.lte]: finalDate,
        },
      };
    }

    /* -------------------------------------------------------------------------- */
    /*                                   PRODUTO                                  */
    /* -------------------------------------------------------------------------- */

    let productWhere = {};

    if (productId) {
      productWhere = { productId: { [Op.eq]: productId } };
    }
    /* -------------------------------------------------------------------------- */
    /*                                  PARCELAS                                  */
    /* -------------------------------------------------------------------------- */

    let installmentFilter = {};
    let today = new Date();
    switch (Number(selectOnly)) {
      case 1:
        /* ----------------- SELECIONANDO CONTENDO APENAS NÃO PAGAS ----------------- */
        installmentFilter = { paymentDate: { [Op.eq]: null } };
        break;

      /* ------------------------ A VENCER PRÓXIMOS 30 DIAS ----------------------- */

      case 2:
        let nextMonth = today.setDate(today.getDate() + 30);
        nextMonth = new Date(nextMonth).toLocaleDateString("en");
        nextMonth = new Date(nextMonth).toISOString();

        installmentFilter = {
          paymentDate: { [Op.eq]: null },
          dueDate: {
            [Op.lte]: nextMonth,
          },
        };
        break;

      case 3:
        /* -------------------------------- VENCIDAS -------------------------------- */

        today = new Date(today).toLocaleDateString("en");
        today = new Date(today).toISOString();

        installmentFilter = {
          paymentDate: { [Op.eq]: null },
          dueDate: {
            [Op.lt]: today,
          },
        };
        break;

      default:
        break;
    }

    /* -------------------------------------------------------------------------- */
    /*                                  ORDENAÇÃO                                 */
    /* -------------------------------------------------------------------------- */

    if (columnToSort && order) {
      order = [
        [columnToSort, order],
        ["installments", "installmentNumber", "ASC"],
      ];
    } else {
      order = null;
    }

    switch (paginate) {
      case "true":
        const offset = Number(page) * Number(pageSize);
        const limit = Number(pageSize);

        let sales = await Sales.findAndCountAll({
          limit,
          offset,
          where: { ...filter },
          include: [
            { association: "customers" },
            { association: "productSold", where: productWhere },
            { association: "saleOwner" },
            { association: "installments", where: installmentFilter },
          ],
        }).catch((error) => {
          return res
            .status(400)
            .json({ error: "Houve um erro na sua requisição", info: error });
        });

        let ids = [];
        sales.rows.map((sale) => {
          ids.push(sale.id);
        });

        let data = {};
        data.docs = sales.rows;

        data.total = sales.count;
        data.pages = Math.ceil(sales.count / limit);

        return res.status(200).json(data);
        break;
      default:
        await Sales.findAll({
          where: filter,
          order,
          include: [
            { association: "customers" },
            { association: "productSold" },
            {
              association: "saleOwner",
              attributes: {
                exclude: [
                  "passwordHash",
                  "recoverPasswordToken",
                  "recoverPasswordTokenExpires",
                  "isAdmin",
                ],
              },
            },
            { association: "installments" },
          ],
        })
          .then((sales) => {
            return res.json(sales);
          })
          .catch((error) => {
            return res
              .status(400)
              .json({ error: "Houve um erro na sua requisição", info: error });
          });
        break;
    }
  },
  async store(req, res) {
    const {
      date,
      customerId,
      freight,
      products,
      installments,
      discount,
      discountType,
    } = req.body;

    const { companyId } = req.params;

    const { user } = req;

    /* -------------------------------------------------------------------------- */
    /*                                VERIFICAÇÕES                                */
    /* -------------------------------------------------------------------------- */

    //Verificando se o cliente pertence a empresa
    if (customerId) {
      const _customers = await Customer.findByPk(customerId);
      if (_customers.companyId !== companyId) {
        return res
          .status(400)
          .json({ error: "O cliente informado não pertence a sua empresa!" });
      }
    }

    let productIdList = [];

    products.map((product) => {
      /* ------------------------ INSERINDO IDS EM UM ARRAY ----------------------- */

      productIdList.push(product.productId);
    });

    /* -------------------- REMOVENDO IDS DUPLICADOS NO ARRAY ------------------- */
    sale;
    productIdList = [...new Set(productIdList)];

    const notUserCompanyProduct = await Product.findAll({
      where: {
        id: productIdList,
        companyId: { [Op.ne]: companyId },
      },
    });

    if (notUserCompanyProduct.length) {
      return res.status(400).json({
        error:
          "Você está tentando cadastrar um produto que não pertence a sua empresa!",
      });
    }

    let productsExists = await Product.findAll({
      where: {
        id: productIdList,
      },
    });

    if (productsExists.length !== productIdList.length) {
      return res.status(400).json({
        error: "Um ou mais dos produtos que você tentou cadastrar não existem",
      });
    }

    const stockRemove = {};
    products.map((product) => {
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
          inStock: product.quantity,
        });
      }
    });

    if (err.length > 0) {
      return res.status(400).json(err);
    }

    /* -------------------------------------------------------------------------- */
    /*                      CRIANDO A VENDA NO BANCO DE DADOS                     */
    /* -------------------------------------------------------------------------- */

    try {
      var sale = await Sales.create({
        companyId: companyId,
        date,
        sellerId: user.id,
        customerId,
        freight,
        discount,
        discountType,
      });

      products.map((product) => {
        product.saleId = sale.id;
      });

      /* ----------------------- INSERINDO PRODUTOS VENDIDOS ---------------------- */

      await ProductSold.bulkCreate(products);
      for (var id in stockRemove) {
        productsExists.map((product, index) => {
          if (product.id == id) {
            productsExists[index].quantity -= stockRemove[id];
          }
        });
      }

      /* ------------------- INSERINDO O ID DA VENDA NA PARCELA ------------------- */

      installments.map((installment) => {
        installment.saleId = sale.id;
        installment.companyId = companyId;
      });

      /* ------------------- CRIANDO PARCELAS NO BANCO DE DADOS ------------------- */

      await Installments.bulkCreate(JSON.parse(JSON.stringify(installments)));

      /* ---------------- ATUALIZANDO OS PRODUTOS NO BANCO DE DADOS --------------- */

      await Product.bulkCreate(JSON.parse(JSON.stringify(productsExists)), {
        updateOnDuplicate: ["quantity"],
      });
    } catch (e) {
      await Sales.destroy({ where: { id: sale.id } });
      return res.status(400).json({
        error: "Houve um erro ao tentar inserir o registro!",
        detail: e,
      });
    }

    return res.status(200).json({ success: "Venda concluída com sucesso!" });
  },
  async delete(req, res) {
    const { user } = req;
    const { id, companyId } = req.params;

    const sale = await Sales.destroy({
      where: { [Op.and]: { id: id, companyId: companyId } },
    });

    if (sale === 1) {
      return res.status(200).json({ success: "Venda deletada com sucesso!" });
    }

    if (sale === 0)
      return res.status(400).json({ error: "Esta venda não existe!" });
  },
};
