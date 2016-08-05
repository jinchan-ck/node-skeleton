var Sequelize = require('sequelize');

var sequelize = require('./db.js');

module.exports = sequelize.define('profile', {
  publicId: {
    primaryKey: true,
    field: 'public_id',
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4
  },
  userId: {
    allowNull: false,
    field: 'user_id',
    type: Sequelize.UUID
  },
  nickname: {
    allowNull: false,
    type: Sequelize.STRING
  },
  avatar: {
    allowNull: false,
    type: Sequelize.STRING
  },
  gender: {
    allowNull: true,
    type: Sequelize.ENUM('MALE', 'FEMALE', 'TRANS', 'AGENDER', 'ANDROGYNE')
  },
  qq: {
    allowNull: true,
    type: Sequelize.STRING
  },
  wechat: {
    allowNull: true,
    type: Sequelize.STRING
  },
  address: {
    allowNull: true,
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
  }
}, {
  underscored: true,
  freezeTableName: true
});
