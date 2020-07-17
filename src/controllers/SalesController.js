const { Op } = require("sequelize");

const User = require("../models/User");
const Product = require("../models/Product");
const Sales = require("../models/Sale");
const ProductSold = require("../models/ProductSold");
const Customer = require("../models/Customer");
const Installments = require("../models/InflowInstallments");
const Seller = require("../models/Seller");

module.exports = {
  async index(req, res) {
    const { user } = req;
    let {
      min,
      max,
      min_date_time,
      max_date_time,
      seller,
      customer,
      product,
      id,
      order,
      page,
      pageSize,
      selectOnly,
    } = req.query;

    if (!pageSize) {
      pageSize = 15;
    }

    let filter = {
      companyId: user.company.id,
    };

    if (seller) {
      if (!isNaN(seller)) {
        let newSeller = { [Op.eq]: seller };

        filter.seller = newSeller;
      }
    }

    if (customer) {
      if (!isNaN(customer)) {
        let newCustomer = { [Op.eq]: customer };

        filter.customer = newCustomer;
      }
    }

    if (id) {
      if (!isNaN(id)) {
        let newId = { [Op.eq]: id };

        filter.id = newId;
      }
    }

    if (min || max) {
      let min_val = 0;
      let max_val = 9999999999;
      filter.total = {
        [Op.and]: {
          [Op.gte]: Number(min) || min_val,
          [Op.lte]: Number(max) || max_val,
        },
      };
    }

    if (min_date_time || max_date_time) {
      filter.date = {
        [Op.and]: {
          [Op.gte]: min_date_time || "1970-01-01",
          [Op.lte]: max_date_time || "2100-01-01",
        },
      };
    }

    if (order) {
      var searchOrder = [];
      searchOrder.push(["id", order]);
    } else {
      var searchOrder = [];
    }

    //Fazendo a seleção dos que conteem parcelas não pagas
    switch (Number(selectOnly)) {
      case 1: {
        let select1 = await Sales.findAll({
          where: filter,
          include: [
            { association: "installments" },
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

        //VERIFICANDO SE O FILTRO DE PRODUTO FOI INCLUIDO E APLICANDO ELE
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
            { association: "installments" },
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

        //VERIFICANDO SE O FILTRO DE PRODUTO FOI INCLUIDO E APLICANDO ELE
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
            { association: "installments" },
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

        //VERIFICANDO SE O FILTRO DE PRODUTO FOI INCLUIDO E APLICANDO ELE
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
        //
        let select4 = await Sales.findAll({
          where: filter,
          include: [
            { association: "installments" },
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

        //VERIFICANDO SE O FILTRO DE PRODUTO FOI INCLUIDO E APLICANDO ELE
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

          //VERIFICANDO SE O FILTRO DE PRODUTO FOI INCLUIDO E APLICANDO ELE
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

    try {
      var sales = await Sales.paginate({
        page,
        paginate: Number(pageSize),
        where: filter,
        order: searchOrder,
        include: [
          { association: "customers" },
          { association: "productSold" },
          { association: "saleOwner" },
          { association: "installments", order: ["installment", "ASC"] },
        ],
      });

      sales.docs.map((sale) => {
        let total = 0;
        sale.installments.map((installment) => {
          total += Number(installment.installmentValue);
        });
        sale.total = total;
        sale.dataValues.total = total;
      });
    } catch (err) {
      return res.status(400).json(err);
    }

    return res.json(sales);
  },
  async store(req, res) {
    const { date, customer, freight, products, installments } = req.body;

    const { user } = req;

    /* -------------------------------------------------------------------------- */
    /*                                VERIFICAÇÕES                                */
    /* -------------------------------------------------------------------------- */

    //Verificando se o cliente pertence a empresa
    if (customer) {
      const _customers = await Customer.findByPk(customer);
      if (_customers.companyId !== user.company.id) {
        return res
          .status(400)
          .json({ error: "O cliente informado não pertence a sua empresa!" });
      }
    }

    /* ----------- SE NÃO HOUVER O VALOR DO FRETE, ELE SERA IGUAL A 0 ----------- */

    let total = freight ? Number(freight) : 0;

    let productIdList = [];

    products.map((product) => {
      /* ------------------- CALCULANDO VALOR TOTAL DOS PRODUTOS ------------------ */

      total = total + product.quantity * product.unityPrice;

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
        seller: user.id,
        customer,
        freight,
        total,
      });

      products.map((product) => {
        product.sellId = sale.id;
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
