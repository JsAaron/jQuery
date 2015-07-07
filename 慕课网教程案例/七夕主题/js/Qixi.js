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

        //用transition运行走动
        $girl.transition({ 
            left: startPox / 3 //第一次之运行1.5/3的距离
        }, 7000, 'linear', function() {
            //页面开始滚动
            swipe.scrollTo(distance * 2, 30000)
            //用transition继续运动
            $girl.transition({
                left: startPox
            }, 30000, 'linear', function() {
                console.log('人物到达中间')
            });
        });


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
