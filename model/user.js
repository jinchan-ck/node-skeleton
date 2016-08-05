var Sequelize = require('sequelize');

var sequelize = require('./db.js');

module.exports = sequelize.define('user', {
  publicId: {
    primaryKey: true,
    field: 'public_id',
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    comment: '主键'
  },
  name: {
    allowNull: true,
    type: Sequelize.STRING
  },
  password: {
    allowNull: false,
    type: Sequelize.STRING
  },
  email: {
    unique: true,
    allowNull: false,
    type: Sequelize.STRING
  },
  mobile: {
    unique: true,
    allowNull: false,
    type: Sequelize.STRING
  },
  status: {
    allowNull: false,
    defaultValue: 'ACTIVE',
    type: Sequelize.ENUM('ACTIVE', 'SUSPEND'),
    comment: '用户状态'
  },
  source: {
    allowNull: false,
    defaultValue: '未知',
    type: Sequelize.STRING,
    comment: '用户来源'
  }
}, {
  underscored: true,
  freezeTableName: true
});
