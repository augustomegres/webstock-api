module.exports = {
  async show(req, res) {
    const { user } = req;

    if (user.error) {
      return res.status(400).json(user);
    }

    return res.status(200).json(user);
  },
};
