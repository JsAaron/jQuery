/****************************************************************
 * 		 支持AMD,CMD模块加载方式
 * 		 @by Aaron
 *          	 github:https://github.com/JsAaron/aaronRequire
 *          	 blog:http://www.cnblogs.com/aaronjs/
 *****************************************************************/
;
(function(r) {
	if (typeof module === "object" && typeof require === "function") {
		module.exports.require = r.require;
		module.exports.define = r.define;
	} else {
		require = r.require;
		define = r.define;
	}
})(function() {

	var objproto = Object.prototype,
		objtoString   = objproto.toString,
		arrproto      = Array.prototype,
		nativeForEach = arrproto.forEach,
		modules       = {},
		pushStack     = {};

	function each(obj, callback, context) {
		if (obj == null) return;
		//如果支持本地forEach方法,并且是函数
		if (nativeForEach && obj.forEach === nativeForEach) {
			obj.forEach(callback, context);
		} else if (obj.length === +obj.length) {
			//for循环迭代
			for (var i = 0, l = obj.length; i < l; i++) {
				if (callback.call(context, obj[i], i, obj) === breaker) return;
			}
		}
	};

	function isFunction(it) {
		return objtoString.call(it) === '[object Function]';
	}

	function isArray(it) {
		return objtoString.call(it) === '[object Array]';
	}

	//导入模块
	var exp = {
		require: function(id, callback) {
			//数组形式
			//require(['domReady', 'App'], function(domReady, app) {});
			if (isArray(id)) {
				if (id.length > 1) {
					return makeRequire(id, callback);
				}
				id = id[0];
			}

			if (!modules[id]) {
				throw "module " + id + " not found";
			}

			if (callback) {
				var module = build(modules[id]);
				callback(module)
				return module;
			} else {
				if (modules[id].factory) {
					return build(modules[id]);
				}
				return modules[id].exports;
			}
		},
		//定义模块
		define: function(id, deps, factory, post) { //模块名,依赖列表,模块本身
			if (modules[id]) {
				throw "module " + id + " 模块已存在!";
			}
			//存在依赖导入
			if (arguments.length > 2) {
				modules[id] = {
					id: id,
					deps: deps,
					factory: factory
				};
				//后加载
				post && exp.require(id, function(exp) {
					post(exp)
				})
			} else {
				factory = deps;
				modules[id] = {
					id: id,
					factory: factory
				};
			}
		}
	}

	//解析依赖关系
	function parseDeps(module) {
		var deps = module['deps'],
			temp = [];
		each(deps, function(id, index) {
			temp.push(build(modules[id]))
		})
		return temp;
	}

	function build(module) {
		var depsList, existMod,
			factory = module['factory'],
			id = module['id'];

		if (existMod = pushStack[id]) { //去重复执行
			return existMod;
		}

		//接口点，将数据或方法定义在其上则将其暴露给外部调用。
		module.exports = {};

		//去重
		delete module.factory;

		if (module['deps']) {
			//依赖数组列表
			depsList = parseDeps(module);
			module.exports = factory.apply(module, depsList);
		} else {
			// exports 支持直接 return 或 modulejs.exports 方式
			module.exports = factory(exp.require, module.exports, module) || module.exports;
		}

		pushStack[id] = module.exports;

		return module.exports;
	}

	//解析require模块
	function makeRequire(ids, callback) {
		var r = ids.length,
			shim = {};
		each(ids, function(name) {
			shim[name] = build(modules[name])
		})
		if (callback) {
			callback.call(null, shim);
		} else {
			shim = null;
		}
	}

	return exp;
}());