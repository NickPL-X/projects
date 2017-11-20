// 切换 class
var showImageAtIndex = function(slide, index) {
    var nextIndex = index
    slide.dataset.active = nextIndex
    // 删除当前图片的 class 给下一张图片加上 class
    var className = 'active'
    removeClassAll(className)
    // 得到下一张图片的选择器
    var nextSelector = '#id-image-' + String(nextIndex)
    var img = e(nextSelector)
    img.classList.add(className)
    // 切换小圆点
    // 删除当前小圆点的 class
    var indiClassName = 'white'
    removeClassAll(indiClassName)
    // 得到下一个小圆点的选择器
    var nextIndiSelecter = '#id-indi-' + String(nextIndex)
    var indicator = e(nextIndiSelecter)
    indicator.classList.add(indiClassName)
}

// 得到下一个 index 的函数，offset 是1或者-1
var nextIndex = function(slide, offset) {
    var numberOfImgs = Number(slide.dataset.imgs)
    var activeIndex = Number(slide.dataset.active)
    var i = (numberOfImgs + activeIndex + offset) % numberOfImgs
    return i
}

// 绑定前后按钮
var bindEventSlide = function() {
    var selector = '.slide-button'
    bindAll(selector, 'click', function(event) {
        var button = event.target
        var slide = button.parentElement
        var offset = Number(button.dataset.offset)
        var index = nextIndex(slide, offset)
        // 按 index 切换 class
        showImageAtIndex(slide, index)
    })
}
// 绑定小圆点
var bindEventIndicator = function() {
    var selector = '.slide-indi'
    bindAll(selector, 'click', function(event) {
        var self = event.target
        var index = Number(self.dataset.index)
        var slide = self.closest('.slide')
        showImageAtIndex(slide, index)
    })
}

// 播放下一张
var playNextImage = function() {
    var slide = e('.slide')
    var index = nextIndex(slide, 1)
    showImageAtIndex(slide, index)
}

// 自动播放下一张
var autoPlay = function() {
    var interval = 2500
    setInterval(function() {
        playNextImage()
    }, interval)
}

var _main = function() {
    bindEventSlide()
    bindEventIndicator()
    autoPlay()
}

_main()
