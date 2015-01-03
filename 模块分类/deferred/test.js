window.onload = function(){


	Aaron.next(function func1() {
        setTimeout(function(){
            console.log(11111111)
        },100)
        return Aaron.wait(2);
    })
    .next(function func2() {
        setTimeout(function(){
            console.log(22222222)
        },300)
    })
    .next(function func2() {
        setTimeout(function(){
            console.log(3333333)
        },50)
    })
}