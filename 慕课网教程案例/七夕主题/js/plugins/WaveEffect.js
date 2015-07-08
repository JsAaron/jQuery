/**
 * 水波效果
 * @type {[type]}
 */

var WaveEffect = function(){};

WaveEffect.prototype = {

    /**
     * 背景图的新位置
     * backgroundPositionX
     * backgroundPositionY
     *
     * 改变的倍数
     * 通过改了速率，形成不同的波纹
     * stepMultiple
     *
     * 改变的基数
     * stepBaseX
     * stepBaseY
     *
     * 动画调用的时间
     * timer
     */
    initialize: function(element, backgroundPositionX, backgroundPositionY, stepMultiple, stepBaseX, stepBaseY, timer) {
        this.el = document.getElementById(element)
        this.posX = backgroundPositionX;
        this.posY = backgroundPositionY;
        this.count = stepMultiple;
        this.stepBaseX = stepBaseX;
        this.stepBaseY = stepBaseY;
        this.step = 0;
        this.isChange = true;
        this.timer = timer || 100
        this.play()
    },

    //播放
    play: function() {
        var self = this;
        this.interval = setInterval(function() {
            self.toMove()
        }, self.timer);
        //设置新的坐标
        self.el.style.backgroundPosition = self.posX + "px " + self.posY + "px"
    },

    //停止
    stop: function() {
        clearInterval(this.interval)
        this.interval = null;
    },

    //开始动画
    toMove: function() {
        var self = this;
        //开始是正增长
        if (self.isChange) {
            self.step++
        } else {
            self.step--
        }
        //如果到了最大数,开始递减
        if (self.step >= self.count) {
            self.isChange = false
        } else {
            if (self.step <= 0) {
                self.isChange = true
            }
        }
        //波动算法
        //上下浮动的距离+新的坐标
        self.el.style.backgroundPosition = (self.step * self.stepBaseX + self.posX) + "px " + (self.step * self.stepBaseY + self.posY) + "px"
    }
}
