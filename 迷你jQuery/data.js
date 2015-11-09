//====================================================
//
//	数据缓存:
//		方法允许我们在DOM元素上绑定任意类型的数据,
//		避免了循环引用的内存泄漏风险。
//		
//=====================================================
define([
	"./core",
	//引入参数access方法
	"./core/access"
],function(aAron, access) {

	/**
	 * 确保是一个对象有数据
	 */
	var acceptData = aAron.acceptData = function( owner ) {
		//只接受几种类型
		//元素节点
		//文档节点
		//任何对象
		return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
	};


	function Data() {
		//向下兼容
		//旧版本的Webkit没有对象的定义
		Object.defineProperty(this.cache = {}, 0, {
			get: function() {

			}
		})

		//UUID基于版本号+随机数
		//避免一个用户引入多个版本的同样的库
		this.expando = aAron.expando + Math.random();
	}

	//生成唯一的UUID
	Data.uid = 1;


	var dataProto = Data.prototype;


	dataProto.key = function(owner) {
		//如果不是一个对象或者节点
		if (!acceptData(owner)) {
			return 0;
		}

		//建立内部对象
		var descriptor = {},
			//检测对象是否有锁定标志
			unlock = owner[ this.expando ];

		//如果没有,则创建
		if ( !unlock ) {
			unlock = Data.uid++;
			//通过ES5的设置,让这个值不能被改写
			try {
				descriptor[this.expando] = {
					value: unlock
				};
				Object.defineProperties(owner, descriptor);
			} catch (e) {
				//低版本兼容处理
				descriptor[this.expando] = unlock;
				aAron.extend(owner, descriptor);
			}
		}

		//确保缓存中存在这个对象
		if ( !this.cache[ unlock ] ) {
			this.cache[ unlock ] = {};
		}

		return unlock;
	}

	/**
	 * 设置对象的缓存
	 * 保存的格式
	 * cache {
	 * 	 1:{
	 * 	 	backgroundSize:{
	 * 	 		a:1,
	 * 	 		b:2
	 * 	 	}
	 * 	 }
	 * }
	 * 
	 * @param {[type]} owner [description]
	 * @param {[type]} data  [description]
	 * @param {[type]} value [description]
	 */
	dataProto.set = function(owner, data, value) {
		var prop,
			//分配给这个节点,可能有一个解锁
			//如果没有则内部创建
			unlock = this.key(owner),
			//找到缓存容器对象
			cache = this.cache[unlock];

		//如果是key字符串,直接缓存
		//这里存在一个问题
		//对相同的接口做不同的处理不会累计,都会直接覆盖
		if (typeof data === "string") {
			cache[data] = value;
		} else {
			//====================================
			// 直接传递对象,设置多个值的处理
			// .data({
			// 		myType : "test",
			// 		count  : 40
			// });
			// ===================================
			if (aAron.isEmptyObject(cache)) {
				aAron.extend(this.cache[unlock], data);
			} else {
				// 否则,一个接一个的属性复制到缓存对象
				for (prop in data) {
					cache[prop] = data[prop];
				}
			}
		}
		return cache;
	}

	/**
	 * 从缓存中取值数据
	 * @return {[type]}       [description]
	 */
	dataProto.get = function(owner, key) {
		var cache = this.cache[this.key(owner)];
		return key === undefined ?
			cache : cache[key];
	}


	//内部使用的缓存
	var data_priv = new Data();


	//用户使用的缓存
	var data_user = new Data();

	/**
	 * 扩展静态方法
	 */
	aAron.extend({

		exportData:function(){
			return data_user
		},

		data:function(){

		}
	});

	console.log(aAron.exportData)

	/**
	 * 扩展实例方法
	 */
	aAron.fn.extend({
		/*
		 * set/get同接口
		 * 通过传递参数不同区分
		 */
		data: function(key, value) {
			var i, name, data,
				elem = this[0],
				attrs = elem && elem.attributes;

			//获取所有的缓存对象
			if(key === undefined){

				
				return
			}

			//如果key是直接对象,则设置多个值缓存
			if (typeof key === "object") {
				return this.each(function() {
					data_user.set(this, key);
				});
			}

			//set操作
			//抽象出access参数解析方法
			return access(this, function(value) {
				var data,
					//转化key正确
					//background-color => backgroundColor
					camelKey = aAron.camelCase(key);

				//get操作
				if ( elem && value === undefined ) {

					//如果缓存中的值,取到则返回
					data = data_user.get(elem, key);
					if (data !== undefined) {
						return data;
					}

					//如果key是backgournd-size命名
					//则取转换的key
					data = data_user.get( elem, camelKey );
					if ( data !== undefined ) {
						return data;
					}

					return
				}

				//设置数据缓存
				this.each(function() {
					data_user.set(this, camelKey, value);
				});

			}, null, value)
		}
	});



	return aAron;
})