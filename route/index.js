var route = require('koa-route');

var user = require('./user.js');

module.exports = function (app) {
  app.use(route.get('/noop', function* (next) {
    this.body = 'ok';
    yield* next;
  }));

  /*
   User API
   */
  app.use(route.post('/auth/login', user.login));
  app.use(route.post('/auth/regist', user.createUser));
  app.use(route.get('/auth/email/:email', user.checkEmail));
  app.use(route.get('/auth/mobile/:mobile', user.checkMobile));
  app.use(route.get('/auth/valid-code/:mobile', user.getValidCode));

  app.use(route.get('/auth/captcha-image/:email', user.captchaImage));
  app.use(route.get('/auth/user/:email/:captchaCode', user.getInfoByEmail));
  app.use(route.put('/auth/reset-password/:email', user.resetPassword));

  app.use(route.get('/users/:id', user.getUser));
  app.use(route.post('/users', user.createUser));
  app.use(route.put('/users/:id', user.updateUser));
  app.use(route.post('/users/init', user.init));

  app.use(route.put('/profile/:id', user.updateProfile));
};
