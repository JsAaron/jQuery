/**
 * 七夕主题效果
 * https://github.com/rstacruz/jquery.transit/blob/master/jquery.transit.js
 * http://code.ciaoca.com/jquery/transit/demo/
 * @type {Object}
 */
var Qixi = {

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

  
        $girl.animate({
            left: startPox  //第一给li中间距离
        },{
            easing:'linear',//匀速
            duration:20000,
            progress:function(){
                var percentage = arguments[1];
                if(percentage>0.8){
                    swipe
                    //滑动到最后一页
                    .scrollTo(distance * 2, 30000)
                    //监听动画完成
                    .monitorAnimComplete = function(){

                    }
                }
    
            }
        })


    }
}


$(function() {
    //七夕主题效果，开始
    Qixi.init();
})
