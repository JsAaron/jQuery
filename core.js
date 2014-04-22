

$(function(){

        $(document).ajaxComplete(function() {
            $(".log").text("Triggered ajaxComplete handler.");
        });


        $(".trigger").click(function() {

            $.ajax({
                url     : "php.html",
                context : document.body,
                complete:function(){
                    console.log(this)
                }
            }).done(function() {
                console.log(this)
            });

        });

})

