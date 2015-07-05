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
    var element = container.children[0];
    //开始索引
    var index = 1;
    //切换速度
    var speed = 300;
    //是否动画中
    var isAnimation = false

    //li页面数量
    var slides = element.children;
    var length = slides.length;

    //创建一个记录数组
    var slidePos = new Array(slides.length);

    //获取容器尺寸
    var pageSize = container.getBoundingClientRect();
    var width    = pageSize.width;
    var height   = pageSize.height;

    //设置li页面总宽度
    element.style.width = (slides.length * width ) + 'px';
    element.style.height = height + 'px';

    //设置每一个页面li的宽度
    var pos = slides.length;
    for (var i = 0; i < pos; i++) {
        var slide = slides[i];  //获取到每一个li元素    
        slide.style.width = width + 'px';
        slide.style.height = height +'px';
    }

    //绑定一个翻页动画结束后通知事件
    container.addEventListener('transitionend', function(){
        //动画结束后更新页面索引
        ++index
        //动画解锁
        isAnimation = false;
    }, false);

    return {
        //下一页
        next: function() {
            //如果是动画中,return
            if (isAnimation) return;
            //不能溢出范围
            if(index >= length) return
            //动画开始,加锁
            isAnimation = true;
            element.style.transitionDuration = speed + 'ms';
            element.style.transform = 'translate3d(' + (-index * width) + 'px,0px,0px)'
        }
    }

}
