$(function() {

    var foo = $('#foo')

    // foo.slideUp().slideDown().queue(function(fn,o){
    //     console.log(fn,o)
    // })

    foo.slideUp(function(){
        console.log(1)
    }).slideDown(function(){
        console.log(2)
    }).queue(function() {
        console.log(3)
       // $(this).dequeue();
    });

})


