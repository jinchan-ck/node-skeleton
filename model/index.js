var User = require('./user');
var sequelize = require('./db');
var Profile = require('./profile');

var Model = exports;

/**
 * Relation between user and profile is 1:1
 */
User.hasOne(Profile, {
  as: 'profile',
  foreignKey: 'userId'
});

Model.User = User;
Model.Profile = Profile;

Model.sequelize = sequelize;
