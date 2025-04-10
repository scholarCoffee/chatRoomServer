var dbserver = require('../dao/dbserver.js'); // 引入数据操作模块

exports.msg = function (req, res) {
    console.log('聊天请求接收:', req.body); // 打印请求体
    let data = req.body; // 获取请求体
    dbserver.msg(data, res); // 调用查询用户函数
}