/**
 * 七夕主题效果
 * https://github.com/rstacruz/jquery.transit/blob/master/jquery.transit.js
 * http://code.ciaoca.com/jquery/transit/demo/
 * @type {Object}
 */
var Qixi = {

    //实例对象
    instance: {},

    //数据
    data: {},

    //初始化
    init: function() {
        var container = $("#content");

        //页面滑动对象
        var swipe = Swipe(container);
        
        //第一页页码
        Qixi.data.width = container.width()

        //构建第一个场景
        var qixiA = Qixi.createPage(1, {
            container : container,
            swipe     : swipe
        })


        //监听动画变化
        swipe.watch('move', function(distance) {
            Qixi.disposeAction(distance, qixiA.offset().left)
        })

        //监听动画完成
        swipe.watch('complete', function() {

        })
    },

    //获取当前的页面
    getCurrentPage: function(pageLeft, girlLeft) {
        //实际移动的距离
        var movePos = Math.abs(pageLeft) + girlLeft;
        var pageIndex = Math.floor(movePos / Qixi.data.width)
        return ++pageIndex //从1开始索引
    },

    //处理当前动作
    disposeAction: function(pageLeft, girlLeft) {
        //当前页码
        var pageIndex = Qixi.getCurrentPage.apply(null, arguments);
        //去重
        if (pageIndex === Qixi.data.pageIndex) {
            return;
        }
        //停止上一页动作
        Qixi.stopAction(Qixi.data.pageIndex)
            //创建新的页面
        Qixi.createPage(pageIndex)
    },

    //停止动作
    stopAction: function(pageIndex) {
        Qixi.findInstance(pageIndex).stop();
    },

    //开始新的动作
    createPage: function(pageIndex, options) {
        var qixi;
        //构建新的页面动作
        function update(classNane) {
            qixi = eval(classNane)(options)
            Qixi.instance[pageIndex] = qixi;
            qixi.run();
        }
        switch (pageIndex) {
            case 1:
                update('QixiA')
                break
            case 2:
                update('QixiB')
                break
            case 3:
                update('QixiC')
                break
        }
        //更新页面
        Qixi.data.pageIndex = pageIndex;
        return qixi;
    },

    findInstance: function(pageIndex) {
        return Qixi.instance[pageIndex]
    }
}


/**
 * 七夕场景一
 * @type {[type]}
 */

var QixiA = function(options) {
    var container = options.container;
    var swipe = options.swipe;
    //云动画 
    var cloud = CloudEffect();
    //走路对象
    var $girl = $("#girl");
    //开始走路
    var width = container.width()
    //目标中间位置
    var middlePos = width / 2 - $girl.width() / 2;
    //走路
    function toWalk() {
        //增加一个css3的效果动作变化
        $girl.attr("class", "class charector-wrap slow")
            //用transition运行走动
        $girl.transition({
            left: middlePos / 3 //第一次之运行1/3的距离
        }, 700, 'linear', function() {
            //页面开始滚动
            swipe.scrollTo(width * 2, 5000)
                //用transition继续运动
            $girl.transition({
                left: middlePos
            }, 5000, 'linear', function() {
                console.log('人物到达中间')
            });
        });
    }

    return {
        run: function() {
            cloud.run()
            toWalk();
        },
        stop: function() {

        },
        offset: function() {
            return $girl.offset()
        }
    }
}


/**
 * 七夕场景二
 * @type {[type]}
 */
var QixiB = function() {

    return {
        run: function() {
            alert('b')
        },
        stop: function() {

        }
    }
}

/**
 * 七夕场景三
 * @type {[type]}
 */
var QixiC = function() {

    return {
        run: function() {
            //执行运动化
            cloud.run()
        },
        stop: function() {

        }
    }
}



$(function() {
    //七夕主题效果，开始
    Qixi.init();
})
