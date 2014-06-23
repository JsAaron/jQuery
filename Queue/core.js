$(function() {


    var div = $("div");

    function runIt() {


        div.show({
            'queue':false
        });
        // div.slideToggle(1000);
        // div.slideToggle("fast");

        return

        div.show("slow");
        div.animate({
            left: '+=300'
        }, 2000);
        div.slideToggle(1000);
        div.slideToggle("fast");
        div.animate({
            left: '-=200'
        }, 1500);
        div.hide("slow");
        div.show(1200);
        div.slideUp("normal", runIt);
    }

    function showIt() {
        var n = div.queue("fx");
        $("span").text(n.length);
        setTimeout(showIt, 100);
    }

    runIt();

    // showIt()



})