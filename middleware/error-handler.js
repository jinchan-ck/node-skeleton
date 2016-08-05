var DatabaseError = require('sequelize').DatabaseError;
module.exports = function () {
  return function* (next) {
    try {
      yield next;
    } catch (err) {
      if (typeof err === 'string') {
        console.error(err);
        this.status = 403;
        this.body = err;
        return;
      }
      if (err instanceof DatabaseError) {
        console.error('sql error :');
      }
      console.error('err message: ', err, err.stack);
      this.status = err.status || 500;
      this.body = err.message;
    }
  };
};
