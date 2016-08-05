var assert = require('assert');

var Model = require('../model');
var Profile = Model.Profile;

var ProfileService = module.exports;
ProfileService.create = function create(userId, parameter) {
  console.log(parameter);
  var nickname = parameter.name;
  var avatar = '';
  var email = parameter.email;
  var mobile = parameter.mobile;

  assert(userId, 'userId param required!');
  assert(nickname, 'nickname param required!');
  assert(email, 'email param required!');
  assert(mobile, 'mobile param required!');

  var newProfile = {};
  newProfile.userId = userId;
  newProfile.nickname = nickname;
  newProfile.avatar = avatar;
  newProfile.email = email;
  newProfile.mobile = mobile;

  return Profile.findOne({
    where: {
      userId: userId
    }
  }).then(function (profile) {
    if (profile) {
      return Promise.reject('exists');
    } else {
      return Profile.create(newProfile);
    }
  });
};

ProfileService.updateProfile = function updateProfile(userId, parameter) {
  var nickname = parameter.nickname;
  var avatar = parameter.avatar;
  var gender = parameter.gender;
  var qq = parameter.qq;
  var wechat = parameter.wechat;
  var email = parameter.email;
  var mobile = parameter.mobile;

  assert(userId, 'userId param required!');
  assert(nickname, 'nickname param required!');
  assert(avatar, 'avatar param required!');
  assert(email, 'email param required!');
  assert(mobile, 'mobile param required!');

  return Profile.findOne({ where: { userId: userId } })
    .then(function (profile) {
      profile.nickname = nickname;
      profile.avatar = avatar;
      profile.gender = gender;
      profile.qq = qq;
      profile.wechat = wechat;
      profile.email = email;
      profile.mobile = mobile;

      return profile.save();
    }).then(function () {
      return true;
    });
};
