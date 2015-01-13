// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache

function createOptions(options) {
    var object = optionsCache[options] = {};
    jQuery.each(options.match(core_rnotwhite) || [], function(_, flag) {
        object[flag] = true;
    });
    return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *  options: an optional list of space-separated options that will change how
 *          the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *  once:           will ensure the callback list can only be fired once (like a Deferred)
 *
 *  memory:         will keep track of previous values and will call any callback added
 *                  after the list has been fired right away with the latest "memorized"
 *                  values (like a Deferred)
 *
 *  unique:         will ensure a callback can only be added once (no duplicate in the list)
 *
 *  stopOnFalse:    interrupt callings when a callback returns false
 *
 */

jQuery.Callbacks = function(options) {

    // Convert options from String-formatted to Object-formatted if needed
    // (we check in cache first)
    //通过字符串在optionsCache寻找有没有相应缓存，如果没有则创建一个，有则引用
    //如果是对象则通过jQuery.extend深复制后赋给options。
    options = typeof options === "string" ?
        (optionsCache[options] || createOptions(options)) :
        jQuery.extend({}, options);

    var // Last fire value (for non-forgettable lists)
    memory, // 最后一次触发回调时传的参数

        // Flag to know if list was already fired
        fired, // 列表中的函数是否已经回调至少一次

        // Flag to know if list is currently firing
        firing, // 列表中的函数是否正在回调中

        // First callback to fire (used internally by add and fireWith)
        firingStart, // 回调的起点

        // End of the loop when firing
        firingLength, // 回调时的循环结尾

        // Index of currently firing callback (modified by remove if needed)
        firingIndex, // 当前正在回调的函数索引

        // Actual callback list
        list = [], // 回调函数列表

        // Stack of fire calls for repeatable lists
        stack = !options.once && [], // 可重复的回调函数堆栈，用于控制触发回调时的参数列表

        // Fire callbacks// 触发回调函数列表
        fire = function(data) {
            //如果参数memory为true，则记录data
            memory = options.memory && data;
            fired = true; //标记触发回调
            firingIndex = firingStart || 0;
            firingStart = 0;
            firingLength = list.length;
            //标记正在触发回调
            firing = true;
            for (; list && firingIndex < firingLength; firingIndex++) {
                if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
                    // 阻止未来可能由于add所产生的回调
                    memory = false; // To prevent further calls using add
                    break; //由于参数stopOnFalse为true，所以当有回调函数返回值为false时退出循环
                }
            }
            //标记回调结束
            firing = false;
            if (list) {
                if (stack) {
                    if (stack.length) {
                        //从堆栈头部取出，递归fire
                        fire(stack.shift());
                    }
                } else if (memory) { //否则，如果有记忆
                    list = [];
                } else { //再否则阻止回调列表中的回调
                    self.disable();
                }
            }
        },
        // Actual Callbacks object
        // 暴露在外的Callbacks对象,对外接口
        self = {
            // Add a callback or a collection of callbacks to the list
            add: function() { // 回调列表中添加一个回调或回调的集合。
                if (list) {
                    // First, we save the current length
                    //首先我们存储当前列表长度
                    var start = list.length;
                    (function add(args) { //jQuery.each，对args传进来的列表的每一个对象执行操作
                        jQuery.each(args, function(_, arg) {
                            var type = jQuery.type(arg);
                            if (type === "function") {
                                if (!options.unique || !self.has(arg)) { //确保是否可以重复
                                    list.push(arg);
                                }
                                //如果是类数组或对象,递归
                            } else if (arg && arg.length && type !== "string") {
                                // Inspect recursively
                                add(arg);
                            }
                        });
                    })(arguments);
                    // Do we need to add the callbacks to the
                    // current firing batch?
                    // 如果回调列表中的回调正在执行时，其中的一个回调函数执行了Callbacks.add操作
                    // 上句话可以简称：如果在执行Callbacks.add操作的状态为firing时
                    // 那么需要更新firingLength值
                    if (firing) {
                        firingLength = list.length;
                        // With memory, if we're not firing then
                        // we should call right away
                    } else if (memory) {
                        //如果options.memory为true，则将memory做为参数，应用最近增加的回调函数
                        firingStart = start;
                        fire(memory);
                    }
                }
                return this;
            },
            // Remove a callback from the list
            // 从函数列表中删除函数（集）
            remove: function() {
                if (list) {
                    jQuery.each(arguments, function(_, arg) {
                        var index;
                        // while循环的意义在于借助于强大的jQuery.inArray删除函数列表中相同的函数引用（没有设置unique的情况）
                        // jQuery.inArray将每次返回查找到的元素的index作为自己的第三个参数继续进行查找，直到函数列表的尽头
                        // splice删除数组元素，修改数组的结构
                        while ((index = jQuery.inArray(arg, list, index)) > -1) {
                            list.splice(index, 1);
                            // Handle firing indexes
                            // 在函数列表处于firing状态时，最主要的就是维护firingLength和firgingIndex这两个值
                            // 保证fire时函数列表中的函数能够被正确执行（fire中的for循环需要这两个值
                            if (firing) {
                                if (index <= firingLength) {
                                    firingLength--;
                                }
                                if (index <= firingIndex) {
                                    firingIndex--;
                                }
                            }
                        }
                    });
                }
                return this;
            },
            // Check if a given callback is in the list.
            // If no argument is given, return whether or not list has callbacks attached
            // 回调函数是否在列表中.
            has: function(fn) {
                return fn ? jQuery.inArray(fn, list) > -1 : !! (list && list.length);
            },
            // Remove all callbacks from the list
            // 从列表中删除所有回调函数
            empty: function() {
                list = [];
                firingLength = 0;
                return this;
            },
            // Have the list do nothing anymore
            // 禁用回调列表中的回调。
            disable: function() {
                list = stack = memory = undefined;
                return this;
            },
            // Is it disabled?
            //  列表中否被禁用
            disabled: function() {
                return !list;
            },
            // Lock the list in its current state
            // 锁定列表
            lock: function() {
                stack = undefined;
                if (!memory) {
                    self.disable();
                }
                return this;
            },
            // Is it locked?
            // 列表是否被锁
            locked: function() {
                return !stack;
            },
            // Call all callbacks with the given context and arguments
            // 以给定的上下文和参数调用所有回调函数
            fireWith: function(context, args) {
                if (list && (!fired || stack)) {
                    args = args || [];
                    args = [context, args.slice ? args.slice() : args];
                    //如果正在回调
                    if (firing) {
                        //将参数推入堆栈，等待当前回调结束再调用
                        stack.push(args);
                    } else { //否则直接调用
                        fire(args);
                    }
                }
                return this;
            },
            // Call all the callbacks with the given arguments
            // 以给定的参数调用所有回调函数
            fire: function() {
                self.fireWith(this, arguments);
                return this;
            },
            // To know if the callbacks have already been called at least once
            // // 回调函数列表是否至少被调用一次
            fired: function() {
                return !!fired;
            }
        };
    return self;
};