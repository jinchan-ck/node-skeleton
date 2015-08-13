var RedisStore = require('koa-redis');
var redisConfig = require('config').get('redis');

module.exports = function () {
  return new RedisStore(redisConfig);
};
