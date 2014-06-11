$(function() {


// var prefilters = {};

// var addToPrefiltersOrTransports = function(structure) {

//     return function(func) {
//         structure['*'] = func;
//     }
// }

// var ajaxPrefilter = addToPrefiltersOrTransports(prefilters)


// ajaxPrefilter(function(options){
//     return {
//         send:function(){

//         },
//         callback:function(){

//         }
//     }
// })




    // jQuery.getJSON(url, function(data) {
    //     console.log(data)
    //     //alert("Symbol:" + data.symbol + ", Price:" + data.price);
    // });


    $.ajax({
        url: 'test.php';,
        dataType: "jsonp",
        success: function(data) {
            console.log(arguments)
        }
    });


    // //全局事件触发
    // $(document).ajaxStart(function() {
    //     console.log(arguments)
    // }).ajaxComplete(function() {
    //     $(".log").text("Triggered ajaxComplete handler.");
    // });


    // $(".trigger").click(function() {
    //     //发送ajax请求
    //     $.ajax({
    //         url: "php.html",
    //         context: document.body,
    //         complete: function() {
    //             console.log(this)
    //         }
    //     }).done(function() {
    //         console.log(this)
    //     });
    // });


})


