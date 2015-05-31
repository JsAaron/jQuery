/**
 * @fileOverview JSDeferred
 * @author       cho45@lowreal.net
 * @version      0.4.0
 * @license
 * JSDeferred Copyright (c) 2007 cho45 ( www.lowreal.net )
 *
 * http://github.com/cho45/jsdeferred
 *
 * License:: MIT
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
; // no warnings for uglify

/*
 * Syntax of comments:
 * http://code.google.com/intl/ja/closure/compiler/docs/js-for-compiler.html
 */

/**
 * Create a Deferred object
 *
 * @example
 *   var d = new Deferred();
 *   // or this is shothand of above.
 *   var d = Deferred();
 *
 * @example
 *   Deferred.define();
 *
 *   $.get("/hoge").next(function (data) {
 *       alert(data);
 *   }).
 *
 *   parallel([$.get("foo.html"), $.get("bar.html")]).next(function (values) {
 *       log($.map(values, function (v) { return v.length }));
 *       if (values[1].match(/nextUrl:\s*(\S+)/)) {
 *           return $.get(RegExp.$1).next(function (d) {
 *               return d;
 *           });
 *       }
 *   }).
 *   next(function (d) {
 *       log(d.length);
 *   });
 *
 * @constructor
 */
function Deferred() {
		return (this instanceof Deferred) ? this.init() : new Deferred()
	}
	/** 
	 * Default callback function
	 * @type {function(this:Deferred, ...[*]):*}
	 * @field
	 */
Deferred.ok = function(x) {
	return x
};
/** 
 * Default errorback function
 * @type {function(this:Deferred, ...[*]):*}
 * @field
 */
Deferred.ng = function(x) {
	throw x
};
Deferred.prototype = {
	/**
	 * This is class magic-number of Deferred for determining identity of two instances
	 * that are from different origins (eg. Mozilla Add-on) instead of using "instanceof".
	 *
	 * @const
	 */
	_id: 0xe38286e381ae,

	/**
	 * @private
	 * @return {Deferred} this
	 */
	init: function() {
		this._next = null;
		this.callback = {
			ok: Deferred.ok,
			ng: Deferred.ng
		};
		return this;
	},

	/**
	 * Create new Deferred and sets `fun` as its callback.
	 *
	 * @example
	 *   var d = new Deferred();
	 *
	 *   d.
	 *   next(function () {
	 *     alert(1);
	 *   }).
	 *   next(function () {
	 *     alert(2);
	 *   });
	 *
	 *   d.call();
	 *
	 * @param {function(this:Deferred, ...[*]):*} fun Callback of continuation.
	 * @return {Deferred} Next Deferred object
	 */
	next: function(fun) {
		return this._post("ok", fun)
	},

	/**
	 * Create new Deferred and sets `fun` as its errorback.
	 *
	 * If `fun` not throws error but returns normal value, Deferred treats
	 * the given error is recovery and continue callback chain.
	 *
	 * @example
	 *   var d =  new Deferred();
	 *
	 *   d.
	 *   next(function () {
	 *     alert(1);
	 *     throw "foo";
	 *   }).
	 *   next(function () {
	 *     alert('not shown');
	 *   }).
	 *   error(function (e) {
	 *     alert(e); //=> "foo"
	 *   });
	 *
	 *   d.call();
	 *
	 * @param {function(this:Deferred, ...[*]):*} fun Errorback of continuation.
	 * @return {Deferred} Next Deferred object
	 */
	error: function(fun) {
		return this._post("ng", fun)
	},

	/**
	 * Invokes self callback chain.
	 *
	 * @example
	 *   function timeout100 () {
	 *     var d = new Deferred();
	 *     setTimeout(function () {
	 *        d.call('value');
	 *     }, 100);
	 *     return d;
	 *   }
	 *
	 * @param {*} val Value passed to continuation.
	 * @return {Deferred} this
	 */
	call: function(val) {
		return this._fire("ok", val)
	},

	/**
	 * Invokes self errorback chain. You can use this method for explicit errors (eg. HTTP request failed)
	 *
	 * @example
	 *   function http (url) {
	 *     var d = new Deferred();
	 *     var x = new XMLHttpRequest();
	 *     x.onreadystatechange = function () {
	 *       if (x.readyState == 4) {
	 *         if (x.status == 200) d.call(x); else d.fail(x);
	 *       }
	 *     };
	 *     return d;
	 *   }
	 *
	 * @param {*} val Value of error.
	 * @return {Deferred} this
	 */
	fail: function(err) {
		return this._fire("ng", err)
	},

	/**
	 * Cancel receiver callback (this is only valid before invoking any callbacks)
	 *
	 * @return {Deferred} this
	 */
	cancel: function() {
		(this.canceller || function() {}).apply(this);
		return this.init();
	},

	_post: function(okng, fun) {
		this._next = new Deferred();
		this._next.callback[okng] = fun;
		return this._next;
	},

	_fire: function(okng, value) {
		var next = "ok";
		try {
			value = this.callback[okng].call(this, value);
		} catch (e) {
			next = "ng";
			value = e;
			if (Deferred.onerror) Deferred.onerror(e);
		}
		if (Deferred.isDeferred(value)) {
			value._next = this._next;
		} else {
			if (this._next) this._next._fire(next, value);
		}
		return this;
	}
};
/**
 * Returns true if an argument is Deferred.
 *
 * @function
 * @param {*} obj Object to determine
 * @return {boolean}
 */
Deferred.isDeferred = function(obj) {
	return !!(obj && obj._id === Deferred.prototype._id);
};

/**
 * `next` is shorthand for creating new deferred which
 * is called after current queue.
 *
 * @function
 * @name Deferred.next
 * @param {function():*} fun Callback function
 * @return {Deferred}
 */
Deferred.next_default = function(fun) {
	var d = new Deferred();
	var id = setTimeout(function() {
		d.call()
	}, 0);
	d.canceller = function() {
		clearTimeout(id)
	};
	if (fun) d.callback.ok = fun;
	return d;
};
Deferred.next_faster_way_readystatechange = ((typeof window === 'object') && (location.protocol == "http:") && !window.opera && /\bMSIE\b/.test(navigator.userAgent)) && function(fun) {
	// MSIE
	var d = new Deferred();
	var t = new Date().getTime();
	if (t - arguments.callee._prev_timeout_called < 150) {
		var cancel = false;
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = "data:text/javascript,";
		script.onreadystatechange = function() {
			if (!cancel) {
				d.canceller();
				d.call();
			}
		};
		d.canceller = function() {
			if (!cancel) {
				cancel = true;
				script.onreadystatechange = null;
				document.body.removeChild(script);
			}
		};
		document.body.appendChild(script);
	} else {
		arguments.callee._prev_timeout_called = t;
		var id = setTimeout(function() {
			d.call()
		}, 0);
		d.canceller = function() {
			clearTimeout(id)
		};
	}
	if (fun) d.callback.ok = fun;
	return d;
};
Deferred.next_faster_way_Image = ((typeof window === 'object') && (typeof(Image) != "undefined") && !window.opera && document.addEventListener) && function(fun) {
	// Modern Browsers
	var d = new Deferred();
	var img = new Image();
	var handler = function() {
		d.canceller();
		d.call();
	};
	img.addEventListener("load", handler, false);
	img.addEventListener("error", handler, false);
	d.canceller = function() {
		img.removeEventListener("load", handler, false);
		img.removeEventListener("error", handler, false);
	};
	img.src = "data:image/png," + Math.random();
	if (fun) d.callback.ok = fun;
	return d;
};
Deferred.next_tick = (typeof process === 'object' && typeof process.nextTick === 'function') && function(fun) {
	var d = new Deferred();
	process.nextTick(function() {
		d.call()
	});
	if (fun) d.callback.ok = fun;
	return d;
};
Deferred.next =
	Deferred.next_faster_way_readystatechange ||
	Deferred.next_faster_way_Image ||
	Deferred.next_tick ||
	Deferred.next_default;

/**
 * Construct Deferred chain with array and return its Deferred.
 * This is shorthand for construct Deferred chains.
 *
 * @example
 *  return chain(
 *      function () {
 *          return wait(0.5);
 *      },
 *      function (w) {
 *          throw "foo";
 *      },
 *      function error (e) {
 *          alert(e);
 *      },
 *      [
 *          function () {
 *              return wait(1);
 *          },
 *          function () {
 *              return wait(2);
 *          }
 *      ],
 *      function (result) {
 *          alert([ result[0], result[1] ]);
 *      },
 *      {
 *          foo: wait(1),
 *          bar: wait(1)
 *      },
 *      function (result) {
 *          alert([ result.foo, result.bar ]);
 *      },
 *      function error (e) {
 *          alert(e);
 *      }
 *  );
 *
 * @param {...[(Array.<function(*):*>|Object.<string,function(*):*>|function(*):*)]} arguments Process chains
 * @return {Deferred}
 */
Deferred.chain = function() {
	var chain = Deferred.next();
	for (var i = 0, len = arguments.length; i < len; i++)(function(obj) {
		switch (typeof obj) {
			case "function":
				var name = null;
				try {
					name = obj.toString().match(/^\s*function\s+([^\s()]+)/)[1];
				} catch (e) {}
				if (name != "error") {
					chain = chain.next(obj);
				} else {
					chain = chain.error(obj);
				}
				break;
			case "object":
				chain = chain.next(function() {
					return Deferred.parallel(obj)
				});
				break;
			default:
				throw "unknown type in process chains";
		}
	})(arguments[i]);
	return chain;
};

/**
 * `wait` returns deferred that will be called after `sec` elapsed
 * with real elapsed time (msec)
 *
 * @example
 *   wait(1).next(function (elapsed) {
 *       log(elapsed); //=> may be 990-1100
 *   });
 *
 * @param {number} sec Second to wait
 * @return {Deferred}
 */
Deferred.wait = function(n) {
	var d = new Deferred(),
		t = new Date();
	var id = setTimeout(function() {
		d.call((new Date()).getTime() - t.getTime());
	}, n * 1000);
	d.canceller = function() {
		clearTimeout(id)
	};
	return d;
};

/**
 * `call` function is for calling function asynchronous.
 *
 * @example
 *   // like tail recursion
 *   next(function () {
 *       function pow (x, n) {
 *           function _pow (n, r) {
 *               print([n, r]);
 *               if (n == 0) return r;
 *               return call(_pow, n - 1, x * r);
 *           }
 *           return call(_pow, n, 1);
 *       }
 *       return call(pow, 2, 10);
 *   }).
 *   next(function (r) {
 *       print([r, "end"]);
 *   });
 *
 * @param {function(...[*]):*} fun Function to call
 * @param {...*} args Arguments passed to `fun`
 * @return {Deferred}
 */
Deferred.call = function(fun) {
	var args = Array.prototype.slice.call(arguments, 1);
	return Deferred.next(function() {
		return fun.apply(this, args);
	});
};

/**
 * `parallel` wraps up `deferredlist` to one deferred.
 * This is useful when some asynchronous resources are required.
 *
 * `deferredlist` can be Array or Object (Hash). If you specify
 * multiple objects as arguments, then they are wrapped into
 * an Array.
 *
 * @example
 *   parallel([
 *       $.get("foo.html"),
 *       $.get("bar.html")
 *   ]).next(function (values) {
 *       values[0] //=> foo.html data
 *       values[1] //=> bar.html data
 *   });
 *
 *   parallel({
 *       foo: $.get("foo.html"),
 *       bar: $.get("bar.html")
 *   }).next(function (values) {
 *       values.foo //=> foo.html data
 *       values.bar //=> bar.html data
 *   });
 *
 * @param {(Array.<Deferred>|Object.<string,Deferred>)} dl Deferred objects wanted to wait
 * @return {Deferred}
 * @see Deferred.earlier
 */
Deferred.parallel = function(dl) {
	var isArray = false;
	if (arguments.length > 1) {
		dl = Array.prototype.slice.call(arguments);
		isArray = true;
	} else if (Array.isArray && Array.isArray(dl) || typeof dl.length == "number") {
		isArray = true;
	}
	var ret = new Deferred(),
		values = {},
		num = 0;
	for (var i in dl)
		if (dl.hasOwnProperty(i))(function(d, i) {
			if (typeof d == "function") dl[i] = d = Deferred.next(d);
			d.next(function(v) {
				values[i] = v;
				if (--num <= 0) {
					if (isArray) {
						values.length = dl.length;
						values = Array.prototype.slice.call(values, 0);
					}
					ret.call(values);
				}
			}).error(function(e) {
				ret.fail(e);
			});
			num++;
		})(dl[i], i);

	if (!num) Deferred.next(function() {
		ret.call()
	});
	ret.canceller = function() {
		for (var i in dl)
			if (dl.hasOwnProperty(i)) {
				dl[i].cancel();
			}
	};
	return ret;
};

/**
 * Continue process when one deferred in `deferredlist` has completed. Others will be canceled.
 * parallel ('and' processing) <=> earlier ('or' processing)
 *
 * @param {(Array.<Deferred>|Object.<string,Deferred>)} dl Deferred objects wanted to wait
 * @return {Deferred}
 * @see Deferred.parallel
 */
Deferred.earlier = function(dl) {
	var isArray = false;
	if (arguments.length > 1) {
		dl = Array.prototype.slice.call(arguments);
		isArray = true;
	} else if (Array.isArray && Array.isArray(dl) || typeof dl.length == "number") {
		isArray = true;
	}
	var ret = new Deferred(),
		values = {},
		num = 0;
	for (var i in dl)
		if (dl.hasOwnProperty(i))(function(d, i) {
			d.next(function(v) {
				values[i] = v;
				if (isArray) {
					values.length = dl.length;
					values = Array.prototype.slice.call(values, 0);
				}
				ret.call(values);
				ret.canceller();
			}).error(function(e) {
				ret.fail(e);
			});
			num++;
		})(dl[i], i);

	if (!num) Deferred.next(function() {
		ret.call()
	});
	ret.canceller = function() {
		for (var i in dl)
			if (dl.hasOwnProperty(i)) {
				dl[i].cancel();
			}
	};
	return ret;
};


/**
 * `loop` function provides browser-non-blocking loop.
 * This loop is slow but not stop browser's appearance.
 * This function waits a deferred returned by loop function.
 *
 * @example
 *   //=> loop 1 to 100
 *   loop({begin:1, end:100, step:10}, function (n, o) {
 *       for (var i = 0; i < o.step; i++) {
 *           log(n+i);
 *       }
 *   });
 *
 * @example
 *   //=> loop 10 times with sleeping 1 sec in each loop.
 *   loop(10, function (n) {
 *       log(n);
 *       return wait(1);
 *   });
 *
 * @param {(number|{begin:number, end:number, step:number})} n Loop count or definition object
 * @param {function(number):*} fun Loop function
 * @return {Deferred} Called when all loop was completed
 */
Deferred.loop = function(n, fun) {
	var o = {
		begin: n.begin || 0,
		end: (typeof n.end == "number") ? n.end : n - 1,
		step: n.step || 1,
		last: false,
		prev: null
	};
	var ret, step = o.step;
	return Deferred.next(function() {
		function _loop(i) {
			if (i <= o.end) {
				if ((i + step) > o.end) {
					o.last = true;
					o.step = o.end - i + 1;
				}
				o.prev = ret;
				ret = fun.call(this, i, o);
				if (Deferred.isDeferred(ret)) {
					return ret.next(function(r) {
						ret = r;
						return Deferred.call(_loop, i + step);
					});
				} else {
					return Deferred.call(_loop, i + step);
				}
			} else {
				return ret;
			}
		}
		return (o.begin <= o.end) ? Deferred.call(_loop, o.begin) : null;
	});
};


/**
 * Loop `n` times with `fun`.
 * This function automatically returns UI-control to browser, if the loop spends over 20msec.
 * This is useful for huge loop not to block browser UI.
 * This function can't wait a deferred returned by loop function, compared with Deferred.loop.
 *
 * @example
 *   repeat(10, function (i) {
 *       i //=> 0,1,2,3,4,5,6,7,8,9
 *   });
 *
 * @param {number} n Loop count
 * @param {function(number)} fun Loop function
 * @return {Deferred} Called when all loop was completed
 */
Deferred.repeat = function(n, fun) {
	var i = 0,
		end = {},
		ret = null;
	return Deferred.next(function() {
		var t = (new Date()).getTime();
		do {
			if (i >= n) return null;
			ret = fun(i++);
		} while ((new Date()).getTime() - t < 20);
		return Deferred.call(arguments.callee);
	});
};

/**
 * Register `fun` to Deferred prototype for method chain.
 *
 * @example
 *   // Deferred.register("loop", loop);
 *
 *   // Global Deferred function
 *   loop(10, function (n) {
 *       print(n);
 *   }).
 *   // Registered Deferred.prototype.loop
 *   loop(10, function (n) {
 *       print(n);
 *   });
 *
 * @param {string} name Name of method
 * @param {function(*):Deferred} fun Actual function of method
 */
Deferred.register = function(name, fun) {
	this.prototype[name] = function() {
		var a = arguments;
		return this.next(function() {
			return fun.apply(this, a);
		});
	};
};

Deferred.register("loop", Deferred.loop);
Deferred.register("wait", Deferred.wait);

/**
 * Connect a function with Deferred.  That is, transform a function
 * that takes a callback into one that returns a Deferred object.
 *
 * @example
 *   var timeout = Deferred.connect(setTimeout, { target: window, ok: 0 });
 *   timeout(1).next(function () {
 *       alert('after 1 sec');
 *   });
 *
 *   var timeout = Deferred.connect(window, "setTimeout");
 *   timeout(1).next(function () {
 *       alert('after 1 sec');
 *   });
 *
 * @param {(function(...[*]):*|*)} funo Target function or object
 * @param {({ok:number, ng:number, target:*}|string)} options Options or method name of object in arguments[0]
 * @return {function(...[*]):Deferred}
 */
Deferred.connect = function(funo, options) {
	var target, func, obj;
	if (typeof arguments[1] == "string") {
		target = arguments[0];
		func = target[arguments[1]];
		obj = arguments[2] || {};
	} else {
		func = arguments[0];
		obj = arguments[1] || {};
		target = obj.target;
	}

	var partialArgs = obj.args ? Array.prototype.slice.call(obj.args, 0) : [];
	var callbackArgIndex = isFinite(obj.ok) ? obj.ok : obj.args ? obj.args.length : undefined;
	var errorbackArgIndex = obj.ng;

	return function() {
		var d = new Deferred().next(function(args) {
			var next = this._next.callback.ok;
			this._next.callback.ok = function() {
				return next.apply(this, args.args);
			};
		});

		var args = partialArgs.concat(Array.prototype.slice.call(arguments, 0));
		if (!(isFinite(callbackArgIndex) && callbackArgIndex !== null)) {
			callbackArgIndex = args.length;
		}
		var callback = function() {
			d.call(new Deferred.Arguments(arguments))
		};
		args.splice(callbackArgIndex, 0, callback);
		if (isFinite(errorbackArgIndex) && errorbackArgIndex !== null) {
			var errorback = function() {
				d.fail(arguments)
			};
			args.splice(errorbackArgIndex, 0, errorback);
		}
		Deferred.next(function() {
			func.apply(target, args)
		});
		return d;
	};
};
/**
 * Used for Deferred.connect to allow to pass multiple values to next.
 *
 * @private
 * @constructor
 * @param {Array.<*>} args
 * @see Deferred.connect
 */
Deferred.Arguments = function(args) {
	this.args = Array.prototype.slice.call(args, 0)
};

/**
 * Try func (returns Deferred) till it finish without exceptions.
 *
 * @example
 *   Deferred.retry(3, function () {
 *       return http.get(...);
 *   }).
 *   next(function (res) {
 *       res //=> response if succeeded
 *   }).
 *   error(function (e) {
 *       e //=> error if all try failed
 *   });
 *
 * @param {number} retryCount Count number to retry
 * @param {function(number):Deferred} funcDeferred A function returns Deferred
 * @param {{wait:number}} options Options
 * @return {Deferred}
 */
Deferred.retry = function(retryCount, funcDeferred, options) {
	if (!options) options = {};

	var wait = options.wait || 0;
	var d = new Deferred();
	var retry = function() {
		var m = funcDeferred(retryCount);
		m.
		next(function(mes) {
			d.call(mes);
		}).
		error(function(e) {
			if (--retryCount <= 0) {
				d.fail(['retry failed', e]);
			} else {
				setTimeout(retry, wait * 1000);
			}
		});
	};
	setTimeout(retry, 0);
	return d;
};

/**
 * Default export methods
 *
 * @see Deferred.define
 */
Deferred.methods = ["parallel", "wait", "next", "call", "loop", "repeat", "chain"];
/**
 * Export functions to obj.
 * @param {Object} obj A object which this method should export to
 * @param {Array.<string>=} list List of function names (default Deferred.methods)
 * @return {function():Deferred} The Deferred constructor function
 */
Deferred.define = function(obj, list) {
	if (!list) list = Deferred.methods;
	if (!obj) obj = (function getGlobal() {
		return this
	})();
	for (var i = 0; i < list.length; i++) {
		var n = list[i];
		obj[n] = Deferred[n];
	}
	return Deferred;
};

this.Deferred = Deferred;