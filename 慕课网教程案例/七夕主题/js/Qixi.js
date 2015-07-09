/**
 * 七夕主题效果
 * https://github.com/rstacruz/jquery.transit/blob/master/jquery.transit.js
 * http://code.ciaoca.com/jquery/transit/demo/
 * @type {Object}
 */
var Qixi = {

    //默认页面页码
    pageIndex: 1,

    //实例对象
    instance: {},

    //数据
    data: {},

    //初始化
    init: function() {
        //页面容器
        var container = $("#content");
        //页面可视宽度
        Qixi.data.visualWidth = container.width()

        //页面滑动对象
        var swipe = Swipe(container);

        //走路
        var walk = QixiWalk(container)
            walk.run(swipe);

        //构建第一个场景
        var qixiA = Qixi.createPage(Qixi.pageIndex, {
            container : container,
            swipe     : swipe
        })

        //监听动画变化
        swipe.watch('move', function(distance) {
            Qixi.disposeAction(distance, walk.getDistance())
        })

        //监听动画完成
        swipe.watch('complete', function() {

        })
    },

    //获取当前的页面
    getCurrentPage: function(pageLeft, girlLeft) {
        //实际移动的距离
        var movePos = Math.abs(pageLeft) + girlLeft;
        var pageIndex = Math.floor(movePos / Qixi.data.visualWidth)
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
        Qixi.stopPage(Qixi.data.pageIndex)
        //创建新的页面
        Qixi.createPage(pageIndex)
    },

    //停止动作
    stopPage: function(pageIndex) {
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

    //找到对应的页面对象
    findInstance: function(pageIndex) {
        return Qixi.instance[pageIndex]
    }
}

/**
 * 走路动作
 */
var QixiWalk = function(container) {
    //走路对象
    var $girl = $("#girl");
    //开始走路
    var width = container.width()
    //运动的位置
    var middlePos = width / 2 - $girl.width() / 2;
    var startPox = middlePos / 3 //第一次之运行1/3的距离

    //得到鲜花
    function flowers() {
        //开始消失
        $girl.transition({
            opacity: 0
        }, 2000)

        setTimeout(function() {
            $girl.transition({
                opacity: 1
            }, 2000)
        }, 2000)
    }


    //用transition做运动
    function run(pox, time) {
        var dfd = $.Deferred();
        $girl.transition({
            left: pox
        }, time, 'linear', function(){
            dfd.resolve();
        });
        return dfd;
    }

    //走路
    function toWalk(swipe) {
        //增加一个css3的效果动作变化
        $girl.addClass('slowWalk')
        //开始走路
        var d1 = run(startPox, 1000);
        //走路结束
        d1.done(function() {
            //开始滚动页面
            swipe.scrollTo(width, 5000)
            //继续走路
            return run(middlePos, 5000)
        }).done(function(){
            console.log()
        })
    }

    return {
        //开始走路
        run: function(swipe) {
            toWalk(swipe);
        },
        //停止走路
        stop: function() {
            $girl.removeClass('slowWalk')
        },
        //获取人物走过的距离
        getDistance: function() {
            return $girl.offset().left
        }
    }
}

/**
 * 七夕场景一
 * @type {[type]}
 */

var QixiA = function() {

    //云动画
    var cloud = function() {
        var $cloud1 = $("#cloud1");
        var $cloud2 = $("#cloud2");
        var $cloud3 = $("#cloud3");
        return {
            play: function() {
                $cloud1.addClass('cloud_1')
                $cloud2.addClass('cloud_2')
                $cloud3.addClass('cloud_3')
            },
            //停止动画
            stop: function() {
                $cloud1.removeClass('cloud_1')
                $cloud2.removeClass('cloud_2')
                $cloud3.removeClass('cloud_3')
                $cloud1 = $cloud2 = $cloud3 = null;
            }
        }
    }()

    var weather = function() {
        var $weather = $("#weather")
        return {
            play: function() {
                $weather.addClass('weatherAnimation')
            },
            //停止动画
            stop: function() {
                $weather.removeClass('weatherAnimation')
                $weather = null;
            }
        }
    }()


    return {
        run: function() {
            weather.play()
            cloud.play()
        },
        stop: function() {
            cloud.stop()
            weather.stop();
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
            // cloud.run()
        },
        stop: function() {

        }
    }
}



$(function() {
    //七夕主题效果，开始
    Qixi.init();
})
