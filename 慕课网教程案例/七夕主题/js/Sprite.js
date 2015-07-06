/**
 * 精灵动画
 */
function Sprite(options) {

    var $element = options.element,
        status = '',
        data = options.data,
        src = data.md5,
        count = data.thecount || 0,
        loop = data.loop,
        fps = data.fps || 1,
        root = Config.pathAddress,
        info = parsePath(src),
        url = root + info.name,
        ext = info.ext,
        num = info.num || 0,
        timer = 0,
        DOC = document,
        image = DOC.createElement('img');

    image.src = root + src;
    $element.append(image);

    function runSprites() {
        timer = setTimeout(function() {
            image.src = url + num + ext;
            num++;
            check();
        }, 1000 / fps);
    }

    function check() {
        if (status === 'paused') {
            return;
        }
        if (num > count) {
            if (loop) {
                num %= count;
                runSprites();
            } else {
                timer = null;
                callback();
            }
        } else {
            runSprites();
        }
    }

    //分解路径,得到扩展名和文件名
    function parsePath(path) {
        var tmp = path.split('.'),
            ext = '.' + tmp[1],
            tmp = tmp[0].split('-'),
            name = tmp[0] + '-',
            num = tmp[1] - 0;
        return {
            name: name,
            ext: ext,
            num: num
        };
    }

    runSprites();

    return {

        run: function() {
            status = 'play';
            runSprites();
        },

        stop: function() {
            //停止精灵动画
            clearTimeout(timer);
            status = 'paused';
            num = 0;
            $element = null;
            image = null;
        },

        pause: function() {
            //暂停精灵动画
            status = 'paused';
        },

        play: function() {
            //恢复精灵动画
            status = 'play';
            check();
        }

    }
}
