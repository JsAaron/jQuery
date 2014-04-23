// Document location
var ajaxLocParts,
    ajaxLocation,

    ajax_nonce = jQuery.now(),

    ajax_rquery = /\?/,
    rhash = /#.*$/,
    rts = /([?&])_=[^&]*/,
    rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,
    // #7653, #8125, #8152: local protocol detection
    rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
    rnoContent = /^(?:GET|HEAD)$/,
    rprotocol = /^\/\//,
    rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,

    //保存一份事件的load的引用
    _load = jQuery.fn.load,

    /* Prefilters
     * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
     * 2) These are called:
     *    - BEFORE asking for a transport
     *    - AFTER param serialization (s.data is a string if s.processData is true)
     * 3) key is the dataType
     * 4) the catchall symbol "*" can be used
     * 5) execution will start with transport dataType and THEN continue down to "*" if needed
     */
    prefilters = {},

    /* Transports bindings
     * 1) key is the dataType
     * 2) the catchall symbol "*" can be used
     * 3) selection will start with transport dataType and THEN go to "*" if needed
     */
    transports = {},

    // Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
    allTypes = "*/".concat("*");

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
// 在IE中，如果document.domain被设置了，获取window.location会报错
try {
    ajaxLocation = location.href;
} catch (e) {
    // Use the href attribute of an A element
    // since IE will modify it given document.location
    // 因为IE会修改A标签元素的href属性，添加window.location字符串
    ajaxLocation = document.createElement("a");
    ajaxLocation.href = "";
    ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || [];


/**
 * 返回一个函数，为prefilters或者transport添加属性,
 * 该属性值是一个数组，里面存放的是函数func，
 * 可以给dataTypeExpression字符串添加标识，表示是添加到数组头部还是尾部
 * @param {[type]} structure [description]
 */
function addToPrefiltersOrTransports(structure) {

    // dataTypeExpression is optional and defaults to "*"
    return function(dataTypeExpression, func) {

        if (typeof dataTypeExpression !== "string") {
            func = dataTypeExpression;
            dataTypeExpression = "*";
        }

        var dataType,
            i = 0,
            dataTypes = dataTypeExpression.toLowerCase().match(core_rnotwhite) || [];

        if (jQuery.isFunction(func)) {
            // For each dataType in the dataTypeExpression
            while ((dataType = dataTypes[i++])) {
                // Prepend if requested
                if (dataType[0] === "+") {
                    dataType = dataType.slice(1) || "*";
                    (structure[dataType] = structure[dataType] || []).unshift(func);

                    // Otherwise append
                } else {
                    (structure[dataType] = structure[dataType] || []).push(func);
                }
            }
        }
    };
}


// 遍历structure[dataType]数组，并执行回调，
// prefilterOrFactory为函数数组元素，
// 执行该函数如果返回的结果dataTypeOrTransport是字符串且时prefilters且没有被inspected过，
// 就给options.dataTypes数组头部添加该字符串，
// 继续递归dataTypeOrTransport(当我们使用json/jsonp的时候会返回“script”，于是会执行“script”相关的回调)。
// 如果是transport就返回dataTypeOrTransport的假结果
function inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR) {

    var inspected = {},
        seekingTransport = (structure === transports);

    function inspect(dataType) {
        var selected;
        inspected[dataType] = true;
        jQuery.each(structure[dataType] || [], function(_, prefilterOrFactory) {
            var dataTypeOrTransport = prefilterOrFactory(options, originalOptions, jqXHR);
            if (typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[dataTypeOrTransport]) {
                options.dataTypes.unshift(dataTypeOrTransport);
                inspect(dataTypeOrTransport);
                return false;
            } else if (seekingTransport) {
                return !(selected = dataTypeOrTransport);
            }
        });
        return selected;
    }

    return inspect(options.dataTypes[0]) || !inspected["*"] && inspect("*");
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
// 对ajax配置项进行扩展
// 如果jQuery.ajaxSettings.flatOptions存在src对应的key值，
// 就直接给target添加（覆盖）相应key/value，
// flatOptions对象里的属性是不需要被深度拷贝的
// 否则创建一个deep对象，将src的key/value添加给deep，
// 然后深度克隆deep对象到target.
// 最后都返回target
function ajaxExtend(target, src) {
    var key, deep,
        flatOptions = jQuery.ajaxSettings.flatOptions || {};

    for (key in src) {
        if (src[key] !== undefined) {
            // 如果jQuery.ajaxSettings.flatOptions存在src对应的key值，
            // 就直接给target添加（覆盖）相应key/value，
            // 否则创建一个deep对象，将src的key/value添加给deep
            (flatOptions[key] ? target : (deep || (deep = {})))[key] = src[key];
        }
    }
    if (deep) {
        jQuery.extend(true, target, deep);
    }

    return target;
}


/**
 *  事件处理函数中也有一个方法叫 .load()。
 *  jQuery根据传递给它的参数设置来确定使用哪个方法执行。
 */
jQuery.fn.load = function(url, params, callback) {

    //加载事件
    if (typeof url !== "string" && _load) {
        return _load.apply(this, arguments);
    }

    var selector, type, response,
        self = this,
        off = url.indexOf(" ");

    // 如果url有空格，空格前面是url，后面是选择器selector
    if (off >= 0) {
        selector = url.slice(off);
        url = url.slice(0, off);
    }

    // If it's a function
    if (jQuery.isFunction(params)) {

        // We assume that it's the callback
        callback = params;
        params = undefined;

        // Otherwise, build a param string
    } else if (params && typeof params === "object") {
        type = "POST";
    }

    // If we have elements to modify, make the request
    if (self.length > 0) {
        jQuery.ajax({
            url: url,

            // if "type" variable is undefined, then "GET" method will be used
            type: type,
            dataType: "html",
            data: params
        }).done(function(responseText) {

            // Save response for use in complete callback
            response = arguments;

            self.html(selector ?

                // If a selector was specified, locate the right elements in a dummy div
                // Exclude scripts to avoid IE 'Permission Denied' errors
                jQuery("<div>").append(jQuery.parseHTML(responseText)).find(selector) :

                // Otherwise use the full result
                responseText);

        }).complete(callback && function(jqXHR, status) {
            self.each(callback, response || [jqXHR.responseText, status, jqXHR]);
        });
    }

    return this;
};

// Attach a bunch of functions for handling common AJAX events
jQuery.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function(i, type) {
    jQuery.fn[type] = function(fn) {
        return this.on(type, fn);
    };
});

jQuery.extend({

    // Counter for holding the number of active queries
    active: 0,

    // Last-Modified header cache for next request
    lastModified: {},
    etag: {},

    // ajax配置项
    ajaxSettings: {
        //用来包含发送请求的URL字符串。
        url: ajaxLocation,

        /**
         * (默认: "GET") 请求方式 ("POST" 或 "GET")，
         * 默认为 "GET"。注意：其它 HTTP 请求方法，如 PUT 和 DELETE 也可以使用，但仅部分浏览器支持
         * @type {String}
         */
        type: "GET",

        /**
         * 是否为本地
         * 默认: 取决于当前的位置协议
         * 允许当前环境被认定为“本地”，（如文件系统），即使jQuery默认情况下不会承认它。
         * 以下协议目前公认为本地：file, *-extension, and widget。
         * 如果isLocal设置需要修改，建议在$.ajaxSetup()方法中这样做一次。
         * @type {Boolean}
         */
        isLocal: rlocalProtocol.test(ajaxLocParts[1]),

        /**
         * (默认: true) 是否触发全局 AJAX 事件。
         * 设置为 false 将不会触发全局 AJAX 事件，如 ajaxStart 或 ajaxStop 可用于控制不同的 Ajax 事件。
         * @type {Boolean}
         */
        global: true,

        /**
         * 默认: true  默认情况下，通过data选项传递进来的数据，
         * 如果是一个对象(技术上讲只要不是字符串)，都会处理转化成一个查询字符串，
         * 以配合默认内容类型 "application/x-www-form-urlencoded"。
         * 如果要发送 DOM 树信息或其它不希望转换的信息，请设置为 false。
         * @type {Boolean}
         */
        processData: true,

        /**
         * (默认: true) 默认设置下，所有请求均为异步请求。如果需要发送同步请求，请将此选项设置为 false。
         * 注意，同步请求将锁住浏览器，用户其它操作必须等待请求完成才可以执行。
         * @type {Boolean}
         */
        async: true,

        /**
         * (默认: "application/x-www-form-urlencoded") 发送信息至服务器时内容编码类型。
         * 默认值适合大多数情况。如果你明确地传递了一个content-type给 $.ajax() 那么他必定会发送给服务器（即使没有数据要发送）
         * @type {String}
         */
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",


        /*
               //设置请求超时时间（毫秒）。此设置将覆盖全局设置。
               timeout: 0,
               data: null,
               dataType: null,
               // 用于响应HTTP访问认证请求的用户名
               username: null,
               // 用于响应HTTP访问认证请求的密码
               password: null,
               // (默认: true,dataType为script和jsonp时默认为false)，设置为 false 将不缓存此页面。
               cache: null,
               throws: false,
               // 如果你想要用传统的方式来序列化数据，那么就设置为true
               traditional: false,
               // 个额外的"{键:值}"对映射到请求一起发送。此设置被设置之前beforeSend函数被调用;因此，消息头中的值设置可以在覆盖beforeSend函数范围内的任何设置。
               headers: {},
           */

        /**
         * 接受的数据的type类型
         * 内容类型发送请求头，告诉服务器什么样的响应会接受返回。
         * 如果accepts设置需要修改，推荐在$.ajaxSetup()方法中做一次。
         * @type {Object}
         */
        accepts: {
            "*": allTypes,
            text: "text/plain",
            html: "text/html",
            xml: "application/xml, text/xml",
            json: "application/json, text/javascript"
        },

        /**
         * 一个以"{字符串:正则表达式}"配对的对象，用来确定jQuery将如何解析响应，给定其内容类型。
         * @type {Object}
         */
        contents: {
            xml: /xml/,
            html: /html/,
            json: /json/
        },

        responseFields: {
            xml: "responseXML",
            text: "responseText",
            json: "responseJSON"
        },

        // Data converters
        // Keys separate source (or catchall "*") and destination types with a single space
        /**
         * 数据转换器
         * 一个数据类型对数据类型转换器的对象。每个转换器的值是一个函数，返回响应的转化值
         * @type {Object}
         */
        converters: {

            // Convert anything to text
            "* text": String,

            // Text to html (true = no transformation)
            "text html": true,

            // Evaluate text as a json expression
            "text json": jQuery.parseJSON,

            // Parse text as xml
            "text xml": jQuery.parseXML
        },

        // For options that shouldn't be deep extended:
        // you can add your own custom options here if
        // and when you create one that shouldn't be
        // deep extended (see ajaxExtend)
        // 不会被深度拷贝的配置项
        flatOptions: {
            url: true,
            context: true
        }
    },

    // Creates a full fledged settings object into target
    // with both ajaxSettings and settings fields.
    // If target is omitted, writes into ajaxSettings.
    // 创建更健壮的配置项到target中，包含了ajaxSettings和settings参数
    // 如果只有一个参数，直接添加到jQuery.ajaxSettings中
    ajaxSetup: function(target, settings) {
        return settings ?

        // Building a settings object
        ajaxExtend(ajaxExtend(target, jQuery.ajaxSettings), settings) :

        // Extending ajaxSettings
        ajaxExtend(jQuery.ajaxSettings, target);
    },

    ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
    ajaxTransport: addToPrefiltersOrTransports(transports),

    // Main method
    ajax: function(url, options) {

        // If url is an object, simulate pre-1.5 signature
        if (typeof url === "object") {
            options = url;
            url = undefined;
        }

        // Force options to be an object
        options = options || {};

        var transport,
            // URL without anti-cache param
            cacheURL,
            // Response headers
            responseHeadersString,
            responseHeaders,
            // timeout handle
            timeoutTimer,
            // Cross-domain detection vars
            parts,
            // To know if global events are to be dispatched
            fireGlobals,
            // Loop variable
            i,
            // Create the final options object
            s = jQuery.ajaxSetup({}, options),

            // Callbacks context
            callbackContext = s.context || s,
            // Context for global events is callbackContext if it is a DOM node or jQuery collection
            globalEventContext = s.context && (callbackContext.nodeType || callbackContext.jquery) ?
                jQuery(callbackContext) :
                jQuery.event,

            // Deferreds
            deferred = jQuery.Deferred(),

            /**
             * 所有的回调队列，不管任何时候增加的回调保证只触发一次
             * @type {[type]}
             */
            completeDeferred = jQuery.Callbacks("once memory"),

            // Status-dependent callbacks
            statusCode = s.statusCode || {},
            // Headers (they are sent all at once)
            requestHeaders = {},
            requestHeadersNames = {},

            // The jqXHR state
            state = 0,
            // Default abort message
            strAbort = "canceled",
            // Fake xhr
            jqXHR = {
                readyState: 0,

                // Builds headers hashtable if needed
                getResponseHeader: function(key) {
                    var match;
                    if (state === 2) {
                        if (!responseHeaders) {
                            responseHeaders = {};
                            while ((match = rheaders.exec(responseHeadersString))) {
                                responseHeaders[match[1].toLowerCase()] = match[2];
                            }
                        }
                        match = responseHeaders[key.toLowerCase()];
                    }
                    return match == null ? null : match;
                },

                // Raw string
                getAllResponseHeaders: function() {
                    return state === 2 ? responseHeadersString : null;
                },

                // Caches the header
                setRequestHeader: function(name, value) {
                    var lname = name.toLowerCase();
                    if (!state) {
                        name = requestHeadersNames[lname] = requestHeadersNames[lname] || name;
                        requestHeaders[name] = value;
                    }
                    return this;
                },

                // Overrides response content-type header
                overrideMimeType: function(type) {
                    if (!state) {
                        s.mimeType = type;
                    }
                    return this;
                },

                // Status-dependent callbacks
                statusCode: function(map) {
                    var code;
                    if (map) {
                        if (state < 2) {
                            for (code in map) {
                                // Lazy-add the new callback in a way that preserves old ones
                                statusCode[code] = [statusCode[code], map[code]];
                            }
                        } else {
                            // Execute the appropriate callbacks
                            jqXHR.always(map[jqXHR.status]);
                        }
                    }
                    return this;
                },

                // Cancel the request
                abort: function(statusText) {
                    var finalText = statusText || strAbort;
                    if (transport) {
                        transport.abort(finalText);
                    }
                    done(0, finalText);
                    return this;
                }
            };

        // 给jqXHR扩充添加promise的属性和方法，
        // 然后添加complete方法，这里用的是回调列表的add方法（即添加回调）
        // 订阅完成回调
        deferred.promise(jqXHR).complete = completeDeferred.add;
        jqXHR.success = jqXHR.done;
        jqXHR.error   = jqXHR.fail;

        // Remove hash character (#7531: and string promotion)
        // Add protocol if not provided (prefilters might expect it)
        // Handle falsy url in the settings object (#10093: consistency with old signature)
        // We also use the url parameter if available
        // Remove 将url的hash去掉 
        // rhash=/#.*$/ 
        // rprotocol = /^\/\//  
        // ajaxLocParts[1]="http:"
        s.url = ((url || s.url || ajaxLocation) + "").replace(rhash, "")
            .replace(rprotocol, ajaxLocParts[1] + "//");

        // Alias method option to type as per ticket #12004
        s.type = options.method || options.type || s.method || s.type;

        // Extract dataTypes list
        // 取出dataTypes list，不存在则为*  
        // core_rnotwhite = /\s+/ 
        // 如:s.dataType=[*]
        s.dataTypes = jQuery.trim(s.dataType || "*").toLowerCase().match(core_rnotwhite) || [""];

        // A cross-domain request is in order when we have a protocol:host:port mismatch
        // 如果你想在同一域中强制跨域请求（如JSONP形式），
        // 例如，想服务器端重定向到另一个域，那么需要将crossDomain设置为 true 
        if (s.crossDomain == null) {

            //同ajaxLocParts变量,这里也是通过这个请求的url来判断是否是跨域请求
            parts = rurl.exec(s.url.toLowerCase());

            //这里来判断是否是跨域请求,又是!! 主要判断请求的url parts与 ajaxLocParts     
            //这里智能判断你的请求地址是否是跨越
            s.crossDomain = !! (parts &&
                (parts[1] !== ajaxLocParts[1] || parts[2] !== ajaxLocParts[2] ||
                    (parts[3] || (parts[1] === "http:" ? "80" : "443")) !==
                    (ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? "80" : "443")))
            );
        }

        // Convert data if not already a string
        // 数据序列化
        // 如果数据不是字符串，则需要转化
        if (s.data && s.processData && typeof s.data !== "string") {
            s.data = jQuery.param(s.data, s.traditional);
        }

        // Apply prefilters
        // 过滤器
        inspectPrefiltersOrTransports(prefilters, s, options, jqXHR);

        // If request was aborted inside a prefilter, stop there
        if (state === 2) {
            return jqXHR;
        }

        // 这个请求是否将触发全局AJAX事件处理程序
        fireGlobals = s.global;

        // Watch for a new set of requests
        // 触发监听的ajaxStart监听
        if (fireGlobals && jQuery.active++ === 0) {
            jQuery.event.trigger("ajaxStart");
        }

        // Uppercase the type
        s.type = s.type.toUpperCase();

        // Determine if request has content
        // 请求是否有内容
        s.hasContent = !rnoContent.test(s.type);

        // Save the URL in case we're toying with the If-Modified-Since
        // and/or If-None-Match header later on
        cacheURL = s.url;

        // More options handling for requests with no content
        if (!s.hasContent) {

            // If data is available, append data to url
            if (s.data) {
                cacheURL = (s.url += (ajax_rquery.test(cacheURL) ? "&" : "?") + s.data);
                // #9682: remove data so that it's not used in an eventual retry
                delete s.data;
            }

            // Add anti-cache in url if needed
            if (s.cache === false) {
                s.url = rts.test(cacheURL) ?

                // If there is already a '_' parameter, set its value
                cacheURL.replace(rts, "$1_=" + ajax_nonce++) :

                // Otherwise add one to the end
                cacheURL + (ajax_rquery.test(cacheURL) ? "&" : "?") + "_=" + ajax_nonce++;
            }
        }

        // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
        // 只有上次请求响应改变时，才允许请求成功。
        // 使用 HTTP 包 Last-Modified 头信息判断。默认值是false，忽略HTTP头信息。
        // 2在jQuery 1.4中，他也会检查服务器指定的'etag'来确定数据没有被修改过。
        if (s.ifModified) {
            if (jQuery.lastModified[cacheURL]) {
                jqXHR.setRequestHeader("If-Modified-Since", jQuery.lastModified[cacheURL]);
            }
            if (jQuery.etag[cacheURL]) {
                jqXHR.setRequestHeader("If-None-Match", jQuery.etag[cacheURL]);
            }
        }

        // Set the correct header, if data is being sent
        // 设置正确的头信息
        if (s.data && s.hasContent && s.contentType !== false || options.contentType) {
            jqXHR.setRequestHeader("Content-Type", s.contentType);
        }

        // Set the Accepts header for the server, depending on the dataType
        // 为服务器设置接收头,根据不同的数据类型
        jqXHR.setRequestHeader(
            "Accept",
            s.dataTypes[0] && s.accepts[s.dataTypes[0]] ?
            s.accepts[s.dataTypes[0]] + (s.dataTypes[0] !== "*" ? ", " + allTypes + "; q=0.01" : "") :
            s.accepts["*"]
        );

        // Check for headers option
        // 混入用户定义的头部信息设置
        for (i in s.headers) {
            jqXHR.setRequestHeader(i, s.headers[i]);
        }

        // Allow custom headers/mimetypes and early abort
        // 请求发送前的回调函数，用来修改请求发送前jqXHR（在jQuery 1.4.x的中，XMLHttpRequest）对象，
        // 此功能用来设置自定义 HTTP 头信息，等等。该jqXHR和设置对象作为参数传递。
        // 这是一个Ajax事件 。在beforeSend函数中返回false将取消这个请求。
        // 从jQuery 1.5开始， beforeSend选项将被访问，不管请求的类型
        if (s.beforeSend && (s.beforeSend.call(callbackContext, jqXHR, s) === false || state === 2)) {
            // Abort if not done already and return
            return jqXHR.abort();
        }

        // aborting is no longer a cancellation
        strAbort = "abort";

        // Install callbacks on deferreds
        // 增加回调队列
        for (i in {
            success  : 1,
            error    : 1,
            complete : 1
        }) {
            /**
             * 把参数的回调函数注册到内部jqXHR对象上,实现统一调用
             * 给ajax对象注册 回调函数add
             * deferred返回complete,error外部捕获
             */
            jqXHR[i](s[i]);
        }

        // Get transport
        transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR);

        // If no transport, we auto-abort
        if (!transport) {
            done(-1, "No Transport");
        } else {

            jqXHR.readyState = 1;

            /**
             * 全局事件ajaxSend
             */
            if (fireGlobals) {
                globalEventContext.trigger("ajaxSend", [jqXHR, s]);
            }

            // Timeout
            if (s.async && s.timeout > 0) {
                timeoutTimer = setTimeout(function() {
                    jqXHR.abort("timeout");
                }, s.timeout);
            }

            /**
             * 发送AJAX请求
             */
            try {
                state = 1;
                transport.send(requestHeaders, done);
            } catch (e) {
                // Propagate exception as error if not done
                if (state < 2) {
                    done(-1, e);
                    // Simply rethrow otherwise
                } else {
                    throw e;
                }
            }
        }

        // Callback for when everything is done
        function done(status, nativeStatusText, responses, headers) {
            var isSuccess, success, error, response, modified,
                statusText = nativeStatusText;

            // Called once
            if (state === 2) {
                return;
            }

            // State is "done" now
            state = 2;

            // Clear timeout if it exists
            if (timeoutTimer) {
                clearTimeout(timeoutTimer);
            }

            // Dereference transport for early garbage collection
            // (no matter how long the jqXHR object will be used)
            transport = undefined;

            // Cache response headers
            responseHeadersString = headers || "";

            // Set readyState
            jqXHR.readyState = status > 0 ? 4 : 0;

            // Determine if successful
            isSuccess = status >= 200 && status < 300 || status === 304;

            // Get response data
            if (responses) {
                response = ajaxHandleResponses(s, jqXHR, responses);
            }

            // Convert no matter what (that way responseXXX fields are always set)
            response = ajaxConvert(s, response, jqXHR, isSuccess);

            // If successful, handle type chaining
            if (isSuccess) {

                // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
                if (s.ifModified) {
                    modified = jqXHR.getResponseHeader("Last-Modified");
                    if (modified) {
                        jQuery.lastModified[cacheURL] = modified;
                    }
                    modified = jqXHR.getResponseHeader("etag");
                    if (modified) {
                        jQuery.etag[cacheURL] = modified;
                    }
                }

                // if no content
                if (status === 204 || s.type === "HEAD") {
                    statusText = "nocontent";

                    // if not modified
                } else if (status === 304) {
                    statusText = "notmodified";

                    // If we have data, let's convert it
                } else {
                    statusText = response.state;
                    success = response.data;
                    error = response.error;
                    isSuccess = !error;
                }
            } else {
                // We extract error from statusText
                // then normalize statusText and status for non-aborts
                error = statusText;
                if (status || !statusText) {
                    statusText = "error";
                    if (status < 0) {
                        status = 0;
                    }
                }
            }

            // Set data for the fake xhr object
            jqXHR.status = status;
            jqXHR.statusText = (nativeStatusText || statusText) + "";

            // Success/Error
            if (isSuccess) {
                deferred.resolveWith(callbackContext, [success, statusText, jqXHR]);
            } else {
                deferred.rejectWith(callbackContext, [jqXHR, statusText, error]);
            }

            // Status-dependent callbacks
            jqXHR.statusCode(statusCode);
            statusCode = undefined;

            if (fireGlobals) {
                globalEventContext.trigger(isSuccess ? "ajaxSuccess" : "ajaxError", [jqXHR, s, isSuccess ? success : error]);
            }

            // Complete
            completeDeferred.fireWith(callbackContext, [jqXHR, statusText]);

            if (fireGlobals) {
                globalEventContext.trigger("ajaxComplete", [jqXHR, s]);
                // Handle the global AJAX counter
                if (!(--jQuery.active)) {
                    jQuery.event.trigger("ajaxStop");
                }
            }
        }

        return jqXHR;
    },

    getJSON: function(url, data, callback) {
        return jQuery.get(url, data, callback, "json");
    },

    getScript: function(url, callback) {
        return jQuery.get(url, undefined, callback, "script");
    }
});

jQuery.each(["get", "post"], function(i, method) {
    jQuery[method] = function(url, data, callback, type) {
        // shift arguments if data argument was omitted
        if (jQuery.isFunction(data)) {
            type = type || callback;
            callback = data;
            data = undefined;
        }

        return jQuery.ajax({
            url: url,
            type: method,
            dataType: type,
            data: data,
            success: callback
        });
    };
});


/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */

function ajaxHandleResponses(s, jqXHR, responses) {

    var ct, type, finalDataType, firstDataType,
        contents = s.contents,
        dataTypes = s.dataTypes;

    // Remove auto dataType and get content-type in the process
    while (dataTypes[0] === "*") {
        dataTypes.shift();
        if (ct === undefined) {
            ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
        }
    }

    // Check if we're dealing with a known content-type
    if (ct) {
        for (type in contents) {
            if (contents[type] && contents[type].test(ct)) {
                dataTypes.unshift(type);
                break;
            }
        }
    }

    // Check to see if we have a response for the expected dataType
    if (dataTypes[0] in responses) {
        finalDataType = dataTypes[0];
    } else {
        // Try convertible dataTypes
        for (type in responses) {
            if (!dataTypes[0] || s.converters[type + " " + dataTypes[0]]) {
                finalDataType = type;
                break;
            }
            if (!firstDataType) {
                firstDataType = type;
            }
        }
        // Or just use first one
        finalDataType = finalDataType || firstDataType;
    }

    // If we found a dataType
    // We add the dataType to the list if needed
    // and return the corresponding response
    if (finalDataType) {
        if (finalDataType !== dataTypes[0]) {
            dataTypes.unshift(finalDataType);
        }
        return responses[finalDataType];
    }
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */

function ajaxConvert(s, response, jqXHR, isSuccess) {
    var conv2, current, conv, tmp, prev,
        converters = {},
        // Work with a copy of dataTypes in case we need to modify it for conversion
        dataTypes = s.dataTypes.slice();

    // Create converters map with lowercased keys
    if (dataTypes[1]) {
        for (conv in s.converters) {
            converters[conv.toLowerCase()] = s.converters[conv];
        }
    }

    current = dataTypes.shift();

    // Convert to each sequential dataType
    while (current) {

        if (s.responseFields[current]) {
            jqXHR[s.responseFields[current]] = response;
        }

        // Apply the dataFilter if provided
        if (!prev && isSuccess && s.dataFilter) {
            response = s.dataFilter(response, s.dataType);
        }

        prev = current;
        current = dataTypes.shift();

        if (current) {

            // There's only work to do if current dataType is non-auto
            if (current === "*") {

                current = prev;

                // Convert response if prev dataType is non-auto and differs from current
            } else if (prev !== "*" && prev !== current) {

                // Seek a direct converter
                conv = converters[prev + " " + current] || converters["* " + current];

                // If none found, seek a pair
                if (!conv) {
                    for (conv2 in converters) {

                        // If conv2 outputs current
                        tmp = conv2.split(" ");
                        if (tmp[1] === current) {

                            // If prev can be converted to accepted input
                            conv = converters[prev + " " + tmp[0]] ||
                                converters["* " + tmp[0]];
                            if (conv) {
                                // Condense equivalence converters
                                if (conv === true) {
                                    conv = converters[conv2];

                                    // Otherwise, insert the intermediate dataType
                                } else if (converters[conv2] !== true) {
                                    current = tmp[0];
                                    dataTypes.unshift(tmp[1]);
                                }
                                break;
                            }
                        }
                    }
                }

                // Apply converter (if not an equivalence)
                if (conv !== true) {

                    // Unless errors are allowed to bubble, catch and return them
                    if (conv && s["throws"]) {
                        response = conv(response);
                    } else {
                        try {
                            response = conv(response);
                        } catch (e) {
                            return {
                                state: "parsererror",
                                error: conv ? e : "No conversion from " + prev + " to " + current
                            };
                        }
                    }
                }
            }
        }
    }

    return {
        state: "success",
        data: response
    };
}


// Install script dataType
// Ajax请求设置默认的值
jQuery.ajaxSetup({
    /**
     * 内容类型发送请求头（Content-Type），用于通知服务器该请求需要接收何种类型的返回结果。
     * 如果accepts设置需要修改，推荐在$.ajaxSetup() 方法中设置一次。
     * @type {Object}
     */
    accepts: {
        script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
    },
    contents: {
        script: /(?:java|ecma)script/
    },
    converters: {
        "text script": function(text) {
            jQuery.globalEval(text);
            return text;
        }
    }
});

// Handle cache's special case and crossDomain
jQuery.ajaxPrefilter("script", function(s) {
    if (s.cache === undefined) {
        s.cache = false;
    }
    if (s.crossDomain) {
        s.type = "GET";
    }
});

// Bind script tag hack transport
jQuery.ajaxTransport("script", function(s) {
    // This transport only deals with cross domain requests
    if (s.crossDomain) {
        var script, callback;
        return {
            send: function(_, complete) {
                script = jQuery("<script>").prop({
                    async: true,
                    charset: s.scriptCharset,
                    src: s.url
                }).on(
                    "load error",
                    callback = function(evt) {
                        script.remove();
                        callback = null;
                        if (evt) {
                            complete(evt.type === "error" ? 404 : 200, evt.type);
                        }
                    }
                );
                document.head.appendChild(script[0]);
            },
            abort: function() {
                if (callback) {
                    callback();
                }
            }
        };
    }
});


var oldCallbacks = [],
    rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup({
    jsonp: "callback",
    jsonpCallback: function() {
        var callback = oldCallbacks.pop() || (jQuery.expando + "_" + (ajax_nonce++));
        this[callback] = true;
        return callback;
    }
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter("json jsonp", function(s, originalSettings, jqXHR) {

    var callbackName, overwritten, responseContainer,
        jsonProp = s.jsonp !== false && (rjsonp.test(s.url) ?
            "url" :
            typeof s.data === "string" && !(s.contentType || "").indexOf("application/x-www-form-urlencoded") && rjsonp.test(s.data) && "data"
        );

    // Handle iff the expected data type is "jsonp" or we have a parameter to set
    if (jsonProp || s.dataTypes[0] === "jsonp") {

        // Get callback name, remembering preexisting value associated with it
        callbackName = s.jsonpCallback = jQuery.isFunction(s.jsonpCallback) ?
            s.jsonpCallback() :
            s.jsonpCallback;

        // Insert callback into url or form data
        if (jsonProp) {
            s[jsonProp] = s[jsonProp].replace(rjsonp, "$1" + callbackName);
        } else if (s.jsonp !== false) {
            s.url += (ajax_rquery.test(s.url) ? "&" : "?") + s.jsonp + "=" + callbackName;
        }

        // Use data converter to retrieve json after script execution
        s.converters["script json"] = function() {
            if (!responseContainer) {
                jQuery.error(callbackName + " was not called");
            }
            return responseContainer[0];
        };

        // force json dataType
        s.dataTypes[0] = "json";

        // Install callback
        overwritten = window[callbackName];
        window[callbackName] = function() {
            responseContainer = arguments;
        };

        // Clean-up function (fires after converters)
        jqXHR.always(function() {
            // Restore preexisting value
            window[callbackName] = overwritten;

            // Save back as free
            if (s[callbackName]) {
                // make sure that re-using the options doesn't screw things around
                s.jsonpCallback = originalSettings.jsonpCallback;

                // save the callback name for future use
                oldCallbacks.push(callbackName);
            }

            // Call if it was a function and we have a response
            if (responseContainer && jQuery.isFunction(overwritten)) {
                overwritten(responseContainer[0]);
            }

            responseContainer = overwritten = undefined;
        });

        // Delegate to script
        return "script";
    }
});

jQuery.ajaxSettings.xhr = function() {
    try {
        return new XMLHttpRequest();
    } catch (e) {}
};

var xhrSupported = jQuery.ajaxSettings.xhr(),
    xhrSuccessStatus = {
        // file protocol always yields status code 0, assume 200
        0: 200,
        // Support: IE9
        // #1450: sometimes IE returns 1223 when it should be 204
        1223: 204
    },
    // Support: IE9
    // We need to keep track of outbound xhr and abort them manually
    // because IE is not smart enough to do it all by itself
    xhrId = 0,
    xhrCallbacks = {};

if (window.ActiveXObject) {
    jQuery(window).on("unload", function() {
        for (var key in xhrCallbacks) {
            xhrCallbacks[key]();
        }
        xhrCallbacks = undefined;
    });
}

jQuery.support.cors = !! xhrSupported && ("withCredentials" in xhrSupported);
jQuery.support.ajax = xhrSupported = !! xhrSupported;


jQuery.ajaxTransport(function(options) {
    var callback;
    // Cross domain only allowed if supported through XMLHttpRequest
    // 不进行跨域请求或者只有支持XMLHttpRequest跨域请求的才符合条件
    if (jQuery.support.cors || xhrSupported && !options.crossDomain) {
        return {
            send: function(headers, complete) {
                var i, id,
                    xhr = options.xhr();
                xhr.open(options.type, options.url, options.async, options.username, options.password);

                // Apply custom fields if provided
                // 一对“文件名-文件值”组成的映射，用于设定原生的 XHR对象。
                // 例如，如果需要的话，在进行跨域请求时，你可以用它来设置withCredentials为true。
                if (options.xhrFields) {
                    for (i in options.xhrFields) {
                        xhr[i] = options.xhrFields[i];
                    }
                }
                // Override mime type if needed
                if (options.mimeType && xhr.overrideMimeType) {
                    xhr.overrideMimeType(options.mimeType);
                }
                // X-Requested-With header
                // For cross-domain requests, seeing as conditions for a preflight are
                // akin to a jigsaw puzzle, we simply never set it to be sure.
                // (it can always be set on a per-request basis or even using ajaxSetup)
                // For same-domain requests, won't change header if already provided.
                if (!options.crossDomain && !headers["X-Requested-With"]) {
                    headers["X-Requested-With"] = "XMLHttpRequest";
                }
                // Set headers
                for (i in headers) {
                    xhr.setRequestHeader(i, headers[i]);
                }
                // Callback
                callback = function(type) {
                    return function() {
                        if (callback) {
                            delete xhrCallbacks[id];
                            callback = xhr.onload = xhr.onerror = null;
                            if (type === "abort") {
                                xhr.abort();
                            } else if (type === "error") {
                                complete(
                                    // file protocol always yields status 0, assume 404
                                    xhr.status || 404,
                                    xhr.statusText
                                );
                            } else {
                                complete(
                                    xhrSuccessStatus[xhr.status] || xhr.status,
                                    xhr.statusText,
                                    // Support: IE9
                                    // #11426: When requesting binary data, IE9 will throw an exception
                                    // on any attempt to access responseText
                                    typeof xhr.responseText === "string" ? {
                                        text: xhr.responseText
                                    } : undefined,
                                    xhr.getAllResponseHeaders()
                                );
                            }
                        }
                    };
                };
                // Listen to events
                xhr.onload = callback();
                xhr.onerror = callback("error");
                // Create the abort callback
                callback = xhrCallbacks[(id = xhrId++)] = callback("abort");
                // Do send the request
                // This may raise an exception which is actually
                // handled in jQuery.ajax (so no try/catch here)
                xhr.send(options.hasContent && options.data || null);
            },
            abort: function() {
                if (callback) {
                    callback();
                }
            }
        };
    }
});


console.log(prefilters, transports)