const validateEmail = (email) => {
  if (!email) {
    return {
      error: "O email está vazio",
      recieved: email,
    };
  }

  const parts = email.split("@");

  if (parts.length !== 2) {
    return {
      error: "O email é inválido!",
      recieved: email,
    };
  }

  return {
    success: "Email válido",
    recieved: email,
  };
};

module.exports = validateEmail;
