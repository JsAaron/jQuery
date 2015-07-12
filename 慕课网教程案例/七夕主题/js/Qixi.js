/**
 * 七夕主题效果
 * https://github.com/rstacruz/jquery.transit/blob/master/jquery.transit.js
 * http://code.ciaoca.com/jquery/transit/demo/
 * @type {Object}
 */
var Qixi = function() {

    //页面容器
    var container = $("#content");
    //页面可视宽度
    var visualWidth = container.width()

    //时间设置
    var walkTime = 500; //正常走路
    var inShopWalkTime = 500; //进商店时间
    var outShopWalkTime = 500; //出商店时间
    var simulateWaitTime = 0; //模拟等待时间
    var openDoorTime = 100; //开门时间
    var shutDoorTime = 100 //关门时间

    ///////////
    //场景页面滑动对象 //
    ///////////
    var swipe = Swipe(container);
    //页面滚动到指定的位置
    function scrollTo(dist) {
        swipe.scrollTo(dist, walkTime)
    }
    return
    //////////
    // 小孩走路 //
    //////////
    var boy = BoyWalk();

    //开始走路
    boy.walkTo(3)
        .then(function() {
            //开始滚动页面
            scrollTo(visualWidth)
        }).then(function() {
            //第二次走路
            return boy.walkTo(2)
        }).then(function() {
            //去商店
            return toShop(boy);
        }).then(function() {
            //右边飞鸟
            var brid = Bird();
            brid.fly();
        }).then(function() {
            //页面继续滚动
            scrollTo(2 * visualWidth);
            //人物要往回走1/7处
            return boy.walkTo(7)
        }).then(function() {
            //上桥

        });


    //监听页面移动变化
    swipe.watch('move', function(distance) {})
        //监听页面移动完成
    swipe.watch('complete', function() {})

    /**
     * 小孩走路
     * @param {[type]} container [description]
     */
    function BoyWalk() {

        //走路对象
        var $boy = $("#boy");
        var boyWidth = $boy.width();
        //中间位置
        var middleDist = visualWidth / 2 + boyWidth;
        //走过的位置
        var instanceX;

        //暂停走路
        function pauseWalk() {
            $boy.addClass('pauseWalk')
        }

        //恢复走路
        function restoreWalk() {
            $boy.removeClass('pauseWalk')
        }

        //css3的动作变化
        function slowWalk() {
            $boy.addClass('slowWalk')
        }

        //用transition做运动
        function stratRun(options, runTime) {
            var dfdPlay = $.Deferred();
            //恢复走路
            restoreWalk();
            //运动的属性
            $boy.transition(
                options,
                runTime,
                'linear',
                function() {
                    dfdPlay.resolve(); //动画完成
                });
            return dfdPlay;
        }

        //开始走路
        function walkRun(dist) {
            //脚动作
            slowWalk();
            //开始走路
            var d1 = stratRun({
                'left': dist + 'px'
            }, walkTime);
            return d1;
        }

        //走进商店
        function walkToShop(offsetDoor, doorMiddle, runTime) {
            var inShop = $.Deferred();
            //小孩当前的坐标
            var offsetBoy = $boy.offset();
            //当前的坐标
            instanceX = offsetDoor.left - offsetBoy.left + doorMiddle;
            var instanceZ = offsetBoy.top - offsetDoor.top

            //开始走路
            var walkPlay = stratRun({
                transform: 'rotateX(20deg) translateZ(' + instanceZ + 'px) translateX(' + instanceX + 'px) scale(0.8)',
                opacity: 0.3
            }, runTime);
            //走路完毕
            walkPlay.done(function() {
                $boy.css({
                    opacity: 0
                })
                inShop.resolve();
            })
            return inShop;
        }

        //走出店
        function walkOutShop(runTime) {
            var outShop = $.Deferred();
            restoreWalk();
            //开始走路
            var walkPlay = stratRun({
                    transform: 'rotateX(0deg) translateZ(0px) translateX(' + instanceX + 'px)',
                    opacity: 1
                }, runTime)
                //走路完毕
            walkPlay.done(function() {
                outShop.resolve();
            })
            return outShop;
        }

        //计算移动距离
        function calculateDist(proportion) {
            return visualWidth / proportion
        }

        return {
            //开始走路
            walkTo: function(proportionX, proportionY) {
                var distX = calculateDist(proportionX)
                return walkRun(distX);
            },
            //停止走路
            stop: function() {
                pauseWalk();
            },
            //恢复走路
            restoreWalk: function() {
                restoreWalk();
            },
            //走进商店
            goShop: function() {
                return walkToShop.apply(null, arguments);
            },
            //走出商店
            outShop: function() {
                return walkOutShop.apply(null, arguments);
            },
            //获取人物走过的距离
            getDistance: function() {
                return $boy.offset().left
            }
        }
    }

    /**
     * 商店
     * @return {[type]} [description]
     */
    var toShop = function(walk) {

        var shopDefer = $.Deferred();
        var doorLeft = $('.door-left');
        var doorRight = $('.door-right')

        function doorAction(left, right, time) {
            var defer = $.Deferred();
            var count = 2;
            //等待开门完成
            var complete = function() {
                if (count == 1) {
                    defer.resolve();
                    return;
                }
                count--
            }
            doorLeft.transition({
                'left': left
            }, time, complete)
            doorRight.transition({
                'left': right
            }, time, complete)
            return defer
        }

        //开门
        function openDoor(time) {
            return doorAction('-50%', '100%', time)
        }

        //关门
        function shutDoor(time) {
            return doorAction('0%', '50%', time)
        }

        //取花
        function talkFlower() {
            $("#boy").addClass('slowFlolerWalk')
        }

        var $door = $('.door');

        //门中间位置
        var doorMiddle = $door.width() / 4;

        //开门动作
        var waitOpen = openDoor(openDoorTime)

        //等待开门
        //开始执行一系列动作
        waitOpen
            .then(function() {
                //进入商店
                return walk.goShop($door.offset(), doorMiddle, inShopWalkTime)
            })
            .then(function() {
                //取花
                talkFlower();
            })
            .then(function() {
                //增加延时等待效果
                var defer = $.Deferred();
                setTimeout(function() {
                    defer.resolve()
                }, simulateWaitTime)
                return defer
            })
            .then(function() {
                //走出商店
                return walk.outShop(outShopWalkTime)
            })
            .then(function() {
                //商店关门
                return shutDoor(shutDoorTime);
            })
            .then(function() {
                //新的动作
                shopDefer.resolve();
            })

        return shopDefer;
    }

    /**
     * 左边飞鸟
     */
    var Bird = function() {
        var $brid = $(".bird");

        function run() {
            $brid.addClass('birdFly')
            $brid.transition({
                right: visualWidth
            }, 20000, 'linear');
        }
        return {
            fly: function() {
                run();
            },
            stop: function() {

            }
        }
    }
};


$(function() {
    //七夕主题效果，开始
    Qixi()
})
