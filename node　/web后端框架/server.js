// 引入内置模块
const net = require('net')
const fs = require('fs')

// 引入自定义模块
// Request 是 封装了请求的类
const Request = require('./request')
// routeMapper 是路由 object
const routeMapper = require('./routes')
const log = require('./utils')

// 错误请求的响应函数
const error = (code=404) => {
    const e = {
        404: 'HTTP/1.1 404 NOT FOUND\r\n\r\n<h1>NOT FOUND</h1>',
    }
    const r = e[code] || ''
    return r
}

// 解析 path 的函数
// path 可能的取值
// /home
// /message?content=hello&author=sss
// 返回包含 path 和 query 的 object
const parsedPath = (path) => {
    /*
     * content=hello&author=gua
     * {
     *     'message': 'hello',
     *     'author': 'gua',
     * }
     */
    // 先判断 path 中是否包含 ?
    const index = path.indexOf('?')
    // 如果不包含 ?, query 是一个空对象
    if (index === -1) {
        return {
            path: path,
            query: {},
        }
    } else {
        // 如果包含 ?, 则按照 ? 将请求中的 path 分成 path 和 query
        const l = path.split('?')
        path = l[0]

        // 解析 query
        // query 的格式为 a=b&c=d&e=f
        const search = l[1]
        const args = search.split('&')
        const query = {}
        for (let arg of args) {
            const [k, v] = arg.split('=')
            query[k] = v
        }
        return {
            path: path,
            query: query,
        }
    }
}

// 响应函数
// 生成 request 对应的响应函数
const responseFor = (request) => {
    const raw = request.raw
    const raws = raw.split(' ')

    // request 是自定义的对象, 使用这个对象来保存请求的相关信息
    // 比如 method, path, query, body
    request.method = raws[0]
    let pathname = raws[1]
    let { path, query } = parsedPath(pathname)
    request.path = path
    request.query = query
    request.body = raw.split('\r\n\r\n')[1]
    log('path and query', path, query)

    // 定义一个基本的 route, 是一个空 object
    const route = {}
    // 然后将引入进来的 routeMapper 与 route 合并
    // Object.assign 的作用是合并多个(这里是 2 个) object, 然后将合并后的 object 返回
    const routes = Object.assign(route, routeMapper)
    // 获取 response 函数
    const response = routes[path] || error
    // 将 request 作为 response 的参数传出去, 这样每一个 response 都可以与对应的 request 挂钩
    return response(request)
}

// 把逻辑放在单独的函数中, 这样可以方便地调用
// 指定了默认的 host 和 port, 因为用的是默认参数, 可以在调用的时候传其他的值
const run = (host='', port=3000) => {
    // 创建一个服务器
    const server = new net.Server()

    // 开启一个服务器监听连接
    server.listen(port, host, () => {
        const address = server.address()
        log(`listening server at http://${address.address}:${address.port}`)
    })

    // 当有新连接建立时, 就会触发 connection 事件
    server.on('connection', (s) => {
        // 当 socket(也就是这次的参数 s) 接收到数据的时候, 会触发 data 事件
        s.on('data', (data) => {
            // 每次触发 data 事件后, 都生成一个 request 实例,
            // 然后整个请求 - 响应过程中使用的都是这个实例,
            // 相当于 request 在这个过程中是一个全局变量,
            // 不管什么时候都可以方便地获取 request 里的数据
            const request = new Request()
            // data 是 buffer 类型, 使用 toString 把 data 转成 utf8 编码的字符串
            // 现在 r 是一个符合 http 请求格式的字符串
            const r = data.toString('utf8')
            // 使用 request.raw 保存请求的原始信息
            request.raw = r
            const ip = s.localAddress
            log(`ip and request, ${ip}\n${r}`)

            // 然后调用 responseFor, 根据 request 生成响应内容
            // 因为除了 path, 还有 method, query, body 都会影响 response 的内容
            const response = responseFor(request)

            // 将 response 发送给客户端, 这里的客户端就是浏览器
            // socket.write 可以接收 buffer 类型的参数
            // 也就是说可以发送文本, 也可以发送像图片这样的二进制信息
            s.write(response)
            // 如果不这么做, 浏览器不知道当前请求是否已经结束
            // 会出现一直等待的情况, 也就是会一直 loading
            s.destroy()
        })
    })

    // 服务器出错的时候会触发这个事件
    server.on('error', (error) => {
        log('server error', error)
    })

    // 当服务器关闭时被触发
    server.on('close', () => {
        log('server closed')
    })
}

// 程序的入口
const __main = () => {
    run('127.0.0.1', 5000)
}

// 调用 main 函数
__main()
