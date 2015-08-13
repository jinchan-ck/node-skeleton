var assert = require('assert');
var createError = require('http-errors');

var Exception = exports;

Exception.Types = {
  BadRequest: 400,
  Unauthorized: 401,
  RequestFailed: 402,
  Forbidden: 403,
  NotFound: 404,
  Conflict: 409,
  ServerError: 500,
  ResourceExists: 500
};

Exception.create = function exception(type, msg) {
  assert(type, 'Exception type required when create one.');
  return createError(type, msg);
};
