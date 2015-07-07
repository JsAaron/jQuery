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
        var element   = container.children[0];
        var slides    = element.children;

        //页面滑动对象
        var swipe = Swipe(container);

        //构建第一个页面
        PageA(container,pageAcomplete)

        //第一个页面的所有动作完成后
        function pageAcomplete() {
            //页面到下一个页面
            swipe.next();
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
