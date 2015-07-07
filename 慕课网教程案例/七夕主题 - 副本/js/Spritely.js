/**
 * 精灵动画
 * @param  {[type]} $ [description]
 * @return {[type]}   [description]
 */
(function($) {

    //保存精灵动画的实例
    var instances = {};

    $._spritely = {
        animate: function(options) {
            var el = $(options.el);
            var el_id = el.attr('id');
            if (!instances[el_id]) {
                return this;
            }
            options = $.extend(options, instances[el_id] || {});

            if (options.play_frames && !instances[el_id]['remaining_frames']) {
                instances[el_id]['remaining_frames'] = options.play_frames + 1;
            } else if (options.do_once && !instances[el_id]['remaining_frames']) {
                instances[el_id]['remaining_frames'] = options.no_of_frames;
            }

            var frames;

            var animate = function(el) {
                var w = options.width,
                    h = options.height;
                if (!frames) {
                    frames = [];
                    total = 0
                    for (var i = 0; i < options.no_of_frames; i++) {
                        frames[frames.length] = (0 - total);
                        total += w;
                    }
                }
                if (instances[el_id]['current_frame'] == 0) {
                    if (options.on_first_frame) {
                        options.on_first_frame(el);
                    }
                } else if (instances[el_id]['current_frame'] == frames.length - 1) {
                    if (options.on_last_frame) {
                        options.on_last_frame(el);
                    }
                }
                if (options.on_frame && options.on_frame[instances[el_id]['current_frame']]) {
                    options.on_frame[instances[el_id]['current_frame']](el);
                }
                if (options.rewind == true) {
                    if (instances[el_id]['current_frame'] <= 0) {
                        instances[el_id]['current_frame'] = frames.length - 1;
                    } else {
                        instances[el_id]['current_frame'] = instances[el_id]['current_frame'] - 1;
                    };
                } else {
                    if (instances[el_id]['current_frame'] >= frames.length - 1) {
                        instances[el_id]['current_frame'] = 0;
                    } else {
                        instances[el_id]['current_frame'] = instances[el_id]['current_frame'] + 1;
                    }
                }

                var yPos = $._spritely.getBgY(el);
                el.css('background-position', frames[instances[el_id]['current_frame']] + 'px ' + yPos);
                if (options.bounce && options.bounce[0] > 0 && options.bounce[1] > 0) {
                    var ud = options.bounce[0]; // up-down
                    var lr = options.bounce[1]; // left-right
                    var ms = options.bounce[2]; // milliseconds
                    el
                        .animate({
                            top: '+=' + ud + 'px',
                            left: '-=' + lr + 'px'
                        }, ms)
                        .animate({
                            top: '-=' + ud + 'px',
                            left: '+=' + lr + 'px'
                        }, ms);
                }
            }

            if (instances[el_id]['remaining_frames'] && instances[el_id]['remaining_frames'] > 0) {
                instances[el_id]['remaining_frames']--;
                if (instances[el_id]['remaining_frames'] == 0) {
                    instances[el_id]['remaining_frames'] = -1;
                    delete instances[el_id]['remaining_frames'];
                    return this;
                } else {
                    animate(el);
                }
            } else if (instances[el_id]['remaining_frames'] != -1) {
                animate(el);
            }

            instances[el_id]['options'] = options;
            instances[el_id]['timeout'] = window.setTimeout(function() {
                $._spritely.animate(options);
            }, parseInt(1000 / options.fps));
        },
        randomIntBetween: function(lower, higher) {
            return parseInt(rand_no = Math.floor((higher - (lower - 1)) * Math.random()) + lower);
        },
        getBgUseXY: (function() {
            try {
                return typeof $('body').css('background-position-x') == 'string';
            } catch (e) {
                return false;
            }
        })(),
        getBgY: function(el) {
            if ($._spritely.getBgUseXY) {
                return $(el).css('background-position-y') || '0';
            } else {
                return ($(el).css('background-position') || ' ').split(' ')[1];
            }
        },
        getBgX: function(el) {
            if ($._spritely.getBgUseXY) {
                return $(el).css('background-position-x') || '0';
            } else {
                return ($(el).css('background-position') || ' ').split(' ')[0];
            }
        }
    };


    //去掉url()
    function _spStrip(s, chars) {
        while (s.length) {
            var i, sr, nos = false,
                noe = false;
            for (i = 0; i < chars.length; i++) {
                var ss = s.slice(0, 1);
                sr = s.slice(1);
                if (chars.indexOf(ss) > -1)
                    s = sr;
                else
                    nos = true;
            }
            for (i = 0; i < chars.length; i++) {
                var se = s.slice(-1);
                sr = s.slice(0, -1);
                if (chars.indexOf(se) > -1)
                    s = sr;
                else
                    noe = true;
            }
            if (nos && noe)

                return s;
        }
        return '';
    }


    //扩充jQuery方法
    $.fn.extend({

        /**
         * 加载精灵动画
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
        spritely: function(options) {

            var $this = $(this),
                el_id = $this.attr('id'),
                options = $.extend({
                    type: 'sprite',
                    do_once: false,
                    width: null,
                    height: null,
                    img_width: 0,
                    img_height: 0,
                    fps: 12,
                    no_of_frames: 2,
                    play_frames: 0
                }, options || {}),

                /**
                 * 计算出加载的雪碧图的实际大小
                 * @type {[type]}
                 */
                background_image = (new Image()),
                //获取的地址去掉url()
                background_image_src = _spStrip($this.css('background-image') || '', 'url("); ');

            //如果没有创建
            //存在当前精灵实例的信息
            if (!instances[el_id]) {
                if (options.start_at_frame) {
                    instances[el_id] = {
                        current_frame: options.start_at_frame - 1
                    };
                } else {
                    instances[el_id] = {
                        current_frame: -1
                    };
                }
            }

            instances[el_id]['type'] = options.type;
            instances[el_id]['depth'] = options.depth;

            options.el = $this;

            //精灵的尺寸
            options.width = options.width || $this.width() || 100;
            options.height = options.height || $this.height() || 100;

            //等待雪碧图加载完毕
            background_image.onload = function() {
                //雪碧图的尺寸
                options.img_width = background_image.width;
                options.img_height = background_image.height;
                options.img = background_image;
                var get_rate = function() {
                        //每秒执行的帧数
                        return parseInt(1000 / options.fps);
                    }
                    //是否只执行一次
                if (!options.do_once) {
                    //执行动画
                    options.timer = setTimeout(function() {
                        $._spritely.animate(options);
                    }, get_rate(options.fps));
                } else {
                    options.timer = setTimeout(function() {
                        $._spritely.animate(options);
                    }, 0);
                }
            }
            background_image.src = background_image_src;
            return this;

        },
        sprite: function(options) {
            var options = $.extend({
                type: 'sprite',
                bounce: [0, 0, 1000]
            }, options || {});
            return $(this).spritely(options);
        },
        //滑动到指定位置
        scrollTo: function(x, y, speed, pause) {
            speed = speed || 4000
            pause = pause || 0
            var el_id = $(this).attr('id');
            if (!instances[el_id]) {
                return this;
            }
            if (!instances[el_id].stop_random) {
                $('#' + el_id).animate({
                    top: y + 'px',
                    left: x + 'px'
                }, speed)
            }
            return this;
        },
        spState: function(n) {
            $(this).each(function() {
                // change state of a sprite, where state is the vertical
                // position of the background image (e.g. frames row)
                var yPos = ((n - 1) * $(this).height()) + 'px';
                var xPos = $._spritely.getBgX($(this));
                var bp = xPos + ' -' + yPos;
                $(this).css('background-position', bp);
            });
            return this;
        },
        destroy: function() {
            var el = $(this);
            var el_id = $(this).attr('id');
            if (instances[el_id] && instances[el_id]['timeout']) {
                window.clearTimeout(instances[el_id]['timeout']);
            }
            if (instances[el_id] && instances[el_id]['interval']) {
                window.clearInterval(instances[el_id]['interval']);
            }
            delete instances[el_id]
            return this;
        }
    })
})(jQuery);
