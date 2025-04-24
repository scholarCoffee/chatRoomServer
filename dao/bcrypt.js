var bcrypt = require('bcryptjs');

exports.encryption = function (password) {
    console.log('输入的密码:', password); // 打印原始密码
    // 生成盐值
    var salt = bcrypt.genSaltSync(10);
    // 使用盐值加密密码
    var hash = bcrypt.hashSync(password, salt);
    console.log('加密后的密码:', hash); // 打印加密后的密码
    return hash; // 返回加密后的密码
}

exports.verification = function (password, hash) {
    // console.log('输入的密码:', password); // 打印原始密码 
    // console.log('数据库的原密码:', hash); // 打印加密后的密码
    // 验证密码是否匹配
    var match = bcrypt.compareSync(password, hash);
    // console.log('密码验证结果:', match); // 打印验证结果
    return match; // 返回验证结果
}

