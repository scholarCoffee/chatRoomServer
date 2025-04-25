var dbmodel = require('../model/dbmodel.js'); // 引入数据模型
var bcrypt = require('./bcrypt.js'); // 引入 bcrypt 模块
var User = dbmodel.model('User'); // 引入用户模型
var Friend = dbmodel.model('Friend'); // 引入好友模型
var Message = dbmodel.model('Message'); // 引入消息模型
var Group = dbmodel.model('Group'); // 引入群模型
var GroupUser = dbmodel.model('GroupUser'); // 引入群成员模型
var GroupMessage = dbmodel.model('GroupMessage'); // 引入群消息模型
                                                                                  
var jwt = require('./jwt.js'); // 引入 jwt 模块 

// 新建用户
exports.buildUser = function (name, mail, pwd, res) {
    var salt = bcrypt.encryption(pwd); // 加密密码
    var data = new User({
        name: name,
        email: mail,
        pwd: salt,
        time: new Date(), // 注册时间
    });
    let user = new User(data)
    user.save()
    .then(result => {
        console.log('注册成功！'); // 打印成功信息
        res.send({
            code: 200,
            msg: '注册成功！',
            data: result // 返回注册成功的用户数据
        }); // 返回成功信息给前端
    })
    .catch(err => {
        console.log(err); // 打印错误信息
        res.send('注册失败！'); // 返回失败信息给前端
    });
}

// 匹配用户表元素个数
exports.countUserValue = function (data, type, res) {
    let wherestr = {}
    wherestr[type] = data
    User.countDocuments(wherestr)
    .then(count => {
        console.log('匹配用户查询成功！'); // 打印成功信息
        res.send({
            code: 200,
            msg: '匹配用户查询成功！',
            data: count // 返回查询到的元素个数
        }); // 返回成功信息给前端
    })
    .catch(err => {
        console.log(err); // 打印错误信息
        res.send('匹配用户查询失败！'); // 返回失败信息给前端
    });
}

// 用户验证
exports.userMatch = function (data, pwd, res) {
    let wherestr = {
        $or: [
            { 'name': data }, // 用户名
            { 'email': data } // 邮箱
        ]
    }
    let out = {
        'name': 1,
        'imgurl': 1,
        'pwd':1 
    }
    console.log('查询条件:', wherestr); // 打印查询条件
    console.log('查询输出:', out); // 打印查询输出
    User.find(wherestr, out)
    .then(result => {
        console.log('查询成功！', result); // 打印成功信息
        if (result?.length > 0) {
            result.map(item => {
                const pwdMatch = bcrypt.verification(pwd, item.pwd); // 验证密码
                if (pwdMatch) {
                    console.log('密码匹配成功！'); // 打印成功信息
                    let token = jwt.generateToken(item._id); // 生成token
                    let back = {
                        name: item.name,
                        imgurl: item.imgurl,
                        token: token, // 返回token
                        id: item._id // 返回用户ID
                    }
                    res.send({
                        code: 200,
                        msg: '登录成功！',
                        data: back // 返回登录成功的用户数据
                    }); // 返回成功信息给前端
                } else {
                    console.log('密码匹配失败！'); // 打印失败信息
                    res.send({
                        code: 400,
                        msg: '密码错误！'
                    }); // 返回失败信息给前端
                }
            })  
        } else {
            console.log('用户不存在！'); // 打印失败信息
            res.send({
                code: 300,
                msg: '用户不存在！'
            }); // 返回失败信息给前端
        }
    })
}  

// 搜索用户
exports.searchUser = function (body, res) {
    const { data } = body || {} // 解构获取请求体中的数据
    let wherestr = {
        $or: [
            { 'name': { $regex: data } }, // 用户名模糊查询
            { 'email': { $regex: data } } // 邮箱模糊查询
        ]
    }
    let out = {
        'name': 1,
        'email': 1,
        'imgurl': 1
    }
    User.find(wherestr, out)
    .then(result => {
        console.log('查询成功！'); // 打印成功信息
        res.send({
            code: 200,
            msg: '查询成功！',
            data: result // 返回查询到的用户数据
        }); // 返回成功信息给前端
    })
    .catch(err => {
        console.log(err); // 打印错误信息
        res.send('查询失败！'); // 返回失败信息给前端
    });
}

// 判断是否为好友
exports.isFriend = function (uid, fid, res) {
    Friend.findOne({
        $or: [
            { 'userID': uid, 'friendID': fid, 'state': 0 }, // 用户ID和好友ID
        ]
    })
    .then(result => {
        console.log('查询成功！'); // 打印成功信息
        console.log('查询结果:', result); // 打印查询结果
        if (result) {
            res.send({
                code: 200,
                msg: '已是好友！',
                data: result // 返回查询到的好友数据
            }); // 返回成功信息给前端
        } else {
            res.send({
                code: 400,
                msg: '不是好友！'
            }); // 返回失败信息给前端
        }
    })
    .catch(err => {
        console.log(err); // 打印错误信息
        res.send('查询失败！'); // 返回失败信息给前端
    });
}

// 搜索群
exports.searchGroup = function (data, res) {
    let wherestr = {
       'name': { $regex: data } // 群名称模糊查询
    }
    let out = {
        'name': 1,
        'imgurl': 1
    }
    Group.find(wherestr, out)
    .then(result => {
        console.log('查询成功！'); // 打印成功信息
        res.send({
            code: 200,
            msg: '查询成功！',
            data: result // 返回查询到的群数据
        }); // 返回成功信息给前端
    })
    .catch(err => {
        console.log(err); // 打印错误信息
        res.send('查询失败！'); // 返回失败信息给前端
    });
}

// 判断是否在群内
exports.isInGroup = function (uid, gid, res) {
    GroupUser.findOne({ 'userID': uid, 'groupID': gid }) // 用户ID和群ID
    .then(result => {
        console.log('查询成功！'); // 打印成功信息
        console.log('查询结果:', result); // 打印查询结果
        if (result) {
            res.send({
                code: 400,
                msg: '不在群内！'
            }); // 返回失败信息给前端
        } else {
            res.send({
                code: 200,
                msg: '已在群内！',
                data: result // 返回查询到的群成员数据
            }); // 返回成功信息给前端
        }
    })
    .catch(err => {
        console.log(err); // 打印错误信息
        res.send('查询失败！'); // 返回失败信息给前端
    });
}

// 判断是否是好友，如果是好友则判断是否在群里面
exports.isInGroupByFriend = function (uid, fid, gid, res) {
    let wherestr = {
        $or: [
            { 'userID': uid, 'friendID': fid, 'state': 0 }, // 用户ID和好友ID
        ]
    }
    Friend.findOne(wherestr) // 查询好友
    .then(result => {
        console.log('查询成功！'); // 打印成功信息
        console.log('查询结果:', result); // 打印查询结果
        if (result) {
            GroupUser.findOne({ 'userID': fid, 'groupID': gid }) // 用户ID和群ID
            .then(result => {
                console.log('查询成功！'); // 打印成功信息
                console.log('查询结果:', result); // 打印查询结果
                if (result) {
                    res.send({
                        code: 400,
                        msg: '不在群内！'
                    }); // 返回失败信息给前端
                } else {
                    res.send({
                        code: 200,
                        msg: '已在群内！',
                        data: result // 返回查询到的群成员数据
                    }); // 返回成功信息给前端
                }
            })
        } else {
            res.send({
                code: 300,
                msg: '不是好友！'
            }); // 返回失败信息给前端
        }
    })
    .catch(err => {
        console.log(err); // 打印错误信息
        res.send('查询失败！'); // 返回失败信息给前端
    });
}

// 用户详情
exports.userDetail = function (uid, res) {
    let wherestr = {
        '_id': uid // 用户ID
    }
    let out = {
        'pwd': 0, // 不返回密码
    }
    User.findOne(wherestr, out)
    .then(result => {
        console.log('查询成功！'); // 打印成功信息
        res.send({
            code: 200,
            msg: '查询成功！',
            data: result // 返回查询到的用户数据
        }); // 返回成功信息给前端
    })
    .catch(err => {
        console.log(err); // 打印错误信息
        res.send('查询失败！'); // 返回失败信息给前端
    });
}

function update(uId, toData, res) {
    console.log('更新数据uId:', uId)
    console.log('更新目标数据：', toData)
    User.findByIdAndUpdate(uId, toData, { new: true }) // 更新用户信息
    .then(result => {
        // console.log('更新成功！', result); // 打印成功信息
        res.send({
            code: 200,
            msg: '更新成功！',
            data: result // 返回更新后的用户数据
        }); // 返回成功信息给前端
    })
    .catch(err => {
        console.log(err); // 打印错误信息
        res.send('更新失败！'); // 返回失败信息给前端
    });
}

// 用户信息修改
exports.userUpdate = function (req, res) {
    let updatestr = {}
    const { pwd, uid, type, data } = req // 解构获取请求体中的数据
    // 判断是否有密码
    if (typeof pwd !== 'undefined') {
        User.find({
            '_id': uid // 用户ID
        }, {
            'pwd': 1 // 只查询密码
        })
        .then(result => {
            console.log('查询成功: ', result); // 打印成功信息
            result.map(item => {
                const pwdMatch = bcrypt.verification(pwd, item.pwd); // 验证密码
                if (pwdMatch) {
                    console.log('密码匹配成功！'); // 打印成功信息
                    // 如果修改密码需加密
                    if (type === 'pwd') {
                        updatestr[type] = bcrypt.encryption(data); // 加密密码
                        console.log('更新数据:', updatestr); // 打印更新数据
                        update(uid, updatestr, res) // 调用更新函数
                    } else {
                        updatestr[type] = data // 其他字段直接赋值
                        User.countDocuments(updatestr) // 查询是否有重复数据
                        .then(count => {
                            console.log('查询成功！'); // 打印成功信息
                            if (count === 0) {
                                update(uid, updatestr, res) // 调用更新函数
                            } else {
                                
                                res.send({
                                    code: 300,
                                    msg: '数据已存在！'
                                }); // 返回失败信息给前端
                            }
                        })
                        .catch(err => {
                            console.log(err); // 打印错误信息
                            res.send('查询失败！'); // 返回失败信息给前端
                        });
                    }
                } else {
                    console.log('密码匹配失败！'); // 打印失败信息
                    res.send({
                        code: 400,
                        msg: '密码错误！'
                    }); // 返回失败信息给前端
                }
            })
        })
    } else if(type === 'name') {
        updatestr[type] = data // 其他字段直接赋值
        User.countDocuments(updatestr) // 查询是否有重复数据
        .then(count => {
            console.log('查询成功！'); // 打印成功信息
            if (count === 0) {
                update(uid, updatestr, res) // 调用更新函数
            } else {
                res.send({
                    code: 300,
                    msg: '数据已存在！'
                }); // 返回失败信息给前端
            }
        })
        .catch(err => {
            console.log(err); // 打印错误信息
            res.send('查询失败！'); // 返回失败信息给前端
        });
    } else {
        updatestr[type] = data
        update(uid, updatestr, res) // 调用更新函数
    }
}

// 修改好友昵称
exports.updateMarkName = function (data, res) {
    const { uid, fid, name } = data // 解构获取请求体中的数据
    let wherestr = {
        'userID': uid, // 用户ID
        'friendID': fid // 好友ID
    }
    let updatestr = {
        'markname': name
    }
    Friend.findOneAndUpdate(wherestr, updatestr, { new: true }) // 更新好友昵称
    .then(result => {
        console.log('好友昵称更新成功！'); // 打印成功信息
        res.send({
            code: 200,
            msg: '好友昵称更新成功！',
            data: result // 返回更新后的好友数据
        }); // 返回成功信息给前端
    })
    .catch(err => {
        console.log(err); // 打印错误信息
        res.send('好友昵称更新失败！'); // 返回失败信息给前端
    });
}

// 获取好友昵称
exports.getMarkName = function (data, res) {
    const { uid, fid } = data // 解构获取请求体中的数据
    let wherestr = {
        'userID': uid, // 用户ID
        'friendID': fid // 好友ID
    }
    let out = {
        'markname': 1 // 只查询好友昵称
    }
    Friend.findOne(wherestr, out) // 查询好友昵称
    .then(result => {
        console.log('查询成功！'); // 打印成功信息
        res.send({
            code: 200,
            msg: '查询成功！',
            data: result // 返回查询到的好友数据
        }); // 返回成功信息给前端
    })
    .catch(err => {
        console.log(err); // 打印错误信息
        res.send('查询失败！'); // 返回失败信息给前端
    });
}

// 添加好友表
exports.buildFriend = function (uid, fid, state, res) {
    let data = {
        'userID': uid, // 用户ID
        'friendID': fid, // 好友ID
        'state': state, // 好友状态
        'time': new Date(), // 添加时间
        'lastTime': new Date(), // 最后聊天时间
    }
    let friend = new Friend(data) // 创建好友模型
    friend.save()
    .then(result => {
        console.log('添加好友成功！', result); // 打印成功信息
    })
    .catch(err => {
        console.log(err); // 打印错误信息
        res.send('添加好友失败！'); // 返回失败信息给前端
    });
}

// 好友最后通讯时间
exports.updateFriendLastTime = function (data, res) {
    const { uid, fid } = data // 解构获取请求体中的数据
    let wherestr = {
        $or: [{
            'userID': uid, // 用户ID
            'friendID': fid // 好友ID
        }, {
            'userID': fid, // 用户ID
            'friendID': uid // 好友ID 
        }]
    }
    let updatestr = {
        'lastTime': new Date() // 更新最后通讯时间
    }
    console.log(Friend)
    Friend.updateMany(wherestr, updatestr) // 更新好友最后通讯时间
    .then(result => {
        // console.log('好友最后通讯时间更新成功！', result); // 打印成功信息
    })
    .catch(err => {
        console.log(err); // 打印错误信息
        res.send('更新失败！'); // 返回失败信息给前端
    });
}


// 添加一对一消息
exports.insertMsg = function(uid, fid, msg, type, res) {
    let data = {
        'userID': uid, // 用户ID
        'friendID': fid, // 好友ID
        'message': msg, // 消息内容
        'types': type, // 消息类型
        'time': new Date(), // 消息时间
        'state': 1 // 消息状态  0已读 1未读
    }
    // console.log('添加消息数据:', data); // 打印添加消息数据
    let message = new Message(data) // 创建消息模型
    message.save()
    .then(result => {
        // console.log('添加消息成功！'); // 打印成功信息
        if (res) {
            res.send({
                code: 200,
                msg: '添加消息成功！',
                data: result // 返回添加成功的消息数据
            }); // 返回成功信息给前端
        }

    })
    .catch(err => {
        console.log(err); // 打印错误信息
        if (res) {
            res.send('添加消息失败！'); // 返回失败信息给前端
        }
    });
}
// 好友申请
exports.applyFriend = function (data, res) {
    // 判断是否已经申请过
    let wherestr = {
        'userID': data.uid, // 用户ID
        'friendID': data.fid, // 好友ID
    }
    Friend.countDocuments(wherestr) // 查询好友申请表是否有记录
    .then(count => {
        console.log('查询成功！'); // 打印成功信息
        if (count === 0) {
            this.buildFriend(data.uid, data.fid, 2, res) // 调用添加好友函数
            this.buildFriend(data.fid, data.uid, 1, res) // 调用添加好友函数
        } else {
            console.log('已申请过！'); // 打印失败信息
            this.updateFriendLastTime(data) // 更新最后通讯时间
        }
        this.insertMsg(data.uid, data.fid, data.msg, data.type, res) // 调用添加消息函数
    })
    .catch(err => {
        console.log(err); // 打印错误信息
        res.send('查询失败！'); // 返回失败信息给前端
    });
}

// 更新好友状态
exports.updateFriendState = function (data, res) {
    const { uid, fid } = data // 解构获取请求体中的数据
    let wherestr = {
        $or: [{
            'userID': uid, // 用户ID
            'friendID': fid // 好友ID
        }, {
            'userID': fid, // 用户ID
            'friendID': uid // 好友ID
        }]
    }
    Friend.updateMany(wherestr, {'state': 0 }) // 更新好友状态
    .then(result => {
        console.log('好友状态更新成功！', result); // 打印成功信息
        res.send({
            code: 200,
            msg: '好友状态更新成功！',
            data: result // 返回更新后的好友数据
        }); // 返回成功信息给前端
    })
}

// 拒绝或者删除好友
exports.deleteFriend = function (data, res) {
    const { uid, fid } = data // 解构获取请求体中的数据
    let wherestr = {
        $or: [{
            'userID': uid, // 用户ID
            'friendID': fid // 好友ID
        }, {
            'userID': fid, // 用户ID
            'friendID': uid // 好友ID
        }]
    }
    Friend.deleteMany(wherestr) // 删除好友
    .then(result => {
        console.log('删除好友成功！', result); // 打印成功信息
        res.send({
            code: 200,
            msg: '删除好友成功！',
            data: result // 返回删除后的好友数据
        }); // 返回成功信息给前端
    })
}

// 按要求获取用户列表
exports.getOnlyUsers = function(data, res) {
    return new Promise((resolve) => {
        const { uid, state } = data // 解构获取请求体中的数据
        return resolve(Friend.find({}).where({
            'userID': uid, // 用户ID
            'state': state // 好友状态
        })
        .populate('friendID')
        .sort({ 'lastTime': -1 }) // 按时间排序
        .exec())
    })
    .then(result => {
        let data = result.map(item => {
            return {
                id: item.friendID._id, // 好友ID
                name: item.friendID.name, // 好友名称
                imgurl: item.friendID.imgurl, // 好友头像
                markname: item.markname, // 好友备注名
                time: item.time, // 
                lastTime: item.lastTime, // 最后通讯时间
                chatType: 0 // 代表私聊
            }
        })
        if (res) {
            res.send({
                code: 200,
                msg: '查询成功！',
                data: data // 返回查询到的用户数据
            }) // 返回成功信息给前端
        }
        return Promise.resolve(data)
    })
    .catch(err => {
        if (res) {
            res.send('查询失败！'); // 返回失败信息给前端
        }
       return Promise.reject(err) // 返回错误信息
    });

}

// 按要求获取一对一消息
exports.getOneMsg = function(data, res) {
    return new Promise((resolve) => {
        const { uid, fid } = data // 解构获取请求体中的数据
        return resolve(Message.findOne({}).where({
            $or: [{
                'userID': uid, // 用户ID
                'friendID': fid // 好友ID
            }, {
                'userID': fid, // 用户ID
                'friendID': uid // 好友ID
            }]
        }).sort({ 'time': -1 }) // 按时间排序
        .exec())
    })
    .then(result => {
        if(res) {
            res.send({
                code: 200,
                msg: '查询成功！',
                data: result // 返回查询到的用户数据
            })
        }

        return Promise.resolve(result)
    })
    .catch(err => {
        console.log(err); // 打印错误信息
        if (res) {
            res.send('查询失败！'); // 返回失败信息给前端
        }
        return Promise.reject(err)
    });
    
}

// 汇总一对一消息未读取
exports.unreadSelfMsg = function(data, res) {
    return new Promise((resolve) => {
        const { uid, fid } = data // 解构获取请求体中的数据
        let wherestr = {
            'userID': fid, // 用户ID
            'friendID': uid, // 好友ID
            'state': 1 // 消息状态 
        }
        return resolve(Message.countDocuments(wherestr)) // 查询未读消息数量
    })
    .then(count => {
        // console.log('查询一对一汇总消息数量：', count); // 打印成功信息
        if (res) {
            res.send({
                code: 200,
                msg: '查询成功！',
                data: count // 返回查询到的未读消息数量
            })
        }
        return Promise.resolve(count)
    })
    .catch(err => {
        console.log(err); // 打印错误信息
        if (res) {
            res.send('查询失败！'); // 返回失败信息给前端
        }
        return Promise.reject(err)
    });
}

// 汇总一对一消息未读取
exports.unreadGroupMsg = function(data, res) {
    return new Promise((resolve) => {
        const { gid } = data // 解构获取请求体中的数据
        let wherestr = {
            'groupID': gid, // 群组ID
            'state': 1 // 消息状态 
        }
        // console.log('汇总一对一未读消息', wherestr)
        return resolve(GroupMessage.countDocuments(wherestr)) // 查询未读消息数量
    })
    .then(count => {
        // console.log('查询一对一汇总消息数量：', count); // 打印成功信息
        if (res) {
            res.send({
                code: 200,
                msg: '查询成功！',
                data: count // 返回查询到的未读消息数量
            })
        }
        return Promise.resolve(count)
    })
    .catch(err => {
        console.log(err); // 打印错误信息
        if (res) {
            res.send('查询失败！'); // 返回失败信息给前端
        }
        return Promise.reject(err)
    });
}

exports.getFriendsInMsg = async (data, res) => {
    const { uid } = data // 解构获取请求体中的数据
    try {
        let friend = await this.getOnlyUsers(data) // 获取用户列表
        // console.log('获取用户列表成功！', friend); // 打印成功信息
        for(let i = 0; i < friend.length; i++) {
            let result = await this.getOneMsg({ uid: uid, fid: friend[i].id }) // 获取一对一消息
            // console.log('获取一对一消息成功！', result); // 打印成功信息
            result = result || {}
            if (result.types == 0) {
                
            } else if (result.types == 1) {
                result.message = '[图片]'
            } else if (result.types == 2) { 
                result.message = '[音频]'
            } else if (result.types == 3) {
                result.message = '[位置]'
            }
            friend[i].msg = result.message || '' // 将消息内容添加到用户列表中
            let readTip = await this.unreadSelfMsg({ uid: uid, fid: friend[i].id }) // 获取未读消息数量
            friend[i].tip = readTip // 将未读消息数量添加到用户列表中
        }
        // console.log('获取最终用户信息！', friend); // 打印成功信息
        res.send({
            code: 200,
            msg: '查询成功！',
            data: friend // 返回查询到的用户数据
        }) // 返回成功信息给前端
    } catch (err) {
        console.log(err); // 打印错误信息
        res.send('查询失败！'); // 返回失败信息给前端
    }
}

exports.getGroupInMsg = async (data, res) => {
    const { uid } = data // 解构获取请求体中的数据
    try {
        let group = await this.getOnlyGroup(uid) // 获取用户列表
        for(let i = 0; i < group.length; i++) {
            let result = await this.getOneGroupMsg({ gid: group[i].id})
            if (result) {
                if (result.types == 0) {
                
                } else if (result.types == 1) {
                    result.message = '[图片]'
                } else if (result.types == 2) { 
                    result.message = '[音频]'
                } else if (result.types == 3) {
                    result.message = '[位置]'
                }
                group[i].msg = result.message // 将消息内容添加到用户列表中
                // console.log('result:', result)
                group[i].username = result.userID && result.userID.name // 将用户名称添加到用户列表中
                let readGroupTip = await this.unreadGroupMsg({  uid: uid, gid: group[i].id })
                group[i].tip = readGroupTip
            }
        }
        // console.log('获取最终群信息！', group); // 打印成功信息
        res.send({
            code: 200,
            msg: '查询成功！',
            data: group // 返回查询到的用户数据
        }) // 返回成功信息给前端
    } catch (err) {
        console.log(err); // 打印错误信息
        res.send('查询失败！'); // 返回失败信息给前端
    }
}


// 一对一消息状态修改
exports.updateMsg = function(data, res) {
    const { uid, fid } = data // 解构获取请求体中的数据
    let wherestr = {
        'userID': fid, // 用户ID
        'friendID': uid, // 好友ID
        'state': 1 // 消息状态 
    }
    let updatestr = {
        'state': 0 // 修改消息状态为已读
    }
    Message.updateMany(wherestr, updatestr) // 更新消息状态
    .then(result => {
        console.log('更新成功！', result); // 打印成功信息
        if (res) {
            res.send({
                code: 200,
                msg: '更新成功！',
                data: result // 返回更新后的消息数据
            })
        }

    })
    .catch(err => {
        console.log('更新失败！', err); // 打印错误信息
        if (res) {
            res.send('更新失败！'); // 返回失败信息给前端
        }
        
    });
}

// 新建群
exports.createGroup = function (data, res) {
    const { uid, name, imgurl, groupUserInfo } = data // 解构获取请求体中的数据
    let groupData = {
        'userID': uid, // 用户ID
        'name': name, // 群名称
        'imgurl': imgurl, // 群头像
        'time': new Date(), // 创建时间
    }
    let group = new Group(groupData) // 创建群模型
    group.save()
    .then(result => {
        console.log('创建群成功！', result); // 打印成功信息
        let wherestr = {
            'userID': uid, // 用户ID
            'name': name
        }
        let updatestr = {
            '_id': 1 
        }
        return Group.find(wherestr, updatestr) // 查询群成员表是否有记录  
    })
    .then(result => {
        console.log('查询成功！', result); // 打印成功信息
        const groupID = result[0]._id
        console.log('当前群ID：', groupID); // 打印当前群ID
        groupUserInfo.push(uid)
        return Promise.all(groupUserInfo.map(value => { 
            const param = {
                groupID: groupID, // 群ID
                userID: value, // 用户ID
                time: new Date(), // 加入时间
                lastTime: new Date(), // 最后聊天时间
            }
            console.log('添加群成员数据:', param); // 打印添加群成员数据
            this.addGroupUser(param) // 调用添加群成员函数
        }))
    })
    .then(() => {
        res.send({
            code: 200,
            msg: '创建群成功！'
        }); // 返回成功信息给前端
    })
    .catch(err => {
        console.log(err); // 打印错误信息
        res.send('创建群失败！'); // 返回失败信息给前端
    });
}

// 获取群详情
exports.getGroupDetail = function (data, res) {
    const { gid } = data // 解构获取请求体中的数据
    let groupInfo = {} // 初始化群信息
    let wherestr = {
        '_id': gid // 群ID
    }
    Group.findOne(wherestr) // 查询群详情
    .then(result => {
        console.log('查询群信息成功！', result); // 打印成功信息
        groupInfo = result // 将查询到的群信息赋值给groupInfo
        // 查询群成员信息
        let groupUser = GroupUser.find({})
        return groupUser.where({
            'groupID': gid // 群ID
        })
        .populate('userID') // 关联用户ID
        .sort({ 'lastTime': -1 }) // 按时间排序
        .exec()
    })
    .then(result => {
        console.log('查询群成员信息成功！', result); // 打印成功信息
        const groupMemberList = result.map(item => {
            return {
                uid: item.userID._id,
                name: item.userID.name,
                imgurl: item.userID.imgurl
            }
        })
        const data = {
            groupInfo,
            groupMemberList
        }
        res.send({
            code: 200,
            msg: '查询成功！',
            data // 返回查询到的群信息
        }); // 返回成功信息给前端
    })
    .catch(err => {
        console.log(err); // 打印错误信息
        res.send('查询失败！'); // 返回失败信息给前端
    });
}

// 添加群成员
exports.addGroupUser = function (data, res) {
    let groupUser = new GroupUser(data) // 创建群成员模型
    groupUser.save()
    .then(result => {
        console.log('添加群成员成功！', result); // 打印成功信息
        if (res) {
            res.send({
                code: 200,
                msg: '添加群成员成功！',
                data: result // 返回添加成功的群成员数据
            }); // 返回成功信息给前端
        }
    })
    .catch(err => {
        console.log(err); // 打印错误信息
        if (res) { 
            res.send('添加群成员失败！'); // 返回失败信息给前端
        }
    });
}

// 删除群成员
exports.deleteGroupUser = function (data, res) {
    const { gid, uid } = data // 解构获取请求体中的数据
    let wherestr = {
        'groupID': gid, // 群ID
        'userID': uid // 用户ID
    }
    GroupUser.deleteMany(wherestr) // 删除群成员
    .then(result => {
        console.log('删除群成员成功！', result); // 打印成功信息
        if (res) {
            res.send({
                code: 200,
                msg: '删除群成员成功！',
                data: result // 返回删除后的群成员数据
            }); // 返回成功信息给前端
        }
    })
    .catch(err => {
        console.log(err); // 打印错误信息
        if (res) {
            res.send('删除群成员失败！'); // 返回失败信息给前端
        }
    });
}

// 删除群
exports.deleteGroup = function (data, res) {
    const { gid } = data // 解构获取请求体中的数据
    let wherestr = {
        '_id': gid // 群ID
    }
    Group.deleteMany(wherestr) // 删除群
    .then(result => {
        console.log('删除群成功！', result); // 打印成功信息
        // 删除群相关的群成员
        let groupUser = GroupUser.find({})
        return groupUser.where({
            'groupID': gid // 群ID
        })
        .deleteMany()
        .exec()
    })
    .then(result => {
        console.log('删除群成员成功！', result); // 打印成功信息
        if (res) {
            res.send({
                code: 200,
                msg: '删除群成功！',
                data: result // 返回删除后的群成员数据
            }); // 返回成功信息给前端
        }
    })
    .catch(err => {
        console.log(err); // 打印错误信息
        if (res) {
            res.send('删除群失败！'); // 返回失败信息给前端
        }
    });
}

// 更新群信息
exports.updateGroup = function (data, res) {
    const { gid, value, type } = data || {}// 解构获取请求体中的数据
    let wherestr = {
        '_id': gid // 群ID
    }
    let updatestr = {}
    updatestr[type] = value
    Group.findOneAndUpdate(wherestr, updatestr, { new: true }) // 更新群信息
    .then(result => {
        console.log('更新群信息成功！', result); // 打印成功信息
        if (res) {
            res.send({
                code: 200,
                msg: '更新群信息成功！',
                data: result // 返回更新后的群数据
            }); // 返回成功信息给前端
        }
    })
    .catch(err => {
        console.log(err); // 打印错误信息
        if (res) {
            res.send('更新群信息失败！'); // 返回失败信息给前端
        }
    });
}

// 添加群消息
exports.insertGroupMsg = function(data, res) {
    let groupMessage = new GroupMessage(data) // 创建群消息模型
    groupMessage.save()
    .then(result => {
        // console.log('添加群消息成功！', result); // 打印成功信息
        if (res) {
            res.send({
                code: 200,
                msg: '添加群消息成功！',
                data: result // 返回添加成功的群消息数据
            }); // 返回成功信息给前端
        }
    })
    .catch(err => {
        console.log(err); // 打印错误信息
        if (res) {
            res.send('添加群消息失败！'); // 返回失败信息给前端
        }
    });
}


// 按要求获取群列表
exports.getOnlyGroup = function(uid, res) {
    return new Promise((resolve, reject) => {
        let query = GroupUser.find({})
        query.where({
            'userID': uid // 用户ID
        })
        .populate('groupID')
        .sort({ 'lastTime': -1 }) // 按时间排序
        .exec()
        .then(result => {
            // console.log('查询群列表成功！', result); // 打印成功信息
            let data = result.map(item => {
                return {
                    id: item.groupID._id, // 群ID
                    userID: item.userID._id, // 用户ID
                    name: item.groupID.name, // 群名称
                    markname: item.name, // 群备注名
                    imgurl: item.groupID.imgurl, // 群头像
                    lastTime: item.lastTime, // 加入时间
                    chatType: 1 // 代表群聊
                }
            })
            resolve(data) // 返回查询到的群数据
            if (res) {
                res.send({
                    code: 200,
                    msg: '查询成功！',
                    data: data // 返回查询到的群数据
                })
            }
        })
        .catch(err => {
            console.log(err); // 打印错误信息
            reject(err)
            if (res) {
                res.send('查询失败！'); // 返回失败信息给前端
            }
        });
    })

}

// 按要求获取群消息
exports.getOneGroupMsg = function(data, res) {
    return new Promise((resolve, reject) => {
        const { gid } = data // 解构获取请求体中的数据
        let query = GroupMessage.findOne({})
        query.where({
            'groupID': gid // 群ID
        })
        .populate('groupID')
        .populate('userID') // 关联用户ID
        .sort({ 'time': -1 }) // 按时间排序
        .exec()
        .then(result => {
            // console.log('群消息：', result)
            if (res) {
                res.send({
                    code: 200,
                    msg: '查询成功！',
                    data: result // 返回查询到的群消息数据
                })
            }
            resolve(result)
        })
        .catch(err => {
            console.log(err); // 打印错误信息
            reject(err)
            if (res) {
                res.send('查询失败！'); // 返回失败信息给前端
            }
        });
    })
}

// 更新群消息时间
exports.updateGroupMessageLastTime = function(data, res) {
    const { groupID } = data // 解构获取请求体中的数据
    let wherestr = {
        'groupID': groupID // 群ID
    }
    let updatestr = {
        'lastTime': new Date() // 更新最后聊天时间
    }
    GroupUser.updateMany(wherestr, updatestr) // 更新群消息时间
    .then(result => {
        // console.log('群消息时间更新成功！', result); // 打印成功信息
        if (res) {
            res.send({
                code: 200,
                msg: '群消息时间更新成功！',
                data: result // 返回更新后的群消息数据
            })
        }
    })
    .catch(err => {
        console.log(err); // 打印错误信息
        if (res) {
            res.send('更新失败！'); // 返回失败信息给前端
        }
    });
}

// 群消息状态修改
exports.updateGroupMsg = function(data, res) {
    const { gid } = data // 解构获取请求体中的数据
    let wherestr = {
        'groupID': gid, // 群ID
        'state': 1 // 消息状态 
    }
    let updatestr = {
        'state': 0 // 修改消息状态为已读
    }
    GroupMessage.updateMany(wherestr, updatestr) // 更新消息状态
    .then(result => {
        // console.log('更新成功！', result); // 打印成功信息
        if (res) {
            res.send({
                code: 200,
                msg: '更新成功！',
                data: result // 返回更新后的消息数据
            })
        }
    })
    .catch(err => {
        console.log(err); // 打印错误信息
        if (res) {
            res.send('更新失败！'); // 返回失败信息给前端
        }
    });
}

// 消息操作
// 分页获取数据一对一聊天数据
exports.getSelfMsg = function (data, res) {
    const { nowPage, pageSize, uid, fid } = data // 解构获取请求体中的数据
    const skipNum = (nowPage - 1) * pageSize // 计算跳过的数量
    Message.find({})
    .where({
        $or: [{
            'userID': uid, // 用户ID
            'friendID': fid // 好友ID
        }, {
            'userID': fid, // 用户ID
            'friendID': uid // 好友ID
        }]
    })
    .sort({ 'time': -1 }) // 按时间排序
    .skip(skipNum) // 跳过指定数量
    .populate('userID') // 关联查询用户信息
    .limit(pageSize) // 限制返回数量
    .exec()
    .then(result => {
        // console.log('聊天消息', result)
        const data = result.map(item => {
            return {
                id: item._id, // 消息ID
                message: item.message, // 消息内容
                time: item.time, // 消息时间
                types: item.types, // 消息类型
                fromId: item.userID._id, // 发送者ID
                userId: item.friendID, // 用户ID
                imgurl: item.userID.imgurl, // 发送者头像
            }
        })
        res.send({
            code: 200,
            msg: '查询成功！',
            data: data // 返回查询到的消息数据
        }) // 返回成功信息给前端
        // 更新消息状态为已读
        this.updateMsg({ uid: uid, fid: fid }) // 调用更新消息状态函数
    })
    .then(result => {
        // console.log('更新成功！', result); // 打印成功信息
    })
    .catch(err => {
        console.log(err); // 打印错误信息
        res.send('查询失败！'); // 返回失败信息给前端
    });
}


// 分页获取数据一对一聊天数据
exports.getGroupMsg = function (data, res) {
    const { nowPage, pageSize, uid, gid } = data // 解构获取请求体中的数据
    const skipNum = (nowPage - 1) * pageSize // 计算跳过的数量
    GroupMessage.find({})
    .where({
        'groupID': gid // 群ID
    })
    .sort({ 'time': -1 }) // 按时间排序
    .skip(skipNum) // 跳过指定数量
    .populate('userID') // 关联查询用户信息
    .limit(pageSize) // 限制返回数量
    .exec()
    .then(result => {
        // console.log('聊天消息', result)
        const data = result.map(item => {
            return {
                id: item._id, // 消息ID
                message: item.message, // 消息内容
                time: item.time, // 消息时间
                types: item.types, // 消息类型
                fromId: item.userID._id, // 发送者ID
                groupId: item.groupID, // 群ID
                name: item.userID.name, // 发送者名称
                imgurl: item.userID.imgurl, // 发送者头像
            }
        })
        res.send({
            code: 200,
            msg: '查询成功！',
            data: data // 返回查询到的消息数据
        }) // 返回成功信息给前端
        // 更新消息状态为已读
        this.updateGroupMsg({ uid: uid, gid: gid }) // 调用更新消息状态函数
    })
    .then(result => {
        // console.log('更新成功！', result); // 打印成功信息
    })
    .catch(err => {
        console.log(err); // 打印错误信息
        res.send('查询失败！'); // 返回失败信息给前端
    });
}