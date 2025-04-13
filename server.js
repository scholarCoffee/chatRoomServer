const express = require('express');
const app = express();
const post = 3000;
const cors = require('cors');
const ip = require('ip');
const ipAddress = ip.address();
const bodyParser = require('body-parser');
var jwt = require('./dao/jwt.js'); // 引入 jwt 模块
var server = app.listen(8002)
var io = require('socket.io')(server)
require('./dao/socket.js')(io)
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '50mb' // 设置请求体大小限制为 50mb
}));

app.use(bodyParser.json({
    limit: '50mb' // 设置请求体大小限制为 50mb
}));
app.use(cors());
app.use(express.static(__dirname + '/data'));

require('./router/files.js')(app); // 引入文件上传路由模块
require('./router/index.js')(app); // 引入路由模块

// token判断
app.use((req, res, next) => {
    const { token } = req.body || {} 
    if (typeof token !== 'undefined') {
        let tokenMatch = jwt.verifyToken(token); // 验证token
        console.log('tokenMatch:', tokenMatch); // 打印token验证结果
        if (tokenMatch.code !== 200) {
            return res.status(401).send('Unauthorized'); // 如果token不合法，返回401错误
        }
    } else {
        next()
    }
    // 这里可以添加token验证逻辑
    // if (!req.headers['authorization']) {
    //     return res.status(401).send('Unauthorized');
    // }
    next();
});

// 404页面
app.use((req, res) => {
    res.status(404).send('404 Not Found');
});
// 500页面
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('500 Server Error');
});

console.log('IP Address:', ipAddress);
app.listen(post, ipAddress, () => {
    console.log(`Server is running on http://${ipAddress}:${post}`);
});
