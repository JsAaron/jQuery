(function( jQuery ) {

jQuery.support = (function() {

	var div = document.createElement( "div" ),
		documentElement = document.documentElement,
		all,
		a,
		select,
		opt,
		input,
		marginDiv,
		support,
		fragment,
		body,
		testElementParent,
		testElement,
		testElementStyle,
		tds,
		events,
		eventName,
		i,
		isSupported;

	// Preliminary tests
	div.setAttribute("className", "t");
	div.innerHTML = "   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/><nav></nav>";


	all = div.getElementsByTagName( "*" );
	a = div.getElementsByTagName( "a" )[ 0 ];

	// Can't get basic test support
	if ( !all || !all.length || !a ) {
		return {};
	}

	// First batch of supports tests
	select = document.createElement( "select" );
	opt = select.appendChild( document.createElement("option") );
	input = div.getElementsByTagName( "input" )[ 0 ];

	support = {
		// IE strips leading whitespace when .innerHTML is used
		leadingWhitespace: ( div.firstChild.nodeType === 3 ),

		// Make sure that tbody elements aren't automatically inserted
		// IE will insert them into empty tables
		tbody: !div.getElementsByTagName( "tbody" ).length,

		// Make sure that link elements get serialized correctly by innerHTML
		// This requires a wrapper element in IE
		htmlSerialize: !!div.getElementsByTagName( "link" ).length,

		// Get the style information from getAttribute
		// (IE uses .cssText instead)
		style: /top/.test( a.getAttribute("style") ),

		// Make sure that URLs aren't manipulated
		// (IE normalizes it by default)
		hrefNormalized: ( a.getAttribute( "href" ) === "/a" ),

		// Make sure that element opacity exists
		// (IE uses filter instead)
		// Use a regex to work around a WebKit issue. See #5145
		opacity: /^0.55/.test( a.style.opacity ),

		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)
		cssFloat: !!a.style.cssFloat,

		// Make sure unknown elements (like HTML5 elems) are handled appropriately
		unknownElems: !!div.getElementsByTagName( "nav" ).length,

		// Make sure that if no value is specified for a checkbox
		// that it defaults to "on".
		// (WebKit defaults to "" instead)
		checkOn: ( input.value === "on" ),

		// Make sure that a selected-by-default option has a working selected property.
		// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
		optSelected: opt.selected,

		// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
		getSetAttribute: div.className !== "t",

		// Tests for enctype support on a form(#6743)
		enctype: !!document.createElement("form").enctype,

		// Will be defined later
		submitBubbles: true,
		changeBubbles: true,
		focusinBubbles: false,
		deleteExpando: true,
		noCloneEvent: true,
		inlineBlockNeedsLayout: false,
		shrinkWrapBlocks: false,
		reliableMarginRight: true
	};

	// Make sure checked status is properly cloned
	input.checked = true;
	support.noCloneChecked = input.cloneNode( true ).checked;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Test to see if it's possible to delete an expando from an element
	// Fails in Internet Explorer
	try {
		delete div.test;
	} catch( e ) {
		support.deleteExpando = false;
	}

	if ( !div.addEventListener && div.attachEvent && div.fireEvent ) {
		div.attachEvent( "onclick", function() {
			// Cloning a node shouldn't copy over any
			// bound event handlers (IE does this)
			support.noCloneEvent = false;
		});
		div.cloneNode( true ).fireEvent( "onclick" );
	}

	// Check if a radio maintains its value
	// after being appended to the DOM
	input = document.createElement("input");
	input.value = "t";
	input.setAttribute("type", "radio");
	support.radioValue = input.value === "t";

	input.setAttribute("checked", "checked");
	div.appendChild( input );
	fragment = document.createDocumentFragment();
	fragment.appendChild( div.lastChild );

	// WebKit doesn't clone checked state correctly in fragments
	support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

	div.innerHTML = "";

	// Figure out if the W3C box model works as expected
	div.style.width = div.style.paddingLeft = "1px";

	// We don't want to do body-related feature tests on frameset
	// documents, which lack a body. So we use
	// document.getElementsByTagName("body")[0], which is undefined in
	// frameset documents, while document.body isn’t. (7398)
	body = document.getElementsByTagName("body")[ 0 ];
	// We use our own, invisible, body unless the body is already present
	// in which case we use a div (#9239)
	testElement = document.createElement( body ? "div" : "body" );
	testElementStyle = {
		visibility: "hidden",
		width: 0,
		height: 0,
		border: 0,
		margin: 0,
		background: "none"
	};
	if ( body ) {
		jQuery.extend( testElementStyle, {
			position: "absolute",
			left: "-999px",
			top: "-999px"
		});
	}
	for ( i in testElementStyle ) {
		testElement.style[ i ] = testElementStyle[ i ];
	}
	testElement.appendChild( div );
	testElementParent = body || documentElement;
	testElementParent.insertBefore( testElement, testElementParent.firstChild );

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	support.appendChecked = input.checked;

	support.boxModel = div.offsetWidth === 2;

	if ( "zoom" in div.style ) {
		// Check if natively block-level elements act like inline-block
		// elements when setting their display to 'inline' and giving
		// them layout
		// (IE < 8 does this)
		div.style.display = "inline";
		div.style.zoom = 1;
		support.inlineBlockNeedsLayout = ( div.offsetWidth === 2 );

		// Check if elements with layout shrink-wrap their children
		// (IE 6 does this)
		div.style.display = "";
		div.innerHTML = "<div style='width:4px;'></div>";
		support.shrinkWrapBlocks = ( div.offsetWidth !== 2 );
	}

	div.innerHTML = "<table><tr><td style='padding:0;border:0;display:none'></td><td>t</td></tr></table>";
	tds = div.getElementsByTagName( "td" );

	// Check if table cells still have offsetWidth/Height when they are set
	// to display:none and there are still other visible table cells in a
	// table row; if so, offsetWidth/Height are not reliable for use when
	// determining if an element has been hidden directly using
	// display:none (it is still safe to use offsets if a parent element is
	// hidden; don safety goggles and see bug #4512 for more information).
	// (only IE 8 fails this test)
	isSupported = ( tds[ 0 ].offsetHeight === 0 );

	tds[ 0 ].style.display = "";
	tds[ 1 ].style.display = "none";

	// Check if empty table cells still have offsetWidth/Height
	// (IE < 8 fail this test)
	support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );
	div.innerHTML = "";

	// Check if div with explicit width and no margin-right incorrectly
	// gets computed margin-right based on width of container. For more
	// info see bug #3333
	// Fails in WebKit before Feb 2011 nightlies
	// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
	if ( document.defaultView && document.defaultView.getComputedStyle ) {
		marginDiv = document.createElement( "div" );
		marginDiv.style.width = "0";
		marginDiv.style.marginRight = "0";
		div.appendChild( marginDiv );
		support.reliableMarginRight =
			( parseInt( ( document.defaultView.getComputedStyle( marginDiv, null ) || { marginRight: 0 } ).marginRight, 10 ) || 0 ) === 0;
	}

	// Technique from Juriy Zaytsev
	// http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
	// We only care about the case where non-standard event systems
	// are used, namely in IE. Short-circuiting here helps us to
	// avoid an eval call (in setAttribute) which can cause CSP
	// to go haywire. See: https://developer.mozilla.org/en/Security/CSP
	if ( div.attachEvent ) {
		for( i in {
			submit: 1,
			change: 1,
			focusin: 1
		} ) {
			eventName = "on" + i;
			isSupported = ( eventName in div );
			if ( !isSupported ) {
				div.setAttribute( eventName, "return;" );
				isSupported = ( typeof div[ eventName ] === "function" );
			}
			support[ i + "Bubbles" ] = isSupported;
		}
	}

	// Run fixed position tests at doc ready to avoid a crash
	// related to the invisible body in IE8
	jQuery(function() {
		var container, outer, inner, table, td, offsetSupport,
			conMarginTop = 1,
			ptlm = "position:absolute;top:0;left:0;width:1px;height:1px;margin:0;",
			vb = "visibility:hidden;border:0;",
			style = "style='" + ptlm + "border:5px solid #000;padding:0;'",
			html = "<div " + style + "><div></div></div>" +
							"<table " + style + " cellpadding='0' cellspacing='0'>" +
							"<tr><td></td></tr></table>";

		// Reconstruct a container
		body = document.getElementsByTagName("body")[0];
		if ( !body ) {
			// Return for frameset docs that don't have a body
			// These tests cannot be done
			return;
		}

		container = document.createElement("div");
		container.style.cssText = vb + "width:0;height:0;position:static;top:0;margin-top:" + conMarginTop + "px";
		body.insertBefore( container, body.firstChild );

		// Construct a test element
		testElement = document.createElement("div");
		testElement.style.cssText = ptlm + vb;

		testElement.innerHTML = html;
		container.appendChild( testElement );
		outer = testElement.firstChild;
		inner = outer.firstChild;
		td = outer.nextSibling.firstChild.firstChild;

		offsetSupport = {
			doesNotAddBorder: ( inner.offsetTop !== 5 ),
			doesAddBorderForTableAndCells: ( td.offsetTop === 5 )
		};

		inner.style.position = "fixed";
		inner.style.top = "20px";

		// safari subtracts parent border width here which is 5px
		offsetSupport.fixedPosition = ( inner.offsetTop === 20 || inner.offsetTop === 15 );
		inner.style.position = inner.style.top = "";

		outer.style.overflow = "hidden";
		outer.style.position = "relative";

		offsetSupport.subtractsBorderForOverflowNotVisible = ( inner.offsetTop === -5 );
		offsetSupport.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== conMarginTop );

		body.removeChild( container );
		testElement = container = null;

		jQuery.extend( support, offsetSupport );
	});

	testElement.innerHTML = "";
	testElementParent.removeChild( testElement );

	// Null connected elements to avoid leaks in IE
	testElement = fragment = select = opt = body = marginDiv = div = input = null;

	return support;
})();

// Keep track of boxModel
jQuery.boxModel = jQuery.support.boxModel;

})( jQuery );
