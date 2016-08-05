var should = require('should');

var Mock = require('../mock-data');
var Models = require('../../model');
var Utils = require('../../utils');
var userService = require('../../service/user');

var sequelize = Models.sequelize;
var User = Models.User;

var user = Mock.user;
var user2 = Mock.user2;
var user3 = Mock.user3;

function init(done) {
  Mock.setupUser(done);
}

function destroy(done) {
  sequelize.sync({
    force: true
  }).then(function() {
    done();
  }).catch(done);
}

describe('Service - [User]', function() {
  before(init);
  after(destroy);

  describe('#create user', function() {
    it('should create faild with a exist email', function(done) {
      userService.createUser(user.email, user.mobile, user.name, user.password)
      .then(done)
      .catch(function (err) {
        if (err) {
          done();
        } else {
          done('test failed');
        }
      });
    });

    it('should create success with a not exist email', function(done) {
      userService.createUser('ck@gmail.com', '15110094900', 'Ck', '123456')
      .then(function(user) {
        should.exist(user);
        user.email.should.be.equal('ck@gmail.com');
        user.name.should.be.equal('Ck');
        done();
      })
      .catch(done);
    });
  });

  describe('#login', function() {
    it('should login success with right email and password', function(done) {
      userService.login(user.email, user.password)
      .then(function(success) {
        should.exist(success);
        success.should.be.ok();
        done();
      })
      .catch(done);
    });

    it('should login faild invalid email or password', function(done) {
      userService.login(user.email, 'invalidPassword')
        .then(function(user) {
          if (user) {
            done('log in success');
          } else {
            done();
          }
        })
        .catch(function() {
          done();
        });
    });
  });

  describe('#get use info', function() {
    it('should fetch success when had login', function(done) {
      userService.getUser(user.publicId)
      .then(function(result) {
        if (result) {
          result.email.should.be.equal(user.email);
          result.name.should.be.equal(user.name);
          done();
        } else {
          done('User not found');
        }
      }).catch(done);
    });
  });

  describe('#update user info', function() {
    it('should update name success with a name param', function(done) {
      userService.updateUser(user.publicId, {
        name: 'AL'
      })
      .then(function(success) {
        success.should.be.ok();
        return User.findOne({
          where: {
            publicId: user.publicId
          }
        });
      })
      .then(function(user) {
        should.exist(user);
        user.name.should.be.equal('AL');
        done();
      })
      .catch(done);
    });

    it('should update user password success with new and original password', function(done) {
      userService.updateUser(user2.publicId, {
        newPassword: 'asd',
        originalPassword: user2.password
      })
      .then(function(success) {
        success.should.be.ok();
        return User.findOne({
          where: {
            publicId: user2.publicId
          }
        });
      })
      .then(function(user) {
        should.exist(user);
        done();
      })
      .catch(done);
    });

    it('should update user password failed without original password', function(done) {
      userService.updateUser(user3.publicId, {
        newPassword: 'asd'
      })
      .then(function(success) {
        success.should.be.ok();
        return User.findOne({
          where: {
            publicId: user3.publicId
          }
        });
      })
      .then(function(user) {
        should.exist(user);
        done();
      })
      .catch(done);
    });
  });
});
