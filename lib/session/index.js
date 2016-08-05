var session = require('koa-generic-session');
var sessionStore = require('config').get('session');

var store = require('./' + sessionStore.store);

var bind = function (app) {
  app.use(session({
    store: store(),
    cookie: {
      maxage: sessionStore.cookieExpire
    }
  }));
};

module.exports = {
  bind: bind
};
