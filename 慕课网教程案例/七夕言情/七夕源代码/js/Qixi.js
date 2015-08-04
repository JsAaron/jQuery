/**
 * 慕课网特制
 * 七夕主题效果
 * @type {Object}
 */
var Qixi = function() {

    //////////
    // 参数设置 //
    //////////

    var confi = {

        //是否维持缩放比
        keepZoomRatio: false,

        //设置容器尺寸
        //否则默认全屏
        //如果设置，需要输入具体的px值
        layer: {
            'width': '100%',
            'height': '100%',
            'top': 0,
            'left': 0
        },

        //音乐配置
        audio: {
            enable: false, //是否开启音乐
            playURl: 'http://www.imooc.com/upload/media/happy.wav', //正常播放地址
            cycleURL: 'http://www.imooc.com/upload/media/circulation.wav' //正常循环播放地址
        },

        //时间设置(时间毫秒）
        setTime: {
            walkToThird: 16000, //走第一段路，1/3屏幕宽度所用的时间，走完毕背景动
            walkToMiddle: 16500, //走第二段路，1/2屏幕宽度所用的时间，走到商店
            walkToEnd: 16500, //走第三段路，走到桥

            walkTobridge: 12000, //上桥
            bridgeWalk: 12000, //桥上走路到中间

            walkToShop: 11500, //进商店时间
            walkOutShop: 11500, //出商店时间

            openDoorTime: 1800, //开门时间
            shutDoorTime: 1500, //关门时间

            waitRotate: 1850, //男女等待转身的时间
            waitFlower: 800 //模拟取花的等待时间
        },

        //雪花图路径
        //填入绝对地址
        snowflakeURl: [
            'http://img.mukewang.com/55adde120001d34e00410041.png',
            'http://img.mukewang.com/55adde2a0001a91d00410041.png',
            'http://img.mukewang.com/55adde5500013b2500400041.png',
            'http://img.mukewang.com/55adde62000161c100410041.png',
            'http://img.mukewang.com/55adde7f0001433000410041.png',
            'http://img.mukewang.com/55addee7000117b500400041.png'
        ]
    }

    //如果启动了dubug状态
    var debug = 0
    if (debug) {
        $.each(confi.setTime, function(key, val) {
            confi.setTime[key] = debug
        })
    }

    //启用正比缩放处理
    if (confi.keepZoomRatio) {
        //原始比例
        var proportionY = 900 / 1440
        var screenHeight = $(document).height();
        //维持正比缩放的高度
        var zooomHeight = screenHeight * proportionY;
        var zooomTop = (screenHeight - zooomHeight) / 2
            //设置正比缩放的数据
        confi.layer.height = zooomHeight;
        confi.layer.top = zooomTop;
    }

    //走过的位置
    var instanceX;
    //页面容器
    var container = $("#content");
    //设置新的页面容器大小
    container.css(confi.layer)
        //页面可视区域
    var visualWidth = container.width()
    var visualHeight = container.height()

    //获取数据
    var getValue = function(className) {
        var $elem = $('' + className + '')
            //走路的路线坐标
        return {
            height: $elem.height(),
            top: $elem.position().top
        }
    }

    //路的Y轴
    var pathY = function() {
        var data = getValue('.a_background_middle')
        return data.top + data.height / 2
    }()

    //桥的Y轴
    var bridgeY = function() {
        var data = getValue('.c_background_middle')
        return data.top
    }()

    //动画结束事件
    var animationEnd = (function() {
        var explorer = navigator.userAgent;
        if (~explorer.indexOf('WebKit')) {
            return 'webkitAnimationEnd'
        }
        return 'animationend'
    })();


    /////////
    //背景音乐 //
    /////////
    if (confi.audio.enable) {
        var audio1 = Hmlt5Audio(confi.audio.playURl)
        audio1.end(function() {
            Hmlt5Audio(confi.audio.cycleURL, true)
        })
    }

    ///////////
    //场景页面滑动对象 //
    ///////////
    var swipe = Swipe(container);
    //页面滚动到指定的位置
    function scrollTo(time, proportionX) {
        var distX = visualWidth * proportionX
        swipe.scrollTo(distX, time)
    }


    ////////
    //小女孩 //
    ////////
    var girl = {
        elem: $('.girl'),
        getHeight: function() {
            return this.elem.height()
        },
        //转身动作
        rotate: function() {
            this.elem.addClass('girl-rotate')
        },
        setOffset: function() {
            this.elem.css({
                left: visualWidth / 2,
                top: bridgeY - this.getHeight()
            })
        },
        getOffset: function() {
            return this.elem.offset();
        },
        getWidth: function() {
            return this.elem.width()
        }
    }

    /////////
    //右边飞鸟 //
    /////////
    var bird = {
        elem: $(".bird"),
        fly: function() {
            this.elem.addClass('birdFly')
            this.elem.transition({
                right: visualWidth
            }, 15000, 'linear');
        }
    }

    ///////////
    //loge动画 //
    ///////////
    var logo = {
        elem: $('.logo'),
        run: function() {
            this.elem.addClass('logolightSpeedIn')
                .on(animationEnd, function() {
                    $(this).addClass('logoshake').off();
                })
        }
    }

    //////////
    // 小孩走路 //
    //////////
    var boy = BoyWalk();

    //开始走路
    boy.walkTo(confi.setTime.walkToThird, 0.6)
        .then(function() {
            //开始滚动页面
            scrollTo(confi.setTime.walkToMiddle, 1)
                //第二次走路
            return boy.walkTo(confi.setTime.walkToMiddle, 0.5)
        }).then(function() {
            //飞鸟
            bird.fly();
        }).then(function() {
            //暂停走路
            boy.stopWalk();
            //去商店
            return BoyToShop(boy);
        }).then(function() {
            //自适应分辨率
            //修正小女孩的坐标,位于中间
            girl.setOffset();
            //页面继续滚动,到结束
            scrollTo(confi.setTime.walkToEnd, 2);
            //人物要往回走1/10处
            return boy.walkTo(confi.setTime.walkToEnd, 0.15)
        }).then(function() {
            //上桥   
            return boy.walkTo(confi.setTime.walkTobridge, 0.25, (bridgeY - girl.getHeight()) / visualHeight)
        }).then(function() {
            //实际走路的比例
            var proportionX = (girl.getOffset().left - boy.getWidth() - instanceX + girl.getWidth() / 5) / visualWidth;
            //桥上走路
            return boy.walkTo(confi.setTime.bridgeWalk, proportionX)
        }).then(function() {
            //复位初始状态 
            boy.resetOriginal();
            //增加转身动作 
            setTimeout(function() {
                girl.rotate();
                boy.rotate(function() {
                    //开始logo动画
                    logo.run();
                    //如果转身完毕
                    //开始飘花
                    snowflake()
                });
            }, confi.setTime.waitRotate)
        });


    /**
     * 小孩走路
     * @param {[type]} container [description]
     */
    function BoyWalk() {

        //走路对象
        var $boy = $("#boy");

        var boyWidth = $boy.width();
        var boyHeight = $boy.height();

        //设置下高度    
        $boy.css({
            top: pathY - boyHeight + 25
        })

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
        function walkRun(time, dist, disY) {
            time = time || 3000;
            //脚动作
            slowWalk();
            //开始走路
            var d1 = stratRun({
                'left': dist + 'px',
                'top': disY ? disY : undefined
            }, time);
            return d1;
        }

        //走进商店
        function walkToShop(doorObj, runTime) {
            var defer = $.Deferred();
            var doorObj = $('.door')
                //门的坐标
            var offsetDoor = doorObj.offset();
            var doorOffsetLeft = offsetDoor.left;
            var doorOffsetTop = offsetDoor.top;
            //小孩当前的坐标
            var offsetBoy = $boy.offset();
            var boyOffetLeft = offsetBoy.left;
            var boyOffetTop = offsetBoy.top;

            //当前需要移动的坐标
            instanceX = (doorOffsetLeft + doorObj.width() / 2) - (boyOffetLeft + $boy.width() / 2);

            //Y的坐标
            //translateY = 人物底部距离 - 门的底部距离
            instanceY = (boyOffetTop + boyHeight) - (doorOffsetTop + doorObj.height());

            //开始走路
            var walkPlay = stratRun({
                transform: 'translateX(' + instanceX + 'px),translateY(-' + instanceY + 'px),scale(0.8,0.8)',
                opacity: 0.1
            }, 2000);
            //走路完毕
            walkPlay.done(function() {
                $boy.css({
                    opacity: 0
                })
                defer.resolve();
            })
            return defer;
        }

        //走出店
        function walkOutShop(runTime) {
            var defer = $.Deferred();
            restoreWalk();
            //开始走路
            var walkPlay = stratRun({
                    transform: 'translate(' + instanceX + 'px,0px),scale(1,1)',
                    opacity: 1
                }, runTime)
                //走路完毕
            walkPlay.done(function() {
                defer.resolve();
            })
            return defer;
        }

        //计算移动距离
        function calculateDist(direction, proportion) {
            return (direction == "x" ?
                visualWidth : visualHeight) * proportion;
        }

        return {
            //开始走路
            walkTo: function(time, proportionX, proportionY) {
                var distX = calculateDist('x', proportionX)
                var distY = calculateDist('y', proportionY)
                return walkRun(time, distX, distY);
            },
            //停止走路
            stopWalk: function() {
                pauseWalk();
            },
            //复位初始状态
            resetOriginal: function() {
                this.stopWalk();
                //恢复图片
                $boy.removeClass('slowWalk slowFlolerWalk').addClass('boyOriginal')
            },
            //走进商店
            toShop: function() {
                return walkToShop.apply(null, arguments);
            },
            //走出商店
            outShop: function() {
                return walkOutShop.apply(null, arguments);
            },
            //转身动作
            rotate: function(callback) {
                restoreWalk()
                $boy.addClass('boy-rotate')
                    //监听转身完毕
                if (callback) {
                    $boy.on(animationEnd, function() {
                        callback()
                        $(this).off();
                    })
                }
            },
            //获取男孩的宽度
            getWidth: function() {
                return $boy.width();
            },
            //获取人物走过的距离
            getDistance: function() {
                return $boy.offset().left
            },
            //取花
            talkFlower: function() {
                $boy.addClass('slowFlolerWalk')
            }

        }
    }

    /**
     * 商店
     * @return {[type]} [description]
     */
    var BoyToShop = function(boyObj) {

        var defer = $.Deferred();
        var $door = $('.door');
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
            //增加延时等待效果
            var defer = $.Deferred();
            //取花
            boyObj.talkFlower();
            setTimeout(function() {
                defer.resolve()
            }, confi.setTime.waitFlower)
            return defer
        }

        ///////////
        //灯动画 //
        ///////////
        var lamp = {
            elem: $('.b_background'),
            bright: function() {
                this.elem.addClass('lamp-bright')
            },
            dark: function() {
                this.elem.removeClass('lamp-bright')
            }
        }

        //开门动作
        var waitOpen = openDoor(confi.setTime.openDoorTime)

        //等待开门
        //开始执行一系列动作
        waitOpen
            .then(function() {
                lamp.bright();
                //小孩进入商店
                return boyObj.toShop($door, confi.setTime.walkToShop)
            }).then(function() {
                //取花
                return talkFlower();
            }).then(function() {
                //走出商店
                return boyObj.outShop(confi.setTime.walkOutShop)
            }).then(function() {
                //商店关门
                shutDoor(confi.setTime.shutDoorTime);
                lamp.dark();
                //开始下一套动作
                defer.resolve();
            })

        return defer;
    }



    ///////
    //飘雪花 //
    ///////
    function snowflake() {
        //雪花容器
        var $flakeContainer = $('#snowflake');

        //随机六张图
        function getImagesName() {
            return confi.snowflakeURl[[Math.floor(Math.random() * 6)]]
        };
        //创建一个雪花元素
        function createSnowBox() {
                var url = getImagesName()
                return $('<div class="snowbox" />').css({
                    'width': 41,
                    'height': 41,
                    'position': 'absolute',
                    'backgroundSize': 'cover',
                    'zIndex': 100000,
                    'top': '-41px',
                    'backgroundImage': 'url(' + url + ')'
                }).addClass('snowRoll')
            }
            //开始飘花
        setInterval(function() {
            //运动的轨迹
            var startPositionLeft = Math.random() * visualWidth - 100,
                startOpacity = 1
            endPositionTop = visualHeight - 40,
                endPositionLeft = startPositionLeft - 100 + Math.random() * 500,
                duration = visualHeight * 10 + Math.random() * 5000;

            //随机透明度，不小于0.5
            var randomStart = Math.random()
            randomStart = randomStart < 0.5 ? startOpacity : randomStart

            //创建一个雪花
            var $flake = createSnowBox();
            //设计起点位置
            $flake.css({
                    left: startPositionLeft,
                    opacity: randomStart
                })
                //加入到容器
            $flakeContainer.append($flake)
                //开始执行动画
            $flake.transition({
                top: endPositionTop,
                left: endPositionLeft,
                opacity: 0.7
            }, duration, 'ease-out', function() {
                $(this).remove() //结束后删除
            })
        }, 200);
    }


    /////////
    //背景音乐 //
    /////////
    function Hmlt5Audio(url, loop) {
        var audio = new Audio(url);
        audio.autoplay = true;
        audio.loop = loop; //是否循环
        audio.play();
        return {
            end: function(callback) {
                audio.addEventListener('ended', function() {
                    callback()
                }, false);
            }
        }
    }

};



$(function() {

    //七夕主题效果，开始
    Qixi()
})
