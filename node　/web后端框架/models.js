// 引入模块
const fs = require('fs')
const log = require('./utils')

// 一个辅助函数, 确保要操作的文件已经存在
// 如果不存在就直接创建这个文件, 这样在调用的时候不会报错
const ensureExists = (path) => {
    if (!fs.existsSync(path)) {
        // 因为保存的数据都是 json 格式的, 所以在初始化文件的时候
        // 会写入一个空数组
        const data = '[]'
        fs.writeFileSync(path, data)
    }
}

// 将数据(object 或者 array)写入到文件中
// data 是 object 或者 array
// path 是 保存文件的路径
const save = (data, path) => {
    // 默认情况下使用 JSON.stringify 返回的是一行数据
    // 格式化成缩进 2 个空格的形式利于读
    const s = JSON.stringify(data, null, 2)
    fs.writeFileSync(path, s)
}

// 从文件中读取数据, 并且转成 JSON 形式(即 object 或者 array)
// path 是保存文件的路径
const load = (path) => {
    // 指定 encoding 参数
    const options = {
        encoding: 'utf8',
    }
    // 读取之前确保文件已经存在, 这样不会报错
    ensureExists(path)
    // 如果指定了 encoding, readFileSync 返回的就不是 buffer, 而是字符串
    const s = fs.readFileSync(path, options)
    const data = JSON.parse(s)
    return data
}

// 定义一个 Model 类来处理数据相关的操作
// Model 是基类, 可以被其他类继承
class Model {
    // 加了 static 关键字的方法是静态方法
    // 直接用 类名.方法名() 的形式调用
    // 这里的类名是 Model, 所以调用的方式就是 Model.dbPath()
    // dbPath 方法返回 db 文件的路径
    static dbPath() {
        // 静态方法中的 this 指的是类
        // this.name 指的是类名
        // 文件名一般来说建议全小写, 所以这里将名字换成了小写
        const classname = this.name.toLowerCase()
        // db 的文件名通过这样的方式与类名关联在一起
        const path = `${classname}.txt`
        return path
    }

    // 获取一个类所有实例的函数

    static all() {
        // 先获取文件路径
        const path = this.dbPath()
        // 打开文件, 获取数据
        // 因为使用的 json 格式存储数据, 初始化时用的是数组, 之后保存也用的是数组
        // 所以 models 是一个数组
        const models = load(path)
        const ms = models.map((item) => {
            // 静态方法中的 this 指向的是 class
            // 这里为了更加显式观察, 将 this 赋值给 cls
            // 然后调用 cls.create 方法生成实例

            // 简写的话是下面这样的
            // return this.create(item)
            const cls = this
            const instance = cls.create(item)
            return instance
        })
        return ms

        // 这一大段可以简写成下面这一行
        // return models.map(m => this.create(m))

        // 上面的代码换成 for 循环写如下:
        // const ms = []
        // for (let i = 0; i < models.length; i++) {
        //     const cls = this
        //     const item = models[i]
        //     const instance = cls.create(item)
        //     ms.push(instance)
        // }
        // return ms
    }

    // save 前面没有 static 关键字, 是实例方法或者原型方法
    // 调用方式是 实例.方法()
    // save 函数的作用是把 Model 的一个实例保存到文件中
    save() {
        // 实例方法中的 this 指向的是实例本身, 也就是 new 出来的那个对象
        // this.constructor 是指类
        const cls = this.constructor
        // 先获取 Model 的所有实例, 是一个数组
        const models = cls.all()
        // 然后把当前实例添加到 models 中, 接着保存到文件中
        models.push(this)
        const path = cls.dbPath()
        // 这个 save 函数是 save 文件的函数, 而不是当前这个实例方法
        save(models, path)
    }

    // 为了自定义显示的形式, 需要重写 toString 方法
    // 比如 object.toString() 返回的是[object Object]
    toString() {
        const s = JSON.stringify(this, null, 2)
        return s
    }
}

// 以下两个类用于实际的数据处理
// 因为继承了 Model 类
// 所以可以直接 save load
class User extends Model {
    constructor(form={}) {
        // 继承的时候, 要先调用 super 方法, 才可以使用 this
        super()
        // User 类定义两个属性
        this.username = form.username || ''
        this.password = form.password || ''
    }

    // 把创建实例的操作封装起来, 直接调用 create 方法就可以了
    // 每个类都有 create 的操作, 所以可以直接将这个操作写到 Model 中
    static create(form={}) {
        // 这里的 this 就是当前这个类，也就是 User
        const cls = this
        const instance = new cls(form)
        return instance
    }

    // 与逻辑相关的数据操作都写在类中, 路由处理的逻辑就会比较简单
    // 路由那部分是 controller, 按照这样的方式组织代码
    // 会出现 胖 model, 瘦 controller 的情况

    // 校验登录的逻辑
    validateLogin() {
        log(this, this.username, this.password)
        return this.username === 'gua' && this.password === '123'
    }

    // 校验注册的逻辑
    validateRegister() {
        return this.username.length > 2 && this.password.length > 2
    }
}

class Message extends Model {
    constructor(form={}) {
        super()
        this.author = form.author || ''
        this.message = form.message || ''
    }

    static create(form={}) {
        const cls = this
        const instance = new cls(form)
        return instance
    }
}

// 这次暴露的是一个包含两个 model 的对象
module.exports = {
    User: User,
    Message: Message,
}
