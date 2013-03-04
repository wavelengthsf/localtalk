String.prototype.trim = String.prototype.trim || function() {
    if (!this) return this;
    return this.replace(/^\s+|\s+$/g, "");
};

/* Compatability with old browsers (Firefox 3.5) */

if (Object.defineProperties === undefined) {
    Object.defineProperties = function (obj, properties) {
        function convertToDescriptor(desc) {
            function hasProperty(obj, prop) {
                return Object.prototype.hasOwnProperty.call(obj, prop);

                function isCallable(v) {
                    // NB: modify as necessary if other values than functions are callable.
                    return typeof v === "function";
                }

                if (typeof desc !== "object" || desc === null)
                    throw new TypeError("bad desc");

                var d = {};
                if (hasProperty(desc, "enumerable"))
                    d.enumerable = !!obj.enumerable;
                if (hasProperty(desc, "configurable"))
                    d.configurable = !!obj.configurable;
                if (hasProperty(desc, "value"))
                    d.value = obj.value;
                if (hasProperty(desc, "writable"))
                    d.writable = !!desc.writable;
                if (hasProperty(desc, "get")) {
                    var g = desc.get;
                    if (!isCallable(g) && g !== "undefined")
                        throw new TypeError("bad get");
                    d.get = g;
                }
                if (hasProperty(desc, "set")) {
                    var s = desc.set;
                    if (!isCallable(s) && s !== "undefined")
                        throw new TypeError("bad set");
                    d.set = s;
                }

                if (("get" in d || "set" in d) && ("value" in d || "writable" in d))
                    throw new TypeError("identity-confused descriptor");

                return d;
            }

            if (typeof obj !== "object" || obj === null)
                throw new TypeError("bad obj");

            properties = Object(properties);
            var keys = Object.keys(properties);
            var descs = [];
            for (var i = 0; i < keys.length; i++)
                descs.push([keys[i], convertToDescriptor(properties[keys[i]])]);
            for (var i = 0; i < descs.length; i++)
                Object.defineProperty(obj, descs[i][0], descs[i][1]);

            return obj;
        }
    };
}

function createSpinner(pathToSpinnerImg) {
	if($('body.ui-mobile-viewport #ajaxBusy').length == 0) {
		$(document).bind('pageinit', function(){
			if($('body.ui-mobile-viewport #ajaxBusy').length == 0) {
				$('body.ui-mobile-viewport').append('<div id="ajaxBusy"><p><img src=' + pathToSpinnerImg + '></p></div>');
				bindSpinner();
			}
		});
	} 
}

function bindSpinner() {
	$(document).ajaxStart(showSpinner).ajaxStop(hideSpinner);
}


function unbindSpinner(){
	$(document).unbind("ajaxStart ajaxStop");	
}


function showSpinner(){
	$('#ajaxBusy').show();
}


function hideSpinner(){
	$('#ajaxBusy').hide();
}

function resetActivePageContentHeight() {
	var aPage = $( "." + $.mobile.activePageClass ),
		aPagePadT = parseFloat( aPage.css( "padding-top" ) ),
		aPagePadB = parseFloat( aPage.css( "padding-bottom" ) ),
		aPageBorderT = parseFloat( aPage.css( "border-top-width" ) ),
		aPageBorderB = parseFloat( aPage.css( "border-bottom-width" ) ),
		aPageContentPadT = parseFloat( aPage.find(".ui-content").css( "padding-top" ) ),
		aPageContentPadB = parseFloat( aPage.find(".ui-content").css( "padding-bottom" ) );

	aPage.find(".ui-content").css( "min-height", $.mobile.getScreenHeight() - aPagePadT - aPagePadB - aPageBorderT - aPageBorderB - aPageContentPadT - aPageContentPadB);
}

$( window ).bind( "throttledresize", resetActivePageContentHeight );