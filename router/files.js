var multer = require('multer');
var mkdir = require('../dao/mkdir.js'); // 引入创建目录模块

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const { url } = req.body || {}; // 解构获取请求体中的数据
        mkdir.mkdirs('./data/' + url, err => {
            console.log('err:', err); // 打印创建目录结果
        }); // 创建目录
        cb(null, './data/' + url); // 设置文件上传目录
    },
    filename: function (req, file, cb) {
        const { user, name } = req.body || {}; // 解构获取请求体中的数据
        const type = file.originalname.replace(/.+\./, '.'); // 获取文件类型
        console.log('文件类型:', type); // 打印文件类型
        console.log('文件上传:', file); // 打印文件信息
        // 获取文件扩展名
        cb(null,  name + type); // 设置文件名
    }
});

var upload = multer({ storage: storage });

module.exports = function (app) {
    // 上传文件接口
    app.post('/files/upload', upload.array('file', 10), function (req, res, next) {
        let url = req.body.url
        let name = req.files[0].filename
        let imgurl = '/' + url + '/' + name // 拼接文件路径
        console.log('文件上传请求接收:', req.files[0].filename); // 打印请求体
        res.send({ code: 0, msg: '文件上传成功', data: imgurl }); // 返回成功信息
    });
}