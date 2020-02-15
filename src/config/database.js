module.exports = {
  dialect: "mysql",
  url: process.env.DATABASE_URL,
  define: {
    timestamps: true,
    freezeTableName: true
  }
};
