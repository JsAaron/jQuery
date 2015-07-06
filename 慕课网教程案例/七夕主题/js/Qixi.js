/**
 * 七夕主题效果
 * @type {Object}
 */
var Qixi = {

    createClass: function() {
        return function() {
            this.initialize.apply(this, arguments)
        }
    },

    init: function() {

        var container = document.getElementById('swipe');
        var element = container.children[0];
        var slides = element.children;

        //页面滑动对象
        var swipe = Swipe(container);

        new WaveEffect("qx_water_1_1", -10, -1, 9, 1.5, 1.5)
        new WaveEffect("qx_water_1_2", 20, -50, 7, 1.5, 1.2)
        new WaveEffect("qx_water_1_3", 50,7,8,0.8,1.5) 



        swipe.initComplete = function() {
            page1.start() //开始执行
        }

        $("button").click(function() {
            swipe.next();
        })
    }
}





$(function() {
    //七夕主题效果，开始
    Qixi.init();
})
