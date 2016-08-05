var Exception = require('../lib/exception');
var userService = require('../service/user');
var profileService = require('../service/profile');
var ValidCode = require('../lib/validation/valid-code');
var Captcha = require('../lib/validation/image-captcha');

module.exports = {
  init: init,
  login: login,
  getUser: getUser,
  createUser: createUser,
  updateUser: updateUser,
  checkEmail: checkEmail,
  checkMobile: checkMobile,
  getValidCode: getValidCode,
  captchaImage: captchaImage,
  getInfoByEmail: getInfoByEmail,
  resetPassword: resetPassword,
  updateProfile: updateProfile
};

/**
 * @apiDefine UserError
 * @apiError (Error) 404 UserNotFound, 用户未找到.
 * @apiError (Error) 401 Unauthorized, 请求未认证.
 */

/**
 * @apiDefine  NormalError
 * @apiError (Error) 500 ServerError, 服务器错误.
 * @apiError (Error) 400 BadRequest, 错误的请求.
 * @apiError (Error) 402 RequestFailed, 请求失败.
 */

/**
 * @apiGroup Auth
 * @apiName Login
 * @api {post} /auth/login Login
 * @apiDescription 用户登录接口.
 * @apiParam (Request body) {String} email 用户邮箱.
 * @apiParam (Request body) {String} password 用户密码.
 * @apiParamExample {json} Request-Example:
 *   {
 *    "email": String,
 *    "password": String
 *   }
 * @apiSuccessExample {text} Success-Response:
 *     HTTP/1.1 200 OK
 *     success
 * @apiUse NormalError
 * @apiUse UserError
 */
function* login() {
  var email = this.request.body.email;
  var password = this.request.body.password;

  if (!email || !password) {
    throw Exception.create(Exception.Types.BadRequest, 'The request param is bad.');
  }

  var user = yield userService.login(email, password);
  if (user) {
    this.session.publicId = user.publicId;
    this.session.name = user.name;
    this.session.email = user.email;
    this.status = 200;
    this.body = {
        headers: this.response.headers
    };
  } else {
    throw Exception.create(Exception.Types.UserNotFound, 'User not found.');
  }
}

/**
 * @apiGroup Auth
 * @apiName Regist
 * @api {post} /auth/regist Regist
 * @apiDescription 创建用户接口.
 * @apiParam (Request body) {String} email 用户唯一邮箱.
 * @apiParam (Request body) {String} mobile 手机号码.
 * @apiParam (Request body) {String} name 用户名.
 * @apiParam (Request body) {String} password 密码.
 * @apiParam (Request body) {String} validCode 验证码.
 * @apiParamExample {json} Request-Example:
 *   {
 *     "email": String,
 *     "mobile": String,
 *     "name": String,
 *     "password": String,
 *     "validCode", String
 *   }
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *   {
 *     "publicId": String,
 *     "emial": String,
 *     "mobile": String,
 *     "name": String,
 *     "createdDate": Date,
 *     "updatedDate": Date
 *   }
 * @apiUse NormalError
 * @apiUse UserError
 */
function* createUser() {
  var name = this.request.body.name;
  var email = this.request.body.email;
  var mobile = this.request.body.mobile;
  var password = this.request.body.password;
  var validCode = this.request.body.validCode;

  console.log('=====', this.request.body);

  if (!email || !name || !password || !mobile || !validCode) {
    throw Exception.create(Exception.Types.BadRequest, 'Missing params.');
  }

  yield ValidCode.valid(mobile, validCode);

  var user = yield userService.createUser(email, mobile, name, password);

  if (user) {
    var profile = yield profileService.create(user.publicId, user.get({ plain: true }));
    if (!profile) {
      throw Exception.create(Exception.Types.RequestFailed, 'Create profile failed.');
    }
    this.session.publicId = user.publicId;
    this.status = 200;
    this.body = transformUser(user);
  } else {
    throw Exception.create(Exception.Types.RequestFailed, 'Create user failed.');
  }
}

/**
 * @apiGroup User
 * @apiName GetUser
 * @api {get} /users/:id Get user
 * @apiDescription 获取用户信息接口
 * @apiParam (Path parameters) {Number} id 用户id
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 {
     "name": "林灿斌",
     "email": "lincanbin@liusha.info",
     "type": "CHANNEL",
     "role": "ENTERPRISE",
     "source": "未知",
     "mobile": "13726247339",
     "publicId": "c16e701f-1b3c-11e6-9a7e-00269e815e18",
     "profile": {
         "publicId": "ebfec605-223e-11e6-98d0-00269e815e18",
         "userId": "c16e701f-1b3c-11e6-9a7e-00269e815e18",
         "nickname": "林小姐",
         "avatar": "https://www.94cb.com/upload/avatar/large/173.png",
         "gender": "FEMALE",
         "qq": "2660350438",
         "wechat": "517038270",
         "address": "潮州",
         "email": "me@lincanbin.com",
         "mobile": "15814904455",
         "created_at": "2016-05-25T00:00:00.000Z",
         "updated_at": "2016-06-03T03:54:10.000Z"
     }
 }
 * @apiUse NormalError
 * @apiUse UserError
 */
function* getUser(id) {
  if (id === null) {
    throw Exception.create(Exception.Types.BadRequest, 'The request param is bad.');
  }

  var user = yield userService.getUser(id);

  if (user) {
    this.status = 200;
    this.body = transformUser(user);
  } else {
    throw Exception.create(Exception.Types.UserNotFound, 'User not found.');
  }
}

/**
 * @apiGroup Auth
 * @apiName CheckEmail
 * @api {get} /auth/email/:email Check Email
 * @apiDescription 检查邮件地址是否存在
 * @apiParam (Path parameters) {String} email 需要检查的email
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *   {
 *     exist: Boolean
 *   }
 * @apiUse NormalError
 * @apiUse UserError
 */
function* checkEmail(email) {
  if (email === null) {
    throw Exception.create(Exception.Types.BadRequest, 'Email required.');
  }

  var exist = yield userService.checkEmail(email);

  this.status = 200;
  this.body = { exist: !!exist };
}

/**
 * @apiGroup Auth
 * @apiName CheckMobile
 * @api {get} /auth/mobile/:mobile Check Mobile
 * @apiDescription 检查邮件地址是否存在
 * @apiParam (Path parameters) {String} mobile 需要检查的mobile
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *   {
 *     exist: Boolean
 *   }
 * @apiUse NormalError
 * @apiUse UserError
 */
function* checkMobile(mobile) {
  if (mobile === null) {
    throw Exception.create(Exception.Types.BadRequest, 'Mobile required.');
  }

  var exist = yield userService.checkMobile(mobile);

  this.status = 200;
  this.body = { exist: !!exist };
}

/**
 * @apiGroup Auth
 * @apiName GetValidCode
 * @api {get} /auth/valid-code/:mobile Get ValidCode
 * @apiDescription 获取短信验证码
 * @apiParam (Path parameters) {String} mobile 接收验证码的mobile
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 * @apiUse NormalError
 * @apiUse UserError
 */
function* getValidCode(mobile) {
  if (mobile === null) {
    throw Exception.create(Exception.Types.BadRequest, 'Mobile required.');
  }

  var success = yield ValidCode.sendValidCode(mobile);
  if (!success) {
    throw Exception.create(Exception.Types.ServerError, 'Send valid code failed.');
  }

  this.status = 200;
}

/**
 * @apiGroup User
 * @apiName UpdateUser
 * @api {put} /users/:id Update user
 * @apiDescription 更新用户信息.
 * @apiParam (Path parameters) {Number} id 用户id
 * @apiParam (Request body) {String} [name] 用户名.
 * @apiParam (Request body) {String} [newPassword] 新密码.
 * @apiParam (Request body) {String} [originalPassword] 原始密码, 与新密码同时存在.
 * @apiParamExample {json} Request-Example:
 *   {
 *     "name": String,
 *   }
 * @apiParamExample {json} Request-Example:
 *   {
 *     "newPassword": String,
 *     "originalPassword": String
 *   }
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  success
 * @apiUse NormalError
 * @apiUse UserError
 */
function* updateUser(id) {
  if (id === null) {
    throw Exception.create(Exception.Types.BadRequest, 'The request param is bad.');
  }
  if (id !== this.session.publicId) {
    throw Exception.create(Exception.Types.Unauthorized, 'Unauthorized');
  }

  var newPassword = this.request.body.newPassword;
  var originalPassword = this.request.body.originalPassword;

  if (newPassword && !originalPassword) {
    throw Exception.create(Exception.Types.BadRequest, 'The request param is bad.');
  }

  var success = yield userService.updateUser(id, this.request.body);
  if (success) {
    this.status = 200;
    this.body = "success";
  } else {
    throw Exception.create(Exception.Types.RequestFailed, 'Update user failed');
  }
}

/**
 * @apiGroup User
 * @apiName updateProfile
 * @api {put} /profile/:id Update profile
 * @apiDescription 更新用户联系信息.
 * @apiParam (Path parameters) {Number} id 用户id
 * @apiParam (Request body) {String} [nickname] 昵称.
 * @apiParam (Request body) {String} [avatar] 头像URL.
 * @apiParam (Request body) {ENUM} [gender] 性别，MALE, FEMALE, TRANS, AGENDER, ANDROGYNE.
 * @apiParam (Request body) {String} [qq] qq.
 * @apiParam (Request body) {String} [wechat] 微信.
 * @apiParam (Request body) {String} [address] 联系地址.
 * @apiParam (Request body) {String} [email] email.
 * @apiParam (Request body) {String} [mobile] 手机号.
 * @apiParamExample {json} Request-Example:
 *   {
 *     "name": String,
 *   }
 * @apiParamExample {json} Request-Example:
 *   {
 *     "newPassword": String,
 *     "originalPassword": String
 *   }
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  success
 * @apiUse NormalError
 * @apiUse UserError
 */
function* updateProfile(id) {
  if (id === null) {
    throw Exception.create(Exception.Types.BadRequest, 'The request param is bad.');
  }
  if (id !== this.session.publicId) {
    throw Exception.create(Exception.Types.Unauthorized, 'Unauthorized');
  }

  var nickname = this.request.body.nickname;
  var avatar = this.request.body.avatar;
  var email = this.request.body.email;
  var mobile = this.request.body.mobile;

  if (!nickname || !avatar || !email || !mobile) {
    throw Exception.create(Exception.Types.BadRequest, 'The request param is bad.');
  }

  var success = yield profileService.updateProfile(id, this.request.body);
  if (success) {
    this.status = 200;
    this.body = "success";
  } else {
    throw Exception.create(Exception.Types.RequestFailed, 'Update profile failed');
  }
}

/**
 * @apiGroup User
 * @apiName Init
 * @api {post} /users/init Init
 * @apiDescription 初始化接口，返回用户相关数据，或403
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *      "user": {
 *          "publicId": "85b0cf16-2241-11e6-8a5b-b0c090570f25",
 *          "name": "xxx",
 *          "email": "aaa@gmail.com",
 *          "mobile": "18510655240",
 *          "status": "ACTIVE",
 *          "source": "未知",
 *          "created_at": "2016-05-25T00:00:00.000Z",
 *          "updated_at": "2016-05-25T00:00:00.000Z",
 *          "profile": {
 *              "publicId": "38ceadff-ef07-44bd-ad8f-43467b96acc6",
 *              "userId": "85b0cf16-2241-11e6-8a5b-b0c090570f25",
 *              "nickname": "dog",
 *              "avatar": "",
 *              "gender": "MALE",
 *              "qq": "123456",
 *              "wechat": "abcde",
 *              "email": "abc@def.coms",
 *              "mobile": "18510655240",
 *              "created_at": "2016-05-25T00:00:00.000Z",
 *              "updated_at": "2016-05-26T00:00:00.000Z"
 *          }
 *      }
 * @apiUse NormalError
 * @apiUse UserError
 */
function* init() {
  var userId = this.session.publicId;
  var user = yield userService.getUser(userId, this.session.channelsId);

  if (user) {
    this.status = 200;
    this.body = user;
  } else {
    throw Exception.create(Exception.Types.UserNotFound, 'User not found.');
  }
}

function transformUser(user) {
  var response = {};
  response.id = user.id;
  response.name = user.name;
  response.email = user.email;
  response.type = user.type;
  response.role = user.role;
  response.statu = user.statu;
  response.source = user.source;
  response.mobile = user.mobile;
  response.publicId = user.publicId;
  response.profile = user.profile;
  response.createdDate = user.createdDate;
  response.updatedDate = user.updatedDate;
  return response;
}

/**
 * @apiGroup Forgot
 * @apiName captchaImage
 * @api {get} /auth/captcha-image/:email Get Captcha
 * @apiDescription 忘记密码时用来获取用户信息的验证码
 * @apiParam (Path parameters) {String} email 要取回账户的电子邮件地址
 * @apiUse NormalError
 * @apiUse UserError
 */
function* captchaImage(email) {
  var imgbase64 = yield Captcha.getImage(email);
  if (imgbase64) {
    this.status = 200;
    this.set({
      'Content-Type': 'image/png'
    });
    this.body = imgbase64;
  } else {
    throw Exception.create(Exception.Types.RequestFailed, 'get captcha image failed');
  }
}

/**
 * @apiGroup Forgot
 * @apiName Get user information by Email
 * @api {get} /auth/user/:email/:captchaCode Get User Email And Mobile
 * @apiDescription 忘记密码时用来获取用户手机和密码的
 * @apiParam (Path parameters) {String} email 要取回账户的电子邮件地址
 * @apiParam (Path parameters) {String} captchaCode 验证码.
  * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  {"email":"abc***@gmail.com","mobile":"137*****339"}
 * @apiUse NormalError
 * @apiUse UserError
 */
function* getInfoByEmail(email, captchaCode) {
  yield Captcha.valid(email, captchaCode);
  var userInfo = yield userService.getUserByEmail(email);
  if (!userInfo) {
    throw Exception.create(Exception.Types.UserNotFound, 'User not found.');
  }
  email = userInfo.get('email');
  email = email.substr(0, email.search('@') - 3) + '***' + email.substr(email.search('@'));
  var res = {};
  res.email = email;
  res.mobile = userInfo.get('mobile').substr(0, 3) + '*****' + userInfo.get('mobile').substr(8, 11);
  this.status = 200;
  this.body = res;
}

/**
 * @apiGroup Forgot
 * @apiName Reset password
 * @api {put} /auth/reset-password/:email Reset Password
 * @apiDescription 修改密码接口
 * @apiParam (Path parameters) {Number} email 用户email
 * @apiParam (Request body) {String} email 用户唯一邮箱.
 * @apiParam (Request body) {String} mobile 手机号码.
 * @apiParam (Request body) {String} newPassword 密码.
 * @apiParam (Request body) {String} validCode 验证码.
 * @apiParamExample {json} Request-Example:
 *   {
 *     "mobile": String,
 *     "newPassword": String,
 *     "validCode", String
 *   }
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *   success
 * @apiUse NormalError
 * @apiUse UserError
 */
function* resetPassword(email) {
  var mobile = this.request.body.mobile;
  var newPassword = this.request.body.newPassword;
  var validCode = this.request.body.validCode;

  if (!email || !newPassword || !mobile || !validCode) {
    throw Exception.create(Exception.Types.BadRequest, 'Missing params.');
  }

  yield ValidCode.valid(mobile, validCode);

  var result = yield userService.resetPassword(email, mobile, newPassword);

  if (!result) {
    throw Exception.create(Exception.Types.RequestFailed, 'Reset password failed.');
  }
  this.status = 200;
  this.body = 'success';
}
