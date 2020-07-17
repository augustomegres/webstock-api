const validateName = (name) => {
  if (!name) {
    return {
      error: "O nome está vazio",
      recieved: name,
    };
  }

  if (name.length < 3) {
    return {
      error: "O nome é curto demais",
      recieved: name,
    };
  }

  if (name.length >= 100) {
    return {
      error: "O nome deve ter no máximo 100 caracteres",
      recieved: name,
    };
  }

  /* -------------------------------------------------------------------------- */
  /* ------------ ESSE REGEX VERIFICA SE TODOS VALORES SÃO A-Z 0-9 ------------ */
  /* ------------------------ CASO CONTRÁRIO DARÁ FALSO ----------------------- */
  /* -------------------------------------------------------------------------- */

  if (name.toString().replace(/[A-Z 0-9áéíóúâêîôûàèìòùãõẽĩõũ]/gi, "")) {
    return {
      error: "O nome deve conter apenas A-Z ou 0-9",
      recieved: name,
    };
  }

  return {
    success: "Nome válido",
    recieved: name,
  };
};

module.exports = validateName;
