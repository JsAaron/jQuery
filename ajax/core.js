$(function() {






function fn1( value ) {
   console.log("fn1 says: " + value);
}
 
function fn2( value ) {
    console.log("fn2 says: " + value);
    return false;
}


var callbacks = $.Callbacks("once,memory");

callbacks.add( fn1 );
callbacks.fire( "1" );

callbacks.add( fn1 );
callbacks.fire( "2" );

callbacks.add( fn1 );
callbacks.fire( "3" );

callbacks.add( fn1 );
callbacks.fire( "4" );

// callbacks.remove( fn2 );
// callbacks.fire( "foobar" );
     



    // var callbacks = $.Callbacks("once memory")

    // console.log(callbacks)

 




    // var dfd = $.Deferred();

    // console.log(dfd)


    // setTimeout(function(){
    //     dfd.resolve(111)
    // },1000)


    // dfd.done(function(a){
    //     console.log(a)
    // })


    //全局事件触发
    // $(document).ajaxStart(function() {
    //     console.log(arguments)
    // }).ajaxComplete(function() {
    //     $(".log").text("Triggered ajaxComplete handler.");
    // });


    // $(".trigger").click(function() {
    //     //发送ajax请求
    //     //
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


