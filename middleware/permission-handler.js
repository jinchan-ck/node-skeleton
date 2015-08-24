var Exception = require('../lib/exception');

module.exports = function () {
  return function* (next) {
    if (process.env.NODE_ENV === 'DEBUG') {
      this.session = JSON.parse(this.request.header.cookie);
      return yield* next;
    }
    if (([ '/noop' ].indexOf(this.path) === -1) && (!this.session || !this.session.id)) {
      throw Exception.create(Exception.Types.Unauthorized, 'Unauthorized');
    }
    yield* next;
  };
};
