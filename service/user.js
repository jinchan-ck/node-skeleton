var assert = require('assert');

var Model = require('../model');
var Utils = require('../utils');
var User = Model.User;

var UserService = module.exports;

UserService._login = function (user, md5Password) {

  if (!user) {
    return Promise.reject('user does not exist');
  } else if (user.password !== md5Password) {
    return Promise.reject('password is wrong');
  }

  return user;
};

UserService.login = function login(email, password) {
  assert(email, 'email param required!');
  assert(password, 'password param required!');

  var md5Password = Utils.md5(password);

  return User.findOne({
    where: {
      email: email,
    }
  }).then(function (user) {
    return UserService._login(user, md5Password);
  });

};

UserService.createUser = function createUser(email, mobile, name, password) {
  assert(name, 'name param required!');
  assert(email, 'email param required!');
  assert(mobile, 'mobile param required!');
  assert(password, 'password param required!');
  var md5Password = Utils.md5(password);

  var newUser = {};
  newUser.name = name;
  newUser.email = email;
  newUser.mobile = mobile;
  newUser.password = md5Password;
  newUser.createdDate = new Date();
  newUser.updatedDate = new Date();

  return User.findOne({
    where: {
      $or: [
        {
          email: email
        },
        {
          mobile: mobile
        }
      ]
    }
  }).then(function (user) {
    if (user) {
      return Promise.reject((user.email === email ? 'email' : 'mobile') + ' exists');
    } else {
      return User.create(newUser);
    }
  });
};

UserService.getUser = function getUser(id) {
  assert(id, 'id param required!');

  return User.findOne({
    where: {
      publicId: id
    },
    include: [
      {
        model: Model.Profile,
        as: 'profile'
      }
    ]
  });
};

UserService.getUserByEmail = function getUserByEmail(email) {
  assert(email, 'email param required!');

  return User.findOne({
    attributes: [ 'email', 'mobile' ],
    where: { email: email }
  });
};

UserService.updateUser = function updateUser(id, body) {
  assert(id, 'id param required!');
  assert(body, 'body param required!');

  var name = body.name;
  var newPassword = body.newPassword;
  var originalPassword = body.originalPassword;

  return User.findOne({ where: { publicId: id } })
  .then(function (user) {
    var update = false;

    if (name && name !== user.name) {
      user.name = name;
      update = true;
    }
    if (newPassword &&
     originalPassword &&
     originalPassword === user.password) {
      user.password = newPassword;
      update = true;
    }

    if (update) {
      user.updatedDate = new Date();
    }

    return user.save();
  }).then(function () {
    return true;
  });
};

UserService.resetPassword = function resetPassword(email, mobile, newPassword) {
  assert(email, 'email param required!');
  assert(mobile, 'mobile param required!');
  assert(newPassword, 'newPassword param required!');

  return User.findOne({ where: { email: email } })
  .then(function (user) {
    var update = false;

    if (newPassword && mobile === user.mobile) {
      user.password = Utils.md5(newPassword);
      update = true;
    }

    if (update) {
      user.updatedDate = new Date();
    }

    return user.save();
  }).then(function () {
    return true;
  });
};

UserService.checkEmail = function (email) {
  assert(email, 'Email required when check email.');

  return User.findOne({
    attributes: [ 'publicId' ],
    where: { email: email }
  });
};

UserService.checkMobile = function (mobile) {
  assert(mobile, 'Mobile required when check mobile.');

  return User.findOne({
    attributes: [ 'publicId' ],
    where: { mobile: mobile }
  });
};
