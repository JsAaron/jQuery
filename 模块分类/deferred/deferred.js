(function(deferred){
	if (typeof module !== 'undefined') {
		var DeferredURLRequest = require('./DeferredURLRequest')
		for (var k in DeferredURLRequest) {
			DeferredAPI[k] = DeferredURLRequest[k]
		}
		module.exports = DeferredAPI
	}
	var global = function() {
		return this || (1, eval)('this')
	}();
	global['Aaron'] = deferred;
})(new function(){
	/**
	 * 接口
	 * @type {Object}
	 */
	var API = {
		'deferred' : deferred,
		'next'     : Next,
		'wait'     : Wait
		// all          : all,
		// Deferred     : Deferred,
		// DeferredList : DeferredList,
		// wrapResult   : wrapResult,
		// wrapFailure  : wrapFailure,
		// Failure      : Failure
	}

	function ok(x) {
		return x
	};

	function ng(x) {
		throw x
	};

	function deferred(t) {
		return new Deferred(t)
	}

	function Deferred() {
		this._next = null;
		this.callback = {
			'ok': ok,
			'ng': ng
		};
		return this;
	}

	Deferred.prototype.then = function(fun) {
		return this._post("ok", fun);
	};

	Deferred.prototype.error = function(fun) {
		return this._post("ng", fun);
	};

	Deferred.prototype.resolve = function(val) {
		return this._fire("ok", val);
	};

	Deferred.prototype.fail = function(val) {
		return this._fire("ng", err);
	};

	Deferred.prototype.cancel = function(val) {
        (this.canceller || function () {
        }).apply(this);
        return this.init();
	};

	Deferred.prototype._post = function(okng, fun) {
        this._next = new Deferred();
        this._next.callback[okng] = fun;
        return this._next;
	};

	Deferred.prototype._fire = function(okng, value) {
        var next = "ok";
        try {
        	//执行回调函数
            value = this.callback[okng].call(this, value);
        } catch (e) {
            next = "ng";
            value = e;
            if (Deferred.onerror) Deferred.onerror(e);
        }
        if (isDeferred(value)) { //如果返回值是deferred对象
            value._next = this._next;
        } else {
            if (this._next) this._next._fire(next, value);
        }
        return this;
	};

	function isDeferred(obj) {
		return !!(obj && obj._id === Deferred.prototype._id);
	};

	function Next(fun) {
		var d   = new Deferred();
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
	}

	function Wait(n) {
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

	function register(name, fun) {
		Deferred.prototype[name] = function() {
			var a = arguments;
			return this.next(function() {
				return fun.apply(this, a);
			});
		};
	};

	register("wait", Wait);

	return API;
});