/**
 * jQuery队列
 * jQuery的队列依赖缓存机制事件，它同时是animate的基础。
 * 它不像事件机制、缓存机制、回调机制一样有自己的命名空间，
 * 由于比较简单，所以直接挂在到$和jQuery对象上。
 */

jQuery.extend({

    //加入动画队列
    //将data按照某种类型存储到elem对应的队列中，并等待执行。同时返回目前队列中的所有数据
    queue: function(elem, type, data) {
        var queue;
        if (elem) {
            //默认处理动画队列
            type = (type || "fx") + "queue";
            //取出关联到现有元素上的所有队列
            queue = data_priv.get(elem, type);
            // Speed up dequeue by getting out quickly if this is just a lookup
            if (data) {
                //如果elem还没有在cache中存储过名为type的数据，或者需要存储的数据时数组
                if (!queue || jQuery.isArray(data)) {
                    queue = data_priv.access(elem, type, jQuery.makeArray(data));
                } else {
                    queue.push(data);
                }
            }
            return queue || [];
        }
    },  

    //执行动画队列
    //出列操作，如果想要执行队列中的所有方法，则有多少个方法就需要执行多少次dequeue方法
    dequeue: function(elem, type) {

        //如果指定类型就按照指定类型查找，否则默认是“fx”
        type = type || "fx";

        var queue = jQuery.queue(elem, type),
            startLength = queue.length,
            //取出队列（数组）中的第一个值（先进先出），
            //第一个数据是上一次执行dequeue时添加到队列中的“inprogress”占位符
            fn = queue.shift(),
            hooks = jQuery._queueHooks(elem, type),
            //预先准备好下一个队列操作
            next = function() {
                jQuery.dequeue(elem, type);
            };

        // If the fx queue is dequeued, always remove the progress sentinel
        // 当进行出栈操作时，总是删除名为“inprogress”的数据，并继续取下一条。
        // 队列中也存在占位符，用于动画处理
        if (fn === "inprogress") {
            fn = queue.shift();
            startLength--;
        }

        if (fn) {
            // Add a progress sentinel to prevent the fx queue from being
            // automatically dequeued
            // 函数执行前, 在queue数组的最前面添加一个进程锁，就实在之前清除的  
            if (type === "fx") {
                queue.unshift("inprogress");
            }

            // clear up the last queue stop function
            delete hooks.stop;

            //执行动画回调
            fn.call(elem, next, hooks);
        }

        if (!startLength && hooks) {
            hooks.empty.fire();
        }
    },

    // not intended for public consumption - generates a queueHooks object, or returns the current one
    // 从elem相应类型对应的队列中下一条数据并执行这条数据
    _queueHooks: function(elem, type) {
        var key = type + "queueHooks";
        return data_priv.get(elem, key) || data_priv.access(elem, key, {
            empty: jQuery.Callbacks("once memory").add(function() {
                data_priv.remove(elem, [type + "queue", key]);
            })
        });
    }
});

//内部动画队列
jQuery.fn.extend({
    queue: function(type, data) {
        var setter = 2;
        //修正type, 默认为表示jquery动画的fx, 如果不为"fx", 
        //即为自己的自定义动画, 一般我们用"fx"就足够了.  
        if (typeof type !== "string") {
            data = type;
            type = "fx";
            setter--;
        }

        //只有动画的回调
        // div.slideToggle(1000);
        // div.slideToggle("fast");
        // div.animate({left:'-=200'},1500);
        // div.queue('fx')
        if (arguments.length < setter) {
            return jQuery.queue(this[0], type);
        }

        //生成的动画数据
        //动画队列
        //动画钩子
        //  cache[uuid] = {
        //     fxqueue: Array[1],
        //     fxqueueHooks: Object
        // }
        return data === undefined ?
            this :
            this.each(function() {
                //调用基础队列
                //设置动画队列缓存
                //并返回队列总数
                var queue = jQuery.queue(this, type, data);

                // ensure a hooks for this queue
                // 确保是一个队列钩子
                jQuery._queueHooks(this, type);

                //直接执行动画队列
                //防止在执行函数的时候, 这里又进行dequeue操作, 这样会同时执行2个函数, 队列就不受控制了.
                //其实就是通过inprogress这个参数。判断从什么时候开始真正执行动画
                if (type === "fx" && queue[0] !== "inprogress") {
                    //如果队列没有被锁住, 即此时没有在执行dequeue. 移出队列里第一个函数并执行它.  
                    jQuery.dequeue(this, type);
                }
            });
    },
    dequeue: function(type) {
        return this.each(function() {
            jQuery.dequeue(this, type);
        });
    },
    // Based off of the plugin by Clint Helfers, with permission.
    // http://blindsignals.com/index.php/2009/07/jquery-delay/
    delay: function(time, type) {
        time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
        type = type || "fx";

        return this.queue(type, function(next, hooks) {
            var timeout = setTimeout(next, time);
            hooks.stop = function() {
                clearTimeout(timeout);
            };
        });
    },
    clearQueue: function(type) {
        return this.queue(type || "fx", []);
    },
    // Get a promise resolved when queues of a certain type
    // are emptied (fx is the type by default)
    promise: function(type, obj) {
        var tmp,
            count = 1,
            defer = jQuery.Deferred(),
            elements = this,
            i = this.length,
            resolve = function() {
                if (!(--count)) {
                    defer.resolveWith(elements, [elements]);
                }
            };

        if (typeof type !== "string") {
            obj = type;
            type = undefined;
        }
        type = type || "fx";

        while (i--) {
            tmp = data_priv.get(elements[i], type + "queueHooks");
            if (tmp && tmp.empty) {
                count++;
                tmp.empty.add(resolve);
            }
        }
        resolve();
        return defer.promise(obj);
    }
});