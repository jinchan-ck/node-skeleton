var MysqlStore = require('koa-mysql-session');
var mysqlConfig = require('config').get('mysql');

module.exports = function () {
  return new MysqlStore(mysqlConfig);
};