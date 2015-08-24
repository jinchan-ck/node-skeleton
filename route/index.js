var route = require('koa-route');

module.exports = function (app) {
  app.use(route.get('/noop', function* (next) {
    this.body = 'ok';
    yield* next;
  }));
};
