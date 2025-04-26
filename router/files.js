const multer = require('multer');
const path = require('path');
const mkdir = require('../dao/mkdir.js'); // 引入创建目录模块

/**
 * 允许的文件类型
 * @type {Array}
 */
const ALLOWED_FILE_TYPES = ['.jpg', '.jpeg', '.png', '.gif', '.mp3', '.mp4', '.doc', '.pdf', '.txt'];

/**
 * 最大文件大小(10MB)
 * @type {Number}
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * 文件存储配置
 */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const { url } = req.body || {};
        
        if (!url) {
            return cb(new Error('未提供上传目录路径'), false);
        }
        
        // 创建目录
        mkdir.mkdirs('../data/' + url, err => {
            if (err) {
                console.error('创建目录失败:', err);
                return cb(new Error('创建目录失败'), false);
            }
            
            console.log('文件上传目录:', './data/' + url);
            cb(null, './data/' + url);
        });
    },
    filename: function (req, file, cb) {
        const { name } = req.body || {};
        
        if (!name) {
            return cb(new Error('未提供文件名'), false);
        }
        
        // 获取文件扩展名
        const extname = path.extname(file.originalname).toLowerCase();
        console.log('文件类型:', extname);
        
        // 检查文件类型
        if (!ALLOWED_FILE_TYPES.includes(extname)) {
            return cb(new Error('不支持的文件类型'), false);
        }
        
        console.log('文件名:', name);
        cb(null, name + extname);
    }
});

/**
 * 文件过滤器
 * @param {Object} req - 请求对象
 * @param {Object} file - 文件对象
 * @param {Function} cb - 回调函数
 */
const fileFilter = (req, file, cb) => {
    // 检查文件类型
    const extname = path.extname(file.originalname).toLowerCase();
    
    if (!ALLOWED_FILE_TYPES.includes(extname)) {
        return cb(new Error('不支持的文件类型'), false);
    }
    
    // 检查文件大小
    if (parseInt(req.headers['content-length']) > MAX_FILE_SIZE) {
        return cb(new Error('文件大小超出限制'), false);
    }
    
    cb(null, true);
};

/**
 * 文件上传配置
 */
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE
    }
});

/**
 * 统一响应格式
 * @param {number} code - 状态码
 * @param {string} msg - 提示信息
 * @param {object} data - 响应数据
 * @returns {object} 统一格式的响应对象
 */
const response = (code, msg, data = null) => {
    return { code, msg, data };
};

/**
 * 路由配置
 * @param {Object} app - Express应用实例
 */
module.exports = function (app) {
    // 上传文件接口
    app.post('/files/upload', (req, res) => {
        upload.array('file', 10)(req, res, (err) => {
            if (err) {
                console.error('文件上传错误:', err);
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).send(response(400, '文件大小超出限制'));
                }
                return res.status(400).send(response(400, err.message));
            }
            
            if (!req.files || req.files.length === 0) {
                return res.status(400).send(response(400, '未检测到上传的文件'));
            }
            
            try {
                const { filename } = req.files[0];
                const url = req.body.url || '';
                const resultFile = '/' + url + '/' + filename;
                
                console.log('文件上传成功:', resultFile);
                res.send(response(0, '文件上传成功', resultFile));
            } catch (error) {
                console.error('处理上传文件时出错:', error);
                res.status(500).send(response(500, '服务器内部错误'));
            }
        });
    });
};