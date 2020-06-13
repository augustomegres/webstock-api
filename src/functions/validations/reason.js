const validateReason = (value, required) => {
  if (required == true && !value) {
    return {
      provided: value,
      error: "A razão deve ser informada!",
    };
  }

  if (!value)
    return {
      provided: value,
      success: "A razão não foi informada, porém não é obrigatória",
    };

  if (value.length > 500)
    return {
      provided: value,
      error: "A razão deve ter no máximo 500 caracteres!",
    };

  if (value.length < 10) {
    return {
      provided: value,
      error: "A razão deve ter no mínimo 10 caracteres!",
    };
  }

  return {
    provided: value,
    success: value,
  };
};

module.exports = validateReason;
