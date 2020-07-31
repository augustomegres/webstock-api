const validateType = (value, required) => {
  if (required == true && !value) {
    return {
      provided: value,
      error: "O tipo deve ser informado!",
    };
  }

  if (!value)
    return {
      provided: value,
      success: "O tipo não foi informado, porém não é obrigatório!",
    };

  if (value.length > 60)
    return {
      provided: value,
      error: "O tipo deve ter no máximo 60 caracteres!",
    };

  if (value.length < 2) {
    return {
      provided: value,
      error: "A descrição deve ter no minimo 2 caracteres!",
    };
  }

  return {
    provided: value,
    success: value,
  };
};

module.exports = validateType;
