

$(function(){

//        var p1 = $('#p1')
//
//   console.log( p1.innerWidth() )



    function mixin(receiver, supplier) {
        for (var property in supplier) {
            if (supplier.hasOwnProperty(property)) {
                receiver[property] = supplier[property];
                }
        }
    }

    var aa = {}

//    mixin(aa, {
//        name: "Nicholas",
//
//        sayName: function() {
//            console.log(this.name);
//        }
//    });
//
//    aa.sayName();       // outputs "Nicholas"



    ;(function() {
        // to be filled in later
        var name;

        mixin(aa, {
            get name() {
                return name;
            }
        });

        // let's just say this is later
        name = "Nicholas";
    }());

    console.log(aa.name);       // undefined










})

