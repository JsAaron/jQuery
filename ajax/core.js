$(function() {


    //全局事件触发
    $(document).ajaxStart(function() {
        console.log(arguments)
    }).ajaxComplete(function() {
        $(".log").text("Triggered ajaxComplete handler.");
    });


    $(".trigger").click(function() {
        //发送ajax请求
        //
        $.ajax({
            url: "php.html",
            context: document.body,
            complete: function() {
                console.log(this)
            }
        }).done(function() {
            console.log(this)
        });
    });


})


