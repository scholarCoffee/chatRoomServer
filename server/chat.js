var dbserver = require('../dao/dbServer.js'); // 引入数据操作模块

exports.getSelfMsg = function (req, res) {
    // console.log('聊天请求接收:', req.body); // 打印请求体
    let data = req.body; // 获取请求体
    dbserver.getSelfMsg(data, res); // 调用查询用户函数
}

exports.getGroupMsg = function (req, res) {
    // console.log('群聊天请求接收:', req.body); // 打印请求体
    let data = req.body; // 获取请求体
    dbserver.getGroupMsg(data, res); // 调用查询用户函数
}