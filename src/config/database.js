module.exports = {
  dialect: "postgres",
  url:
    process.env.DATABASE_URL ||
    "postgres://lpnfrgsq:sDcXTIpLUEl2EP4ITkOIP_97P5mLWqVh@salt.db.elephantsql.com:5432/lpnfrgsq",
  define: {
    timestamps: true,
    freezeTableName: true
  }
};
