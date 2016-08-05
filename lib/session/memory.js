var LRU = require("lru-cache");

function MemStore(cache) {
  this.cache = cache;
}

MemStore.prototype.get = function (ssid) {
  this.get(ssid);
};

MemStore.prototype.set = function (ssid, sess) {
  this.set(ssid, sess);
};

MemStore.prototype.destroy = function (ssid) {
  this.del(ssid);
};

module.exports = function () {
  var cache = LRU({
    maxAge: 1000 * 60 * 60 * 48
  });
  return MemStore(cache);
};
