var crypto = require('crypto');

exports.md5 = md5;
exports.random = random;
exports.getRandomIntInclusive = getRandomIntInclusive;

function md5(input) {
  var _md5 = crypto.createHash('md5');
  _md5.update(input);
  return _md5.digest('hex');
}

function random (num) {
  var buf = crypto.randomBytes(num);
  var token = buf.toString('hex');
  return token;
}

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
