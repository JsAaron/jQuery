/**
 * 拼图游戏构造器
 * contentArea 文本区域
 * imageSrc	   图片地址
 * @return {[type]} [description]
 */
function puzzleGame(contentArea, imageSrc, level) {

    //显示图片节点
    this.$contentArea = $(contentArea)
    this.imageSrc = imageSrc;

    //显示区域的尺寸
    this.contentWidth  = parseInt(this.$contentArea.css('width'))
    this.contentHeight = parseInt(this.$contentArea.css('Height'))

    var offset = this.$contentArea.offset()
    this.contentLeft   = offset.left;
    this.contentTop    = offset.top


    //定义级别难度
    var level = this.level = {
        x:3,
        y:3
    }

    //碎片合集
    this.$debris = '';
    this.aminTime = 350; //记录animate动画的运动时间，默认400毫秒

    //计算每一个碎片图片的应该有的尺寸
    this.debrisWidth = this.contentWidth / level.x;
    this.debrisHeight = this.contentHeight / level.y;


    this.init();

    console.log(this)

}


puzzleGame.prototype = {

    //初始化
    init: function() {
        //初始化布局3*3
        this.layer(this.level.x, this.level.y);
    },


    //布局
    //3 * 3 默认
    layer: function(xlen, ylen) {
        var debris; //每一个碎片图片节点
        var debrisWidth = this.debrisWidth;
        var debrisHeight = this.debrisHeight;
        //临时文档碎片
        var fragment = document.createElement('createDocumentFragment');
        var $fragment = $(fragment);
        //布局的正确排序
        this.correctOrder = [];

        for (var i = 0; i < xlen; i++) {
            for (var j = 0; j < ylen; j++) {
                //用来对比随机后正确的顺序
                this.correctOrder.push(i * ylen + j);
                debris = document.createElement("div");
                debris = $(debris).css({
                    'float': 'left',
                    'border': '1px solid red',
                    'border-radius': '5px',
                    'position': 'absolute',
                    'z-index': 5,
                    'box-shadow': '0px 0px 15px #fff',
                    'transition-property': 'background-position',
                    'transition-duration': '300ms', //动画参数
                    'transition-timing-function': 'ease-in-out',
                    'width': (debrisWidth - 2) + 'px',
                    'height': (debrisHeight - 2) + 'px',
                    'left': j * debrisWidth + 'px',
                    'top': i * debrisHeight + 'px',
                    "background": "url('" + this.imageSrc + "')",
                    'backgroundPosition': (-j) * debrisWidth + 'px ' + (-i) * debrisHeight + 'px'
                });
                $fragment.append(debris)
            }
        }

        //保存碎片节点合集
        this.$debris = $(fragment.childNodes)
        this.$contentArea.append(fragment.childNodes);
    },


    //开始游戏
    startGame: function() {
        //打乱图片
        this.calculateRandom();
        this.layerOrder(this.randomOrder);

        this.$contentArea.css({
            'cursor': 'pointer'
        })

        //绑定事件处理
        this.creatEvent();

    },

    //==================事件处理================

    mousedown: function(event) {
		this.isClick = true; //点击了屏幕
        this.$contentArea.css({
            'cursor': 'move'
        })

        this.element = $(event.target);

        //提供移动层级
		this.element.css({
			'z-index': '40'
		})

		this.orgLeft = parseInt(this.element.css('left'))
		this.orgTop  = parseInt(this.element.css('top'))

        this.start = {
			pageX : event.pageX,
			pageY : event.pageY,
			time  : (+new Date())
        }

        //得到点击的索引位
        this.startDebrisIndex = this.calculateExchangeElement(event.pageX, event.pageY)
    },

    mousemove: function(event) {
    	if(!this.isClick) return
		var deltaX = event.pageX - this.start.pageX;
		var deltaY = event.pageY - this.start.pageY;
		//元素移动的距离
        this.element.css({
            'left' : deltaX + this.orgLeft + 'px',
            'top'  : deltaY +  this.orgTop + 'px'
        })
    },

    //松手
    mouseup: function(event) {
    	if(!this.isClick) return
    	this.isClick = false
        this.$contentArea.css({
            'cursor': 'pointer'
        })

        //拖动结束的索引位
        var endDebrisIndex = this.calculateExchangeElement(event.pageX, event.pageY)

        //反弹,还原
        if(this.startDebrisIndex === endDebrisIndex){
            this.restorePosition(endDebrisIndex);
        }else{
            //切换碎片图
            this.debrisExchange(this.startDebrisIndex,endDebrisIndex)
        }
      
    },

    //切换碎片图
    debrisExchange: function(from, to) {

    },
    

    //反弹，还原位置
    restorePosition: function(debrisIndex) {
        this.element.animate({
            'top'  : this.orgTop + 'px',
            'left' : this.orgLeft + 'px'
        }, this.moveTime, function() {
            //动画结束后,恢复层级关系
            $(this).css('z-index', '10');
        });
    },


    //计算交换元素
	calculateExchangeElement: function(pageX, pageY) {

        //根据当前移动的位置，与屏幕的每个碎片图比一下，得到当前的位置比
        var col = Math.floor((pageY - this.contentTop) / this.debrisWidth),
            row = Math.floor((pageX - this.contentLeft) / this.debrisHeight);

        //从整数1开始算起
        col = col + 1; //列
        row = row + 1; //行

        //索引位置
        //（上一列数 * 指定行）+ 当前行数
        var index = ( (col - 1) * this.level.y) + row

        return this.randomOrder[index - 1]; //按照0开始索引
	},

    //绑定事件
    creatEvent: function() {
    	var self = this;
		this.$contentArea.mousedown(function(event) {
			self.mousedown(event)
		})
		this.$contentArea.mousemove(function(event) {
			self.mousemove(event)
		})
		this.$contentArea.mouseup(function(event) {
			self.mouseup(event)
		})
        return event;
    },

    //计算下随机布局排序
    calculateRandom: function() {
        //新是随机排序
        this.randomOrder = [];
        //计算随机
        var calculate = function(len) {
            return Math.floor(Math.random() * len);
        }
        for (var i = 0, len = this.correctOrder.length; i < len; i++) {
            var order = calculate(len);
            if (this.randomOrder.length > 0) {
                while (jQuery.inArray(order, this.randomOrder) > -1) {
                    order = calculate(len) //如果重复了，再次随机,直到每一个都唯一
                }
            }
            this.randomOrder.push(order);
        }
    },

    //随机布局
    layerOrder: function(randomOrder) {
        for (var i = 0, len = randomOrder.length; i < len; i++) {
            //变换新的位置
            this.$debris.eq(i).animate({
                'left': randomOrder[i] % this.level.y * this.debrisWidth + 'px',
                'top': Math.floor(randomOrder[i] / this.level.x) * this.debrisHeight + 'px'
            }, this.aminTime)
        }
    },

    //设置游戏的困难度
    setLevel: function(x, y) {

    }
}
