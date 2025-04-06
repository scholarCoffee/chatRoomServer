// dbmodel.js
var mongoose = require('mongoose');
var db = require('../config/db.js');
var Schema = mongoose.Schema;

// 定义 UserInfo 的 Schema
const UserSchem = new Schema({
    name: { type: String }, // 用户名
    pwd: { type: String }, // 密码
    email: { type: String }, // 邮箱
    sex: { type: String, default: 'asexual' }, // 性别
    birth: { type: Date }, // 生日
    phone: { type: Number }, // 手机号
    explain: { type: String }, // 个人说明
    imgurl: { type: String, default: 'user.png' }, // 头像地址
    register: { type: Date, default: Date.now }, // 注册时间
});

// 好友表
const FriendSchema = new Schema({
    userID: { type: Schema.Types.ObjectId, ref: 'User' }, // 用户ID
    friendID: { type: Schema.Types.ObjectId, ref: 'User' }, // 好友ID
    state: { type: Number }, // 好友状态 0-已为好友 1-申请中 2-申请发送对方，对方未同意
    time: { type: Date, default: Date.now }, // 生成时间
    lastTime: { type: Date, default: Date.now }, // 最后一次聊天时间
});

// 一对一消息表
const MessageSchema = new Schema({
    userID: { type: Schema.Types.ObjectId, ref: 'User' }, // 用户ID
    friendID: { type: Schema.Types.ObjectId, ref: 'User' }, // 好友ID
    message: { type: String }, // 消息内容
    types: { type: Number, default: 0 }, // 消息类型 0-文本 1-图片 2-音频连接
    time: { type: Date, default: Date.now }, // 发送时间
    state: { type: Number, default: 0 }, // 消息状态 0-未读 1-已读
});

// 群表
const GroupSchema = new Schema({
    userID: { type: Schema.Types.ObjectId, ref: 'User' }, // 创建者ID
    name: { type: String }, // 群名称
    imgurl: { type: String, default: 'group.png' }, // 群头像地址
    time: { type: Date, default: Date.now }, // 创建时间
    notice: { type: String }, // 群公告
});

// 群成员表
const GroupUserSchema = new Schema({
    groupID: { type: Schema.Types.ObjectId, ref: 'Group' }, // 群ID
    userID: { type: Schema.Types.ObjectId, ref: 'User' }, // 用户ID
    name: { type: String }, // 用户名
    tip: { type: Number, default: 0 }, // 提示 未读消息树
    time: { type: Date, default: Date.now }, // 加入时间
    shield: { type: Number, default: 0 }, // 是否屏蔽 0-不屏蔽 1-屏蔽
});

// 群消息表
const GroupMessageSchema = new Schema({
    groupID: { type: Schema.Types.ObjectId, ref: 'Group' }, // 群ID
    userID: { type: Schema.Types.ObjectId, ref: 'User' }, // 用户ID
    message: { type: String }, // 消息内容
    types: { type: Number }, // 消息类型 0-文本 1-图片 2-音频连接
    time: { type: Date, default: Date.now }, // 发送时间
});
// 导出 UserInfo 模型
module.exports = db.model('User', UserSchem, 'userInfo') // 用户模型, // 用户模型
module.exports = db.model('Friend', FriendSchema, 'friend') // 好友模型
module.exports = db.model('Message', MessageSchema, 'message') // 一对一消息模型
module.exports = db.model('Group', GroupSchema, 'group') // 群模型
module.exports = db.model('GroupUser', GroupUserSchema, 'groupUser') // 群成员模型
module.exports = db.model('GroupMessage', GroupMessageSchema, 'groupMessage') // 群消息模型
