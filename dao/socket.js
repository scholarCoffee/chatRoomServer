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
            if (users[toid]) {
                socket.to(users[toid]).emit('msg', msg, fromid) // 发送消息给自己   
            }
        })

        socket.on('disconnecting', () => {
            console.log('用户断开连接:', socket.id) // 打印断开连接的socket.id
            if (users.hasOwnProperty(socket.name)) {
                delete users[socket.name] // 从users对象中删除断开连接的用户
            }
            console.log('当前在线用户:', users) // 打印当前在线用户
        })
    })
}