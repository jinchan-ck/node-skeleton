var Models = require('../model');
var Utils = require('../utils');
var User = Models.User;

var userTemplate1 = {
  email: 'chengke@test.com',
  name: 'test1',
  mobile: '18510655240',
  password: Utils.md5('123'),
};
var userTemplate2 = {
  email: 'wuliangquan@test.com',
  name: 'test2',
  mobile: '13750509651',
  password: Utils.md5('234'),
};
var userTemplate3 = {
  email: 'lincanbin@test.com',
  name: 'test3',
  mobile: '13726247339',
  password: Utils.md5('345'),
};
var user = {};
var user2 = {};
var user3 = {};

function setupUser(done) {

  User.create(userTemplate1)
  .then(function(result) {
    user.publicId = result.publicId;
    user.email = result.email;
    user.name = result.name;
    user.mobile = result.mobile;
    user.password = '123';
    user.createdDate = result.createdDate;
    user.updatedDate = result.updatedDate;

    return User.create(userTemplate2);
  })
  .then(function(result) {

    user2.publicId = result.publicId;
    user2.email = result.email;
    user2.name = result.name;
    user2.mobile = result.mobile;
    user2.password = '234';
    user2.createdDate = result.createdDate;
    user2.updatedDate = result.updatedDate;

    return User.create(userTemplate3);
  })
  .then(function(result) {

    user3.publicId = result.publicId;
    user3.email = result.email;
    user3.name = result.name;
    user3.mobile = result.mobile;
    user3.password = '345';
    user3.createdDate = result.createdDate;
    user3.updatedDate = result.updatedDate;

    done();
  })
  .catch(done);
}

module.exports = {
  user: user,
  user2: user2,
  user3: user3,
  setupUser: setupUser
};
