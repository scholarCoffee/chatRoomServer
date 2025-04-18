var dbserver = require('../dao/dbserver.js'); // 引入数据操作模块

exports.getFriend = function (req, res) {
    console.log('好友请求接收:', req.body); // 打印请求体
    const data = req.body; // 解构获取请求体中的数据
    if (data.state == 0) {
        dbserver.doIt(data, res); // 调用查询用户函数
    } else {
        dbserver.getUsers(data, res); 
    }
    
}

// 获取最后一条消息
exports.getLastMsg = function (req, res) {
    console.log('最后一条消息请求接收:', req.body); // 打印请求体
    const data = req.body; // 解构获取请求体中的数据
    dbserver.getOneMsg(data, res); // 调用查询用户函数
}

// 获取未读消息
exports.unreadMsg = function (req, res) {
    console.log('未读消息请求接收:', req.body); // 打印请求体
    const data = req.body; // 解构获取请求体中的数据
    dbserver.unreadMsg(data, res); // 调用查询用户函数
}

// 更新已读消息
exports.updateMsg = function (req, res) {
    console.log('已读消息请求接收:', req.body); // 打印请求体
    const data = req.body; // 解构获取请求体中的数据
    dbserver.updateMsg(data, res); // 调用查询用户函数
}

// 新建群
exports.createGroup = function (req, res) {
    console.log('新建群请求接收:', req.body); // 打印请求体
    const data = req.body; // 解构获取请求体中的数据
    dbserver.createGroup(data, res); // 调用查询用户函数
}

// 获取群列表
exports.getGroup = function (req, res) {
    console.log('群组请求接收:', req.body); // 打印请求体
    const { uid } = req.body; // 解构获取请求体中的数据
    dbserver.getGroup(uid, res); // 调用查询用户函数
}

// 获取最后一条消息
exports.getLastGroupMsg = function (req, res) {
    console.log('最后一条群消息请求接收:', req.body); // 打印请求体
    const data = req.body; // 解构获取请求体中的数据
    dbserver.getOneGroupMsg(data, res); // 调用查询用户函数
}

// 群消息标已读
exports.updateGroupMsg = function (req, res) {
    console.log('已读群消息请求接收:', req.body); // 打印请求体
    const data = req.body; // 解构获取请求体中的数据
    dbserver.updateGroupMsg(data, res); // 调用查询用户函数
}
