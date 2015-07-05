$(function() {

	var container = document.getElementById('swipe');
	var element   = container.children[0];
	var slides    = element.children;

    //初始化页面对象
    var page1 = firstPage(slides[0])


    //页面滑动对象
    var swipe = Swipe(container);


    swipe.initComplete = function(){
    	page1.start() //开始执行
    }




    $("button").click(function() {
        swipe.next();
    })
})
