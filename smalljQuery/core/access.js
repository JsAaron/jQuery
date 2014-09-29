//============================================
//
//	配套核心方法,参数set/get存取器
//	
//	多用途的方法：
//	给一组合集get或者set值
//	假如值是一个函数可以视情况执行
//
//============================================
define([
	"../core"
], function( aAaron ) {

	var access = aAaron.access = function(elems, fn, key, value, raw) {
		var i = 0,
			len = elems.length,
			//判断是set/get
			bulk = key == null; 

		//sets操作
		//如果key是对象数据
		if (aAaron.type(key) === 'object') {
			alert('access-如果key是对象数据')
			return 1111
			//如果只是单个值
		} else if (value !== undefined) {

			//检测是否为可以执行函数
			if (!aAaron.isFunction(value)) {
				raw = true;
			}

			//需要把解析出来后的参数回调处理方法
			//执行具体的处理手段
			if (raw) {
				fn.call(elems, value);
				fn = null;
			} 
		}

		//如果是gets操作
		if (bulk) {
			return fn && fn.call(elems)
		}
	};

	return access;
});
