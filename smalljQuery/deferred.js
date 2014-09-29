//=========================================================================================================
//		
//	步队列
//	延迟对象，在jQuery的1.5引入，是通过调用jQuery.Deferred()方法创建一个可链式调用的工具对象。 
//	它可以注册多个回调到回调队列， 调用回调队列，准备代替任何同步或异步函数的成功或失败状态。
//	延迟对象是可链式调用的，类似于jQuery对象是可链接的方式，  但它有其自己的方法。
//	创建一个Deferred（延迟）对象后，你可以通过使用下面任何方法 直接从对象创建或者链式调用 或 保存对象的一个变量，
//	调用该变量的一个或多个方法。
//		
//		
//	内部构建3条线
//	
//	1 成功线
//			 done回调->resolve 改变状态为resolved
//			 
//	2 失败线
//			 fail回到->reject  改变状态为rejected
//			 
//	3 状态线
//	
//	
//	巧妙的设计：
//		在第一次执行done的时候内部执行了list
//		在更改状态的时候,fire触发了,memory也就成立了,那么证明这条链是已经被触发过的
//		后续的done在加入的时候,检测到memory也就会立即执行了
//			
//=========================================================================================================
define([
	"./core",
	"./callbacks"
], function(aAron) {

	aAron.extend({

		Deferred: function(func) {

			//开始状态,构建
			var state = "pending";

			var tuples = [
				// 添加成功, 失败,变化侦听器
				// 分别为3个回调控制
				["resolve", "done", aAron.Callbacks("once memory"), "resolved"],
				["reject", "fail", aAron.Callbacks("once memory"), "rejected"],
				["notify", "progress", aAron.Callbacks("memory")]
			];

			var promise = {

				/**
				 * 查询状态
				 * @return {[type]} [description]
				 */
				state: function() {
					return state;
				},

				/**
				 * 失败或者成功都会调用到
				 * @return {[type]} [description]
				 */
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},

				/**
				 * 当Deferred（延迟）对象解决，拒绝或仍在进行中时，调用添加处理程序。
				 * @return {[type]} [description]
				 * then实现了pipe的管道,回调使用瀑布模型
				 * 提供成功，失败，进度3个回调的处理
				 */
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return aAron.Deferred(function( newDefer ) {
						aAron.each( tuples, function( i, tuple ) {
							var fn = aAron.isFunction(fns[i]) && fns[i];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[tuple[1]](function() {
								var returned = fn && fn.apply(this, arguments);
								newDefer[tuple[0] + "With"](this === promise ? newDefer.promise() : this, fn ? [returned] : arguments);
							});
						});
						fns = null;
					}).promise();
				},

				/**
				 * 让对象继承promise方法
				 * 这里的方法只能是可读的
				 * @param  {[type]} obj [description]
				 * @return {[type]}     [description]
				 */
				promise: function( obj ) {
					return obj != null ? aAron.extend( obj, promise ) : promise;
				}
				
			};

			//添加管道队列
			//就是回调的值提供给下一个回调使用
			promise.pipe = promise.then;

			//返回的对象
			var deferred = {};

			/**
			 * 通过分解tuples做各种匹配动作
			 * 针对成功与失败,注册了三个函数处理
			 */
			aAron.each(tuples, function(i, tuple) {
				//获取回调对象
				var list = tuple[2],
					stateString = tuple[3];

				//给promise添加[ done | fail | progress ] = list.add
				promise[ tuple[1] ] = list.add;

				if (stateString) {
					//内部注册成功/失败后处理
					//1 resolved或者rejected后修正状态
					//2 [ reject_list | resolve_list ].disable
					//3 progress_list.lock
					//	
					//执行三条中的任意一条线路，针对剩余2条线的处理
					//
					//tuples[i ^ 1][2].disable 反向处理
					//如果成功执行了,就清理失败,反之亦然
					//	
					//tuples[2][2].lock
					//notify的处理
					//	
					list.add(function() {
						state = stateString;
					}, tuples[i ^ 1][2].disable, tuples[2][2].lock);
				}

				//生成deferred对象需要的返回
				// deferred[ resolve | reject | notify ]
				deferred[tuple[0]] = function() {
					deferred[tuple[0] + "With"](this === deferred ? promise : this, arguments);
					return this;
				};
				//允许传入上下文
				// deferred[ resolveWith | rejectWith | notifyWith]
				deferred[ tuple[0] + "With" ] = list.fireWith;
			});

			// 生成一个deferred的promise
			// deferred 本身只有 6个方法
			// 通过promise接口混入promise方法
			promise.promise( deferred );

			//如果开始就传递了一个函数回调
			if ( func ) {
				func.call( deferred, deferred );
			}

			return deferred;
		},

		when: function() {

		}

	})

	return aAron;
});