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

    if (!pageSize) {
      pageSize = 15;
    }

    /* -------------------------------------------------------------------------- */
    /*                                   FILTROS                                  */
    /* -------------------------------------------------------------------------- */

    let filter = {
      companyId: user.company.id,
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

    let productFilter = {};

    if (productId) {
      productFilter = { productId: { [Op.eq]: productId } };
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
        console.log(nextMonth);

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
        let sales = await Sales.paginate({
          page,
          paginate: Number(pageSize),
          where: { ...filter },
          include: [
            { association: "customers" },
            {
              association: "productSold",
              where: productFilter,
            },
            { association: "saleOwner" },
            {
              association: "installments",
              where: installmentFilter,
            },
          ],
        }).catch((error) => {
          return res
            .status(400)
            .json({ error: "Houve um erro na sua requisição", info: error });
        });

        let ids = [];
        sales.docs.map((sale) => {
          ids.push(sale.id);
        });

        let includeSales = await Sales.paginate({
          paginate: Number(pageSize),
          where: { id: ids },
          order,
          include: [
            { association: "customers" },
            { association: "productSold" },
            { association: "saleOwner" },
            { association: "installments" },
          ],
        }).catch((error) => {
          return res
            .status(400)
            .json({ error: "Houve um erro na sua requisição", info: error });
        });
        console.log(includeSales);

        sales.docs = includeSales.docs;
        sales.dataValues = includeSales.dataValues;

        return res.json(sales);
        break;
      default:
        await Sales.findAll({
          where: filter,
          order,
          include: [
            { association: "customers" },
            { association: "productSold" },
            { association: "saleOwner" },
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

    /**
    //Fazendo a seleção dos que contém parcelas não pagas
    switch (Number(selectOnly)) {
      case 1: {
        let select1 = await Sales.findAll({
          where: filter,
          include: [
            {
              association: "installments",
            },
            { association: "productSold" },
          ],
        });

        var queryIncludeArr = [];
        let newQueryArr = [];

        select1.map((sale) => {
          sale.installments.map((installment) => {
            if (!installment.paymentDate) {
              return queryIncludeArr.push(sale.id);
            }
          });
        });

        //VERIFICANDO SE O FILTRO DE PRODUTO FOI INCLUÍDO E APLICANDO ELE
        var productIncludeArr = [];
        if (product) {
          select1.map((sale) => {
            sale.productSold.map((saleProduct) => {
              if (saleProduct.productId == product)
                return productIncludeArr.push(sale.id);
            });
          });
        }

        if (productIncludeArr.length) {
          productIncludeArr.map((val) => {
            if (queryIncludeArr.indexOf(val) > -1) {
              newQueryArr.push(val);
            }
          });
        } else {
          newQueryArr = queryIncludeArr;
        }

        if (!newQueryArr.length) {
          filter.id = { [Op.eq]: null };
        } else {
          let notPaid = { [Op.or]: newQueryArr };
          filter.id = notPaid;
        }
        break;
      }
      case 2: {
        //Contém parcelas a vencer nos próximos 30 dias
        let select2 = await Sales.findAll({
          where: filter,
          include: [
            {
              association: "installments",
            },
            { association: "productSold" },
          ],
        });

        var queryIncludeArr = [];
        var newQueryArr = [];
        select2.map((sale) => {
          sale.installments.map((installment) => {
            let hoje = new Date();
            let due = new Date(installment.dueDate);

            if (
              !installment.paymentDate &&
              hoje.setDate(hoje.getDate() + 30) > due
            ) {
              return queryIncludeArr.push(sale.id);
            }
          });
        });

        //VERIFICANDO SE O FILTRO DE PRODUTO FOI INCLUÍDO E APLICANDO ELE
        var productIncludeArr = [];
        if (product) {
          select2.map((sale) => {
            sale.productSold.map((saleProduct) => {
              if (saleProduct.productId == product)
                return productIncludeArr.push(sale.id);
            });
          });
        }

        if (productIncludeArr.length) {
          productIncludeArr.map((val) => {
            if (queryIncludeArr.indexOf(val) > -1) {
              newQueryArr.push(val);
            }
          });
        } else {
          newQueryArr = queryIncludeArr;
        }

        if (!newQueryArr.length) {
          filter.id = { [Op.eq]: null };
        } else {
          let dueIn30Days = { [Op.or]: newQueryArr };
          filter.id = dueIn30Days;
        }
        break;
      }
      case 3: {
        //Contém parcelas pagas
        let select3 = await Sales.findAll({
          where: filter,
          include: [
            {
              association: "installments",
            },
            { association: "productSold" },
          ],
        });

        var queryIncludeArr = [];
        var newQueryArr = [];

        select3.map((sale) => {
          sale.installments.map((installment) => {
            if (installment.paymentDate) {
              return queryIncludeArr.push(sale.id);
            }
          });
        });

        //VERIFICANDO SE O FILTRO DE PRODUTO FOI INCLUÍDO E APLICANDO ELE
        var productIncludeArr = [];
        if (product) {
          select3.map((sale) => {
            sale.productSold.map((saleProduct) => {
              if (saleProduct.productId == product)
                return productIncludeArr.push(sale.id);
            });
          });
        }

        if (productIncludeArr.length) {
          productIncludeArr.map((val) => {
            if (queryIncludeArr.indexOf(val) > -1) {
              newQueryArr.push(val);
            }
          });
        } else {
          newQueryArr = queryIncludeArr;
        }

        if (!newQueryArr.length) {
          filter.id = { [Op.eq]: null };
        } else {
          let onlyPaid = { [Op.or]: newQueryArr };
          filter.id = onlyPaid;
        }
        break;
      }
      case 4: {
        //Vencidas
        let select4 = await Sales.findAll({
          where: filter,
          include: [
            {
              association: "installments",
            },
            { association: "productSold" },
          ],
        });

        var queryIncludeArr = [];
        var newQueryArr = [];

        select4.map((sale) => {
          sale.installments.map((installment) => {
            if (
              !installment.paymentDate &&
              new Date(installment.dueDate) < new Date().setHours(0, 0, 0, 0)
            ) {
              return queryIncludeArr.push(sale.id);
            }
          });
        });

        //VERIFICANDO SE O FILTRO DE PRODUTO FOI INCLUÍDO E APLICANDO ELE
        var productIncludeArr = [];
        if (product) {
          select4.map((sale) => {
            sale.productSold.map((saleProduct) => {
              if (saleProduct.productId == product)
                return productIncludeArr.push(sale.id);
            });
          });
        }

        if (productIncludeArr.length) {
          productIncludeArr.map((val) => {
            if (queryIncludeArr.indexOf(val) > -1) {
              newQueryArr.push(val);
            }
          });
        } else {
          newQueryArr = queryIncludeArr;
        }

        if (!newQueryArr.length) {
          filter.id = { [Op.eq]: null };
        } else {
          let dueOnly = { [Op.or]: newQueryArr };
          filter.id = dueOnly;
        }
        break;
      }
      default:
        if (product) {
          let selectDefault = await Sales.findAll({
            where: filter,
            include: [{ association: "productSold" }],
          });

          //VERIFICANDO SE O FILTRO DE PRODUTO FOI INCLUÍDO E APLICANDO ELE
          var productIncludeArr = [];
          selectDefault.map((sale) => {
            sale.productSold.map((saleProduct) => {
              if (saleProduct.productId == product)
                return productIncludeArr.push(sale.id);
            });
          });

          if (!productIncludeArr.length) {
            filter.id = { [Op.eq]: null };
          } else {
            let productFilter = { [Op.or]: productIncludeArr };
            filter.id = productFilter;
          }
        }
        break;
    }

    if (columnToSort && order) {
      order = [
        [columnToSort, order],
        ["installments", "installmentNumber", "ASC"],
      ];
    } else {
      order = null;
    }

    try {
      switch (paginate) {
        case "true":
          var sales = await Sales.paginate({
            page,
            paginate: Number(pageSize),
            where: filter,
            order,
            include: [
              { association: "customers" },
              { association: "productSold" },
              { association: "saleOwner" },
              {
                association: "installments",
              },
            ],
          });
          break;

        default:
          var sales = await Sales.findAll({
            where: filter,
            order,
            include: [
              { association: "customers" },
              { association: "productSold" },
              { association: "saleOwner" },
              { association: "installments" },
            ],
          });
          break;
      }

      switch (paginate) {
        case "true":
          sales.docs.map((sale) => {
            let total = 0;
            sale.installments.map((installment) => {
              total += Number(installment.installmentValue);
            });
            sale.total = total;
            sale.dataValues.total = total;
          });
          return res.json(sales);
        default:
          return res.json(sales);
      }
    } catch (err) {
      return res.status(400).json(err);
    } */
  },
  async store(req, res) {
    const { date, customerId, freight, products, installments } = req.body;

    const { user } = req;

    /* -------------------------------------------------------------------------- */
    /*                                VERIFICAÇÕES                                */
    /* -------------------------------------------------------------------------- */

    //Verificando se o cliente pertence a empresa
    if (customerId) {
      const _customers = await Customer.findByPk(customerId);
      if (_customers.companyId !== user.company.id) {
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
        companyId: { [Op.ne]: user.company.id },
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
        companyId: user.company.id,
        date,
        sellerId: user.id,
        customerId,
        freight,
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
        installment.companyId = user.company.id;
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
    const { id } = req.params;

    const sale = await Sales.destroy({
      where: { [Op.and]: { id: id, companyId: user.company.id } },
    });

    if (sale === 1) {
      return res.status(200).json({ success: "Venda deletada com sucesso!" });
    }
    if (sale === 0)
      return res.status(400).json({ error: "Esta venda não existe!" });
  },
};
