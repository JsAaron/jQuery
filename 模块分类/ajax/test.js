
alert(1)


var tAjax = function(config) {

    var doneFn;

    var url      = config.url;
    var complete = config.complete; 
    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    xhr.open('post', url);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                doneFn(xhr.responseText);
                complete(xhr.responseText);
            }
        }
    }

    xhr.send(xhr.responseText);

    return {
        /**
         * 返回一个done对象
         */
        done: function(ourfn) {
             doneFn = ourfn;
        }
    };
}


// tAjax({
//     url: "php.html",
//     complete: function(data) {
//          console.log(data)
//     }
// }).done(function(data){
//     console.log(data)
// })

