/**
 * 动画部分
 */
var fxNow, timerId,
    rfxtypes = /^(?:toggle|show|hide)$/,
    rfxnum = new RegExp("^(?:([+-])=|)(" + core_pnum + ")([a-z%]*)$", "i"),
    rrun = /queueHooks$/,
    animationPrefilters = [defaultPrefilter],
    tweeners = {
        "*": [

            function(prop, value) {
                var tween = this.createTween(prop, value),
                    target = tween.cur(),
                    parts = rfxnum.exec(value),
                    unit = parts && parts[3] || (jQuery.cssNumber[prop] ? "" : "px"),

                    // Starting value computation is required for potential unit mismatches
                    start = (jQuery.cssNumber[prop] || unit !== "px" && +target) &&
                        rfxnum.exec(jQuery.css(tween.elem, prop)),
                    scale = 1,
                    maxIterations = 20;

                if (start && start[3] !== unit) {
                    // Trust units reported by jQuery.css
                    unit = unit || start[3];

                    // Make sure we update the tween properties later on
                    parts = parts || [];

                    // Iteratively approximate from a nonzero starting point
                    start = +target || 1;

                    do {
                        // If previous iteration zeroed out, double until we get *something*
                        // Use a string for doubling factor so we don't accidentally see scale as unchanged below
                        scale = scale || ".5";

                        // Adjust and apply
                        start = start / scale;
                        jQuery.style(tween.elem, prop, start + unit);

                        // Update scale, tolerating zero or NaN from tween.cur()
                        // And breaking the loop if scale is unchanged or perfect, or if we've just had enough
                    } while (scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations);
                }

                // Update tween properties
                if (parts) {
                    start = tween.start = +start || +target || 0;
                    tween.unit = unit;
                    // If a +=/-= token was provided, we're doing a relative animation
                    tween.end = parts[1] ?
                        start + (parts[1] + 1) * parts[2] : +parts[2];
                }

                return tween;
            }
        ]
    };

// Animations created synchronously will run synchronously

function createFxNow() {
    setTimeout(function() {
        fxNow = undefined;
    });
    return (fxNow = jQuery.now());
}

function createTween(value, prop, animation) {
    var tween,
        collection = (tweeners[prop] || []).concat(tweeners["*"]),
        index = 0,
        length = collection.length;
    for (; index < length; index++) {
        if ((tween = collection[index].call(animation, prop, value))) {

            // we're done with this property
            return tween;
        }
    }
}

function Animation(elem, properties, options) {
    var result,
        stopped,
        index = 0,
        length = animationPrefilters.length,
        deferred = jQuery.Deferred().always(function() {
            // don't match elem in the :animated selector
            delete tick.elem;
        }),
        tick = function() {
            if (stopped) {
                return false;
            }
            var currentTime = fxNow || createFxNow(),
                remaining = Math.max(0, animation.startTime + animation.duration - currentTime),
                // archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)
                temp = remaining / animation.duration || 0,
                percent = 1 - temp,
                index = 0,
                length = animation.tweens.length;

            for (; index < length; index++) {
                animation.tweens[index].run(percent);
            }

            deferred.notifyWith(elem, [animation, percent, remaining]);

            if (percent < 1 && length) {
                return remaining;
            } else {
                deferred.resolveWith(elem, [animation]);
                return false;
            }
        },
        animation = deferred.promise({
            elem               : elem,
            props              : jQuery.extend({}, properties),
            opts               : jQuery.extend(true, {
            specialEasing      : {}
            }, options),
            originalProperties : properties,
            originalOptions    : options,
            startTime          : fxNow || createFxNow(),
            duration           : options.duration,
            tweens             : [],
            createTween: function(prop, end) {
                var tween = jQuery.Tween(elem, animation.opts, prop, end,
                    animation.opts.specialEasing[prop] || animation.opts.easing);
                animation.tweens.push(tween);
                return tween;
            },
            stop: function(gotoEnd) {
                var index = 0,
                    // if we are going to the end, we want to run all the tweens
                    // otherwise we skip this part
                    length = gotoEnd ? animation.tweens.length : 0;
                if (stopped) {
                    return this;
                }
                stopped = true;
                for (; index < length; index++) {
                    animation.tweens[index].run(1);
                }

                // resolve when we played the last frame
                // otherwise, reject
                if (gotoEnd) {
                    deferred.resolveWith(elem, [animation, gotoEnd]);
                } else {
                    deferred.rejectWith(elem, [animation, gotoEnd]);
                }
                return this;
            }
        }),
        props = animation.props;

    propFilter(props, animation.opts.specialEasing);

    for (; index < length; index++) {
        result = animationPrefilters[index].call(animation, elem, props, animation.opts);
        if (result) {
            return result;
        }
    }

    jQuery.map(props, createTween, animation);

    if (jQuery.isFunction(animation.opts.start)) {
        animation.opts.start.call(elem, animation);
    }

    jQuery.fx.timer(
        jQuery.extend(tick, {
            elem  : elem,
            anim  : animation,
            queue : animation.opts.queue
        })
    );

    // attach callbacks from options
    return animation.progress(animation.opts.progress)
        .done(animation.opts.done, animation.opts.complete)
        .fail(animation.opts.fail)
        .always(animation.opts.always);
}


function propFilter(props, specialEasing) {
    var index, name, easing, value, hooks;

    // camelCase, specialEasing and expand cssHook pass
    for (index in props) {
        name = jQuery.camelCase(index);
        easing = specialEasing[name];
        value = props[index];
        if (jQuery.isArray(value)) {
            easing = value[1];
            value = props[index] = value[0];
        }

        if (index !== name) {
            props[name] = value;
            delete props[index];
        }

        hooks = jQuery.cssHooks[name];
        if (hooks && "expand" in hooks) {
            value = hooks.expand(value);
            delete props[name];

            // not quite $.extend, this wont overwrite keys already present.
            // also - reusing 'index' from above because we have the correct "name"
            for (index in value) {
                if (!(index in props)) {
                    props[index] = value[index];
                    specialEasing[index] = easing;
                }
            }
        } else {
            specialEasing[name] = easing;
        }
    }
}

jQuery.Animation = jQuery.extend(Animation, {

    tweener: function(props, callback) {
        if (jQuery.isFunction(props)) {
            callback = props;
            props = ["*"];
        } else {
            props = props.split(" ");
        }

        var prop,
            index = 0,
            length = props.length;

        for (; index < length; index++) {
            prop = props[index];
            tweeners[prop] = tweeners[prop] || [];
            tweeners[prop].unshift(callback);
        }
    },

    prefilter: function(callback, prepend) {
        if (prepend) {
            animationPrefilters.unshift(callback);
        } else {
            animationPrefilters.push(callback);
        }
    }
});

function defaultPrefilter(elem, props, opts) {
    /* jshint validthis: true */
    var prop, value, toggle, tween, hooks, oldfire,
        anim = this,
        orig = {},
        style = elem.style,
        hidden = elem.nodeType && isHidden(elem),
        dataShow = data_priv.get(elem, "fxshow");

    // handle queue: false promises
    if (!opts.queue) {
        hooks = jQuery._queueHooks(elem, "fx");
        if (hooks.unqueued == null) {
            hooks.unqueued = 0;
            oldfire = hooks.empty.fire;
            hooks.empty.fire = function() {
                if (!hooks.unqueued) {
                    oldfire();
                }
            };
        }
        hooks.unqueued++;

        anim.always(function() {
            // doing this makes sure that the complete handler will be called
            // before this completes
            anim.always(function() {
                hooks.unqueued--;
                if (!jQuery.queue(elem, "fx").length) {
                    hooks.empty.fire();
                }
            });
        });
    }

    // height/width overflow pass
    if (elem.nodeType === 1 && ("height" in props || "width" in props)) {
        // Make sure that nothing sneaks out
        // Record all 3 overflow attributes because IE9-10 do not
        // change the overflow attribute when overflowX and
        // overflowY are set to the same value
        opts.overflow = [style.overflow, style.overflowX, style.overflowY];

        // Set display property to inline-block for height/width
        // animations on inline elements that are having width/height animated
        if (jQuery.css(elem, "display") === "inline" &&
            jQuery.css(elem, "float") === "none") {

            style.display = "inline-block";
        }
    }

    if (opts.overflow) {
        style.overflow = "hidden";
        anim.always(function() {
            style.overflow = opts.overflow[0];
            style.overflowX = opts.overflow[1];
            style.overflowY = opts.overflow[2];
        });
    }


    // show/hide pass
    for (prop in props) {
        value = props[prop];
        if (rfxtypes.exec(value)) {
            delete props[prop];
            toggle = toggle || value === "toggle";
            if (value === (hidden ? "hide" : "show")) {

                // If there is dataShow left over from a stopped hide or show and we are going to proceed with show, we should pretend to be hidden
                if (value === "show" && dataShow && dataShow[prop] !== undefined) {
                    hidden = true;
                } else {
                    continue;
                }
            }
            orig[prop] = dataShow && dataShow[prop] || jQuery.style(elem, prop);
        }
    }

    if (!jQuery.isEmptyObject(orig)) {
        if (dataShow) {
            if ("hidden" in dataShow) {
                hidden = dataShow.hidden;
            }
        } else {
            dataShow = data_priv.access(elem, "fxshow", {});
        }

        // store state if its toggle - enables .stop().toggle() to "reverse"
        if (toggle) {
            dataShow.hidden = !hidden;
        }
        if (hidden) {
            jQuery(elem).show();
        } else {
            anim.done(function() {
                jQuery(elem).hide();
            });
        }
        anim.done(function() {
            var prop;

            data_priv.remove(elem, "fxshow");
            for (prop in orig) {
                jQuery.style(elem, prop, orig[prop]);
            }
        });
        for (prop in orig) {
            tween = createTween(hidden ? dataShow[prop] : 0, prop, anim);

            if (!(prop in dataShow)) {
                dataShow[prop] = tween.start;
                if (hidden) {
                    tween.end = tween.start;
                    tween.start = prop === "width" || prop === "height" ? 1 : 0;
                }
            }
        }
    }
}

function Tween(elem, options, prop, end, easing) {
    return new Tween.prototype.init(elem, options, prop, end, easing);
}
jQuery.Tween = Tween;

Tween.prototype = {
    constructor: Tween,
    init: function(elem, options, prop, end, easing, unit) {
        this.elem = elem;
        this.prop = prop;
        this.easing = easing || "swing";
        this.options = options;
        this.start = this.now = this.cur();
        this.end = end;
        this.unit = unit || (jQuery.cssNumber[prop] ? "" : "px");
    },
    cur: function() {
        var hooks = Tween.propHooks[this.prop];

        return hooks && hooks.get ?
            hooks.get(this) :
            Tween.propHooks._default.get(this);
    },
    run: function(percent) {
        var eased,
            hooks = Tween.propHooks[this.prop];

        if (this.options.duration) {
            this.pos = eased = jQuery.easing[this.easing](
                percent, this.options.duration * percent, 0, 1, this.options.duration
            );
        } else {
            this.pos = eased = percent;
        }
        this.now = (this.end - this.start) * eased + this.start;

        if (this.options.step) {
            this.options.step.call(this.elem, this.now, this);
        }

        if (hooks && hooks.set) {
            hooks.set(this);
        } else {
            Tween.propHooks._default.set(this);
        }
        return this;
    }
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
    _default: {
        get: function(tween) {
            var result;

            if (tween.elem[tween.prop] != null &&
                (!tween.elem.style || tween.elem.style[tween.prop] == null)) {
                return tween.elem[tween.prop];
            }

            // passing an empty string as a 3rd parameter to .css will automatically
            // attempt a parseFloat and fallback to a string if the parse fails
            // so, simple values such as "10px" are parsed to Float.
            // complex values such as "rotate(1rad)" are returned as is.
            result = jQuery.css(tween.elem, tween.prop, "");
            // Empty strings, null, undefined and "auto" are converted to 0.
            return !result || result === "auto" ? 0 : result;
        },
        set: function(tween) {
            // use step hook for back compat - use cssHook if its there - use .style if its
            // available and use plain properties where available
            if (jQuery.fx.step[tween.prop]) {
                jQuery.fx.step[tween.prop](tween);
            } else if (tween.elem.style && (tween.elem.style[jQuery.cssProps[tween.prop]] != null || jQuery.cssHooks[tween.prop])) {
                jQuery.style(tween.elem, tween.prop, tween.now + tween.unit);
            } else {
                tween.elem[tween.prop] = tween.now;
            }
        }
    }
};

// Support: IE9
// Panic based approach to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
    set: function(tween) {
        if (tween.elem.nodeType && tween.elem.parentNode) {
            tween.elem[tween.prop] = tween.now;
        }
    }
};

jQuery.each(["toggle", "show", "hide"], function(i, name) {
    var cssFn = jQuery.fn[name];
    jQuery.fn[name] = function(speed, easing, callback) {
        return speed == null || typeof speed === "boolean" ?
            cssFn.apply(this, arguments) :
            this.animate(genFx(name, true), speed, easing, callback);
    };
});

jQuery.fn.extend({
    fadeTo: function(speed, to, easing, callback) {
        // show any hidden elements after setting opacity to 0
        return this.filter(isHidden).css("opacity", 0).show()
        // animate to the value specified
        .end().animate({
            opacity: to
        }, speed, easing, callback);
    },
    animate: function(prop, speed, easing, callback) {
        var empty = jQuery.isEmptyObject(prop),
            optall = jQuery.speed(speed, easing, callback),
            doAnimation = function() {
                // Operate on a copy of prop so per-property easing won't be lost
                var anim = Animation(this, jQuery.extend({}, prop), optall);
                // Empty animations, or finishing resolves immediately
                if (empty || data_priv.get(this, "finish")) {
                    anim.stop(true);
                }
            };
        doAnimation.finish = doAnimation;
        doAnimation.Aaron = speed
        return empty || optall.queue === false ?
            this.each(doAnimation) :
            this.queue(optall.queue, doAnimation);
    },
    stop: function(type, clearQueue, gotoEnd) {
        var stopQueue = function(hooks) {
            var stop = hooks.stop;
            delete hooks.stop;
            stop(gotoEnd);
        };

        if (typeof type !== "string") {
            gotoEnd = clearQueue;
            clearQueue = type;
            type = undefined;
        }
        if (clearQueue && type !== false) {
            this.queue(type || "fx", []);
        }

        return this.each(function() {
            var dequeue = true,
                index = type != null && type + "queueHooks",
                timers = jQuery.timers,
                data = data_priv.get(this);

            if (index) {
                if (data[index] && data[index].stop) {
                    stopQueue(data[index]);
                }
            } else {
                for (index in data) {
                    if (data[index] && data[index].stop && rrun.test(index)) {
                        stopQueue(data[index]);
                    }
                }
            }

            for (index = timers.length; index--;) {
                if (timers[index].elem === this && (type == null || timers[index].queue === type)) {
                    timers[index].anim.stop(gotoEnd);
                    dequeue = false;
                    timers.splice(index, 1);
                }
            }

            // start the next in the queue if the last step wasn't forced
            // timers currently will call their complete callbacks, which will dequeue
            // but only if they were gotoEnd
            if (dequeue || !gotoEnd) {
                jQuery.dequeue(this, type);
            }
        });
    },
    finish: function(type) {
        if (type !== false) {
            type = type || "fx";
        }
        return this.each(function() {
            var index,
                data = data_priv.get(this),
                queue = data[type + "queue"],
                hooks = data[type + "queueHooks"],
                timers = jQuery.timers,
                length = queue ? queue.length : 0;

            // enable finishing flag on private data
            data.finish = true;

            // empty the queue first
            jQuery.queue(this, type, []);

            if (hooks && hooks.stop) {
                hooks.stop.call(this, true);
            }

            // look for any active animations, and finish them
            for (index = timers.length; index--;) {
                if (timers[index].elem === this && timers[index].queue === type) {
                    timers[index].anim.stop(true);
                    timers.splice(index, 1);
                }
            }

            // look for any animations in the old queue and finish them
            for (index = 0; index < length; index++) {
                if (queue[index] && queue[index].finish) {
                    queue[index].finish.call(this);
                }
            }

            // turn off finishing flag
            delete data.finish;
        });
    }
});

// Generate parameters to create a standard animation

function genFx(type, includeWidth) {
    var which,
        attrs = {
            height: type
        },
        i = 0;

    // if we include width, step value is 1 to do all cssExpand values,
    // if we don't include width, step value is 2 to skip over Left and Right
    includeWidth = includeWidth ? 1 : 0;
    for (; i < 4; i += 2 - includeWidth) {
        which = cssExpand[i];
        attrs["margin" + which] = attrs["padding" + which] = type;
    }

    if (includeWidth) {
        attrs.opacity = attrs.width = type;
    }

    return attrs;
}

// Generate shortcuts for custom animations
jQuery.each({
    slideDown: genFx("show"),
    slideUp: genFx("hide"),
    slideToggle: genFx("toggle"),
    fadeIn: {
        opacity: "show"
    },
    fadeOut: {
        opacity: "hide"
    },
    fadeToggle: {
        opacity: "toggle"
    }
}, function(name, props) {
    jQuery.fn[name] = function(speed, easing, callback) {
        return this.animate(props, speed, easing, callback);
    };
});

jQuery.speed = function(speed, easing, fn) {
    var opt = speed && typeof speed === "object" ? jQuery.extend({}, speed) : {
        complete: fn || !fn && easing || jQuery.isFunction(speed) && speed,
        duration: speed,
        easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
    };

    opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
        opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default;

    // normalize opt.queue - true/undefined/null -> "fx"
    if (opt.queue == null || opt.queue === true) {
        opt.queue = "fx";
    }

    // Queueing
    opt.old = opt.complete;

    opt.complete = function() {
        if (jQuery.isFunction(opt.old)) {
            opt.old.call(this);
        }

        if (opt.queue) {
            jQuery.dequeue(this, opt.queue);
        }
    };

    return opt;
};

jQuery.easing = {
    linear: function(p) {
        return p;
    },
    swing: function(p) {
        return 0.5 - Math.cos(p * Math.PI) / 2;
    }
};

jQuery.timers = [];
jQuery.fx = Tween.prototype.init;
jQuery.fx.tick = function() {
    var timer,
        timers = jQuery.timers,
        i = 0;

    fxNow = jQuery.now();

    for (; i < timers.length; i++) {
        timer = timers[i];
        // Checks the timer has not already been removed
        if (!timer() && timers[i] === timer) {
            timers.splice(i--, 1);
        }
    }

    if (!timers.length) {
        jQuery.fx.stop();
    }
    fxNow = undefined;
};

jQuery.fx.timer = function(timer) {
    if (timer() && jQuery.timers.push(timer)) {
        jQuery.fx.start();
    }
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
    if (!timerId) {
        timerId = setInterval(jQuery.fx.tick, jQuery.fx.interval);
    }
};

jQuery.fx.stop = function() {
    clearInterval(timerId);
    timerId = null;
};

jQuery.fx.speeds = {
    slow: 600,
    fast: 200,
    // Default speed
    _default: 400
};

// Back Compat <1.8 extension point
jQuery.fx.step = {};

if (jQuery.expr && jQuery.expr.filters) {
    jQuery.expr.filters.animated = function(elem) {
        return jQuery.grep(jQuery.timers, function(fn) {
            return elem === fn.elem;
        }).length;
    };
}
jQuery.fn.offset = function(options) {
    if (arguments.length) {
        return options === undefined ?
            this :
            this.each(function(i) {
                jQuery.offset.setOffset(this, options, i);
            });
    }

    var docElem, win,
        elem = this[0],
        box = {
            top: 0,
            left: 0
        },
        doc = elem && elem.ownerDocument;

    if (!doc) {
        return;
    }

    docElem = doc.documentElement;

    // Make sure it's not a disconnected DOM node
    if (!jQuery.contains(docElem, elem)) {
        return box;
    }

    // If we don't have gBCR, just use 0,0 rather than error
    // BlackBerry 5, iOS 3 (original iPhone)
    if (typeof elem.getBoundingClientRect !== core_strundefined) {
        box = elem.getBoundingClientRect();
    }
    win = getWindow(doc);
    return {
        top: box.top + win.pageYOffset - docElem.clientTop,
        left: box.left + win.pageXOffset - docElem.clientLeft
    };
};

jQuery.offset = {

    setOffset: function(elem, options, i) {
        var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
            position = jQuery.css(elem, "position"),
            curElem = jQuery(elem),
            props = {};

        // Set position first, in-case top/left are set even on static elem
        if (position === "static") {
            elem.style.position = "relative";
        }

        curOffset = curElem.offset();
        curCSSTop = jQuery.css(elem, "top");
        curCSSLeft = jQuery.css(elem, "left");
        calculatePosition = (position === "absolute" || position === "fixed") && (curCSSTop + curCSSLeft).indexOf("auto") > -1;

        // Need to be able to calculate position if either top or left is auto and position is either absolute or fixed
        if (calculatePosition) {
            curPosition = curElem.position();
            curTop = curPosition.top;
            curLeft = curPosition.left;

        } else {
            curTop = parseFloat(curCSSTop) || 0;
            curLeft = parseFloat(curCSSLeft) || 0;
        }

        if (jQuery.isFunction(options)) {
            options = options.call(elem, i, curOffset);
        }

        if (options.top != null) {
            props.top = (options.top - curOffset.top) + curTop;
        }
        if (options.left != null) {
            props.left = (options.left - curOffset.left) + curLeft;
        }

        if ("using" in options) {
            options.using.call(elem, props);

        } else {
            curElem.css(props);
        }
    }
};


jQuery.fn.extend({

    position: function() {
        if (!this[0]) {
            return;
        }

        var offsetParent, offset,
            elem = this[0],
            parentOffset = {
                top: 0,
                left: 0
            };

        // Fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is it's only offset parent
        if (jQuery.css(elem, "position") === "fixed") {
            // We assume that getBoundingClientRect is available when computed position is fixed
            offset = elem.getBoundingClientRect();

        } else {
            // Get *real* offsetParent
            offsetParent = this.offsetParent();

            // Get correct offsets
            offset = this.offset();
            if (!jQuery.nodeName(offsetParent[0], "html")) {
                parentOffset = offsetParent.offset();
            }

            // Add offsetParent borders
            parentOffset.top += jQuery.css(offsetParent[0], "borderTopWidth", true);
            parentOffset.left += jQuery.css(offsetParent[0], "borderLeftWidth", true);
        }

        // Subtract parent offsets and element margins
        return {
            top: offset.top - parentOffset.top - jQuery.css(elem, "marginTop", true),
            left: offset.left - parentOffset.left - jQuery.css(elem, "marginLeft", true)
        };
    },

    offsetParent: function() {
        return this.map(function() {
            var offsetParent = this.offsetParent || docElem;

            while (offsetParent && (!jQuery.nodeName(offsetParent, "html") && jQuery.css(offsetParent, "position") === "static")) {
                offsetParent = offsetParent.offsetParent;
            }

            return offsetParent || docElem;
        });
    }
});


// Create scrollLeft and scrollTop methods
jQuery.each({
    scrollLeft: "pageXOffset",
    scrollTop: "pageYOffset"
}, function(method, prop) {
    var top = "pageYOffset" === prop;

    jQuery.fn[method] = function(val) {
        return jQuery.access(this, function(elem, method, val) {
            var win = getWindow(elem);

            if (val === undefined) {
                return win ? win[prop] : elem[method];
            }

            if (win) {
                win.scrollTo(!top ? val : window.pageXOffset,
                    top ? val : window.pageYOffset
                );

            } else {
                elem[method] = val;
            }
        }, method, val, arguments.length, null);
    };
});

function getWindow(elem) {
    return jQuery.isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
}
// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each({
    Height: "height",
    Width: "width"
}, function(name, type) {
    jQuery.each({
        padding: "inner" + name,
        content: type,
        "": "outer" + name
    }, function(defaultExtra, funcName) {
        // margin is only for outerHeight, outerWidth
        jQuery.fn[funcName] = function(margin, value) {
            var chainable = arguments.length && (defaultExtra || typeof margin !== "boolean"),
                extra = defaultExtra || (margin === true || value === true ? "margin" : "border");

            return jQuery.access(this, function(elem, type, value) {
                var doc;

                if (jQuery.isWindow(elem)) {
                    // As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
                    // isn't a whole lot we can do. See pull request at this URL for discussion:
                    // https://github.com/jquery/jquery/pull/764
                    return elem.document.documentElement["client" + name];
                }

                // Get document width or height
                if (elem.nodeType === 9) {
                    doc = elem.documentElement;

                    // Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
                    // whichever is greatest
                    return Math.max(
                        elem.body["scroll" + name], doc["scroll" + name],
                        elem.body["offset" + name], doc["offset" + name],
                        doc["client" + name]
                    );
                }

                return value === undefined ?
                // Get width or height on the element, requesting but not forcing parseFloat
                jQuery.css(elem, type, extra) :

                // Set width or height on the element
                jQuery.style(elem, type, value, extra);
            }, type, chainable ? margin : undefined, chainable, null);
        };
    });
});
// Limit scope pollution from any deprecated API
// (function() {

// The number of elements contained in the matched element set
jQuery.fn.size = function() {
    return this.length;
};

jQuery.fn.andSelf = jQuery.fn.addBack;

// })();
if (typeof module === "object" && module && typeof module.exports === "object") {
    // Expose jQuery as module.exports in loaders that implement the Node
    // module pattern (including browserify). Do not create the global, since
    // the user will be storing it themselves locally, and globals are frowned
    // upon in the Node module world.
    module.exports = jQuery;
} else {
    // Register as a named AMD module, since jQuery can be concatenated with other
    // files that may use define, but not via a proper concatenation script that
    // understands anonymous AMD modules. A named AMD is safest and most robust
    // way to register. Lowercase jquery is used because AMD module names are
    // derived from file names, and jQuery is normally delivered in a lowercase
    // file name. Do this after creating the global so that if an AMD module wants
    // to call noConflict to hide this version of jQuery, it will work.
    if (typeof define === "function" && define.amd) {
        define("jquery", [], function() {
            return jQuery;
        });
    }
}

// If there is a window object, that at least has a document property,
// define jQuery and $ identifiers
if (typeof window === "object" && typeof window.document === "object") {
    window.jQuery = window.$ = jQuery;
}