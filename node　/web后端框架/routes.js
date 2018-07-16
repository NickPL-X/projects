const fs = require('fs')
const log = require('./utils')

const models = require('./models')
const User = models.User
const Message = models.Message

// 使用一个全局变量来暂时保存 message 信息
const messageList = []

// 读取 html 文件的函数
// 把页面的内容写入到 html 文件中, 专注处理逻辑
const template = (name) => {
    const path = 'templates/' + name
    const options = {
        encoding: 'utf8'
    }
    const content = fs.readFileSync(path, options)
    return content
}

// 主页的处理函数, 返回主页的响应
const index = () => {
    const header = 'HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n'
    const body = template('index.html')
    const r = header + '\r\n' + body
    return r
}

// 登录的处理函数, 根据请求方法来处理业务
const login = (request) => {
    let result
    if (request.method === 'POST') {
        // 获取表单中的数据
        const form = request.form()
        // 根据 form 生成 User 实例
        const u = User.create(form)
        if (u.validateLogin()) {
            result = '登录成功'
        } else {
            result = '用户名或者密码错误'
        }
    } else {
        result = ''
    }
    const header = 'HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n'
    let body = template('login.html')
    // 使用{{label}} 在页面里做一个记号, 直接替换掉这部分内容
    body = body.replace('{{result}}', result)
    const r = header + '\r\n' + body
    return r
}

// 注册的处理函数
const register = (request) => {
    let result
    if (request.method === 'POST') {
        const form = request.form()
        const u = User.create(form)
        if (u.validateRegister()) {
            // 如果 u 这个实例符合注册条件, 就调用 save 函数, 将这个 u 保存到文件中
            u.save()
            const us = User.all()
            result = `注册成功<br><pre>${us}</pre>`
        } else {
            result = '用户名或者密码长度必须大于2'
        }
    } else {
        result = ''
    }
    const header = 'HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n'
    let body = template('register.html')
    body = body.replace('{{result}}', result)
    const r = header + '\r\n' + body
    return r
}

// 留言板的处理函数, 返回留言板的响应
const message = (request) => {
    if (request.method === 'POST') {
        const form = request.form()
        const m = Message.create(form)
        log('debug post', form, m)
        messageList.push(m)
    }
    const header = 'HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n'
    let body = template('message.html')
    const s = messageList.map((m) => {
        return m.toString()
    }).join('<br>')
    body = body.replace('{{messages}}', s)
    const r = header + '\r\n' + body
    return r
}

// 图片的响应函数, 读取图片并生成响应返回
const static = (request) => {
    // 静态资源的处理, 读取图片并生成相应返回
    const filename = request.query.file || 'doge.gif'
    const path = `static/${filename}`
    const body = fs.readFileSync(path)
    const header = 'HTTP/1.1 200 OK\r\nContent-Type: image/gif\r\n\r\n'
    const h = Buffer.from(header)
    const r = Buffer.concat([h, body])
    return r
}

// 把 route 放在一起, 然后暴露出去
const routeMapper = {
    '/': index,
    '/static': static,
    '/login': login,
    '/register': register,
    '/message': message,
}

module.exports = routeMapper
