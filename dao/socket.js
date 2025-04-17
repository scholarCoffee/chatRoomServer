let dbServer = require('./dbserver')

module.exports = function(io) {
    var users = {}
    io.on('connection', socket => {
        socket.on('login', id => {
            console.log('用户登录：', id)
            socket.name = id
            users[id] = socket.id // 将用户id和socket.id存储在users对象中   
            socket.emit('msg', socket.id)
        })

        socket.on('msg', (msg, fromid, toid) => {
            console.log('发送消息：', msg)
            console.log('发送用户：', fromid)
            console.log('接收用户：', toid)
            dbServer.upFriendLastTime({ uid: fromid, fid: toid }) // 更新最后一条消息时间
            dbServer.insertMsg(fromid, toid, msg.message, msg.types)
            if (users[toid]) {
                socket.to(users[toid]).emit('msg', msg, fromid, 0) // 发送消息给自己   
            }
            socket.emit('msg', msg, toid, 1)
        })

        socket.on('disconnecting', () => {
            console.log('用户断开连接:', socket.id) // 打印断开连接的socket.id
            if (users.hasOwnProperty(socket.name)) {
                delete users[socket.name] // 从users对象中删除断开连接的用户
            }
            console.log('当前在线用户:', users) // 打印当前在线用户
        })

        socket.on('group', data => {
            socket.join(data)
        })

        socket.on('groupMsg', (msg, fromid, gid, name, img) => {
            socket.to(gid).emit('groupmsg', msg, fromid, gid, name, img, 0) // 发送消息给群组
            
            socket.emit('groupmsg', msg, fromid, gid, name, img, 1) // 
        })

        socket.on('leaveChatRoom', (uid, fid) => {
            socket.emit('leavechatroom', uid, fid) // 发送离开聊天室的消息
        })
    })
}