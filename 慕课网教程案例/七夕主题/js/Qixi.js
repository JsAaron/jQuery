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
            container: container,
            swipe: swipe
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
    getCurrentPage: function(pageLeft, boyLeft) {
        //实际移动的距离
        var movePos = Math.abs(pageLeft) + boyLeft;
        var pageIndex = Math.floor(movePos / Qixi.data.visualWidth)
        return ++pageIndex //从1开始索引
    },

    //处理当前动作
    disposeAction: function(pageLeft, boyLeft) {
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
 * 商店
 * @return {[type]} [description]
 */
var toShop = function(shopComplete) {

    function doorAction(left, right, time, callback) {
        var defer = $.Deferred();
        var count = 2;
        //等待开门完成
        var complete = function() {
            if (count == 1) {
                callback && callback() ;
                return;
            }
            count--
        }
        $('.door-left').transition({
            'left': left
        }, time, complete)
        $('.door-right').transition({
            'left': right
        }, time, complete)
        return defer
    }

    //开门
    function openDoor(time, callback) {
        doorAction('-50%', '100%', time, callback)
    }

    //关门
    function shutDoor(time) {
        doorAction('0%', '50%', time)
    }

    //走进商店
    function toDoor(time, callback) {
        var $boy = $("#boy")
        var $door = $('.door');
        var $doorMiddle = $door.width() / 4 //门中间
        var offsetBoy = $boy.offset();
        var offsetDoor = $door.offset();
        var instanceX = offsetDoor.left - offsetBoy.left + $doorMiddle
        var instanceZ = offsetBoy.top - offsetDoor.top
        $boy.removeClass('pausedWalk')
        $boy.transition({
            transform: 'rotateX(30deg) translateZ(' + instanceZ + 'px) translateX(' + instanceX + 'px) scale(0.8)',
            opacity: 0.5
        }, time, function() {
            $boy.css({
                opacity: 0
            })
            callback()
        })
    }

    //出商店
    function outDoor(time, callback) {
        var $boy = $("#boy")
        $boy.removeClass('pausedWalk')
        $boy.transition({
            transform: 'rotateX(0deg) translateZ(0px) translateX(200px)',
            opacity: 1
        }, time, function() {
            callback()
        })
    }

    //取花
    function talkFlower() {
        $("#boy").addClass('slowFlolerWalk')
    }

    var timer = 3000;

    openDoor(timer, function() { //开门
        toDoor(timer, function() { //走进去
            setTimeout(function() { //模拟2秒等待取花
                talkFlower(); //取花
                outDoor(timer, function() { //走出商店
                    shutDoor(timer); //关门
                    shopComplete() //购物结束
                });
            }, timer)
        })
    });
}

/**
 * 鸟
 */
var Bird = function() {
    var $brid = $(".bird");
    function run(){
        $brid.addClass('birdFly')
        $brid.transition({
            right: Qixi.data.visualWidth/2
        }, 5000, 'linear');
    }
    return {
        fly:function(){
            run();
        },
        stop:function(){

        }
    }
}   

/**
 * 走路动作
 */
var QixiWalk = function(container) {

    //走路对象
    var $boy = $("#boy");

    //开始走路
    var width = container.width()

    //运动的位置
    var middlePos = width / 2 - $boy.width() / 2;

    //用transition做运动
    function run(pox, time) {
        var dfd = $.Deferred();
        $boy.transition({
            left: pox
        }, time, 'linear', function() {
            dfd.resolve();
        });
        return dfd;
    }

    //走路
    function toWalk(swipe) {

        var baseTime = 2000;

        //增加一个css3的效果动作变化
        $boy.addClass('slowWalk')

        //开始滚动页面
        swipe.scrollTo(width, baseTime * 3)

        //开始走路
        var d1 = run(middlePos, baseTime * 3);

        //第一段走路结束
        d1.done(function() {
            //暂停走路
            $boy.addClass('pausedWalk')
                //去商店
            toShop(function() {
                //右边飞鸟
                var brid = Bird();
                brid.fly();
                // 购物完成
                // 继续往后走
                swipe.scrollTo(width * 2, 100000)
            });
        })
    }

    return {
        //开始走路
        run: function(swipe) {
            toWalk(swipe);
        },
        //停止走路
        stop: function() {
            $boy.removeClass('slowWalk')
        },
        //获取人物走过的距离
        getDistance: function() {
            return $boy.offset().left
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

    var sun = function() {
        var $sun = $("#sun")
        return {
            play: function() {
                $sun.addClass('sunAnimation')
            },
            //停止动画
            stop: function() {
                $sun.removeClass('sunAnimation')
                $sun = null;
            }
        }
    }()


    return {
        run: function() {
            sun.play()
            cloud.play()
        },
        stop: function() {
            cloud.stop()
            sun.stop();
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
