const express = require('express');
const app = express();
const post = 3000;
const cors = require('cors');
const ip = require('ip');
const ipAddress = ip.address();
const bodyParser = require('body-parser');
var jwt = require('./dao/jwt.js'); // 引入 jwt 模块

app.use(bodyParser.json()); // 解析 application/x-www-form-urlencoded
app.use(cors());

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
