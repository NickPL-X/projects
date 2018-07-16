
// 解析协议
const protocolOfUrl = (url) => {
    if(url.includes('https')) {
        return 'https'
    } else {
        return 'http'
    }
}


// 解析主机名
const hostOfUrl = (url) => {
    let host = ''
    let u = ''
    if (url.startsWith('https://') || url.startsWith('http://')) {
        u = url.split('://')[1]
    } else {
        u = url
    }

    const index = u.indexOf(':')
    if (index > -1) {
        host = u.slice(0, index)
    } else {
        host = u
        host = host.split('/')[0]
    }

    return host
}


// 解析端口
// 辅助函数
const cutEnd2 = (str) => {
    if(str.includes('/')) {
        return Number(str.split('/')[0])
    }else {
        return Number(str)
    }
}
// 解析端口
const portOfUrl = (url) => {
    if(protocolOfUrl(url) === 'https') {
        return 443
    }else if(url.includes(':') && !url.includes('://')) {   // 有：且不带://的
        let str = url.split(':')[1]
        return cutEnd2(str)
    }else {
        return 80
    }
}


// 辅助函数，切掉头部协议
const cutHead = (url) => {
    return url.split('://')[1]
}
// 找到/ ,切出路径，没有的直接/
const findPath =(url) => {
    if(url.includes('/')) {
        let i = url.indexOf('/')
        let l = url.length
        return url.slice(i, l)
    }else {
        return '/'
    }
}
// 解析路径
const pathOfUrl = (url) => {
    if(url.includes('://')) {
        let str = cutHead(url)
        return findPath(str)
    }else {
        return findPath(url)
    }
}

/*
 url 是字符串, 可能的值如下
 'g.cn'
 'g.cn/'
 'g.cn:3000'
 'g.cn:3000/search'
 'http://g.cn'
 'https://g.cn'
 'http://g.cn/'

 返回一个 object, 内容如下
 {
 protocol: protocol,
 host: host,
 port: port,
 path: path,
 }
 */
const parsedUrl = (url) => {
    return {
        protocol: protocolOfUrl(url),
        host: hostOfUrl(url),
        port: portOfUrl(url),
        path: pathOfUrl(url),
    }
}
/*
 path 是一个字符串
 query 是一个字典

 返回一个拼接后的 url
 */
const pathWithQuery = (path, query) => {
    const keys = Object.keys(query)
    const arr = []
    for(let i = 0; i < keys.length; i++) {
        const str = `${keys[i]}=${query[keys[i]]}`
        arr.push(str)
    }
    const result = arr.join('&')
    return path + "?" + result

}

/*
 headers 是一个 object 对象
 范例如下
 对于
 {
 'Content-Type': 'text/html',
 'Content-Length': 127,
 }
 返回如下 string
 'Content-Type: text/html\r\nContent-Length: 127\r\n'
 */
const headerFromDict = (headers) => {
    const keys = Object.keys(headers)
    const arr = []
    for(let i = 0; i < keys.length; i++) {
        const str = `${keys[i]}: ${headers[keys[i]]}`
        arr.push(str)
    }
    const result = arr.join('\r\n') + '\r\n'
    return result
}
// 根据协议返回一个 socket 实例
// 如果是 http 协议, 返回 net.Socket 实例
// 如果是 https 协议, 返回 tls.TLSSocket 实例
const socketByProtocol = (protocol) => {
    const net = require('net')
    const tls = require('tls')
    const http = new net.Socket()
    const https = new tls.TLSSocket()
    if(protocol === 'http') {
        return http
    } else {
        return https
    }
}


/*
 把 response 解析出 code headers body 返回
 状态码 code 是 int
 headers 是 object
 body 是 string
 */

// 假设返回的 response 如下
/*
 HTTP/1.1 301 Moved Permanently
 Location: https://movie.douban.com/top250
 Content-Type: text/html

 hello
 */

// 那么函数返回的结果为
/*
 {
 code: 301,
 headers: {
 'Location': 'https://movie.douban.com/top250',
 'Content-Type': 'text/html',
 },
 body: 'hello'
 }
 */
const parsedResponse = (r) => {
    let code = r.split(' ')[1]
    code = parseInt(code)
    let arr = r.split('\r\n')
    // arr 是一到五行
    let headers = {}
    let key1 = arr[1].split(': ')[0]
    let val1 = arr[1].split(': ')[1]
    let key2 = arr[2].split(': ')[0]
    let val2 = arr[2].split(': ')[1]
    headers[key1] = val1
    headers[key2] = val2
    let body = r.split('\r\n\r\n')[1]
    let result = {
        code: code,
        headers: headers,
        body: body,
    }
    return result
}


/*
 模拟发送 HTTP 请求

 豆瓣电影 Top250 页面链接如下
 https://movie.douban.com/top250
 这页一共有 25 个条目

 目前并不能一次性加载完所有的数据(因为数据量比较大), 会分几次触发。
 也就是说 data 事件会触发多次, 有一个 end 事件, 服务器数据发送完成之后会触发
 所以需要在 data 事件中拼接接收到的数据，在 end 事件中处理最后的数据
 所以现在的程序就只剩下了解析 HTML
 */
const get = (url, query, callback) => {
    const protocol = protocolOfUrl(url)
    const client = socketByProtocol(protocol)
    const host = hostOfUrl(url)
    const port = portOfUrl(url)
    const path = pathOfUrl(url)
    const p = pathWithQuery('', query)

// 客户端根据给出的配置参数打开一个连接, 这样可以连接到服务器
    client.connect(port, host, () => {
        console.log('connect to: ', host, port)

        // 向服务器发送一个消息
        const request = `GET ${path}${p} HTTP/1.1\r\nHost: movie.douban.com\r\nConnection: close\r\n\r\n`
        client.write(request)
        // 如果 server destroy 之后, 再调用下面的代码会报错
        // setInterval(() => {
        //     client.write('hello in interval')
        // }, 100)
    })

// 当接收服务器的响应数据时触发 data 事件
// 其实这里就是接收服务器的数据
    let s = ''
    client.on('data', (d) => {
        const r = d.toString()
        console.log('原始数据 r 的 length', r.length)
        // 因为不知道一共有多少数据, 所以需要不断累加, 最后就可以获得所有数据
        // 拼接字符串
        s = s + r
        console.log(s)
    })
    client.on('end', () => {
        // 现在 s 是完整的数据了, 在这里调用解析响应的函数的函数得到 html
        callback(s)
    })
// client 关闭的时候触发这个事件
    client.on('close', function() {
        console.log('connection closed')
    })
}


const parseHtml = (r) => {
    const body = parsedResponse(r).body
    console.log('body', body.length)
}

const testGet = () => {
    const url = 'https://movie.douban.com/top250'
    let start = 25
    for(let i = 1; i <= 10; i++) {
        start = 25 * i
        const query = {
            start: start,
        }
        get(url, query, (r) => {
            parseHtml(r)
        })
    }
}

testGet()
