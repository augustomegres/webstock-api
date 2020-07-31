const validateDate = (value, required) => {
  if (required == true && !value) {
    return {
      provided: value,
      error: "A data deve ser informada!",
    };
  }

  if (!value)
    return {
      provided: value,
      success: "A data não foi informada, porém não é obrigatória!",
    };

  if (new Date(value) == "Invalid Date" || !isNaN(value))
    return {
      provided: value,
      error: "O valor informado não é uma data válida",
    };

  return {
    provided: value,
    success: value,
  };
};

module.exports = validateDate;
