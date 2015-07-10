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
    var swipe = {};

    //li页面数量
    var slides = element.find(">")

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

    var isComplete = false;
    var timer;
    var callbacks = {};//注册回调

    function monitorOffet(element) {
        timer = setTimeout(function() {
            if (isComplete) {
                clearInterval(timer)
                return;
            }
            callbacks.move(element.offset().left);
            monitorOffet(element)
        }, 500)
    }

    //注册监听器
    swipe.watch = function(eventName, callback) {
        callbacks[eventName] = callback;
    }

    //监控完成与移动
    swipe.scrollTo = function(x, speed) {
        //执行动画移动
        element.css({
            'transition-timing-function': 'linear',
            'transition-duration': speed + 'ms',
            'transform': 'translate3d(-' + x + 'px,0px,0px)'
        })
        //获取当前坐标
        monitorOffet(element);
        //动画结束后通知事件
        container[0].addEventListener('transitionend', function() {
            isComplete = true;
            callbacks.complete();
        }, false)
        return this;
    }


    return swipe;
}
