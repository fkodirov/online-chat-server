const Sequelize = require("sequelize");
const sequelize = new Sequelize("chat", "root", "", {
  host: "localhost",
  dialect: "mysql",
});
module.exports = sequelize;
