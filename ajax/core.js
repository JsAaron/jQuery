$(function() {






        // a sample logging function to be added to a callbacks list
        var foo = function( value ) {
          console.log( value );
        };
         
        // another function to also be added to the list
        var bar = function( value ){
          console.log(  value );
        };
         
        var callbacks = $.Callbacks('memory');

        callbacks.add( foo );

        callbacks.fire( "hello" );

        callbacks.add( bar );
         
        callbacks.fire( "hello world" );
         


        console.log(callbacks)




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


