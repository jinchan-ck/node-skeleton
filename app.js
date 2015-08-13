var koa = require('koa');
var config = require('config');
var gzip = require('koa-gzip');
var cors = require('koa-cors');
var logger = require('koa-logger');
var bodyParser = require('koa-bodyparser');

var route = require('./route/');
var session = require('./lib/session');
var errorHander = require('./middlewares/errorHander');
var permissionHander = require('./middlewares/permissionHander');

var app = koa();
var corsConfig = config.get('cors');

app.use(gzip());
app.use(logger());
app.use(bodyParser());
app.use(cors(corsConfig));

// custom middlewares
session.bind(app);
app.use(errorHander());
app.use(permissionHander());

route(app);

var port = process.env.PORT || 3000;

var server = app.listen(port, function () {
  console.log('Node server listening on : ', port);
});

module.exports = server;
