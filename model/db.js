var Sequelize = require('sequelize');
var mysqlConfig = require('config').get('mysql');

module.exports = new Sequelize(mysqlConfig.db, mysqlConfig.user, mysqlConfig.password, {
  host: mysqlConfig.host,
  port: mysqlConfig.port,
  pool: mysqlConfig.pool,
  dialect: mysqlConfig.dialect,
  dialectOptions: {
    multipleStatements: true
  },
  logging: mysqlConfig.logging && console.log,
  define: {}
});
