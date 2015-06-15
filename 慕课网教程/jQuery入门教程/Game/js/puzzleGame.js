
/**
 * 拼图游戏构造器
 * contentArea 文本区域
 * imageSrc	   图片地址
 * @return {[type]} [description]
 */
function puzzleGame(contentArea, imageSrc) {

	//定义级别难度
	this.level = [
		[3, 3],
		[4, 4],
		[6, 6]
	];

	this.$contentArea = $(contentArea)

	//显示区域的尺寸
	this.$contentWidth  = this.$contentArea.css('width')
	this.$contentHeight = this.$contentArea.css('Height')

	//计算每一个碎片图片的应该有的尺寸
	this.$debrisWidth  = this.imgWidth / this.levelArr[this.levelNow][1];
	this.$debrisHeight = this.imgHeight / this.levelArr[this.levelNow][0];


	this.init();

	console.log(this)

}





puzzleGame.prototype = {


	init:function(){
		this.layer();
	},

	//布局
	layer:function(){

	},




	//开始游戏
	startGame:function(){

	},

	//设置游戏的困难度
	setDifficulty: function(x, y) {

	}

}