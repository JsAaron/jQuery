/**
 * 七夕主题效果
 * https://github.com/rstacruz/jquery.transit/blob/master/jquery.transit.js
 * http://code.ciaoca.com/jquery/transit/demo/
 * @type {Object}
 */
var Qixi = {

    //范围边界
    range:{},

    //尺寸
    size:{},

    //计算出边界
    //{0: 1, 1104: 1, 1105: 2, 2209: 2, 2210: 3, 3314: 3}
    calculateRange:function(){
        var i = Qixi.size.count;
        while(i--){
            Qixi.range[i * Qixi.size.width] = 'in:' + (i + 1)
            Qixi.range[(i + 1) * Qixi.size.width - 1] = 'out:' + ( i + 1)
        }
        console.log(Qixi.range)
    },

    init: function() {
        var container = $("#content");

        //页面滑动对象
        var swipe = Swipe(container);

        /////////
        //执行云动画 //
        //////////
        var cloud = CloudEffect();
        cloud.run()

        //////////
        // 小孩走路 //
        //////////
        var $girl = $("#girl");

        //增加一个css3的效果动作变化
        $girl.attr("class", "class charector-wrap slow")

        //开始走路
        var distance = container.width()
        var startPox = distance / 2 - $girl.width() / 2

        Qixi.size = {
            width      : distance,
            height     : container.height(),
            startPox   : startPox,
            count      : 3,
            totalWidth : distance * 3
        }
        Qixi.calculateRange();

        $girl.animate({
            left: startPox / 1.5 //第一给li中间距离
        }, {
            easing: 'linear', //匀速
            duration: 7000,

            //要完成80%的时候开始提速
            progress: function() {
                var percentage = arguments[1];
                if (!$girl.prop('progressRepeat') && percentage > 0.8) {
                    $girl.prop('progressRepeat', true) //加锁,去重
                        //滑动到最后一页
                    swipe.scrollTo(distance * 2, 30000)
                    console.log(1)
                }
            },

            //完成一次后，继续慢跑,随着背景
            complete: function() { 
                $girl.transition({
                    left: startPox
                }, 30000, 'linear', function() {
                    console.log('人物到达中间')
                });
            }
        })


        //监听动画变化
        swipe.watch('move', function(distance) {
            // Qixi.disposeAction(distance)
        })

        //监听动画完成
        swipe.watch('complete', function() {
           
        })
    },

    //获取当前的页面
    getCurrentPage:function(){

    },

    //处理当前动作
    disposeAction:function(distance){



        // console.log(distance,Qixi.range)

    }

}


$(function() {
    //七夕主题效果，开始
    Qixi.init();
})
