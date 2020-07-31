const validateMoney = (value, required) => {
  if (required == true && !value) {
    return {
      provided: value,
      error: "O valor deve ser informado!",
    };
  }

  if (!value)
    return {
      provided: value,
      success: "O valor não foi informado, porém não é obrigatório!",
    };

  value = Number(value);

  if (isNaN(value))
    return {
      provided: value,
      error: "O valor deve ser um número!",
    };

  if (value < 0)
    return {
      provided: value,
      error: "O valor deve ser maior que 0!",
    };

  return {
    provided: value,
    success: value,
  };
};

module.exports = validateMoney;
