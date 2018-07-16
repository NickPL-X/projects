// 封装 console.log
const log = (...args) => {
    console.log.apply(console, args)
}

// 把封装之后的 log 函数暴露出去, 这样在其他地方就可以直接使用了
module.exports = log