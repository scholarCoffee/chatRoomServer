var dbserver = require('../dao/dbserver.js'); // 引入数据操作模块

// 新建群
exports.createGroup = function (req, res) {
    console.log('新建群请求接收:', req.body); // 打印请求体
    let data = req.body; // 获取请求体
    dbserver.createGroup(data, res); // 调用查询用户函数
}