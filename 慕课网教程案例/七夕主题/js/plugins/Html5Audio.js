/**
 * 使用html5的audio播放
 * @param  {string} url    音频路径
 * @return {object}         [description]
 */
function Html5Audio(url) {
    var audio = new Audio(url);
    //监听音频结束
    audio.addEventListener('ended', function() {
        self.status = 'ended';
    }, false);
    this.audio = audio;
    this.status = 'playing';
}

Html5Audio.prototype = {
    play: function() {
        //warning!keep it autoplay，否则要判断加载完成
        this.audio.autoplay = true;
        this.status = 'playing';
        this.audio.play();
    },
    pause: function() {
        this.status = 'paused';
        this.audio.pause();
    },
    end: function() {
        this.status = 'ended';
        this.audio.end();
    }
}

