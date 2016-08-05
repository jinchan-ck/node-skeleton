var request = require('request');
var smsConfig = require('config').get('sms');

var Utils = require('../../utils');
var coRedis = require('../cache/co-redis')();

var ValidCode = exports;

ValidCode.valid = function* (mobile, validCode) {
  var realCode = yield coRedis.get('valid_code_' + mobile);
  var pass = realCode === validCode;
  if (!pass) {
    return Promise.reject('Valid code mismatch.');
  }
  return Promise.resolve(true);
};

ValidCode.sendValidCode = function* (mobile) {
  var url = smsConfig.url;
  var validCode = Utils.getRandomIntInclusive(1000, 9999);

  var data = {
    mobile: mobile,
    captcha: validCode,
    appid: smsConfig.appid
  };

  var success = yield new Promise(function(resolve, reject) {
    request({
      url: url,
      method: "POST",
      headers: {
        'content-type': 'application/json'
      },
      json: data
    },function (err, response, body) {
      console.log('body is: ', body);
      if (!err && response.statusCode === 200) {
        return resolve(body && !body.code && validCode);
      }
      reject(err);
    });
  });
  if (success) {
    return yield coRedis.setex('valid_code_' + mobile, 60, validCode);
  }
};
