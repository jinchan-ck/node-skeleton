var Captchapng = require('captchapng');
var wrapper = require('co-redis');
var redisClient = require('redis').createClient();

var Captcha = exports;
var redisCo = wrapper(redisClient);

Captcha.valid = function* (email, captchaCode) {
  var realCode = yield redisCo.get('captcha_' + email);
  var pass = realCode === captchaCode;
  if (!pass) {
    return Promise.reject('captcha code mismatch.');
  }
  return Promise.resolve(true);
};

Captcha.getImage = function* (email) {
  var captchaCode = parseInt(Math.random() * 9000 + 1000);
  var p = new Captchapng(80, 30, captchaCode); // width,height,numeric captcha
  p.color(0, 0, 0, 0);  // First color: background (red, green, blue, alpha)
  p.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha)

  var img = p.getBase64();
  var imgbase64 = new Buffer(img,'base64');
  var writeCaptcha = yield redisCo.setex('captcha_' + email, 600, captchaCode);
  if (writeCaptcha) {
    return imgbase64;
  }
};
