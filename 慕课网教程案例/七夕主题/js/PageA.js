/**
 * 第一个页面
 * container 容器
 * complete  所有的动作都结束回调
 */
var PageA = function(container,complete) {

    var containerWidth = $(container).width()

    var leftBirdWidht = $('#leftBird').width();

    ////////
    //鸟动画 //
    ////////
    
    //左边移动到1/3的地方
    $('#leftBird').sprite({
        fps: 9,
        no_of_frames: 3
    }).scrollTo(containerWidth/3 - leftBirdWidht,150,10000)


    // $('#rightBird').spState(2).sprite({
    //     fps: 9,
    //     no_of_frames: 3
    // })

    var audio = new Html5Audio('gallery/m61e6cb0865ce9fea7c4051289f71d269.mp3')
    audio.play()

    //////////
    //执行云动画 //
    //////////
    CloudEffect()


    ////////////
    //执行水波浪动画 //
    ////////////
    new WaveEffect("qx_water_1_1", -10, -1, 9, 1.5, 1.5)
    new WaveEffect("qx_water_1_2", 20, -50, 7, 1.5, 1.2)
    new WaveEffect("qx_water_1_3", 50, 7, 8, 0.8, 1.5)


    return {
        run: function() {

        },
        destroy:function(){

        }
    }
}
