const validateNote = (value, required) => {
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

  if (value.length > 250)
    return {
      provided: value,
      error: "A razão deve ter no máximo 250 caracteres!",
    };

  if (value.length < 3) {
    return {
      provided: value,
      error: "A razão deve ter no mínimo 3 caracteres!",
    };
  }

  return {
    provided: value,
    success: value,
  };
};

module.exports = validateNote;
