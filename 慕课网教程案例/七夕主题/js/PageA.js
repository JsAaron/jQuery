
/**
 * 第一个页面
 * @param  {[type]} argument [description]
 * @return {[type]}          [description]
 */
var PageA = function() {


	//构建水波浪图
	new WaveEffect("qx_water_1_1", -10, -1, 9, 1.5, 1.5)
	new WaveEffect("qx_water_1_2", 20, -50, 7, 1.5, 1.2)
	new WaveEffect("qx_water_1_3", 50, 7, 8, 0.8, 1.5)


	return {
		run: function() {

		}
	}
}