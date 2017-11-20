// 文件系统模块，
const fs = require('fs')
// 同步 http 模块
const request = require('sync-request')
// 类似 jQuery 的分析 HTML 的模块
const cheerio = require('cheerio')

const log = console.log.bind(console)

// 定义一个 movie 类
class Movie {
    constructor() {
        // 分别是电影名/评分/引言/排名/封面图片链接
        this.name = ''
        this.score = 0
        this.quote = ''
        this.ranking = 0
        this.coverUrl = ''
    }
}

// // 创建一个电影类的实例并且获取数据
const movieFromItem = (item) => {
    let e = cheerio.load(item)
    // 人工分析 html 结构
    let movie = new Movie()
    movie.name = e('.img_box').attr('alt')
    movie.score = e('.total').text() + e('.total2').text()
    movie.quote = e('.mt3').text()
    movie.ranking = e('.number').find('em').text()
    movie.coverUrl = e('.img_box').attr('src')
    return movie
}

// 建立缓存
const cachedUrl = (url) => {
    // 1. 确定缓存的文件名
    let cacheFile = ''
    if (!url.includes('index')) {
        cacheFile = 'cached_html/' + '1.html'
    } else {
        cacheFile = 'cached_html/' + url.split('-')[1]
    }
    // 2. 检查缓存文件是否存在
    // 如果存在就读取缓存文件
    // 如果不存在就下载并写入缓存文件
    let exists = fs.existsSync(cacheFile)
    if (exists) {
        let data = fs.readFileSync(cacheFile)
        // log('data', data)
        return data
    } else {
        // 用 GET 方法获取 url 链接的内容
        // 相当于在浏览器地址栏输入 url 按回车后得到的 HTML 内容
        // r 为一个 response，而非数据
        let r = request('GET', url)
        // utf-8 是网页文件的文本编码，对响应使用 getBody 方法得到相应格式数据
        let body = r.getBody('utf-8')
        fs.writeFileSync(cacheFile, body)
        return body
    }
}

// 处理缓存中的数据，得到一个 movie 类的数组
const moviesFromUrl = (url) => {
    let body = cachedUrl(url)
    // cheerio.load 用来把 HTML 文本解析为一个可以操作的 DOM
    let e = cheerio.load(body)
    var movieDivs = e('#asyncRatingRegion').find('li')
    // 循环处理
    var movies = []
    for (let i = 0; i < movieDivs.length; i++) {
        let item = movieDivs[i]
        // 扔给 movieFromItem 函数来获取到一个 movie 对象
        let m = movieFromItem(item)
        movies.push(m)
    }
    return movies
}

// 存储数据进文件中
const saveMovie = (movies) => {
    // JSON.stringify 第 2 3 个参数配合起来是为了让生成的 json
    // 数据带有缩进的格式，第三个参数表示缩进的空格数
    let s = JSON.stringify(movies, null, 2)
    // 把 json 格式字符串写入到文件中
    let path = 'mtimetop100.txt'
    fs.writeFileSync(path, s)
}

// 下载封面并自动存储
const downloadCovers = (movies) => {
    for (let i = 0; i < movies.length; i++) {
        let m = movies[i]
        let url = m.coverUrl
        // 保存图片的路径
        let index = i + 1
        let path = 'covers/' + `${index}` + m.name.split('/')[0] + '.jpg'
        let r = request('GET', url)
        let img = r.getBody()
        fs.writeFileSync(path, img)
    }
}

const _main = () => {
    let url = 'http://www.mtime.com/top/movie/top100/'
    let movies = []
    movies = moviesFromUrl(url)
    for (let i = 2; i <= 10; i++) {
        let u = url + `index-${i}.html`
        let moviesInPage = moviesFromUrl(u)
        // 这个是 ES6 的语法
        movies = [...movies, ...moviesInPage]
        // 常规语法
        // movies = movies.concat(moviesInPage)
    }
    // log('movies', movies)
    saveMovie(movies)
    downloadCovers(movies)
}

_main()
