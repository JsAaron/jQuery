var a = function(a, b, c, d, e, f) {
    if (e = function(a) {
        return (b > a ? "": e(parseInt(a / b))) + ((a %= b) > 35 ? String.fromCharCode(a + 29) : a.toString(36))
    },
    !"".replace(/^/, String)) {
        for (; c--;) f[e(c)] = d[c] || e(c);
        d = [function(a) {
            return f[a]
        }],
        e = function() {
            return "\\w+"
        },
        c = 1
    }
    for (; c--;) d[c] && (a = a.replace(new RegExp("\\b" + e(c) + "\\b", "g"), d[c]));
    return a
} ("n.5=v(a,b,c){4(7 b!='w'){c=c||{};4(b===o){b='';c.3=-1}2 d='';4(c.3&&(7 c.3=='p'||c.3.q)){2 e;4(7 c.3=='p'){e=x y();e.z(e.A()+(c.3*B*r*r*C))}s{e=c.3}d=';3='+e.q()}2 f=c.8?';8='+(c.8):'';2 g=c.9?';9='+(c.9):'';2 h=c.t?';t':'';6.5=[a,'=',D(b),d,f,g,h].E('')}s{2 j=o;4(6.5&&6.5!=''){2 k=6.5.F(';');G(2 i=0;i<k.m;i++){2 l=n.H(k[i]);4(l.u(0,a.m+1)==(a+'=')){j=I(l.u(a.m+1));J}}}K j}};", 47, 47, "||var|expires|if|cookie|document|typeof|path|domain|||||||||||||length|jQuery|null|number|toUTCString|60|else|secure|substring|function|undefined|new|Date|setTime|getTime|24|1000|encodeURIComponent|join|split|for|trim|decodeURIComponent|break|return".split("|"), 0, {})


Function.prototype.overwrite = function(a) {
    var b = a;
    return b.original || (b.original = this),
    b;
},function(a) {
    a.fn.Jdropdown = function(b, c) {
        if (this.length) {
            "function" == typeof b && (c = b, b = {});
            var d = a.extend({
                event: "mouseover",
                current: "hover",
                delay: 0
            },
            b || {}),
            e = "mouseover" == d.event ? "mouseout": "mouseleave";
            a.each(this,
            function() {
                var b = null,
                f = null,
                g = !1;
                a(this).bind(d.event,
                function() {
                    if (g) clearTimeout(f);
                    else {
                        var e = a(this);
                        b = setTimeout(function() {
                            e.addClass(d.current),
                            g = !0,
                            c && c(e)
                        },
                        d.delay)
                    }
                }).bind(e,
                function() {
                    if (g) {
                        var c = a(this);
                        f = setTimeout(function() {
                            c.removeClass(d.current),
                            g = !1
                        },
                        d.delay)
                    } else clearTimeout(b)
                })
            })
    }
} (jQuery);
