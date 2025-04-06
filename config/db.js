// db.js
var mongoose = require('mongoose');
var dbUrl = 'mongodb://localhost:27017/xuzc';
var db = mongoose.createConnection(dbUrl);

db.on('error', function (err) {
    console.error('数据库连接失败：', err);
});

db.once('open', function () {
    console.log('数据库连接成功！');
});

module.exports = db;