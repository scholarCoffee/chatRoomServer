var dbServer = require('../dao/dbserver.js'); // 引入数据操作模块

exports.signIn = function (req, res) {
    console.log('登录请求接收:', req.body); // 打印请求体
    const { name, pwd } = req.body; // 解构获取请求体中的数据
    dbServer.userMatch(name, pwd, res); // 调用查询用户函数
}