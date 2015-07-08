/**
 * 云动画
 */
var CloudEffect = function() {
    var $main = $cloud = screenWidth = null;
    var offset1  = 450;
    var offset2  = 0;
    var offsetbg = 0;
    var timer    = 0;
    $main   = $("#cloudArea");
    $cloud1 = $("#cloud1");
    $cloud2 = $("#cloud2");
    //屏幕宽度
    screenWidth = $main.outerWidth();
    return {
        run: function() {
            timer = setInterval(function flutter() {
                //如果运动的范围超过屏幕宽度，从580的地方开始
                if (offset1 >= screenWidth) {
                    offset1 = -580;
                }
                if (offset2 >= screenWidth) {
                    offset2 = -580;
                }
                offset1 += 1.1;
                offset2 += 1;
                $cloud1.css("background-position", offset1 + "px 0px")
                $cloud2.css("background-position", offset2 + "px 30px")
            }, 50);
        },
        //停止动画
        stop: function() {
            clearInterval(timer)
        }
    }
}
