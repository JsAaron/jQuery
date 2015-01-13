/*!
 * Sizzle CSS Selector Engine v@VERSION
 * http://sizzlejs.com/
 *
 * Copyright 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: @DATE
 */


(function(window) {


	var i,
		support,
		cachedruns, //正在匹配第几个元素
		Expr, //Sizzle.selectors的快捷方式
		getText, //获取文本函数
		isXML, //是否为xml
		compile, //编译函数
		outermostContext,
		sortInput,
		// Local document vars
		setDocument,
		document, //这里只是document是个普通的变量，需要setDocument函数赋值处理过的真正的document
		docElem,
		documentIsHTML,
		rbuggyQSA, //支持的querySelectorAll选择器正则（rbuggyQSA = new RegExp( rbuggyQSA.join("|") );）
		rbuggyMatches, //支持matchesSelector正则（rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );）
		matches, //matchesSelector函数
		contains,

		// Instance-specific data
		expando = "sizzle" + -(new Date()),
		preferredDoc = window.document,
		dirruns = 0,
		done = 0,
		classCache = createCache(),
		//词法分析阶段需要的缓存器
		tokenCache = createCache(),
		compilerCache = createCache(),
		hasDuplicate = false,
		sortOrder = function(a, b) {
			if (a === b) {
				hasDuplicate = true;
				return 0;
			}
			return 0;
		},

		// General-purpose constants
		strundefined = typeof undefined,
		MAX_NEGATIVE = 1 << 31,

		// Instance methods
		hasOwn = ({}).hasOwnProperty,
		arr = [],
		pop = arr.pop,
		push_native = arr.push,
		push = arr.push,
		slice = arr.slice,
		// Use a stripped-down indexOf if we can't use a native one
		indexOf = arr.indexOf || function(elem) {
			var i = 0,
				len = this.length;
			for (; i < len; i++) {
				if (this[i] === elem) {
					return i;
				}
			}
			return -1;
		},

		booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

		// Regular expressions

		// 空白的正则 Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
		whitespace = "[\\x20\\t\\r\\n\\f]",

		// 类选择器与标签选择器的正则 http://www.w3.org/TR/css3-syntax/#characters
		// 
		// 	/^#((?:\\.|[\w-] | [^\x00-\xa0] ) +)/
		// 
		characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

		//ID选择器与标签选择器的正则，HTML5将ID的规则放宽，允许ID可以是纯数字

		// Loosely modeled on CSS identifier characters
		// An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
		// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
		identifier = characterEncoding.replace("w", "w#"),

		// Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
		attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
			"*(?:([*^$|!~]?=)" + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

		// Prefer arguments quoted,
		//   then not containing pseudos/brackets,
		//   then attribute selectors/non-parenthetical expressions,
		//   then anything else
		// These preferences are here to reduce the number of selectors
		//   needing tokenize in the PSEUDO preFilter
		pseudos = ":(" + characterEncoding + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + attributes.replace(3, 8) + ")*)|.*)\\)|)",

		// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
		rtrim = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g"),

		//并联选择器的正则
		//  /^[\x20\t\r\n\f]*,[\x20\t\r\n\f]*/
		rcomma = new RegExp("^" + whitespace + "*," + whitespace + "*"),

		rcombinators = new RegExp("^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*"),

		rsibling = new RegExp(whitespace + "*[+~]"),
		rattributeQuotes = new RegExp("=" + whitespace + "*([^\\]'\"]*)" + whitespace + "*\\]", "g"),

		rpseudo = new RegExp(pseudos),
		ridentifier = new RegExp("^" + identifier + "$"),

		matchExpr = {
			"ID": new RegExp("^#(" + characterEncoding + ")"),
			"CLASS": new RegExp("^\\.(" + characterEncoding + ")"),
			"TAG": new RegExp("^(" + characterEncoding.replace("w", "w*") + ")"),
			"ATTR": new RegExp("^" + attributes),
			"PSEUDO": new RegExp("^" + pseudos),
			"CHILD": new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
				"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
				"*(\\d+)|))" + whitespace + "*\\)|)", "i"),
			"bool": new RegExp("^(?:" + booleans + ")$", "i"),
			// For use in libraries implementing .is()
			// We use this for POS matching in `select`
			"needsContext": new RegExp("^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
				whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i")
		},

		//原生函数正则
		rnative = /^[^{]+\{\s*\[native \w/,

		// Easily-parseable/retrievable ID or TAG or CLASS selectors
		rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

		rinputs = /^(?:input|select|textarea|button)$/i,
		rheader = /^h\d$/i,

		rescape = /'|\\/g,

		// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
		//css转义，配合funescape使用 如：string.replace(runescape, funescape);
		runescape = new RegExp("\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig"),
		funescape = function(_, escaped, escapedWhitespace) {
			var high = "0x" + escaped - 0x10000;
			// NaN means non-codepoint
			// Support: Firefox
			// Workaround erroneous numeric interpretation of +"0x"
			return high !== high || escapedWhitespace ?
				escaped :
			// BMP codepoint
			high < 0 ?
				String.fromCharCode(high + 0x10000) :
			// Supplemental Plane codepoint (surrogate pair)
			String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00);
		};
	console.log(rcomma)
	// Optimize for push.apply( _, NodeList )
	try {
		push.apply(
			(arr = slice.call(preferredDoc.childNodes)),
			preferredDoc.childNodes
		);
		// Support: Android<4.0
		// Detect silently failing push.apply
		arr[preferredDoc.childNodes.length].nodeType;
	} catch (e) {
		push = {
			apply: arr.length ?

			// Leverage slice if possible

			function(target, els) {
				push_native.apply(target, slice.call(els));
			} :

			// Support: IE<9
			// Otherwise append directly

			function(target, els) {
				var j = target.length,
					i = 0;
				// Can't trust NodeList.length
				while ((target[j++] = els[i++])) {}
				target.length = j - 1;
			}
		};
	}
	/**
 * [Sizzle description]
   selector css选择器, context上下文，results结果集，seed筛选集
	前面已经说到CSS选择器解析时是按照从右到左的顺序分析，
	因此第一步是先取出最右的规则，
	如果说我们能够通过最右的规则先确定一个基本符合条件的集合那效率肯定是最好的。
	如果确定不了，那就只能把整个DOM树节点拿出来作为初始集合了，
	在Sizzle里边，这个集合命名为seed。Sizzle里边搜索开始的入口是select函数。
 */

	function Sizzle(selector, context, results, seed) {

		var match, elem, m, nodeType,
			// QSA vars
			i, groups, old, nid, newContext, newSelector;

		if ((context ? context.ownerDocument || context : preferredDoc) !== document) {
			setDocument(context);
		}

		context = context || document;
		results = results || [];

		if (!selector || typeof selector !== "string") {
			return results;
		}

		if ((nodeType = context.nodeType) !== 1 && nodeType !== 9) {
			return [];
		}

		//如果是单条规则的选择器，能通过直接原生接口：
		//getElementById|getElementsByTagName|getElementsByClassName,得到的，那就直接调原生接口
		//如果是多条规则的情况，先看看浏览器有没有原生的querySelectorAll接口
		/**
	if ( documentIsHTML && !seed ) {

		// Shortcuts
		if ( (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( (m = match[1]) ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( m );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === m ) {
							results.push( elem );
							return results;
						}
					} else {
						return results;
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
						contains( context, elem ) && elem.id === m ) {
						results.push( elem );
						return results;
					}
				}

			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				push.apply( results, context.getElementsByTagName( selector ) );
				return results;

			// Speed-up: Sizzle(".CLASS")
			} else if ( (m = match[3]) && support.getElementsByClassName && context.getElementsByClassName ) {
				push.apply( results, context.getElementsByClassName( m ) );
				return results;
			}
		}

		// QSA path
		if ( support.qsa && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
			nid = old = expando;
			newContext = context;
			newSelector = nodeType === 9 && selector;

			// qSA works strangely on Element-rooted queries
			// We can work around this by specifying an extra ID on the root
			// and working up from there (Thanks to Andrew Dupont for the technique)
			// IE 8 doesn't work on object elements
			if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
				groups = tokenize( selector );

				if ( (old = context.getAttribute("id")) ) {
					nid = old.replace( rescape, "\\$&" );
				} else {
					context.setAttribute( "id", nid );
				}
				nid = "[id='" + nid + "'] ";

				i = groups.length;
				while ( i-- ) {
					groups[i] = nid + toSelector( groups[i] );
				}
				newContext = rsibling.test( selector ) && context.parentNode || context;
				newSelector = groups.join(",");
			}

			if ( newSelector ) {
				try {
					push.apply( results,
						newContext.querySelectorAll( newSelector )
					);
					return results;
				} catch(qsaError) {
				} finally {
					if ( !old ) {
						context.removeAttribute("id");
					}
				}
			}
		}
	}
	**/

		// All others
		//如果是低级浏览器，那没办法了，只能自己处理了。
		return select(selector.replace(rtrim, "$1"), context, results, seed);
	}

	/**
	 * Create key-value caches of limited size
	 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
	 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
	 *	deleting the oldest entry
	 */

	function createCache() {
		var keys = [];

		function cache(key, value) {
			// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
			// 为了避免缓存太多，导致内存使用过大，所以这里可以设置cache长度。默认是
			// cacheLength: 50,
			if (keys.push(key += " ") > Expr.cacheLength) {
				// Only keep the most recent entries
				// 超过缓存，那就把缓存的第一个删掉
				delete cache[keys.shift()];
			}
			return (cache[key] = value);
		}
		return cache;
	}

	/**
	 * Mark a function for special use by Sizzle
	 * @param {Function} fn The function to mark
	 */

	function markFunction(fn) {
		fn[expando] = true;
		return fn;
	}

	/**
	 * Support testing using an element
	 * 用于做各种特征检测，比如是否支持某个API，API支持是否完美
	 * @param {Function} fn Passed the created div and expects a boolean result
	 */

	function assert(fn) {
		var div = document.createElement("div");

		try {
			/**
		 * !!一般用来将后面的表达式强制转换为布尔类型的数据（boolean），也就是只能是true或者false;
		 *  var o={flag:true};
			var test=!!o.flag;//等效于var test=o.flag||false;
			由于对null与undefined用!操作符时都会产生true的结果，
			所以用两个感叹号的作用就在于，
			如果明确设置了o中flag的值（非null/undefined/0""/等值），
			自然test就会取跟o.flag一样的值；
			如果没有设置，test就会默认为false，而不是null或undefined。
			alert(test);
		 */
			return !!fn(div);
		} catch (e) {
			return false;
		} finally {
			// Remove from its parent by default
			if (div.parentNode) {
				div.parentNode.removeChild(div);
			}
			// release memory in IE
			div = null;
		}
	}

	/**
	 * Adds the same handler for all of the specified attrs
	 * @param {String} attrs Pipe-separated list of attributes
	 * @param {Function} handler The method that will be applied
	 */

	function addHandle(attrs, handler) {
		var arr = attrs.split("|"),
			i = attrs.length;

		while (i--) {
			Expr.attrHandle[arr[i]] = handler;
		}
	}

	/**
	 * Checks document order of two siblings
	 * @param {Element} a
	 * @param {Element} b
	 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
	 */

	function siblingCheck(a, b) {
		var cur = b && a,
			diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
				(~b.sourceIndex || MAX_NEGATIVE) -
				(~a.sourceIndex || MAX_NEGATIVE);

		// Use IE sourceIndex if available on both nodes
		if (diff) {
			return diff;
		}

		// Check if b follows a
		if (cur) {
			while ((cur = cur.nextSibling)) {
				if (cur === b) {
					return -1;
				}
			}
		}

		return a ? 1 : -1;
	}

	/**
	 * Returns a function to use in pseudos for input types
	 * @param {String} type
	 */

	function createInputPseudo(type) {
		return function(elem) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === type;
		};
	}

	/**
	 * Returns a function to use in pseudos for buttons
	 * @param {String} type
	 */

	function createButtonPseudo(type) {
		return function(elem) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && elem.type === type;
		};
	}

	/**
	 * Returns a function to use in pseudos for positionals
	 * @param {Function} fn
	 */

	function createPositionalPseudo(fn) {
		return markFunction(function(argument) {
			argument = +argument;
			return markFunction(function(seed, matches) {
				var j,
					matchIndexes = fn([], seed.length, argument),
					i = matchIndexes.length;

				// Match elements found at the specified indexes
				while (i--) {
					if (seed[(j = matchIndexes[i])]) {
						seed[j] = !(matches[j] = seed[j]);
					}
				}
			});
		});
	}

	/**
	 * Detect xml
	 * 检测是否为xml
	 * @param {Element|Object} elem An element or a document
	 */
	isXML = Sizzle.isXML = function(elem) {
		// documentElement is verified for cases where it doesn't yet exist
		// (such as loading iframes in IE - #4833)
		var documentElement = elem && (elem.ownerDocument || elem).documentElement;
		return documentElement ? documentElement.nodeName !== "HTML" : false;
	};

	// Expose support vars for convenience
	support = Sizzle.support = {};

	/**
	 * 根据当前的document设置document相关的变量（只设置一次）
	 * Sets document-related variables once based on the current document
	 * @param {Element|Object} [doc] An element or document object to use to set the document
	 * @returns {Object} Returns the current document
	 * HTML页面中 文档元素始终是<html>元素
	 * XML 没有预定义的元素,任何元素都可能是文档元素
	 */
	setDocument = Sizzle.setDocument = function(node) {
		var doc = node ? node.ownerDocument || node : preferredDoc,
			parent = doc.defaultView;

		// If no document and documentElement is available, return
		//如果document已经设置了返回（这里document是个变量初始值是undefined）
		//不是文档对象返回
		//文档对象没有返回根节点时返回
		if (doc === document || doc.nodeType !== 9 || !doc.documentElement) {
			return document;
		}

		// Set our document
		// 给document变量设置真正的文档
		document = doc;
		docElem = doc.documentElement;

		// Support tests
		// 检测是否为HTML
		documentIsHTML = !isXML(doc);

		// Support: IE>8
		// If iframe document is assigned to "document" variable and if iframe has been reloaded,
		// IE will throw "permission denied" error when accessing "document" variable, see jQuery #13936
		// IE6-8 do not support the defaultView property so parent will be undefined
		if (parent && parent.attachEvent && parent !== parent.top) {
			parent.attachEvent("onbeforeunload", function() {
				setDocument();
			});
		}

		/* Attributes
	---------------------------------------------------------------------- */

		// Support: IE<8
		// Verify that getAttribute really returns attributes and not properties (excepting IE8 booleans)
		// 验证getAttribute真的返回属性而不是属性(除了IE8布尔值)
		support.attributes = assert(function(div) {
			div.className = "i";
			return !div.getAttribute("className");
		});

		/* getElement(s)By*
	---------------------------------------------------------------------- */

		// Check if getElementsByTagName("*") returns only elements
		//检查getElementsByTagName是否会返回注释节点，IE6-8会混杂注释节点
		support.getElementsByTagName = assert(function(div) {
			div.appendChild(doc.createComment(""));
			return !div.getElementsByTagName("*").length;
		});

		// Check if getElementsByClassName can be trusted
		//检查getElementsByClassName是否100%支持
		support.getElementsByClassName = assert(function(div) {
			div.innerHTML = "<div class='a'></div><div class='a i'></div>";

			// Support: Safari<4
			// Catch class over-caching
			div.firstChild.className = "i";
			// Support: Opera<10
			// Catch gEBCN failure to find non-leading classes
			return div.getElementsByClassName("i").length === 2;
		});

		// Support: IE<10
		// Check if getElementById returns elements by name
		// The broken getElementById methods don't pick up programatically-set names,
		// so use a roundabout getElementsByName test
		support.getById = assert(function(div) {
			docElem.appendChild(div).id = expando;
			return !doc.getElementsByName || !doc.getElementsByName(expando).length;
		});

		// ID find and filter
		if (support.getById) {
			Expr.find["ID"] = function(id, context) {
				if (typeof context.getElementById !== strundefined && documentIsHTML) {
					var m = context.getElementById(id);
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					return m && m.parentNode ? [m] : [];
				}
			};
			Expr.filter["ID"] = function(id) {
				var attrId = id.replace(runescape, funescape);
				//生成一个匹配器
				return function(elem) {
					//去除节点的id，判断跟目标是否一致
					return elem.getAttribute("id") === attrId;
				};
			};
		} else {
			// Support: IE6/7
			// getElementById is not reliable as a find shortcut
			delete Expr.find["ID"];

			Expr.filter["ID"] = function(id) {
				var attrId = id.replace(runescape, funescape);
				return function(elem) {
					var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
					return node && node.value === attrId;
				};
			};
		}

		// Tag
		// 根据标签查找节点
		Expr.find["TAG"] = support.getElementsByTagName ?
			function(tag, context) {
				if (typeof context.getElementsByTagName !== strundefined) {
					return context.getElementsByTagName(tag);
				}
		} :
			function(tag, context) {
				var elem,
					tmp = [],
					i = 0,
					results = context.getElementsByTagName(tag);

				// Filter out possible comments
				if (tag === "*") {
					while ((elem = results[i++])) {
						if (elem.nodeType === 1) {
							tmp.push(elem);
						}
					}

					return tmp;
				}
				return results;
		};

		// Class
		Expr.find["CLASS"] = support.getElementsByClassName && function(className, context) {
			if (typeof context.getElementsByClassName !== strundefined && documentIsHTML) {
				return context.getElementsByClassName(className);
			}
		};

		/* QSA/matchesSelector
	---------------------------------------------------------------------- */

		// QSA and matchesSelector support

		// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
		rbuggyMatches = []; //支持的matchesSelector放到数组中

		// qSa(:focus) reports false when true (Chrome 21)
		// We allow this because of a bug in IE8/9 that throws an error
		// whenever `document.activeElement` is accessed on an iframe
		// So, we allow :focus to pass through QSA all the time to avoid the IE error
		// See http://bugs.jquery.com/ticket/13378
		rbuggyQSA = []; //支持的querySelectorAll放到数组中

		if ((support.qsa = rnative.test(doc.querySelectorAll))) {
			// Build QSA regex
			// Regex strategy adopted from Diego Perini
			assert(function(div) {
				// Select is set to empty string on purpose
				// This is to test IE's treatment of not explicitly
				// setting a boolean content attribute,
				// since its presence should be enough
				// http://bugs.jquery.com/ticket/12359
				div.innerHTML = "<select><option selected=''></option></select>";

				// Support: IE8
				// Boolean attributes and "value" are not treated correctly
				if (!div.querySelectorAll("[selected]").length) {
					rbuggyQSA.push("\\[" + whitespace + "*(?:value|" + booleans + ")");
				}

				// Webkit/Opera - :checked should return selected option elements
				// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
				// IE8 throws error here and will not see later tests
				if (!div.querySelectorAll(":checked").length) {
					rbuggyQSA.push(":checked");
				}
			});

			assert(function(div) {

				// Support: Opera 10-12/IE8
				// ^= $= *= and empty values
				// Should not select anything
				// Support: Windows 8 Native Apps
				// The type attribute is restricted during .innerHTML assignment
				var input = doc.createElement("input");
				input.setAttribute("type", "hidden");
				div.appendChild(input).setAttribute("t", "");

				if (div.querySelectorAll("[t^='']").length) {
					rbuggyQSA.push("[*^$]=" + whitespace + "*(?:''|\"\")");
				}

				// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
				// IE8 throws error here and will not see later tests
				if (!div.querySelectorAll(":enabled").length) {
					rbuggyQSA.push(":enabled", ":disabled");
				}

				// Opera 10-11 does not throw on post-comma invalid pseudos
				div.querySelectorAll("*,:x");
				rbuggyQSA.push(",.*:");
			});
		}

		if ((support.matchesSelector = rnative.test((matches = docElem.webkitMatchesSelector ||
			docElem.mozMatchesSelector ||
			docElem.oMatchesSelector ||
			docElem.msMatchesSelector)))) {

			assert(function(div) {
				// Check to see if it's possible to do matchesSelector
				// on a disconnected node (IE 9)
				support.disconnectedMatch = matches.call(div, "div");

				// This should fail with an exception
				// Gecko does not error, returns false instead
				matches.call(div, "[s!='']:x");
				rbuggyMatches.push("!=", pseudos);
			});
		}

		rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|"));
		rbuggyMatches = rbuggyMatches.length && new RegExp(rbuggyMatches.join("|"));

		/* Contains
	---------------------------------------------------------------------- */

		// Element contains another
		// Purposefully does not implement inclusive descendent
		// As in, an element does not contain itself
		contains = rnative.test(docElem.contains) || docElem.compareDocumentPosition ?
			function(a, b) {
				var adown = a.nodeType === 9 ? a.documentElement : a,
					bup = b && b.parentNode;
				return a === bup || !! (bup && bup.nodeType === 1 && (
					adown.contains ?
					adown.contains(bup) :
					a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16
				));
		} :
			function(a, b) {
				if (b) {
					while ((b = b.parentNode)) {
						if (b === a) {
							return true;
						}
					}
				}
				return false;
		};

		/* Sorting
	---------------------------------------------------------------------- */

		// Document order sorting
		sortOrder = docElem.compareDocumentPosition ?
			function(a, b) {

				// Flag for duplicate removal
				if (a === b) {
					hasDuplicate = true;
					return 0;
				}

				var compare = b.compareDocumentPosition && a.compareDocumentPosition && a.compareDocumentPosition(b);

				if (compare) {
					// Disconnected nodes
					if (compare & 1 ||
						(!support.sortDetached && b.compareDocumentPosition(a) === compare)) {

						// Choose the first element that is related to our preferred document
						if (a === doc || contains(preferredDoc, a)) {
							return -1;
						}
						if (b === doc || contains(preferredDoc, b)) {
							return 1;
						}

						// Maintain original order
						return sortInput ?
							(indexOf.call(sortInput, a) - indexOf.call(sortInput, b)) :
							0;
					}

					return compare & 4 ? -1 : 1;
				}

				// Not directly comparable, sort on existence of method
				return a.compareDocumentPosition ? -1 : 1;
		} :
			function(a, b) {
				var cur,
					i = 0,
					aup = a.parentNode,
					bup = b.parentNode,
					ap = [a],
					bp = [b];

				// Exit early if the nodes are identical
				if (a === b) {
					hasDuplicate = true;
					return 0;

					// Parentless nodes are either documents or disconnected
				} else if (!aup || !bup) {
					return a === doc ? -1 :
						b === doc ? 1 :
						aup ? -1 :
						bup ? 1 :
						sortInput ?
						(indexOf.call(sortInput, a) - indexOf.call(sortInput, b)) :
						0;

					// If the nodes are siblings, we can do a quick check
				} else if (aup === bup) {
					return siblingCheck(a, b);
				}

				// Otherwise we need full lists of their ancestors for comparison
				cur = a;
				while ((cur = cur.parentNode)) {
					ap.unshift(cur);
				}
				cur = b;
				while ((cur = cur.parentNode)) {
					bp.unshift(cur);
				}

				// Walk down the tree looking for a discrepancy
				while (ap[i] === bp[i]) {
					i++;
				}

				return i ?
				// Do a sibling check if the nodes have a common ancestor
				siblingCheck(ap[i], bp[i]) :

				// Otherwise nodes in our document sort first
				ap[i] === preferredDoc ? -1 :
					bp[i] === preferredDoc ? 1 :
					0;
		};

		return doc;
	};

	Sizzle.matches = function(expr, elements) {
		return Sizzle(expr, null, null, elements);
	};

	Sizzle.matchesSelector = function(elem, expr) {
		// Set document vars if needed
		if ((elem.ownerDocument || elem) !== document) {
			setDocument(elem);
		}

		// Make sure that attribute selectors are quoted
		expr = expr.replace(rattributeQuotes, "='$1']");

		if (support.matchesSelector && documentIsHTML &&
			(!rbuggyMatches || !rbuggyMatches.test(expr)) &&
			(!rbuggyQSA || !rbuggyQSA.test(expr))) {

			try {
				var ret = matches.call(elem, expr);

				// IE 9's matchesSelector returns false on disconnected nodes
				if (ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11) {
					return ret;
				}
			} catch (e) {}
		}

		return Sizzle(expr, document, null, [elem]).length > 0;
	};

	Sizzle.contains = function(context, elem) {
		// Set document vars if needed
		if ((context.ownerDocument || context) !== document) {
			setDocument(context);
		}
		return contains(context, elem);
	};

	Sizzle.attr = function(elem, name) {
		// Set document vars if needed
		if ((elem.ownerDocument || elem) !== document) {
			setDocument(elem);
		}

		var fn = Expr.attrHandle[name.toLowerCase()],
			// Don't get fooled by Object.prototype properties (jQuery #13807)
			val = fn && hasOwn.call(Expr.attrHandle, name.toLowerCase()) ?
				fn(elem, name, !documentIsHTML) :
				undefined;

		return val === undefined ?
			support.attributes || !documentIsHTML ?
			elem.getAttribute(name) :
			(val = elem.getAttributeNode(name)) && val.specified ?
			val.value :
			null :
			val;
	};

	Sizzle.error = function(msg) {
		throw new Error("Syntax error, unrecognized expression: " + msg);
	};

	/**
	 * Document sorting and removing duplicates
	 * @param {ArrayLike} results
	 */
	Sizzle.uniqueSort = function(results) {
		var elem,
			duplicates = [],
			j = 0,
			i = 0;

		// Unless we *know* we can detect duplicates, assume their presence
		hasDuplicate = !support.detectDuplicates;
		sortInput = !support.sortStable && results.slice(0);
		results.sort(sortOrder);

		if (hasDuplicate) {
			while ((elem = results[i++])) {
				if (elem === results[i]) {
					j = duplicates.push(i);
				}
			}
			while (j--) {
				results.splice(duplicates[j], 1);
			}
		}

		return results;
	};

	/**
	 * Utility function for retrieving the text value of an array of DOM nodes
	 * @param {Array|Element} elem
	 */
	getText = Sizzle.getText = function(elem) {
		var node,
			ret = "",
			i = 0,
			nodeType = elem.nodeType;

		if (!nodeType) {
			// If no nodeType, this is expected to be an array
			for (;
				(node = elem[i]); i++) {
				// Do not traverse comment nodes
				ret += getText(node);
			}
		} else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
			// Use textContent for elements
			// innerText usage removed for consistency of new lines (see #11153)
			if (typeof elem.textContent === "string") {
				return elem.textContent;
			} else {
				// Traverse its children
				for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
					ret += getText(elem);
				}
			}
		} else if (nodeType === 3 || nodeType === 4) {
			return elem.nodeValue;
		}
		// Do not include comment or processing instruction nodes

		return ret;
	};

	Expr = Sizzle.selectors = {

		// Can be adjusted by the user
		cacheLength: 50,

		createPseudo: markFunction,

		match: matchExpr,

		attrHandle: {},

		find: {},

		relative: {
			">": {
				dir: "parentNode",
				first: true
			},
			" ": {
				dir: "parentNode"
			},
			"+": {
				dir: "previousSibling",
				first: true
			},
			"~": {
				dir: "previousSibling"
			}
		},

        //预处理，有的选择器，比如属性选择器与伪类从选择器组分割出来，还要再细分
        //属性选择器要切成属性名，属性值，操作符；伪类要切为类型与传参；
        //子元素过滤伪类还要根据an+b的形式再划分
		preFilter: {
			"ATTR": function(match) {
				match[1] = match[1].replace(runescape, funescape);

				// Move the given value to match[3] whether quoted or unquoted
				match[3] = (match[4] || match[5] || "").replace(runescape, funescape);

				if (match[2] === "~=") {
					match[3] = " " + match[3] + " ";
				}

				return match.slice(0, 4);
			},

			"CHILD": function(match) {

                //将它的伪类名称与传参拆分为更细的单元,以数组形式返回
                //比如 ":nth-child(even)"变为
                //["nth","child","even", 2, 0, undefined, undefined, undefined]

				/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
				match[1] = match[1].toLowerCase();

				if (match[1].slice(0, 3) === "nth") {
					// nth-* requires argument
					if (!match[3]) {
						Sizzle.error(match[0]);
					}

					// numeric x and y parameters for Expr.filter.CHILD
					// remember that false/true cast respectively to 0/1
					match[4] = +(match[4] ? match[5] + (match[6] || 1) : 2 * (match[3] === "even" || match[3] === "odd"));
					match[5] = +((match[7] + match[8]) || match[3] === "odd");

					// other types prohibit arguments
				} else if (match[3]) {
					Sizzle.error(match[0]);
				}

				return match;
			},

			"PSEUDO": function(match) {
	            //将它的伪类名称与传参进行再处理
                //比如:contains伪类会去掉两边的引号,反义伪类括号部分会再次提取

				var excess,
					unquoted = !match[5] && match[2];

				if (matchExpr["CHILD"].test(match[0])) {
					return null;
				}

				// Accept quoted arguments as-is
				if (match[3] && match[4] !== undefined) {
					match[2] = match[4];

					// Strip excess characters from unquoted arguments
				} else if (unquoted && rpseudo.test(unquoted) &&
					// Get excess from tokenize (recursively)
					(excess = tokenize(unquoted, true)) &&
					// advance to the next closing parenthesis
					(excess = unquoted.indexOf(")", unquoted.length - excess) - unquoted.length)) {

					// excess is a negative index
					match[0] = match[0].slice(0, excess);
					match[2] = unquoted.slice(0, excess);
				}

				// Return only captures needed by the pseudo filter method (type and argument)
				return match.slice(0, 3);
			}
		},

		//过滤函数（它们基本上都是curry）
		filter: {

			"TAG": function(nodeNameSelector) {
				var nodeName = nodeNameSelector.replace(runescape, funescape).toLowerCase();
				return nodeNameSelector === "*" ?
					function() {
						return true;
				} :
					function(elem) {
						return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
			},

			"CLASS": function(className) {
				var pattern = classCache[className + " "];

				return pattern ||
					(pattern = new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)")) &&
					classCache(className, function(elem) {
						return pattern.test(typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== strundefined && elem.getAttribute("class") || "");
					});
			},


			//属性元匹配器工厂
			//name ：属性名
			//operator ：操作符
			//check ： 要检查的值
			//例如选择器 [type="checkbox"]中，name="type" operator="=" check="checkbox"
			"ATTR": function(name, operator, check) {
				//返回一个元匹配器
				return function(elem) {
					//先取出节点对应的属性值
					var result = Sizzle.attr(elem, name);

					 //看看属性值有木有！
					if (result == null) {
						//如果操作符是不等号，返回真，因为当前属性为空 是不等于任何值的
						return operator === "!=";
					}
					//如果没有操作符，那就直接通过规则了
					if (!operator) {
						return true;
					}

					result += "";

					//如果是等号，判断目标值跟当前属性值相等是否为真
					return operator === "=" ? result === check :
					   //如果是不等号，判断目标值跟当前属性值不相等是否为真
						operator === "!=" ? result !== check :
						//如果是起始相等，判断目标值是否在当前属性值的头部
						operator === "^=" ? check && result.indexOf(check) === 0 :
						//这样解释： lang*=en 匹配这样 <html lang="xxxxenxxx">的节点
						operator === "*=" ? check && result.indexOf(check) > -1 :
						//如果是末尾相等，判断目标值是否在当前属性值的末尾
						operator === "$=" ? check && result.slice(-check.length) === check :
						//这样解释： lang~=en 匹配这样 <html lang="zh_CN en">的节点
						operator === "~=" ? (" " + result + " ").indexOf(check) > -1 :
						//这样解释： lang=|en 匹配这样 <html lang="en-US">的节点
						operator === "|=" ? result === check || result.slice(0, check.length + 1) === check + "-" :
						//其他情况的操作符号表示不匹配
						false;
				};
			},

			"CHILD": function(type, what, argument, first, last) {
				var simple = type.slice(0, 3) !== "nth",
					forward = type.slice(-4) !== "last",
					ofType = what === "of-type";

				return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)

				function(elem) {
					return !!elem.parentNode;
				} :

				function(elem, context, xml) {
					var cache, outerCache, node, diff, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType;

					if (parent) {

						// :(first|last|only)-(child|of-type)
						if (simple) {
							while (dir) {
								node = elem;
								while ((node = node[dir])) {
									if (ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) {
										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [forward ? parent.firstChild : parent.lastChild];

						// non-xml :nth-child(...) stores cache data on `parent`
						if (forward && useCache) {
							// Seek `elem` from a previously-cached index
							outerCache = parent[expando] || (parent[expando] = {});
							cache = outerCache[type] || [];
							nodeIndex = cache[0] === dirruns && cache[1];
							diff = cache[0] === dirruns && cache[2];
							node = nodeIndex && parent.childNodes[nodeIndex];

							while ((node = ++nodeIndex && node && node[dir] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop())) {

								// When found, cache indexes on `parent` and break
								if (node.nodeType === 1 && ++diff && node === elem) {
									outerCache[type] = [dirruns, nodeIndex, diff];
									break;
								}
							}

							// Use previously-cached element index if available
						} else if (useCache && (cache = (elem[expando] || (elem[expando] = {}))[type]) && cache[0] === dirruns) {
							diff = cache[1];

							// xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
						} else {
							// Use the same loop as above to seek `elem` from the start
							while ((node = ++nodeIndex && node && node[dir] ||
								(diff = nodeIndex = 0) || start.pop())) {

								if ((ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) && ++diff) {
									// Cache the index of each encountered element
									if (useCache) {
										(node[expando] || (node[expando] = {}))[type] = [dirruns, diff];
									}

									if (node === elem) {
										break;
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || (diff % first === 0 && diff / first >= 0);
					}
				};
			},

			"PSEUDO": function(pseudo, argument) {
				// pseudo-class names are case-insensitive
				// http://www.w3.org/TR/selectors/#pseudo-classes
				// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
				// Remember that setFilters inherits from pseudos
				var args,
					fn = Expr.pseudos[pseudo] || Expr.setFilters[pseudo.toLowerCase()] ||
						Sizzle.error("unsupported pseudo: " + pseudo);

				// The user may use createPseudo to indicate that
				// arguments are needed to create the filter function
				// just as Sizzle does
				if (fn[expando]) {
					return fn(argument);
				}

				// But maintain support for old signatures
				if (fn.length > 1) {
					args = [pseudo, pseudo, "", argument];
					return Expr.setFilters.hasOwnProperty(pseudo.toLowerCase()) ?
						markFunction(function(seed, matches) {
							var idx,
								matched = fn(seed, argument),
								i = matched.length;
							while (i--) {
								idx = indexOf.call(seed, matched[i]);
								seed[idx] = !(matches[idx] = matched[i]);
							}
						}) :
						function(elem) {
							return fn(elem, 0, args);
					};
				}

				return fn;
			}
		},

		pseudos: {
			// Potentially complex pseudos
			"not": markFunction(function(selector) {
				// Trim the selector passed to compile
				// to avoid treating leading and trailing
				// spaces as combinators
				var input = [],
					results = [],
					matcher = compile(selector.replace(rtrim, "$1"));

				return matcher[expando] ?
					markFunction(function(seed, matches, context, xml) {
						var elem,
							unmatched = matcher(seed, null, xml, []),
							i = seed.length;

						// Match elements unmatched by `matcher`
						while (i--) {
							if ((elem = unmatched[i])) {
								seed[i] = !(matches[i] = elem);
							}
						}
					}) :
					function(elem, context, xml) {
						input[0] = elem;
						matcher(input, null, xml, results);
						return !results.pop();
				};
			}),

			"has": markFunction(function(selector) {
				return function(elem) {
					return Sizzle(selector, elem).length > 0;
				};
			}),

			"contains": markFunction(function(text) {
				return function(elem) {
					return (elem.textContent || elem.innerText || getText(elem)).indexOf(text) > -1;
				};
			}),

			// "Whether an element is represented by a :lang() selector
			// is based solely on the element's language value
			// being equal to the identifier C,
			// or beginning with the identifier C immediately followed by "-".
			// The matching of C against the element's language value is performed case-insensitively.
			// The identifier C does not have to be a valid language name."
			// http://www.w3.org/TR/selectors/#lang-pseudo
			"lang": markFunction(function(lang) {
				// lang value must be a valid identifier
				if (!ridentifier.test(lang || "")) {
					Sizzle.error("unsupported lang: " + lang);
				}
				lang = lang.replace(runescape, funescape).toLowerCase();
				return function(elem) {
					var elemLang;
					do {
						if ((elemLang = documentIsHTML ?
							elem.lang :
							elem.getAttribute("xml:lang") || elem.getAttribute("lang"))) {

							elemLang = elemLang.toLowerCase();
							return elemLang === lang || elemLang.indexOf(lang + "-") === 0;
						}
					} while ((elem = elem.parentNode) && elem.nodeType === 1);
					return false;
				};
			}),

			// Miscellaneous
			"target": function(elem) {
				var hash = window.location && window.location.hash;
				return hash && hash.slice(1) === elem.id;
			},

			"root": function(elem) {
				return elem === docElem;
			},

			"focus": function(elem) {
				return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !! (elem.type || elem.href || ~elem.tabIndex);
			},

			// Boolean properties
			"enabled": function(elem) {
				return elem.disabled === false;
			},

			"disabled": function(elem) {
				return elem.disabled === true;
			},

			"checked": function(elem) {
				// In CSS3, :checked should return both checked and selected elements
				// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
				var nodeName = elem.nodeName.toLowerCase();
				return (nodeName === "input" && !! elem.checked) || (nodeName === "option" && !! elem.selected);
			},

			"selected": function(elem) {
				// Accessing this property makes selected-by-default
				// options in Safari work properly
				if (elem.parentNode) {
					elem.parentNode.selectedIndex;
				}

				return elem.selected === true;
			},

			// Contents
			"empty": function(elem) {
				// http://www.w3.org/TR/selectors/#empty-pseudo
				// :empty is only affected by element nodes and content nodes(including text(3), cdata(4)),
				//   not comment, processing instructions, or others
				// Thanks to Diego Perini for the nodeName shortcut
				//   Greater than "@" means alpha characters (specifically not starting with "#" or "?")
				for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
					if (elem.nodeName > "@" || elem.nodeType === 3 || elem.nodeType === 4) {
						return false;
					}
				}
				return true;
			},

			"parent": function(elem) {
				return !Expr.pseudos["empty"](elem);
			},

			// Element/input types
			"header": function(elem) {
				return rheader.test(elem.nodeName);
			},

			"input": function(elem) {
				return rinputs.test(elem.nodeName);
			},

			"button": function(elem) {
				var name = elem.nodeName.toLowerCase();
				return name === "input" && elem.type === "button" || name === "button";
			},

			"text": function(elem) {
				var attr;
				// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
				// use getAttribute instead to test this case
				return elem.nodeName.toLowerCase() === "input" &&
					elem.type === "text" &&
					((attr = elem.getAttribute("type")) == null || attr.toLowerCase() === elem.type);
			},

			// Position-in-collection
			"first": createPositionalPseudo(function() {
				return [0];
			}),

			"last": createPositionalPseudo(function(matchIndexes, length) {
				return [length - 1];
			}),

			"eq": createPositionalPseudo(function(matchIndexes, length, argument) {
				return [argument < 0 ? argument + length : argument];
			}),

			"even": createPositionalPseudo(function(matchIndexes, length) {
				var i = 0;
				for (; i < length; i += 2) {
					matchIndexes.push(i);
				}
				return matchIndexes;
			}),

			"odd": createPositionalPseudo(function(matchIndexes, length) {
				var i = 1;
				for (; i < length; i += 2) {
					matchIndexes.push(i);
				}
				return matchIndexes;
			}),

			"lt": createPositionalPseudo(function(matchIndexes, length, argument) {
				var i = argument < 0 ? argument + length : argument;
				for (; --i >= 0;) {
					matchIndexes.push(i);
				}
				return matchIndexes;
			}),

			"gt": createPositionalPseudo(function(matchIndexes, length, argument) {
				var i = argument < 0 ? argument + length : argument;
				for (; ++i < length;) {
					matchIndexes.push(i);
				}
				return matchIndexes;
			})
		}
	};

	Expr.pseudos["nth"] = Expr.pseudos["eq"];

	// Add button/input type pseudos
	for (i in {
		radio: true,
		checkbox: true,
		file: true,
		password: true,
		image: true
	}) {
		Expr.pseudos[i] = createInputPseudo(i);
	}
	for (i in {
		submit: true,
		reset: true
	}) {
		Expr.pseudos[i] = createButtonPseudo(i);
	}

	// Easy API for creating new setFilters

	function setFilters() {}
	setFilters.prototype = Expr.filters = Expr.pseudos;
	Expr.setFilters = new setFilters();


	//假设传入进来的选择器是：div > p + .aaron[type="checkbox"], #id:first-child
	//这里可以分为两个规则：div > p + .aaron[type="checkbox"] 以及 #id:first-child
	//返回的需要是一个Token序列
	//Sizzle的Token格式如下 ：{value:'匹配到的字符串', type:'对应的Token类型', matches:'正则匹配到的一个结构'}
	function tokenize(selector, parseOnly) {
		var matched, match, tokens, type,
			soFar, groups, preFilters,
			cached = tokenCache[selector + " "];
		//这里的soFar是表示目前还未分析的字符串剩余部分
		//groups表示目前已经匹配到的规则组，在这个例子里边，groups的长度最后是2，存放的是每个规则对应的Token序列

		//如果cache里边有，直接拿出来即可
		if (cached) {
			return parseOnly ? 0 : cached.slice(0);
		}

		//初始化
		soFar = selector;
		groups = []; //这是最后要返回的结果，一个二维数组

		//比如"title,div > :nth-child(even)"解析下面的符号流
		// [ [{value:"title",type:"TAG",matches:["title"]}],
		//   [{value:"div",type:["TAG",matches:["div"]},
		//    {value:">", type: ">"},
		//    {value:":nth-child(even)",type:"CHILD",matches:["nth",
		//     "child","even",2,0,undefined,undefined,undefined]}
		//   ]
		// ]
		//有多少个并联选择器，里面就有多少个数组，数组里面是拥有value与type的对象

		//这里的预处理器为了对匹配到的Token适当做一些调整
		//自行查看源码，其实就是正则匹配到的内容的一个预处理
		preFilters = Expr.preFilter;

		//递归检测字符串x
		//比如"div > p + .clr input[type="checkbox"]"
		while (soFar) {

			// Comma and first run
			// 以第一个逗号切割选择符,然后去掉前面的部分
			if (!matched || (match = rcomma.exec(soFar))) {
				if (match) {
					//如果匹配到逗号
					// Don't consume trailing commas as valid
					soFar = soFar.slice(match[0].length) || soFar;
				}
				//往规则组里边压入一个Token序列，目前Token序列还是空的
				groups.push(tokens = []);
			}

			matched = false;

			// Combinators
			//将刚才前面的部分以关系选择器再进行划分
			//先处理这几个特殊的Token ： >, +, 空格, ~
			//因为他们比较简单，并且是单字符的
			if ((match = rcombinators.exec(soFar))) {
				//获取到匹配的字符
				matched = match.shift();
				//放入Token序列中
				tokens.push({
					value: matched,
					// Cast descendant combinators to space
					type: match[0].replace(rtrim, " ")
				});
				//剩余还未分析的字符串需要减去这段已经分析过的
				soFar = soFar.slice(matched.length);
			}

			// Filters
			//这里开始分析这几种Token ： TAG, ID, CLASS, ATTR, CHILD, PSEUDO, NAME
			//将每个选择器组依次用ID,TAG,CLASS,ATTR,CHILD,PSEUDO这些正则进行匹配
			//Expr.filter里边对应地 就有这些key
			/**
	 *
	 *
	 *matchExpr 过滤正则
		ATTR: /^\[[\x20\t\r\n\f]*((?:\\.|[\w-]|[^\x00-\xa0])+)[\x20\t\r\n\f]*(?:([*^$|!~]?=)[\x20\t\r\n\f]*(?:(['"])((?:\\.|[^\\])*?)\3|((?:\\.|[\w#-]|[^\x00-\xa0])+)|)|)[\x20\t\r\n\f]*\]/
		CHILD: /^:(only|first|last|nth|nth-last)-(child|of-type)(?:\([\x20\t\r\n\f]*(even|odd|(([+-]|)(\d*)n|)[\x20\t\r\n\f]*(?:([+-]|)[\x20\t\r\n\f]*(\d+)|))[\x20\t\r\n\f]*\)|)/i
		CLASS: /^\.((?:\\.|[\w-]|[^\x00-\xa0])+)/
		ID: /^#((?:\\.|[\w-]|[^\x00-\xa0])+)/
		PSEUDO: /^:((?:\\.|[\w-]|[^\x00-\xa0])+)(?:\(((['"])((?:\\.|[^\\])*?)\3|((?:\\.|[^\\()[\]]|\[[\x20\t\r\n\f]*((?:\\.|[\w-]|[^\x00-\xa0])+)[\x20\t\r\n\f]*(?:([*^$|!~]?=)[\x20\t\r\n\f]*(?:(['"])((?:\\.|[^\\])*?)\8|((?:\\.|[\w#-]|[^\x00-\xa0])+)|)|)[\x20\t\r\n\f]*\])*)|.*)\)|)/
		TAG: /^((?:\\.|[\w*-]|[^\x00-\xa0])+)/
		bool: /^(?:checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped)$/i
		needsContext: /^[\x20\t\r\n\f]*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\([\x20\t\r\n\f]*((?:-\d)?\d*)[\x20\t\r\n\f]*\)|)(?=[^-]|$)/i
	 *
	 */
			//如果通过正则匹配到了Token格式：match = matchExpr[ type ].exec( soFar )
			//然后看看需不需要预处理：!preFilters[ type ]
			//如果需要 ，那么通过预处理器将匹配到的处理一下 ： match = preFilters[ type ]( match )

			for (type in Expr.filter) {

				if ((match = matchExpr[type].exec(soFar)) && (!preFilters[type] ||
					(match = preFilters[type](match)))) {
					matched = match.shift();
					//放入Token序列中
					tokens.push({
                        value  : matched,
                        type   : type,
                        matches: match
					});
					//剩余还未分析的字符串需要减去这段已经分析过的
					soFar = soFar.slice(matched.length);
				}
			}

			//如果到了这里都还没matched到，那么说明这个选择器在这里有错误
			//直接中断词法分析过程
			//这就是Sizzle对词法分析的异常处理
			if (!matched) {
				break;
			}
		}

		// Return the length of the invalid excess
		// if we're just parsing
		// Otherwise, throw an error or return tokens
		//放到tokenCache函数里进行缓存
		//如果只需要这个接口检查选择器的合法性，直接就返回soFar的剩余长度，倘若是大于零，说明选择器不合法
		//其余情况，如果soFar长度大于零，抛出异常；否则把groups记录在cache里边并返回，
		return parseOnly ?
			soFar.length :
			soFar ?
			Sizzle.error(selector) :
		// Cache the tokens
		tokenCache(selector, groups).slice(0);
	}

	function toSelector(tokens) {
		var i = 0,
			len = tokens.length,
			selector = "";
		for (; i < len; i++) {
			selector += tokens[i].value;
		}
		return selector;
	}

	//matcher为当前词素前的“终极匹配器”
	//combinator为位置词素
	//根据关系选择器检查
	//如果是这类没有位置词素的选择器：’#id.clr[name="checkbox"]‘，
	//从右到左依次看看当前节点elem是否匹配规则即可。但是由于有了位置词素，
	//那么判断的时候就不是简单判断当前节点了，
	//可能需要判断elem的兄弟或者父亲节点是否依次符合规则。
	//这是一个递归深搜的过程。
	//addCombinator方法就是为了生成有位置词素的匹配器。
	function addCombinator(matcher, combinator, base) {
		var dir = combinator.dir,
			checkNonElements = base && dir === "parentNode",
			doneName = done++; //第几个关系选择器

		return combinator.first ?
		// Check against closest ancestor/preceding element
		// 检查最靠近的祖先元素
		// 如果是紧密关系的位置词素
		function(elem, context, xml) {
			while ((elem = elem[dir])) {
				if (elem.nodeType === 1 || checkNonElements) {
					//找到第一个亲密的节点，立马就用终极匹配器判断这个节点是否符合前面的规则
					return matcher(elem, context, xml);
				}
			}
		} :

		// Check against all ancestor/preceding elements
		//检查最靠近的祖先元素或兄弟元素（概据>、~、+还有空格检查）
		//如果是不紧密关系的位置词素
		function(elem, context, xml) {
			var data, cache, outerCache,
				dirkey = dirruns + " " + doneName;

			// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
			// 我们不可以在xml节点上设置任意数据，所以它们不会从dir缓存中受益
			if (xml) {
				while ((elem = elem[dir])) {
					if (elem.nodeType === 1 || checkNonElements) {
						if (matcher(elem, context, xml)) {
							return true;
						}
					}
				}
			} else {
				while ((elem = elem[dir])) {
		            //如果是不紧密的位置关系
		            //那么一直匹配到true为止
		            //例如祖宗关系的话，就一直找父亲节点直到有一个祖先节点符合规则为止
					if (elem.nodeType === 1 || checkNonElements) {
						outerCache = elem[expando] || (elem[expando] = {});
						//如果有缓存且符合下列条件则不用再次调用matcher函数
						if ((cache = outerCache[dir]) && cache[0] === dirkey) {
							if ((data = cache[1]) === true || data === cachedruns) {
								return data === true;
							}
						} else {
							cache = outerCache[dir] = [dirkey];
							cache[1] = matcher(elem, context, xml) || cachedruns; //cachedruns//正在匹配第几个元素
							if (cache[1] === true) {
								return true;
							}
						}
					}
				}
			}
		};
	}

	function elementMatcher(matchers) {
		//生成一个终极匹配器
		return matchers.length > 1 ?
		//如果是多个匹配器的情况，那么就需要elem符合全部匹配器规则
			function(elem, context, xml) {
				var i = matchers.length;
				//从右到左开始匹配
				while (i--) {
					//如果有一个没匹配中，那就说明该节点elem不符合规则
					if (!matchers[i](elem, context, xml)) {
						return false;
					}
				}
				return true;
		} :
		//单个匹配器的话就返回自己即可
			matchers[0];
	}

	function condense(unmatched, map, filter, context, xml) {
		var elem,
			newUnmatched = [],
			i = 0,
			len = unmatched.length,
			mapped = map != null;

		for (; i < len; i++) {
			if ((elem = unmatched[i])) {
				if (!filter || filter(elem, context, xml)) {
					newUnmatched.push(elem);
					if (mapped) {
						map.push(i);
					}
				}
			}
		}

		return newUnmatched;
	}

	function setMatcher(preFilter, selector, matcher, postFilter, postFinder, postSelector) {
		if (postFilter && !postFilter[expando]) {
			postFilter = setMatcher(postFilter);
		}
		if (postFinder && !postFinder[expando]) {
			postFinder = setMatcher(postFinder, postSelector);
		}
		return markFunction(function(seed, results, context, xml) {
			var temp, i, elem,
				preMap = [],
				postMap = [],
				preexisting = results.length,

				// Get initial elements from seed or context
				elems = seed || multipleContexts(selector || "*", context.nodeType ? [context] : context, []),

				// Prefilter to get matcher input, preserving a map for seed-results synchronization
				matcherIn = preFilter && (seed || !selector) ?
					condense(elems, preMap, preFilter, context, xml) :
					elems,

				matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || (seed ? preFilter : preexisting || postFilter) ?

				// ...intermediate processing is necessary
				[] :

				// ...otherwise use results directly
				results :
					matcherIn;

			// Find primary matches
			if (matcher) {
				matcher(matcherIn, matcherOut, context, xml);
			}

			// Apply postFilter
			if (postFilter) {
				temp = condense(matcherOut, postMap);
				postFilter(temp, [], context, xml);

				// Un-match failing elements by moving them back to matcherIn
				i = temp.length;
				while (i--) {
					if ((elem = temp[i])) {
						matcherOut[postMap[i]] = !(matcherIn[postMap[i]] = elem);
					}
				}
			}

			if (seed) {
				if (postFinder || preFilter) {
					if (postFinder) {
						// Get the final matcherOut by condensing this intermediate into postFinder contexts
						temp = [];
						i = matcherOut.length;
						while (i--) {
							if ((elem = matcherOut[i])) {
								// Restore matcherIn since elem is not yet a final match
								temp.push((matcherIn[i] = elem));
							}
						}
						postFinder(null, (matcherOut = []), temp, xml);
					}

					// Move matched elements from seed to results to keep them synchronized
					i = matcherOut.length;
					while (i--) {
						if ((elem = matcherOut[i]) &&
							(temp = postFinder ? indexOf.call(seed, elem) : preMap[i]) > -1) {

							seed[temp] = !(results[temp] = elem);
						}
					}
				}

				// Add elements to results, through postFinder if defined
			} else {
				matcherOut = condense(
					matcherOut === results ?
					matcherOut.splice(preexisting, matcherOut.length) :
					matcherOut
				);
				if (postFinder) {
					postFinder(null, results, matcherOut, xml);
				} else {
					push.apply(results, matcherOut);
				}
			}
		});
	}

	//生成用于匹配单个选择器组的函数
	//充当了selector“tokens”与Expr中定义的匹配方法的串联与纽带的作用，
	//可以说选择符的各种排列组合都是能适应的了
	//Sizzle巧妙的就是它没有直接将拿到的“分词”结果与Expr中的方法逐个匹配逐个执行，
	//而是先根据规则组合出一个大的匹配方法，最后一步执行。但是组合之后怎么执行的
	function matcherFromTokens(tokens) {
		var checkContext, matcher, j,
			len = tokens.length,
			leadingRelative = Expr.relative[tokens[0].type],
			implicitRelative = leadingRelative || Expr.relative[" "], //亲密度关系
			i = leadingRelative ? 1 : 0,

			// The foundational matcher ensures that elements are reachable from top-level context(s)
			// 确保这些元素可以在context中找到
			matchContext = addCombinator(function(elem) {
				return elem === checkContext;
			}, implicitRelative, true),

			matchAnyContext = addCombinator(function(elem) {
				return indexOf.call(checkContext, elem) > -1;
			}, implicitRelative, true),

			//这里用来确定元素在哪个context
			matchers = [
				function(elem, context, xml) {
					return (!leadingRelative && (xml || context !== outermostContext)) || (
						(checkContext = context).nodeType ?
						matchContext(elem, context, xml) :
						matchAnyContext(elem, context, xml));
				}
			];

		for (; i < len; i++) {
			// Expr.relative 匹配关系选择器类型
			// "空 > ~ +"
			if ((matcher = Expr.relative[tokens[i].type])) {
				//当遇到关系选择器时elementMatcher函数将matchers数组中的函数生成一个函数
				//（elementMatcher利用了闭包所以matchers一直存在内存中）
				matchers = [addCombinator(elementMatcher(matchers), matcher)];
			} else {
				//过滤  ATTR CHILD CLASS ID PSEUDO TAG
				matcher = Expr.filter[tokens[i].type].apply(null, tokens[i].matches);

				// Return special upon seeing a positional matcher
				//返回一个特殊的位置匹配函数
				//伪类会把selector分两部分
				if (matcher[expando]) {
					// Find the next relative operator (if any) for proper handling
					// 发现下一个关系操作符（如果有话）并做适当处理
					j = ++i;
					for (; j < len; j++) {
						if (Expr.relative[tokens[j].type]) { //如果位置伪类后面还有关系选择器还需要筛选
							break;
						}
					}
					return setMatcher(
						i > 1 && elementMatcher(matchers),
						i > 1 && toSelector(
							// If the preceding token was a descendant combinator, insert an implicit any-element `*`
							tokens.slice(0, i - 1).concat({
								value: tokens[i - 2].type === " " ? "*" : ""
							})
						).replace(rtrim, "$1"),
						matcher,
						i < j && matcherFromTokens(tokens.slice(i, j)), //如果位置伪类后面还有选择器需要筛选
						j < len && matcherFromTokens((tokens = tokens.slice(j))), //如果位置伪类后面还有关系选择器还需要筛选
						j < len && toSelector(tokens)
					);
				}
				matchers.push(matcher);
			}
		}

		return elementMatcher(matchers);
	}

	//返回的是一个终极匹配器superMatcher
	//生成用于匹配单个选择器群组的函数
	function matcherFromGroupMatchers(elementMatchers, setMatchers) {

		// A counter to specify which element is currently being matched
		// 用计数器来指定当前哪个元素正在匹配
		var matcherCachedRuns = 0,
			bySet = setMatchers.length > 0,
			byElement = elementMatchers.length > 0,

			superMatcher = function(seed, context, xml, results, expandContext) {
				var elem, j, matcher,
					setMatched = [],
					matchedCount = 0,
					i = "0",
					unmatched = seed && [],
					outermost = expandContext != null,
					contextBackup = outermostContext,

					//这一步很关键！
					//如果说有初始集合seed，那用它
					//如果没有，那只能把整个DOM树节点取出来过滤了，可以看出选择器最右边应该写一个
					// We must always have either seed elements or context
					elems = seed || byElement && Expr.find["TAG"]("*", expandContext && context.parentNode || context),
					// Use integer dirruns iff this is the outermost matcher
					dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
					len = elems.length;

				if (outermost) {
					outermostContext = context !== document && context;
					cachedruns = matcherCachedRuns;
				}

				//好，开始过滤这个elems集合了！
				// Add elements passing elementMatchers directly to results
				// Keep `i` a string if there are no elements so `matchedCount` will be "00" below
				// Support: IE<9, Safari
				// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
				for (; i !== len && (elem = elems[i]) != null; i++) {
					if (byElement && elem) {
						j = 0;

						//把所有的过滤器拿出来
						//这里的每个匹配器都是上边提到的终极匹配器，既然是终极匹配器，那为什么会有多个呢？
						//因为：div, p实际上是需要两个终极匹配器的（逗号分隔开表示有两个选择器了），:)
						while ((matcher = elementMatchers[j++])) {
							//过滤这个集合的元素elem，如果符合匹配器的规则，那么就添加到结果集里边去
							if (matcher(elem, context, xml)) {
								results.push(elem);
								break;
							}
						}
						if (outermost) {
							dirruns = dirrunsUnique;
							cachedruns = ++matcherCachedRuns;
						}
					}

					// Track unmatched elements for set filters
					if (bySet) {
						// They will have gone through all possible matchers
						if ((elem = !matcher && elem)) {
							matchedCount--;
						}

						// Lengthen the array for every element, matched or not
						if (seed) {
							unmatched.push(elem);
						}
					}
				}

				// Apply set filters to unmatched elements
				matchedCount += i;
				if (bySet && i !== matchedCount) {
					j = 0;
					while ((matcher = setMatchers[j++])) {
						matcher(unmatched, setMatched, context, xml);
					}

					if (seed) {
						// Reintegrate element matches to eliminate the need for sorting
						if (matchedCount > 0) {
							while (i--) {
								if (!(unmatched[i] || setMatched[i])) {
									setMatched[i] = pop.call(results);
								}
							}
						}

						// Discard index placeholder values to get only actual matches
						setMatched = condense(setMatched);
					}

					// Add matches to results
					push.apply(results, setMatched);

					// Seedless set matches succeeding multiple successful matchers stipulate sorting
					if (outermost && !seed && setMatched.length > 0 &&
						(matchedCount + setMatchers.length) > 1) {

						Sizzle.uniqueSort(results);
					}
				}

				// Override manipulation of globals by nested matchers
				if (outermost) {
					dirruns = dirrunsUnique;
					outermostContext = contextBackup;
				}

				return unmatched;
			};

		return bySet ?
			markFunction(superMatcher) :
			superMatcher;
	}

	//编译函数机制
	//通过传递进来的selector和match生成匹配器：
	compile = Sizzle.compile = function(selector, group /* Internal Use Only */ ) {
		var i,
			setMatchers = [],
			elementMatchers = [],
			cached = compilerCache[selector + " "];

		if (!cached) { //依旧看看有没有缓存
			// Generate a function of recursive functions that can be used to check each element
			if (!group) {
				//如果没有词法解析过
				group = tokenize(selector);
			}

			i = group.length; //从后开始生成匹配器

			//如果是有并联选择器这里多次等循环
			while (i--) {
				//这里用matcherFromTokens来生成对应Token的匹配器
				cached = matcherFromTokens(group[i]);
				if (cached[expando]) {
					setMatchers.push(cached);
				} else { //普通的那些匹配器都压入了elementMatchers里边
					elementMatchers.push(cached);
				}
			}

			// Cache the compiled function
			// 这里可以看到，是通过matcherFromGroupMatchers这个函数来生成最终的匹配器
			cached = compilerCache(selector, matcherFromGroupMatchers(elementMatchers, setMatchers));
		}
		//把这个终极匹配器返回到select函数中
		return cached;
	};

	function multipleContexts(selector, contexts, results) {
		var i = 0,
			len = contexts.length;
		for (; i < len; i++) {
			Sizzle(selector, contexts[i], results);
		}
		return results;
	}

	//引擎的主要入口函数
	function select(selector, context, results, seed) {
		var i, tokens, token, type, find,
			//解析出词法格式
			match = tokenize(selector);

		if (!seed) { //如果外界没有指定初始集合seed了。
			// Try to minimize operations if there is only one group
			// 没有多组的情况下
			// 如果只是单个选择器的情况，也即是没有逗号的情况：div, p，可以特殊优化一下
			if (match.length === 1) {

				// Take a shortcut and set the context if the root selector is an ID
				tokens = match[0] = match[0].slice(0); //取出选择器Token序列

				//如果第一个是selector是id我们可以设置context快速查找
				if (tokens.length > 2 && (token = tokens[0]).type === "ID" &&
					support.getById && context.nodeType === 9 && documentIsHTML &&
					Expr.relative[tokens[1].type]) {

					context = (Expr.find["ID"](token.matches[0].replace(runescape, funescape), context) || [])[0];
					if (!context) {
						//如果context这个元素（selector第一个id选择器）都不存在就不用查找了
						return results;
					}
					//去掉第一个id选择器
					selector = selector.slice(tokens.shift().value.length);
				}

				// Fetch a seed set for right-to-left matching
				//其中： "needsContext"= new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
				//即是表示如果没有一些结构伪类，这些是需要用另一种方式过滤，在之后文章再详细剖析。
				//那么就从最后一条规则开始，先找出seed集合
				i = matchExpr["needsContext"].test(selector) ? 0 : tokens.length;

				//从右向左边查询
				while (i--) { //从后开始向前找！
					token = tokens[i]; //找到后边的规则

					// Abort if we hit a combinator
					// 如果遇到了关系选择器中止
					//
					//  > + ~ 空
					//
					if (Expr.relative[(type = token.type)]) {
						break;
					}

					/*
		          先看看有没有搜索器find，搜索器就是浏览器一些原生的取DOM接口，简单的表述就是以下对象了
		          Expr.find = {
					'ID'    : context.getElementById,
					'CLASS' : context.getElementsByClassName,
					'NAME'  : context.getElementsByName,
					'TAG'   : context.getElementsByTagName
		          }
		        */
					//如果是:first-child这类伪类就没有对应的搜索器了，此时会向前提取前一条规则token
					if ((find = Expr.find[type])) {

						// Search, expanding context for leading sibling combinators
						// 尝试一下能否通过这个搜索器搜到符合条件的初始集合seed
						if ((seed = find(
							token.matches[0].replace(runescape, funescape),
							rsibling.test(tokens[0].type) && context.parentNode || context
						))) {

							//如果真的搜到了
							// If seed is empty or no tokens remain, we can return early
							//把最后一条规则去除掉
							tokens.splice(i, 1);
							selector = seed.length && toSelector(tokens);

							//看看当前剩余的选择器是否为空
							if (!selector) {
								//是的话，提前返回结果了。
								push.apply(results, seed);
								return results;
							}

							//已经找到了符合条件的seed集合，此时前边还有其他规则，跳出去
							break;
						}
					}
				}
			}
		}



		/*
		selector："div > p + div.aaron input[type="checkbox"]"

		解析规则：
		1 按照从右到左
		2 取出最后一个token  比如[type="checkbox"]
									{
										matches : Array[3]
										type    : "ATTR"
										value   : "[type="
										checkbox "]"
									}
	    3 过滤类型 如果type是 > + ~ 空 四种关系选择器中的一种，则跳过，在继续过滤
	    4 直到匹配到为 ID,CLASS,NAME,TAG  中一种 , 因为这样才能通过浏览器的接口索取
	    5 此时seed种子合集中就有值了,这样把刷选的条件给缩的很小了
	    6 如果匹配的seed的合集有多个就需要进一步的过滤了,修正选择器 selector: "div > p + div.aaron [type="checkbox"]"
	    7 OK,跳到一下阶段的编译函数



	 */

		// "div > p + div.aaron [type="checkbox"]"

		// Compile and execute a filtering function
		// Provide `match` to avoid retokenization if we modified the selector above
		// 交由compile来生成一个称为终极匹配器
		// 通过这个匹配器过滤seed，把符合条件的结果放到results里边
		//
		//	//生成编译函数
		//  var superMatcher =   compile( selector, match )
		//
		//  //执行
		//	superMatcher(seed,context,!documentIsHTML,results,rsibling.test( selector ))
		//
		compile(selector, match)(
			seed,
			context, !documentIsHTML,
			results,
			rsibling.test(selector)
		);
		return results;
	}

	// One-time assignments

	// Sort stability
	support.sortStable = expando.split("").sort(sortOrder).join("") === expando;

	// Support: Chrome<14
	// Always assume duplicates if they aren't passed to the comparison function
	support.detectDuplicates = hasDuplicate;

	// Initialize against the default document
	setDocument();

	// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
	// Detached nodes confoundingly follow *each other*
	support.sortDetached = assert(function(div1) {
		// Should return 1, but returns 4 (following)
		return div1.compareDocumentPosition(document.createElement("div")) & 1;
	});

	// Support: IE<8
	// Prevent attribute/property "interpolation"
	// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
	if (!assert(function(div) {
		div.innerHTML = "<a href='#'></a>";
		return div.firstChild.getAttribute("href") === "#";
	})) {
		addHandle("type|href|height|width", function(elem, name, isXML) {
			if (!isXML) {
				return elem.getAttribute(name, name.toLowerCase() === "type" ? 1 : 2);
			}
		});
	}

	// Support: IE<9
	// Use defaultValue in place of getAttribute("value")
	if (!support.attributes || !assert(function(div) {
		div.innerHTML = "<input/>";
		div.firstChild.setAttribute("value", "");
		return div.firstChild.getAttribute("value") === "";
	})) {
		addHandle("value", function(elem, name, isXML) {
			if (!isXML && elem.nodeName.toLowerCase() === "input") {
				return elem.defaultValue;
			}
		});
	}

	// Support: IE<9
	// Use getAttributeNode to fetch booleans when getAttribute lies
	if (!assert(function(div) {
		return div.getAttribute("disabled") == null;
	})) {
		addHandle(booleans, function(elem, name, isXML) {
			var val;
			if (!isXML) {
				return elem[name] === true ? name.toLowerCase() :
					(val = elem.getAttributeNode(name)) && val.specified ?
					val.value :
					null;
			}
		});
	}

	// EXPOSE
	if (typeof define === "function" && define.amd) {
		define(function() {
			return Sizzle;
		});
		// Sizzle requires that there be a global window in Common-JS like environments
	} else if (typeof module !== "undefined" && module.exports) {
		module.exports = Sizzle;
	} else {
		window.Sizzle = Sizzle;
	}
	// EXPOSE

})(window);