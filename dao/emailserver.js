// 引用发送邮件插件
const nodemailer = require('nodemailer');
const credentials = require('../config/credentials.js'); // 引入配置文件

const transporter = nodemailer.createTransport({
    service: 'qq',
    auth: {
        user: credentials.qq.user,
        pass: credentials.qq.pass
    }
})

exports.emaliSignUp = function(email, res) {
    // 邮件内容
    const mailOptions = {
        from: credentials.qq.user,
        to: email,
        subject: '注册验证码',
        text: '欢迎注册在线聊天室！\n\n'
    };

    // 发送邮件
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log('Error occurred:', error);
        } else {
            console.log('Email sent:', info.response);
            res.send('邮件发送成功！'); // 返回成功信息给前端
        }
    });
}