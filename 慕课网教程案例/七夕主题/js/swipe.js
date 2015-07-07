/////////
//页面滑动 //
/////////

/**
 * [Swipe description]
 * @param {[type]} container [页面容器节点]
 * @param {[type]} options   [参数]
 */
function Swipe(container, options) {
    //获取第一个子节点
    var element = container.find(":first")
        //开始索引
    var index = 1;
    //切换速度
    var speed = 0;
    //是否动画中
    var isAnimation = false

    //li页面数量
    var slides = element.find(">")
    var length = slides.length;

    //获取容器尺寸
    var width = container.width();
    var height = container.height();


    //设置li页面总宽度
    element.css({
        width: (slides.length * width) + 'px',
        height: height + 'px'
    })


    //设置每一个页面li的宽度
    $.each(slides, function(index) {
        var slide = slides.eq[index]; //获取到每一个li元素    
        slides.eq(index).css({
            width: width + 'px',
            height: height + 'px'
        })
    })

    //绑定一个翻页动画结束后通知事件
    container.on('transitionend',function() {
        //动画结束后更新页面索引
        ++index
    }, false)

    return {
        scrollTo: function(x, speed) {
            element.css({
                transitionDuration : speed + 'ms',
                transform          :'translate3d(-' + x + 'px,0px,0px)'
            })
        }
    }

}
