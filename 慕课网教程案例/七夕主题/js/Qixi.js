/**
 * 七夕主题效果
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

        $("#girl").animate({
            left: startPox  //第一给li中间距离
        },{
            duration:3000,
            progress:function(){
                var percentage = arguments[1];
                if(percentage>0.8){
                    swipe.scrollTo(distance*3,30000)
                }
    
            }
        })

     

    }
}


$(function() {
    //七夕主题效果，开始
    Qixi.init();
})
