let dbServer = require('./dbserver')

module.exports = function(io) {
    const users = {}
    io.on('connection', socket => {
        socket.on('login', id => {
            console.log('用户登录：', id)
            socket.name = id
            if (!users[id]) {
                users[id] = socket.id // 将用户id和socket.id存储在users对象中
            }
        })

        socket.on('msgServer', (msg, fromid, toid) => {
            console.log('发送消息：', msg)
            console.log('发送用户：', fromid)
            console.log('接收用户：', toid)
            dbServer.updateFriendLastTime({ uid: fromid, fid: toid }) // 更新最后一条消息时间
            dbServer.insertMsg(fromid, toid, msg.message, msg.types)
            if (users[toid]) {
                socket.to(users[toid]).emit('msgChatRoomFront', msg, fromid) // 发送消息给自己   
            }
            socket.emit('msgFront', msg, toid)
        })

        socket.on('disconnecting', () => {
            console.log('用户断开连接:', socket.id) // 打印断开连接的socket.id
            if (users.hasOwnProperty(socket.name)) {
                // 从users对象中删除断开连接的用户
                delete users[socket.name]

            }
            console.log('当前在线用户:', users) // 打印当前在线用户
        })

        socket.on('groupServer', id => {
            // 当前已经加入无需加入
            if (socket.rooms.has(id)) {
                console.log('已经加入该群组:', id)
                return
            }
            socket.join(id) // 加入群组
        })

        socket.on('groupMsgServer', data => {
            console.log('发送群组消息：', JSON.stringify(data))
            const { msg, userID, groupID, name, imgurl } = data
            // 插入群组消息
            dbServer.insertGroupMsg({
                groupID: groupID,
                userID: userID,
                message: msg.message,
                types: msg.types
            })
            dbServer.updateGroupMsg({ userID: userID, groupID: groupID }) // 更新最后一条消息时间
            dbServer.updateGroupMessageLastTime({ groupID: groupID }) // 更新最后一条消息时间
            socket.to(gid).emit('groupMsgChatRoomFront', {
                msg: msg,
                userID: userID,
                groupID: groupID,
                name: name,
                imgurl: imgurl
            }) // 发送消息给群组
            socket.emit('groupMsgFront', {
                msg: msg,
                userID: userID,
                groupID: groupID,
                name: name,
                imgurl: imgurl
            }) 
        })

        socket.on('leaveChatRoomServer', (uid, fid) => {
            socket.emit('leaveChatRoomFront', uid, fid) // 发送离开聊天室的消息
        })
    })
}