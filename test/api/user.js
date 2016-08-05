var should = require('should');
var supertest = require('supertest');
var redisClient = require('redis').createClient();

var Mock = require('../mock-data');
var Models = require('../../model');
var app = require('../../app');

var request = supertest(app);

var user = Mock.user;
var sequelize = Models.sequelize;

var cookies;

function init(done) {
  Mock.setupUser(function () {
    redisClient.setex('valid_code_15110094900', 10, 123, done);
  });
}

function destroy(done) {
  sequelize.sync({
    force: true
  }).then(function() {
    done();
  }).catch(done);
}

describe('API - [User]', function() {
  before(init);
  after(destroy);

  describe('#Check existance of resources', function () {
    it('should return {exist: true} with a exist email', function(done) {
      request
        .get('/auth/email/' + user.email)
        .expect(200)
        .end(function (err, res) {
          if (!err) {
            should.exist(res);
            var body = res.body;
            body.exist.should.equal(true);
          }
          done(err, res);
        });
    });

    it('should return {exist: false} with a not exist email', function(done) {
      request
        .get('/auth/email/new@gmail.com')
        .expect(200)
        .end(function (err, res) {
          if (!err) {
            should.exist(res);
            var body = res.body;
            body.exist.should.equal(false);
          }
          done(err, res);
        });
    });

    it('should return {exist: true} with a exist mobile', function(done) {
      request
        .get('/auth/mobile/' + user.mobile)
        .expect(200)
        .end(function (err, res) {
          if (!err) {
            should.exist(res);
            var body = res.body;
            body.exist.should.equal(true);
          }
          done(err, res);
        });
    });

    it('should return {exist: false} with a not exist mobile', function(done) {
      request
        .get('/auth/mobile/15110094900')
        .expect(200)
        .end(function (err, res) {
          if (!err) {
            should.exist(res);
            var body = res.body;
            body.exist.should.equal(false);
          }
          done(err, res);
        });
    });
  });

  describe('#create user', function() {
    it('should return 200 with a not exist email', function(done) {
      request
        .post('/auth/regist')
        .send( { email: 'new@gmail.com', mobile: '15110094900', name: 'newname', password: '123', validCode: '123' })
        .expect(200)
        .end(done);
    });

    it('should return 403 when email exist', function(done) {
      request
        .post('/auth/regist')
        .send( { email: user.email, mobile: user.mobile, name: 'new', password: '123', validCode: '123' } )
        .expect(403)
        .end(done);
    });

    it('should return 400 when param is incomplete', function(done) {
      request
        .post('/auth/regist')
        .send( { name: "newname2" })
        .expect(400)
        .end(done);
    });
  });

  describe('#login', function() {
    it('should return 200 and cookie with right email and password', function(done) {
      request
        .post('/auth/login')
        .send( { email: user.email, password: user.password })
        .expect(200)
        .end(function (err, res) {
          cookies = res.headers['set-cookie'].join(' ').replace(/httponly |path=\/; |path=\/ |domain=localhost /ig, '');
          done(err);
        });
    });

    it('should return 400 when param is incomplete', function(done) {
      request
        .post('/auth/login')
        .send( { name: user.name })
        .expect(400)
        .end(done);
    });
  });

  describe('#get use info', function() {
    it('should return 200 and user', function(done) {
      request
        .get('/users/' + user.publicId)
        .set('Cookie', cookies)
        .expect(200)
        .end(function (err, res) {
          if (!err) {
            should.exist(res);
            var body = res.body;
            body.email.should.equal(user.email);
            body.name.should.equal(user.name);
            console.log(body);
          }
          done(err, res);
        });
    });

    it('should return 401 when without cookies', function(done) {
      request
        .get('/users/' + user.publicId)
        .expect(401)
        .end(done);
    });
  });

  describe('#update user info', function() {
    it('should return 200 with a name param', function(done) {
      request
        .put('/users/' + user.publicId)
        .set('Cookie',cookies)
        .send( { name: "AL" })
        .expect(200)
        .end(done);
    });
  });

  describe('#get info by email', function() {
    before(function(done) {
      redisClient.setex('captcha_chengke@test.com', 10, 1234, done);
    });
    it('should return 200 with a name param', function(done) {
      request
        .get('/auth/user/chengke@test.com/1234')
        .expect(200)
        .end(done);
    });
  });

  describe('#get captcha image', function() {
    it('should return 200 with a name param', function(done) {
      request
        .get('/auth/captcha-image/chengke@test.com')
        .expect(200)
        .end(done);
    });
  });

  describe('#login before reset password', function() {
    it('should return 200 with old password', function(done) {
      request
        .post('/auth/login')
        .send( { email: 'chengke@test.com', password: '123' })
        .expect(200)
        .end(function (err, res) {
          done(err);
        });
    });
  });

  describe('#reset password', function() {
    before(function(done) {
      redisClient.setex('valid_code_12345678901', 10, 1234, done);
    });
    it('should return 200', function(done) {
      request
        .put('/auth/reset-password/chengke@test.com')
        .send({
           mobile: "12345678901",
           newPassword: '345',
           validCode: "1234"
        })
        .expect(200)
        .end(done);
    });
  });

  describe('#login after reset password', function() {
    it('should return 200 with new password', function(done) {
      request
        .post('/auth/login')
        .send( { email: 'chengke@test.com', password: '123' })
        .expect(200)
        .end(function (err, res) {
          done(err);
        });
    });
  });

});
