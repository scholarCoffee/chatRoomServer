var dbServer = require('../dao/dbserver.js'); // 引入数据操作模块

// 用户详情
exports.userDetail = function (req, res) {
    console.log('用户详情请求接收:', req.body); // 打印请求体
    const { id } = req.body; // 解构获取请求体中的数据
    dbServer.userDetail(id, res); // 调用查询用户函数
}

// 用户信息修改
exports.userUpdate = function (req, res) {
    // console.log('用户信息修改请求接收:', req.body); // 打印请求体
    let data = req.body; // 获取请求体
    dbServer.userUpdate(data, res); // 调用查询用户函数
}

// 修改好友昵称
exports.updateMarkName = function (req, res) {
    // console.log('好友昵称修改请求接收:', req.body); // 打印请求体
    let data = req.body; // 获取请求体
    dbServer.updateMarkName(data, res); // 调用查询用户函数
}

// 好友昵称获取
exports.getMarkName = function (req, res) {
    // console.log('好友昵称获取请求接收:', req.body); // 打印请求体
    let data = req.body; // 获取请求体
    dbServer.getMarkName(data, res); // 调用查询用户函数
}