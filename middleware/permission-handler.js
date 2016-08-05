var Exception = require('../lib/exception');

const publicRoutes = [ '/noop', '/auth', 'favicon.ico', '/public' ];

module.exports = function () {
  return function* (next) {
    var self = this;
    var isPublicRoute = publicRoutes.filter(function (publicRoute) {
      return self.path.indexOf(publicRoute) !== -1;
    });
    if (isPublicRoute && isPublicRoute.length) {
      return yield* next;
    }
    if (!this.session || !this.session.publicId) {
      throw Exception.create(Exception.Types.Unauthorized, 'Unauthorized');
    }
    yield* next;
  };
};
