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


    // $.ajax({
    //     url: 'test.php',
    //     dataType:'jsonp',
    //     complete: function(data) {
    //         console.log(arguments)
    //     }
    // })

    // jQuery.getJSON(url, function(data) {
    //     console.log(data)
    //     //alert("Symbol:" + data.symbol + ", Price:" + data.price);
    // });
    
var x = 1;
if (function(){}) { 
  x += typeof f; 
} 
x; 


    
    $(document).ajaxStart(function() {
        console.log(arguments)
    }).ajaxComplete(function() {
        $(".log").text("Triggered ajaxComplete handler.");
    });

    $.ajax({
        async: false, // 同步加载数据,即等到ajax执行完毕再接着执行下面的语句
        // url: 'http://192.168.1.114/yii/demos/test.php',
        url:'test.php',
        type: 'GET', // jsonp模式只有GET是合法的
        data: {
            'action': 'aaron'
        }, // 预传参的数组
        dataType: 'jsonp', // 数据类型
        jsonp: 'backfunc', // 指定回调函数名，与服务器端接收的一致，并回传回来
        success: function(json) {
            console.log(json);
        }
    })
    




    // $.ajax({
    //     url: 'http://192.168.1.114/yii/demos/test.php',
    //     dataType:'text',
    //     success: function(data) {
    //         console.log(arguments)
    //     },
    //     error: function() {
    //         alert('错误')
    //     }
    // });

    


    //全局事件触发
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


