var redis = require('redis');
var wrapper = require('co-redis');
var redisConfig = require('config').get('redis');

module.exports = function () {
  var redisClient = redis.createClient(redisConfig.port, redisConfig.host);
  return wrapper(redisClient);
};
