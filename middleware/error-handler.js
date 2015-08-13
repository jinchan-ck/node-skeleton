var DatabaseError = require('sequelize').DatabaseError;
module.exports = function () {
  return function* (next) {
    try {
      yield next;
    } catch (err) {
      if (err instanceof DatabaseError) {
        console.error('sql error :');
      }
      console.error(err, err.stack);
      this.status = err.status || 500;
      this.body = err;
    }
  };
};
