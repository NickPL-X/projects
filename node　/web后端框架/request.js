
class Request {
    // 构造器函数, 声明了需要保存哪些属性
    // 请求的原始信息, 请求方法, 请求路径, query 参数 和 body 参数
    constructor() {
        this.raw = ''
        // 默认是 GET 方法
        this.method = 'GET'
        this.path = ''
        // query 默认是一个 object
        this.query = {}
        this.body = ''
    }

    // 一般使用 post 方法提交的数据会放在 request body 中
    // 封装一个 form 方法, 直接获取解析之后的数据(以 object 的形式)
    form() {
        // 浏览器在发送 form 表单的数据时, 会自动使用 encodeURIComponent 编码
        // 所以拿到 body 的数据之后先解码
        // 得到的是下面这种格式的数据: a=b&c=d&e=f
        const body = decodeURIComponent(this.body)
        const pairs = body.split('&')
        const d = {}
        for (let pair of pairs) {
            const [k, v] = pair.split('=')
            d[k] = v
        }
        return d
    }
}

module.exports = Request
