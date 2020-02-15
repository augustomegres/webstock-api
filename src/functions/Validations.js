module.exports = {
  cpf(cpf) {
    if (!cpf) {
      return {
        error: "O cpf está vazio",
        recieved: cpf,
        expected: "123.456.789-00"
      };
    }

    cpf = cpf.replace(/[^0-9.-]/g, "");

    if (cpf.length !== 14) {
      return {
        error: "O cpf digitado é inválido!",
        recieved: cpf,
        expected: "123.456.789-00"
      };
    }

    if (cpf.replace(/[^0-9]/g, "").length !== 11) {
      return {
        error: "O cpf digitado é inválido!",
        recieved: cpf,
        expected: "123.456.789-00"
      };
    }

    if (cpf[3] !== "." || cpf[7] !== "." || cpf[11] !== "-") {
      return {
        error: "O cpf digitado é inválido!",
        recieved: cpf,
        expected: "123.456.789-00"
      };
    }

    return cpf;
  },
  cnpj(cnpj) {
    if (!cnpj) {
      return {
        error: "O cnpj está vazio",
        recieved: cnpj,
        expected: "12.345.678/0001-90"
      };
    }

    if (cnpj.length !== 18) {
      return {
        error: "O cnpj informado é inválido",
        recieved: cnpj,
        expected: "12.345.678/0001-90"
      };
    }

    if (cnpj.replace(/[^0-9]/g, "").length !== 14) {
      return {
        error: "O cnpj digitado é inválido!",
        recieved: cnpj,
        expected: "12.345.678/0001-90"
      };
    }

    if (
      cnpj[2] !== "." ||
      cnpj[6] !== "." ||
      cnpj[10] !== "/" ||
      cnpj[15] !== "-"
    ) {
      return {
        error: "O cnpj digitado é inválido!",
        recieved: cnpj,
        expected: "12.345.678/0001-90"
      };
    }

    return cnpj;
  },
  email(email) {
    if (!email) {
      return {
        error: "O email está vazio",
        recieved: email,
        expected: "joao@provedor.com"
      };
    }

    const parts = email.split("@");

    if (parts.length !== 2) {
      return {
        error: "O email é inválido!",
        recieved: email,
        expected: "joao@provedor.com"
      };
    }
  }
};
