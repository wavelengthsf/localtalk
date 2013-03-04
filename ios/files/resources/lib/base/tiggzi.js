(function ($) {
    var components = {};

    var tiggziFunction = function () {
        var id;
        var context;
        var elem;
        var screenCtxt = $("#" + Tiggzi.CurrentScreen);

        if (arguments.length == 1) {
            id = arguments[0];
            if (components[id]) {
                return components[id].__element;
            } else {
                elem = $('[dsid="' + id + '"]:eq(0)', screenCtxt);
                if (elem.length == 0 && screenCtxt.attr('dsid') == id)
                    elem = screenCtxt;
                return elem;
            }
        } else {
            for (var i = 0; i < arguments.length - 1; i++) {
                id ? id += "_" + arguments[i] : id = arguments[i];
            }

            if (typeof arguments[arguments.length - 1] == 'string') {
                id += "_" + arguments[arguments.length - 1];
                if (components[id]) {
                    return $(components[id].__element);
                } else {
                    elem = $('[dsid="' + id + '"]:eq(0)', screenCtxt);
                    if (elem.length == 0 && screenCtxt.attr('dsid') == id)
                        elem = screenCtxt;
                    return elem;
                }
            } else {
                var ctx = $(arguments[arguments.length - 1]);
                elem = ctx.closest('[tiggzitype="mobiletemplate"]');
                if (elem.length != 0) {
                    var ccname = elem.eq(0).attr('dsid') + "_" + arguments[0];
                    elem = $('[dsid="' + ccname + '"]:eq(0)', screenCtxt);
                    return elem;
                } else {
                    while (elem.size() == 0) {
                        ctx = ctx.parent().closest('[dsrefid]').eq(0);
                        if (ctx.size() == 0) return $();
                        elem = ctx.find('[dsid=' + id + ']').filter('[_tmpl!=true]').eq(0);
                    }
                    return elem.eq(0);
                }
            }
        }
    };

    tiggziFunction.__registerComponent = function (id, component) {
        components[id] = component;
    };

    tiggziFunction.__unregisterComponent = function (id) {
        delete components[id];
    };

    tiggziFunction.__deleteAllComponents = function () {
        for (o in components) delete components[o];
    };

    // simulates behaviour of java.net.URLEncoder + escapes "*"
    tiggziFunction.__URLEncodeSpecial = function (input) {
        if (typeof input == 'string') {
            return encodeURIComponent(input)
                .replace(/%20/g, "+")       // %20
                .replace(/\*/g, '%2A')     // *
                .replace(/~/g, '%7E')      // ~
                .replace(/!/g, '%21')      // !
                .replace(/\(/g, '%28')     // (
                .replace(/\)/g, '%29');    // )
        }
        return undefined;
    };

    var Tiggzi, $t;
    /**
     * Finds components on current screen.
     * @param {...string} names - stack of component name and parent custom components names. As an example Tiggzi("mobileimage1") will find image component on the screen, when Tiggzi("myComplexComp1", "mobileimage1") will find image component in myComplexComp1 custom component presented on the screen.
     * @class
     */
    Tiggzi = $t = window.Tiggzi = window.$t = window.Tiggr = tiggziFunction;

    /**
     * @lends Tiggzi.prototype
     * @private
     * Links prototypes
     */
    function linkPrototypes(parent, child) {
        var F = function () {
        };
        F.prototype = parent.prototype;
        child.prototype = new F();
        child.prototype.constructor = child;
        child.$super = parent.prototype;

        return child;
    };

    /**
     * Creates new class.
     * @param {Object} base - super class
     * @param {Object} methods - object containing methods extending the base class (with <i>jQuery.extend</i>). NOTE that if function "init" is presented in methods, it will be run automatically, when new object is created.
     * @param {Object} properties - object containing properties extending the base class (with <i>Object.defineProperties</i>).
     * @see <a href="https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/defineProperties">Object.defineProperties</a>
     * @see <a href="http://api.jquery.com/jQuery.extend/">jQuery.extend</a>
     * @example <b>Example of using Tiggzi.createClass</b>
     * <code>
     * // Creating class A with one init method and one readonly property id
     * A = Tiggzi.createClass(
     *     // base
     *     null, // base class will be set to Object by default
     *     // methods
     *     {
     *         init:function(options) {
     *             this.options = options;
     *         }
     *     },
     *     // properties
     *     {
     *         id: {value: 1, writable: false}
     *     }
     * );
     * a = new A("paramA"); // Method init is called implicitly
     * a.id                 // 1
     * a.options            // "paramA"
     *
     * // Creating class B with log_options method.
     * B = Tiggzi.createClass(
     *     // base
     *     A,
     *     // methods
     *     {
     *         log_options:function() {
     *             if (this.options) console.log(this.options);
     *         }
     *     },
     *     // properties
     *     {}
     * );
     * b = new B("paramB"); // Method init, inherited from A is called implicitly
     * b.id                 // 1, inherited
     * b.options            // "paramB", options is set by init
     * b.log_options()      // "paramB", own method invocation
     * </code>
     */
    Tiggzi.createClass = function (base, methods, properties) {
        base = base || Object;
        methods = methods || {};
        properties = properties || {};

        var derived = function () {
            if (this.init) {
                this.init.apply(this, $.makeArray(arguments));
            }
        };
        linkPrototypes(base, derived);
        $.extend(derived.prototype, methods);

        Object.defineProperties(derived.prototype, properties);

        return derived;
    };

    /**
     * @class
     */
    Tiggzi.BaseComponent = $t.createClass(null, /** @lends Tiggzi.BaseComponent.prototype */ {

        init: function (options) {
            this.options = options;
            this.__element = $('[dsid="' + options.id + '"]:eq(0)', options.context);

            this.attachToDOM();
        },

        __registerComponent: function () {
            this.__componentRegistered = true;
            $t.__registerComponent(this.id, this);
            return this;
        },

        destroy: function () {
            if (this.__componentRegistered) {
                $t.__unregisterComponent(this.id);
            }
            this.__element = $();
        },

        __getUnknownAttribute: function (name) {
            return this.element().attr(name);
        },

        __getAttribute: function (name) {
            if (this.hasOwnProperty(name)) {
                return this[name];
            } else {
                return this.__getUnknownAttribute(name);
            }
        },

        __setUnknownAttribute: function (name, value) {
            this.element().attr(name, value);
        },

        __setAttribute: function (name, value) {
            if (this.hasOwnProperty(name)) {
                this[name] = value;
            } else {
                this.__setUnknownAttribute(name, value);
            }
        },

        getId: function () {
            return this.id;
        },

        element: function () {
            return this.__element;
        },

        attachToDOM: function () {
            this.element().data('Tiggzi.component', this);
        },

        attr: function () {
            if (arguments.length == 1) {
                return this.__getAttribute(arguments[0]);
            } else {
                this.__setAttribute(arguments[0], arguments[1]);
                return this;
            }
        }

    }, {
        id: {
            get: function () {
                return this.options.id;
            },
            configurable: false
        }
    });

    var eventHandlerDelegates = ['bind', 'unbind', 'one', 'live', 'die', 'trigger'];
    $.each(eventHandlerDelegates, function (idx, methodName) {
        $t.BaseComponent.prototype[methodName] = function () {
            var elts = this.element();
            return elts[methodName].apply(elts, $.makeArray(arguments));
        };
    });

    var commonEvents = ['mouseup', 'mousedown', 'mouseover', 'mouseout', 'mousemove', 'keypress', 'keyup', 'keydown', 'dblclick', 'click'];
    $.each(commonEvents, function (idx, type) {
        $t.BaseComponent.prototype[type] = function () {
            if (arguments.length == 0) {
                return this.trigger(type);
            } else {
                return this.bind.apply(this, $.makeArray(arguments));
            }
        };
    });

    /**
     * @class ConsoleLogger is an object that allows logging debug messages at various levels.
     */
    Tiggzi.ConsoleLogger = $t.createClass(null, /** @lends Tiggzi.ConsoleLogger.prototype */ {

        __formatMessage: function (message, params) {
            var params = $.makeArray(arguments);
            params.shift();

            return message.replace(/\{(\d+)\}/g, function (str, p1, offset, s) {
                var num = parseInt(p1, 10);
                return params[num - 1 /* one-based -> zero-based */];
            });
        },

        /**
         * Logs message with error level
         * @param {...Object} params - message formatting parameters
         */
        error: function (message, params) {
            if (this.isLevelEnabled($t.Logger.Levels.ERROR)) {
                console.error(this.__formatMessage(message, params));
            }
        },

        /**
         * Logs message with warning level
         * @param {...Object} params - message formatting parameters
         */
        warn: function (message, params) {
            if (this.isLevelEnabled($t.Logger.Levels.WARN)) {
                console.warn(this.__formatMessage(message, params));
            }
        },

        /**
         * Logs message with info level
         * @param {...Object} params - message formatting parameters
         */
        info: function (message, params) {
            if (this.isLevelEnabled($t.Logger.Levels.INFO)) {
                console.info(this.__formatMessage(message, params));
            }
        },

        /**
         * Logs message with debug level
         * @param {...Object} params - message formatting parameters
         */
        debug: function (message, params) {
            if (this.isLevelEnabled($t.Logger.Levels.DEBUG)) {
                console.log(this.__formatMessage(message, params));
            }
        },

        /**
         * Clears logged messages
         */
        clear: function () {
            console.clear();
        },

        /**
         * Logs properties of object passed as argument
         * @param {Object} o - object which properties should be printed
         */
        dir: function (o) {
            console.dir(o);
        },

        /**
         * Sets current logging level. Messages with level smaller than the ConsoleLogger level won't be logged.
         * @param level - new logging level to set
         */
        setLevel: function (level) {
            this.level = level;
        },

        /**
         * Returns current logging level
         * @return level currently being used
         */
        getLevel: function () {
            return this.level || $t.Logger.Levels.DEBUG;
        },

        /**
         * Checks whether logging is enabled for the passed in level.
         * @param level - level value to check for
         * @return <code>true</code> if logging for this level is enabled, <code>false</code> otherwise
         */
        isLevelEnabled: function (level) {
            return this.getLevel() <= level;
        }
    });

    var booleanAttributes = {
        'checked': true, 'compact': true, 'declare': true, 'defer': true, 'disabled': true, 'ismap': true,
        'multiple': true, 'nohref': true, 'noresize': true, 'noshade': true, 'nowrap': true, 'readonly': true,
        'selected': true
    };

    /**
     * @class
     */
    Tiggzi.MappingVisitor = $t.createClass(null, /** @lends Tiggzi.MappingVisitor.prototype */{

        init: function () {
            this.__contexts = new Array();
            this.__mappings = new Array();
            this.__visitArrayElement$Proxied = $.proxy(this.__visitArrayElement, this);
        },

        /* TODO
         * Finds components considering current context and mapping and filter it with jQuery.filter
         * @param {(string|function(number):boolean|jQueryObject|Element)} filter argument to pass to jQuery.filter
         * @see The <a href="http://api.jquery.com/filter/">jQuery.filter</a>
         */
        findComponent: function (filter) {
            var context = this.getContext();
            var mapping = this.getMapping();
            var name = mapping.ID;

            var result;

            if (name) {
                elem = context.find("[dsid='" + name + "'], " +
                    "[dsrefid='" + name + "']");
                type = elem.attr("tiggzitype");
                if (type && type == "object") {
                    if (elem.attr("_idx") == undefined) {
                        return Tiggzi(name);
                    } else {
                        // clone tiggzi JS object
                        if (Tiggzi(name) != undefined && Tiggzi(name).getOptions != undefined) {
                            if (elem.attr("tiggziclass") != undefined) {
                                if (elem.attr("tiggziclass") == "datepicker") {
                                    options = Tiggzi(name).getOptions();
                                    result = new Tiggzi.TiggziMobileDatePickerComponent(elem.attr("id"), options);
                                } else if (elem.attr("tiggziclass") == "carousel") {
                                    result = new Tiggzi.TiggziMobileCarouselComponent(elem.attr("id"));
                                } else {
                                    result = elem.length ? elem : context;
                                }
                            } else {
                                result = elem.length ? elem : context;
                            }
                        } else {
                            result = elem.length ? elem : context;
                        }
                    }
                } else {
                    result = elem.length ? elem : context;
                }
            } else {
                result = context;
            }

            if (result != context) {
                // Filtering by filter argument
                if (result.filter && filter) {
                    result = result.filter(filter);
                }
            }

            // Filtering by SUBSELECTOR
            if (mapping.SUBSELECTOR) {
                result = result.find(mapping.SUBSELECTOR);
            }

            return result;
        },

        pushPath: function (p) {
        },

        popPath: function () {
        },

        /* TODO
         * returns current context
         * @return {jQueryObject} current context
         */
        getContext: function () {
            return this.__contexts[this.__contexts.length - 1];
        },

        /* TODO
         * returns current mapping
         * @return {Object} current context
         */
        getMapping: function () {
            return this.__mappings[this.__mappings.length - 1];
        },

        __validateRequiredMappingAttributes: function (entry) {
            //if (!entry.PATH) {
            //	$t.log.error("Error processing entry {0} - no PATH specified", JSON.stringify(entry));
            //	return false;
            //}

            return true;
        },

        beforeArrayElementVisit: function (elt, idx) {
        },

        afterArrayElementVisit: function (elt, idx) {
        },

        beforeArrayVisit: function () {
        },

        afterArrayVisit: function () {
        },

        visitEntry: function () {
        },

        getArrayElements: function () {
            return [];
        },

        /* TODO
         * @protected
         * Visits element of mapped array
         * @param {number} idx array element index
         * @param {Element}
         */
        __visitArrayElement: function (idx, elt) {
            this.pushPath(idx);

            this.beforeArrayElementVisit(elt, idx);

            this.__visitMappingsArray(this.getMapping().SET);

            this.afterArrayElementVisit(elt, idx, this.getMapping());

            this.popPath();
        },

        __visitMapping: function (mapping) {
            if (!this.__validateRequiredMappingAttributes(mapping)) {
                return;
            }

            if (mapping.PATH) {
                for (var i = 0; i < mapping.PATH.length; i++) {
                    this.pushPath(mapping.PATH[i]);
                }
            }

            this.__mappings.push(mapping);

            if (!mapping.SET) {
                this.visitEntry();
            } else {
                this.beforeArrayVisit();

                if (arrayElementsBuf = this.getArrayElements()) {
                    if (Object.prototype.toString.call(arrayElementsBuf) === '[object Array]') {
                        $.each(arrayElementsBuf, this.__visitArrayElement$Proxied);
                    } else {
                        this.__visitArrayElement$Proxied();
                    }
                }

                this.afterArrayVisit();
            }

            this.__mappings.pop();

            if (mapping.PATH) {
                for (var i = 0; i < mapping.PATH.length; i++) {
                    this.popPath();
                }
            }
        },

        __visitMappingsArray: function (mappings) {
            for (var i = 0; i < mappings.length; i++) {
                this.__visitMapping(mappings[i]);
            }
        },

        visit: function (mappings) {
            var ctxt = $("#" + $t.CurrentScreen);

            if (ctxt.length) {
                this.__contexts.push(ctxt);
            } else {
                this.__contexts.push($(document));
            }

            this.__visitMappingsArray(mappings);

            this.__contexts.pop();
        }
    });

    /**
     * @class
     * @extends Tiggzi.MappingVisitor
     */
    Tiggzi.RenderVisitor = $t.createClass($t.MappingVisitor, /** @lends Tiggzi.RenderVisitor.prototype */ {
        init: function (data) {
            $t.RenderVisitor.$super.init.apply(this);
            this.data = data;
            this.__path = new Array();
            this.__components = new Array();
        },

        __setupDisplay: function (cs) {
            cs.each(function (i) {
                var c = cs.eq(i);

                // Special case with interactive mobilelistitem as a container
                if (c[0].tagName == "A" && c.parents().eq(3).is("[data-role='listview']")) {
                    c = c.parents().eq(2);
                }

                if (c[0].tagName) {
                    var display = c.prop('__tiggrDisplay');
                    if (typeof display == 'undefined') {
                        //first time call - backup 'display' settings
                        c.prop('__tiggrDisplay', c.css('display'));
                    } else {
                        c.css('display', display);
                    }
                }
            });
        },

        pushPath: function (p) {
            this.__path.push(p);
        },

        popPath: function () {
            this.__path.pop();
        },

        __getDataByPath: function () {
            var path = this.__path.join('.');
            return jsonPath(this.data, path)[0];
        },

        __getComponents: function () {
            return this.__components[this.__components.length - 1];
        },

        getArrayElements: function () {
            return this.__getDataByPath();
        },

        beforeArrayElementVisit: function (elt, idx) {
            var that = this;
            var clonedElements = new Array();

            var components = this.__getComponents();

            components.each(function (componentIdx) {
                var component = components.eq(componentIdx);

                var dsid = component.attr('dsid');

                if (dsid != undefined) {
                    // Special case with interactive mobilelistitem as a container
                    var imli_cloning = component[0].tagName == "A" && component.parents().eq(3).is("[data-role='listview']");

                    if (imli_cloning) {
                        component = component.parents().eq(2);
                    }
                    var clonedComponent = that.__specialClone(component);
                    clonedComponent.appendTo(component.parent());

                    if (imli_cloning) {
                        clonedComponent = clonedComponent.find("> div > div > a[dsid]");
                    }
                    that.changeIds(clonedComponent, dsid, idx);
                    if (component.parent().parent().attr('data-role') === 'controlgroup')
                        $.mobile.checkboxradio.prototype.enhanceWithin(clonedComponent);
                    if (component.find($.mobile.selectmenu.prototype.options.initSelector).length)
                        clonedComponent.find($.mobile.selectmenu.prototype.options.initSelector).selectmenu();
                    $.merge(clonedElements, clonedComponent);
                }
            });

            this.__contexts.push($(clonedElements));
        },

        __specialClone: function (originalComponent) {
            var that = this;
            var clonedComponent;

            originalComponent = originalComponent.jquery ? originalComponent : jQuery(originalComponent);

            if (originalComponent.jquery && originalComponent.attr('data-role') === 'collapsible') {
                clonedComponent = $('<div data-role="collapsible"><h3></h3><div></div></div>');
                clonedComponent.collapsible();

                this.__specialAtributesCopy(originalComponent, clonedComponent);

                clonedComponent.children('h3').children().remove();
                this.__specialChildrenCopy(originalComponent.children('h3'), clonedComponent.children('h3'));
                this.__specialAtributesCopy(originalComponent.children('h3'), clonedComponent.children('h3'));
                clonedComponent.children('div').children().remove();
                this.__specialChildrenCopy(originalComponent.children('div'), clonedComponent.children('div'));
                this.__specialAtributesCopy(originalComponent.children('div'), clonedComponent.children('div'));
            } else if (originalComponent.parent().parent().attr('data-role') === 'controlgroup' && originalComponent.attr('data-role') != 'button') {
                var typeGroup = originalComponent.children('div').children('input').attr('type');
                var nameGroup = originalComponent.children('div').children('input').attr('name');
                clonedComponent = $('<span><input></input><label></label></span>');
                this.__specialAtributesCopy(originalComponent, clonedComponent);
                this.__specialAtributesCopy(originalComponent.children('div').children('label'), clonedComponent.children('label'));
                this.__specialAtributesCopy(originalComponent.children('div').children('input'), clonedComponent.children('input'));
                this.__specialChildrenCopy(originalComponent.children('div').children('label').find('.ui-btn-text'), clonedComponent.children('label'));
            } else if (originalComponent.children('select').attr('data-role') === 'slider') {
                clonedComponent = $('<div><select><option value="on">On</option><option value="off">Off</option></select></div>');
                this.__specialAtributesCopy(originalComponent, clonedComponent);
                this.__specialAtributesCopy(originalComponent.children('select'), clonedComponent.children('select'));
            } else if (originalComponent.attr('data-role') === 'fieldcontain' && originalComponent.children('div').hasClass('ui-select')) {
                clonedComponent = $('<div><select></select></div>');
                clonedComponent.children('select').html(originalComponent.find($.mobile.selectmenu.prototype.options.initSelector).html());
                this.__specialAtributesCopy(originalComponent, clonedComponent);
                this.__specialAtributesCopy(originalComponent.find($.mobile.selectmenu.prototype.options.initSelector), clonedComponent.children('select'));
            } else if (originalComponent[0].nodeName == 'OPTION') {
                //Case of cloning option in mobile select menu
                clonedComponent = $('<' + originalComponent[0].nodeName + '/>');
                this.__specialAtributesCopy(originalComponent, clonedComponent);
                this.__specialChildrenCopy(originalComponent, clonedComponent);

                //After cloning option 'placeholder' flag must be reseted, to make select menu component work.
                clonedComponent.data('placeholder', false);
                clonedComponent.attr('data-placeholder', "false");
            } else {
                clonedComponent = $('<' + originalComponent[0].nodeName + '/>');
                this.__specialAtributesCopy(originalComponent, clonedComponent);
                this.__specialChildrenCopy(originalComponent, clonedComponent);

            }
            return clonedComponent;
        },

        __specialChildrenCopy: function (originalComponent, clonedComponent) {
            var that = this;
            originalComponent.contents().each(function () {
                if (this.nodeType == Node.TEXT_NODE) {
                    clonedComponent.append(this.cloneNode(false));
                }
                else if (this.nodeType == Node.ELEMENT_NODE) {
                    var child = that.__specialClone(this);
                    clonedComponent.append(child);
                    if (child.attr('data-role') === 'controlgroup')
                        $.mobile.checkboxradio.prototype.enhanceWithin(child);
                    if (child.children('select').attr('data-role') === 'slider')
                        $.mobile.slider.prototype.enhanceWithin(child);
                }
            });
        },

        __specialAtributesCopy: function (originalComponent, clonedComponent) {
            for (var i = 0; i < originalComponent[0].attributes.length; i++) {
                clonedComponent[0].attributes.setNamedItem(originalComponent[0].attributes.item(i).cloneNode(true));
            }
        },

        changeIds: function (component, dsid, idx) {
            component.attr('dsid', dsid + '_' + idx).attr('dsrefid', dsid);
            var oldComponentId = component.attr('id');
            if (oldComponentId) {
                component.attr('_idx', '_' + idx);
                component.attr('id', oldComponentId + '_' + idx);
            }
            var replIdElements = component.find('[id]');
            replIdElements.each(function (replIdx) {
                var replEl = replIdElements.eq(replIdx);
                var oldId = replEl.attr('id');
                replEl.attr('id', oldId + '_' + idx);
                replEl.attr('_idx', '_' + idx);
            });
            replIdElements = component.find('[for]');
            replIdElements.each(function (replIdx) {
                var replEl = replIdElements.eq(replIdx);
                var oldId = replEl.attr('for');
                replEl.attr('for', oldId + '_' + idx);
            });
            replIdElements = component.find('input[type=checkbox]');
            replIdElements.each(function (replIdx) {
                var replEl = replIdElements.eq(replIdx);
                var oldId = replEl.attr('name');
                replEl.attr('name', oldId + '_' + idx);
            });
            component.removeAttr('_tmpl');
            component.find('[_tmpl]').removeAttr('_tmpl');
        },

        beforeArrayVisit: function () {
            var components;
            components = this.findComponent('[dsrefid]');

            // Special case with interactive mobilelistitem as a container
            if (components.length > 0 && components[0].tagName == "A" && components.eq(0).parents().eq(3).is("[data-role='listview']")) {
                components = components.map(function (ind, elt) {
                    return $(elt).parents()[2];
                });
            }
            components.remove();

            components = this.findComponent();
            this.__setupDisplay(components);
            this.__components.push(components);
        },

        afterArrayElementVisit: function (elt, idx, mappingSet) {
            var el = this.__contexts.pop();
            if (mappingSet && mappingSet.TRANSFORMATION) {
                mappingSet.TRANSFORMATION(elt, el);
            }
        },

        afterArrayVisit: function () {
            var components = this.__components.pop();

            // Special case with interactive mobilelistitem as a container
            if (components[0].tagName == "A" && components.eq(0).parents().eq(3).is("[data-role='listview']")) {
                components = components.map(function (idx, elt) {
                    return $(elt).parents()[2];
                });
            }

            components.hide();
            components.each(function (idx) {
                if (this.tagName == 'OPTION') {
                    $(this).text('');
                }

            });
            components.attr('_tmpl', 'true');
            components.removeAttr('selected');
            var templates = components.find('[id]');
            templates.each(function (idx) {
                var tmplEl = templates.eq(idx);
                tmplEl.attr('_tmpl', 'true');
            });
        },

        __updateComponent: function () {
            var entry = this.getMapping();
            var value = this.__getDataByPath();
            if (value == undefined) {
                value = '';
            }
            var elt = this.findComponent();

            if (entry.TRANSFORMATION) {
                var result = entry.TRANSFORMATION(value, elt);
                if (result != undefined) value = result;
            }

            //TODO remove this legacy case (attrib!='@')
            if (entry.ATTR && entry.ATTR != '@') {
                //TODO - boolean value conversion
                //attribute can have boolean/integer type so we don't do string conversion. or do we need?

                if (booleanAttributes[entry.ATTR] && typeof value != 'boolean') {
                    value = /^\s*true\s*$/i.test(String(value));
                }
                if (elt.hasOwnProperty("__setAttribute")) {
                    elt.__setAttribute(entry.ATTR, value);
                } else {
                    elt.setAttr(entry.ATTR, value);
                }
            } else {
                //TODO - do we need explicit string constructor call here?
                elt.setText(String(value));
            }

            if (elt.parents != undefined) {
                if (elt.attr("reRender") != undefined || elt.parents("[reRender]").size() > 0) {
                    if (this.componentsForRefresh == undefined && this.clonedComponentsForRefresh == undefined) {
                        this.componentsForRefresh = [];
                    }
                }
                if (elt.attr("reRender") != undefined) {
                    if (this.componentsForRefresh.indexOf(elt.attr("reRender")) == -1) {
                        this.componentsForRefresh.push(elt.attr("reRender"));
                    }
                }
                var eltParents = elt.parents("[reRender]");
                for (var i = 0; i < eltParents.length; i++) {
                    if (this.componentsForRefresh.indexOf($(eltParents[i]).attr("reRender")) == -1) {
                        this.componentsForRefresh.push($(eltParents[i]).attr("reRender"));
                    }
                }
            }
        },

        __refreshComponent: function () {
            if (this.componentsForRefresh != undefined) {
                $.each(this.componentsForRefresh, function (i, val) {
                    if (Tiggzi(val) != undefined && Tiggzi(val).refresh != undefined) {
                        if ((Tiggzi(val).data != undefined) && (Tiggzi(val).data('selectmenu') != undefined)) {
                            Tiggzi(val).children(':not([_tmpl])').removeAttr('selected');
                            Tiggzi(val).children(':not([_tmpl])').eq(0).attr('selected', 'selected');
                        }
                        if (Tiggzi(val).attr && Tiggzi(val).attr('data-role') == "controlgroup")
                            Tiggzi(val).controlgroup()
                        else
                            Tiggzi(val).refresh();
                    }
                    clonedElementsSelector = "[name='" + val + "'][_idx]";

                    $.each($(clonedElementsSelector), function () {
                        if ($(this).data('selectmenu') != undefined) {
                            $(this).children(':not([_tmpl])').removeAttr('selected');
                            $(this).children(':not([_tmpl])').eq(0).attr('selected', 'selected');
                        }

                        if ($(this).refresh != undefined)
                            $(this).refresh();
                        if ($(this).attr("tiggziclass") != undefined) {
                            if ($(this).attr("tiggziclass") == "carousel") {
                                new Tiggzi.TiggziMobileCarouselComponent($(this).attr("id"));
                            }
                        }
                    });

                });

            }
        },


        visitEntry: function () {
            var entry = this.getMapping();
            var value = this.__getDataByPath();
            if (value == undefined) {
                value = '';
            }

            if (entry.ID == '___local_storage___') {

                if (entry.TRANSFORMATION) {
                    var result = entry.TRANSFORMATION(value, undefined);
                    if (result != undefined) value = result;
                }
                ;

                if (typeof value != 'undefined') {
                    $t.persistentStorage.setItem(entry.ATTR, value);
                } else {
                    $t.persistentStorage.removeItem(entry.ATTR);
                }
                ;
            } else if (entry.ID == '___js___') {
                if (entry.TRANSFORMATION) {
                    var result = entry.TRANSFORMATION(value, undefined);
                    if (result != undefined) value = result;
                }
            } else if (entry.ID == undefined && entry.TRANSFORMATION) {
                var element = this.findComponent();
                entry.TRANSFORMATION(value, element);
            } else {
                this.__updateComponent();
            }
        }
    });

    /**
     * @class
     * @extends Tiggzi.MappingVisitor
     */
    Tiggzi.RequestDataBuilderVisitor = $t.createClass($t.MappingVisitor, /** @lends Tiggzi.RequestDataBuilderVisitor.prototype */ {
        init: function (isJsonp) {
            $t.RequestDataBuilderVisitor.$super.init.apply(this);
            this.__params = {};
            this.__headers = {};

            this.__paramStack = new Array();
            this.__paramStack.push(this.__params);

            this.__headerStack = new Array();
            this.__headerStack.push(this.__headers);

            this.__paths = new Array();

            this.__currentPath = new Array();

            this.__isJsonp = isJsonp;
        },


        __getParam: function () {
            return this.__paramStack[this.__paramStack.length - 1];
        },


        __getHeader: function () {
            return this.__headerStack[this.__headerStack.length - 1];
        },


        __clearPath: function () {
            this.__currentPath = new Array();
        },


        pushPath: function (p) {
            this.__currentPath.push(p);
        },


        popPath: function () {
            if (this.__currentPath.length != 0) {
                this.__currentPath.pop();
            }
        },


        __setValue: function (data, value) {
            for (var i = 0; i < this.__currentPath.length - 1; i++) {
                var p = this.__currentPath[i];
                if (!data[p]) {
                    data = data[p] = {};
                } else {
                    data = data[p];
                }
            }

            var pathSegment = this.__currentPath[this.__currentPath.length - 1];

            var prevValue = data[pathSegment];
            if (typeof prevValue != 'undefined') {
                if ($.isArray(prevValue)) {
                    prevValue.push(value);
                } else {
                    data[pathSegment] = [data[pathSegment], value];
                }
            } else {
                data[pathSegment] = value;
            }
        },


        __isHeader: function () {
            var l = this.__mappings.length - 1;
            for (var i = l; 0 <= i && l - 2 < i; i--) {
                var mapping = this.__mappings[i];
                if (mapping.HEADER) {
                    return true;
                }
            }

            return false;
        },


        findComponent: function () {
            var elts = $t.RequestDataBuilderVisitor.$super.findComponent.call(this, '[dsrefid]');
            elts = elts.length ? elts : $t.RequestDataBuilderVisitor.$super.findComponent.call(this);
            return elts;
        },


        getArrayElements: function () {
            return this.findComponent();
        },


        beforeArrayElementVisit: function (elt, idx) {
            this.__contexts.push($(elt));
        },


        afterArrayElementVisit: function (elt, idx) {
            this.__contexts.pop();
        },


        beforeArrayVisit: function () {
            this.__paths.push($.merge([], this.__currentPath));
            this.__clearPath();

            this.__paramStack.push([]);
            this.__headerStack.push([]);
        },


        afterArrayVisit: function () {
            this.__currentPath = this.__paths.pop();

            var paramArray = this.__paramStack.pop();
            if (paramArray.length != 0) {
                this.__setValue(this.__getParam(), paramArray);
            }

            var headerArray = this.__headerStack.pop();
            if (headerArray.length != 0) {
                this.__setValue(this.__getHeader(), headerArray);
            }

            this.__clearPath();
        },


        __setHeaderOrValue: function (value) {
            this.__setValue(this.__isHeader() ? this.__getHeader() : this.__getParam(), value);
        },


        visitEntry: function () {
            var entry = this.getMapping();
            var result;

            if (entry.ATTR) {
                var value;
                if (entry.ID) {
                    if (entry.ID == '___local_storage___') {

                        value = $t.persistentStorage.getItem(entry.ATTR) || '';
                        if (entry.TRANSFORMATION) {
                            result = entry.TRANSFORMATION(value);
                            if (result != undefined) value = result;
                        }
                        this.__setHeaderOrValue(value);
                    }
                    else {
                        var requestData = entry.ATTR == '@' ? this.findComponent().text().trim() : this.findComponent().getAttr(entry.ATTR);

                        if (entry.TRANSFORMATION) {
                            result = entry.TRANSFORMATION(requestData);
                            if (result != undefined) requestData = result;
                        }

                        this.__setHeaderOrValue(requestData);
                    }
                } else if (this.__isJsonp && entry.ATTR == '?') {
                    this.jsonp = this.__currentPath.join('.');
                } else {
                    value = entry.ATTR;
                    if (entry.TRANSFORMATION) {
                        result = entry.TRANSFORMATION(value);
                        if (result != undefined) value = result;
                    }
                    this.__setHeaderOrValue(value);
                }
            } else if (entry.ID) {
                var requestData = this.findComponent().serializeArray();
                if (entry.TRANSFORMATION) {
                    result = entry.TRANSFORMATION(requestData[0].value);
                    if (result != undefined) requestData[0].value = result;
                }
                for (var i = 0; i < requestData.length; i++) {
                    this.__setHeaderOrValue(requestData[i].value);
                }
            } else if (entry.TRANSFORMATION) {
                result = entry.TRANSFORMATION(undefined);
                if (result != undefined) this.__setHeaderOrValue(result);
            }
        },

        getHeaders: function () {
            return this.__headers;
        },
        getParams: function () {
            return this.__params;
        },

        getJsonp: function () {
            return this.jsonp;
        }
    });

    /**
     * Creates new data source
     * @class
     */
    Tiggzi.DataSource = $t.createClass(null, /** @lends Tiggzi.DataSource.prototype */{
            /**
             * Called implicitly when object is created
             * @param {Object} service - service providing data
             * @param {Object} options - response/request mappings structures and complete/success/error handlers passed here
             * @link Tiggzi.createClass
             */
            init: function (service, options) {
                this.service = service;
                this.options = options;
                this.__responseMapping = options.responseMapping || [];
                this.__requestMapping = options.requestMapping || [];
                this.__requestOptions = $.extend({}, this.requestDefaults, options);
            },

            __setupDisplay: function (cs) {
                for (var i = 0; i < this.__responseMapping.length; i++) {
                    if (this.__responseMapping[i].SET) {
                        c = $("#" + Tiggzi.CurrentScreen + " [dsid=" + this.__responseMapping[i].ID + "]");

                        // Special case with interactive mobilelistitem as a container
                        if (c.length > 0 && c[0].tagName == "A" && c.parents().eq(3).is("[data-role='listview']")) {
                            c = c.parents().eq(2);
                        }

                        if (c.length > 0) {
                            var display = c.prop('__tiggrDisplay');
                            if (typeof display == 'undefined') {
                                //first time call - backup 'display' settings
                                var oldDisplay = c.css('display');
                                if (oldDisplay && oldDisplay != 'none') {
                                    c.prop('__tiggrDisplay', c.css('display'));
                                } else if (c[0].tagName == 'TABLE') {
                                    c.prop('__tiggrDisplay', 'table');
                                }
                                else {
                                    c.prop('__tiggrDisplay', 'block');
                                }
                            } else {
                                c.css('display', display);
                            }
                            if (c[0].tagName == "OPTION") {
                                c.text("");
                                c.parent().refresh();
                            }
                            c.hide();
                        }
                    }
                }
            },

            /* TODO jsDocs
             * Method to update components according to the predefined mapping rules using given data
             * @param {Object<String, Object>} data - data object to use for component updates
             */
            updateComponents: function (data) {
                this.data = data;
                visitor = new $t.RenderVisitor(data);
                visitor.visit(this.__responseMapping);
                visitor.__refreshComponent();
            },

            __successHandler: function (data) {
                this.updateComponents(data);

                if (this.options.onSuccess) {
                    this.options.onSuccess.apply(this, $.merge([], arguments));
                }
            },

            __responseDataHandler: function () {
                var args = $.merge([], arguments);
                var data = args[0];

                if (this.service.__requestOptions.dataType === "xml") {
                    data = $.xml2json(data);
                }

                if ($.type(data) == 'string') {
                    data = $.parseJSON(data);
                }

                args[0] = data;

                var transformer = this.getTransformer();
                if (transformer) {
                    args[0] = transformer.transform(args[0]);
                }

                this.__successHandler.apply(this, args);
            },


            __errorHandler: function () {
                //we are not resetting this.data here - that's done intentionally

                //TODO store error data
                if (this.options.onError) {
                    this.options.onError.apply(this, $.merge([], arguments));
                }
            },

            __completeHandler: function () {
                if (this.options.onComplete) {
                    this.options.onComplete.apply(this, $.merge([], arguments));
                }
                if (this.service.__requestOptions.dataType != undefined && this.service.__requestOptions.dataType == "jsonp") {
                    hideSpinner();
                }
            },

            __beforeSendHandler: function () {
                if (this.service.__requestOptions.dataType != undefined && this.service.__requestOptions.dataType == "jsonp") {
                    showSpinner();
                }
            },

            __buildRequestSettings: function (settings) {
                var handlers = {
                    'success': $.proxy(this.__responseDataHandler, this),
                    'error': $.proxy(this.__errorHandler, this),
                    'complete': $.proxy(this.__completeHandler, this),
                    'beforeSend': $.proxy(this.__beforeSendHandler, this)
                };
                settings = $.extend(handlers, this.service.__requestOptions, settings || {});

                var builder = new $t.RequestDataBuilderVisitor(!settings.jsonp && /\bjsonp\b/.test(settings.dataType || ''));
                builder.visit(this.__requestMapping);

                settings.data = $.extend(builder.getParams(), settings.data || {});
                settings.headers = $.extend(builder.getHeaders(), settings.headers || {});

                var jsonp = builder.getJsonp();
                if (jsonp) {
                    settings.jsonp = jsonp;
                }

                return settings;
            },

            /**
             * Sends asynchronous request to the server using given settings. If request has been completed successfully,
             * updates components with the received data according to the defined mapping rules and fires 'success' event followed by 'complete' event.
             * <p>If request has not completed successfully, fires 'error' event followed by 'complete'.</p>
             * @see The <a href="http://api.jquery.com/jQuery.ajax/">jQuery.ajax</a>.
             * @param {Object<String, Object>} settings - exactly the same object as is required by jQuery.ajax method
             */
            execute: function (settings) {
                settings = this.__buildRequestSettings(settings);
                this.service.process(settings);
            },

            /* TODO jsDocs
             * Returns transformer currently associated with data source
             */
            getTransformer: function () {
                return this.__transformer;
            },

            /* TODO jsDocs
             * Associates data source with transformer that's used to handle received data
             */
            setTransformer: function (transformer) {
                this.__transformer = transformer;
            }
        },
        {}
    );

    /**
     * @class
     */
    Tiggzi.GenericService = $t.createClass(null, /** @lends Tiggzi.GenericService.prototype */ {


        init: function (requestOptions) {
            this.__requestOptions = $.extend({}, requestOptions);
        },


        process: function (settings) {
            if (this.__requestOptions.echo) {
                settings.success(this.__requestOptions.echo);
            } else {
                console.log('Default implementation is used. Please define your own.');
                settings.success({});
            }
            settings.complete('success');
        }

    });

    /**
     * @class
     */
    Tiggzi.RestService = $t.createClass(null, /** @lends Tiggzi.RestService.prototype */ {

        // see correspondent variable in TestConnectionServiceImpl.java
        paramPattern: /\{([^{"':]+?)\}/g,

        requestDefaults: {
            dataType: 'json',
            cache: true,
            crossDomain: true,
            timeout: 20000,
            traditional: true
        },


        init: function (requestOptions) {
            /* This need for correct IE ajax json requests, otherwise 'no trasport' error */
            if (navigator.userAgent.toLowerCase().indexOf('msie') != -1) {
                jQuery.support.cors = true;
            }
            this.__requestOptions = $.extend({}, this.requestDefaults, requestOptions);
        },


        process: function (settings) {
            if (this.__requestOptions.echo) {
                settings.success(this.__requestOptions.echo);
            } else {
                settings.ssc_data = {};
                if (this.__requestOptions.securityContext && this.__requestOptions.securityContext.settings) {
                    $.extend(settings.ssc_data, this.__requestOptions.securityContext.settings);
                }

                settings.service_settings_data = {};
                if (this.__requestOptions.serviceSettings) {
                    $.extend(settings.service_settings_data, this.__requestOptions.serviceSettings);
                }

                settings.substitutedParams = new Array();

                this.__performParametersSubstitutions(settings);

                this.__performHeaderParametersSubstitutions(settings);

                this.__performURLSubstitutions(settings);

                for (var i = 0; i < settings.substitutedParams.length; i++) {
                    if (settings.substitutedParams[i] != undefined) delete settings.data[settings.substitutedParams[i]];
                }

                delete settings.substitutedParams;

                if (settings.contentType && settings.contentType.indexOf('json') !== -1) {
                    settings.data = JSON.stringify(settings.data);
                }

                if (settings.contentType && settings.contentType.indexOf('xml') !== -1) {
                    settings.data = this.dataToXml(settings.data);
                }

                if (this.__requestOptions.securityContext) {
                    this.__requestOptions.securityContext.invoke({execute: $.ajax}, settings);
                } else {
                    $.ajax(settings);
                }
            }
        },


        dataToXml: function (data) {
            var result = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<inputParameters>";
            result += this.objectToXml(data) + "</inputParameters>";
            return result;
        },

        /* TODO jsDocs
         * Serializes javascript object to xml
         * @param {Object} data object to encode
         * @return {string} xml string representing data
         */
        objectToXml: function (data) {
            var encodedData = "";
            var key;
            for (key in data) {
                var value = data[key];
                if (typeof value != 'string') {
                    value = this.objectToXml(value);
                }
                encodedData += "<" + key + ">" + value + "</" + key + ">";
            }
            return encodedData;
        },

        __performParametersSubstitutions: function (settings) {

            var that = this;

            if (settings.data) {
                function __performParametersSubstitution(str, param) {
                    return (settings.service_settings_data[param] || '');
                }

                function __performParametersSubstitutionRecursively(obj) {

                    if (typeof obj == 'string') {
                        obj = obj.replace(that.paramPattern, __performParametersSubstitution);
                    } else if (typeof obj == 'object') {

                        var param, value, newParam, newValue;

                        for (param in obj) {
                            value = obj[param];

                            newParam = __performParametersSubstitutionRecursively(param);
                            newValue = __performParametersSubstitutionRecursively(value);

                            delete obj[param];
                            obj[newParam] = newValue;
                        }
                    }

                    return obj;
                }

                settings.data = __performParametersSubstitutionRecursively(settings.data);

            }
        },

        __performHeaderParametersSubstitutions: function (settings) {
            if (!$.isEmptyObject(settings.headers)) {
                function __performHeaderParametersSubstitution(str, param) {
                    var paramValue = settings.data[param] || settings.service_settings_data[param] || '';
                    if (settings.substitutedParams.indexOf(param) == -1) settings.substitutedParams.push(param);
                    return paramValue;
                }

                var param, value, newParam, newValue;

                for (param in settings.headers) {

                    // Skip our tiggzi header parameters
                    if ($.inArray(param, ["tiggzi-key", "tiggzi-rest", "tiggzi-proxy-url"]) > -1) continue;

                    value = settings.headers[param];

                    newParam = param.replace(this.paramPattern, __performHeaderParametersSubstitution);
                    newValue = value.replace(this.paramPattern, __performHeaderParametersSubstitution);

                    delete settings.headers[param];
                    settings.headers[newParam] = newValue;
                }
            }
        },

        __performURLSubstitutions: function (settings) {

            var urlBuffer;

            if (settings.headers && "tiggzi-proxy-url" in settings.headers) {
                urlBuffer = settings.headers["tiggzi-proxy-url"];
            } else if (settings.url) {
                urlBuffer = settings.url;
            }

            if (urlBuffer) {
                function __performURLSubstitution(str, param) {
                    var paramValue = settings.data[param] || settings.ssc_data[param] || settings.service_settings_data[param] || '';
                    if (settings.substitutedParams.indexOf(param) == -1) settings.substitutedParams.push(param);

                    if ($.isArray(paramValue)) {
                        paramValue = paramValue.join(',');
                    } else if (typeof paramValue == 'object') {
                        paramValue = JSON.stringify(paramValue);
                    }

                    return isEncoded ? encodeURIComponent(paramValue) : paramValue;
                }

                var urlPart = urlBuffer.indexOf('?') != -1 ? urlBuffer.substr(0, urlBuffer.indexOf('?')) : urlBuffer;
                var getParamsPart = urlBuffer.indexOf('?') != -1 ? urlBuffer.substr(urlBuffer.indexOf('?'), urlBuffer.length) : undefined;
                var isEncoded;

                isEncoded = false;
                urlPart = urlPart.replace(this.paramPattern, __performURLSubstitution);
                isEncoded = true;
                getParamsPart = getParamsPart && getParamsPart.replace(this.paramPattern, __performURLSubstitution);

                urlBuffer = urlPart + (getParamsPart ? getParamsPart : "");

                if (settings.headers && "tiggzi-proxy-url" in settings.headers) {
                    settings.headers["tiggzi-proxy-url"] = urlBuffer;
                } else if (settings.url) {
                    settings.url = urlBuffer;
                }
            }
        }
    });

    /**
     * @class
     */
    Tiggzi.GeolocationService = $t.createClass(null, /** @lends Tiggzi.GeolocationService.prototype */ {

        requestDefaults: {
            frequency: 3000
        },


        init: function (requestOptions) {
            this.__requestOptions = $.extend({}, requestOptions);
        },


        process: function (settings) {
            if (this.__requestOptions.echo) {
                settings.success(this.__requestOptions.echo);
                settings.complete('success');
            } else {
                showSpinner();
                var options = settings.data.options;
                options.watchPosition = options.watchPosition && options.watchPosition === 'true'; //Now "options.watchPosition" is boolean (not string)

                var geoFunction = options.watchPosition ? navigator.geolocation.watchPosition : navigator.geolocation.getCurrentPosition;

                if (options.watchPosition) {
                    options.frequency = options.frequency || this.requestDefaults.frequency;
                }

                geoFunction.call(navigator.geolocation,
                    function (position) {
                        if ($.browser.mozilla) {
                            //converting position object
                            var convertedPosition = {};
                            convertedPosition.coords = {};
                            convertedPosition.coords.accuracy = position.coords.accuracy;
                            convertedPosition.coords.altitude = position.coords.altitude;
                            convertedPosition.coords.altitudeAccuracy = position.coords.altitudeAccuracy;
                            convertedPosition.coords.heading = position.coords.heading;
                            convertedPosition.coords.latitude = position.coords.latitude;
                            convertedPosition.coords.longitude = position.coords.longitude;
                            convertedPosition.coords.speed = position.coords.speed;
                            convertedPosition.timestamp = position.coords.timestamp;
                            settings.success(convertedPosition);
                        } else {
                            settings.success(position);
                        }
                        settings.complete('success');
                        hideSpinner();
                    },
                    function (error) {
                        settings.error(error);
                        settings.complete('error');
                        hideSpinner();
                    },
                    settings.data.options);
            }
        }

    });

    /**
     * @class
     */
    Tiggzi.ContactsService = $t.createClass(null, /** @lends Tiggzi.ContactsService.prototype */ {


        init: function (requestOptions) {
            this.__requestOptions = $.extend({}, requestOptions);
        },


        process: function (settings) {
            if (this.__requestOptions.echo) {
                settings.success(this.__requestOptions.echo);
                settings.complete('success');
            } else {
                showSpinner();
                navigator.contacts.find(settings.data.params.fields.split(' '),
                    function (contacts) {
                        settings.success(contacts);
                        settings.complete('success');
                        hideSpinner();
                    },
                    function (error) {
                        settings.error(error);
                        settings.complete('error');
                        hideSpinner();
                    },
                    settings.data.options);
            }
        }
    });

    /**
     * @class
     */
    Tiggzi.BarCodeService = $t.createClass(null, /** @lends Tiggzi.BarCodeService.prototype */ {


        init: function (requestOptions) {
            this.__requestOptions = $.extend({}, requestOptions);
        },


        process: function (settings) {
            if (this.__requestOptions.echo) {
                settings.success(this.__requestOptions.echo);
                settings.complete('success');
            } else {
                window.plugins.barcodeScanner.scan(function (result) {
                        settings.success(JSON.stringify(result));
                        settings.complete('success');
                    }, function (error) {
                        settings.error(error);
                        settings.complete('error');
                    }
                );
            }
        }

    });

    /**
     * @class
     */
    Tiggzi.CameraService = $t.createClass(null, /** @lends Tiggzi.CameraService.prototype */ {

        init: function (requestOptions) {
            //Ignore component properties (quality, width, height ...) Its will be read from responseMapping
            this.__requestOptions = {};
        },

        /* TODO jsdoc
         * Note: "encodingTypes", "destinationTypes", "sourceTypes" are constants
         * But it's impossible to move this object outside of function scope
         * because class Camera is not defined when tiggzi.js is parsed.
         */
        getEncodingType: function (strType) {
            var encodingTypes = {"JPEG": Camera.EncodingType.JPEG,
                "PNG": Camera.EncodingType.PNG};

            if (strType in encodingTypes)
                return encodingTypes[strType];
            else
                return Camera.EncodingType.JPEG;
        },


        getDestinationType: function (strType) {
            var destinationTypes = { "Data URL": Camera.DestinationType.DATA_URL,
                "File URI": Camera.DestinationType.FILE_URI };

            if (strType in destinationTypes)
                return destinationTypes[strType];
            else
                return Camera.DestinationType.DATA_URL;
        },

        getSourceType: function (strType) {
            var sourceTypes = { "Photolibrary": Camera.PictureSourceType.PHOTOLIBRARY,
                "Camera": Camera.PictureSourceType.CAMERA,
                "Saved photo album": Camera.PictureSourceType.SAVEDPHOTOALBUM};

            if (strType in sourceTypes)
                return sourceTypes[strType];
            else
                return Camera.PictureSourceType.CAMERA;
        },

        //This method parses options recieved by camera service.
        //Options are converted from string to appropriate type.
        getRequestOptions: function (data) {
            var options = {};
            options['quality'] = parseInt(data.quality) || 80;
            options['destinationType'] = this.getDestinationType(data.destinationType);
            options['sourceType'] = this.getSourceType(data.sourcetype);
            options['allowEdit'] = (data.allowedit === 'true');
            options['encodingType'] = this.getEncodingType(data.encodingType);
            options['targetWidth'] = parseInt(data.targetWidth) || 1024;
            options['targetHeight'] = parseInt(data.targetHeight) || 768;

            return options;
        },

        process: function (settings) {
            this.__requestOptions = this.getRequestOptions(settings.data);
            var requestOptions = this.__requestOptions;
            if (this.__requestOptions.echo) {
                settings.success(this.__requestOptions.echo);
                settings.complete('success');
            } else {
                navigator.camera.getPicture(
                    function (imageData) {
                        if (requestOptions.destinationType == Camera.DestinationType.DATA_URL) {
                            settings.success({ 'imageDataBase64': "data:image/jpeg;base64," + imageData });
                        }
                        else {
                            settings.success({ 'imageURI': imageData });
                        }
                        settings.complete('success');
                    },
                    function (error) {
                        settings.error(error);
                        settings.complete('error');
                    },
                    this.__requestOptions);
            }
        }

    });

    /**
     * @class
     */
    Tiggzi.TiggziWrapper = $t.TiggrWrapper = $t.createClass(null, /** @lends Tiggzi.TiggziWrapper.prototype */ {
        init: function (componentId, options) {
            this.__element = $('[dsid="' + componentId + '"]:eq(0)');
            this.__element.options = options;
        },
        setProperty: function (name, value) {
            if (this.__element.hasOwnProperty(name)) {
                this.__element[name] = value;
                return;
            }
            if (this.__element.hasOwnProperty("setProperty")) {
                this.setProperty(name, value);
                return;
            }
            this.__element.attr(name, value);
        },
        refresh: function () {
            if (this.__element.hasOwnProperty("refresh")) {
                this.__element.refresh();
            }
        }
    });

    /**
     * @class
     */
    Tiggzi.TiggziMapComponent = $t.TiggrMapComponent = $t.createClass($t.TiggziWrapper, /** @lends Tiggzi.TiggziMapComponent.prototype */ {
        init: function (componentId, options) {
            this.constructor.$super.init(componentId, options);
            this.isInitialized = false;
            this.options = options;
            this.options.mapElement = this.constructor.$super.__element;
            this.__element = this;
            this.geocoder = new google.maps.Geocoder();
            this.specifiedLocMarker = null;
            this.delayOptions = null;
            this.renderMap();
        },
        renderMap: function () {
            var _that = this;
            if (this.options.address != "") {
                //evaluate center coordinates from address
                this.geocoder.geocode({ 'address': this.options.address}, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        _that.options.latitude = results[0].geometry.location.lat();
                        _that.options.longitude = results[0].geometry.location.lng();
                        _that.initializeMapComponent();
                    } else {
                        console.log("Geocode was not successful for the following reason: " + status);
                    }
                });
                return;
            }
            this.initializeMapComponent();
        },
        initializeMapComponent: function () {
            this.isInitialized = false;
            var _that = this;
            mapCenter = new google.maps.LatLng(this.options.latitude, this.options.longitude);
            this.options.mapElement.gmap({
                'center': mapCenter,
                'zoom': this.options.zoom
            }).bind('init', function (evt, map) {
                    _that.gmap = map;
                    _that.isInitialized = true;

                    if (_that.delayOptions != null) {
                        $.extend(_that.options, _that.delayOptions);
                        _that.delayOptions = null;
                        _that.refresh();
                    } else {
                        _that.renderMarkers();
                    }


                });
        },
        renderSpecifiedLocationMarker: function () {
            //Setting specified location marker if enabled
            if (this.isInitialized) {
                if (this.options.showLocationMarker) {
                    if (typeof(this.options.showLocationMarker) == "string") {
                        switch (this.options.showLocationMarker.toLowerCase()) {
                            case "true":
                            case "yes":
                            case "1":
                                this.options.showLocationMarker = true;
                                break;
                            default:
                                this.options.showLocationMarker = false;
                        }
                    }
                    if (this.options.showLocationMarker) {
                        specifiedLoc = new google.maps.LatLng(this.options.latitude, this.options.longitude);
                        this.specifiedLocMarker = new google.maps.Marker({
                            'position': specifiedLoc,
                            'title': "Specified location"
                        });
                        this.options.mapElement.gmap('addMarker', this.specifiedLocMarker);
                    }
                }
            } else {
                console.log("Is not initialized yet, please try again later");
            }
        },
        renderMarkers: function () {
            if (this.isInitialized) {
                var _that = this;
                this.options.mapElement.gmap("clear", "markers");
                this.renderSpecifiedLocationMarker();

                $("[dsid=" + this.options.markerSourceName + "] li").each(function (index) {
                    isRenderedmarker = $(this).attr("rendered") ? $(this).attr("rendered") : "true";

                    if (isRenderedmarker == "true") {
                        lat = $(this).attr("latitude") ? $(this).attr("latitude") : $(this).find("[req]").attr("latitude");
                        longt = $(this).attr("longitude") ? $(this).attr("longitude") : $(this).find("[req]").attr("longitude");
                        title = $(this).attr("text") ? $(this).attr("text") : $(this).find("[req]").attr("text");
                        address = $(this).attr("address") ? $(this).attr("address") : $(this).find("[req]").attr("address");
                        showInfoWindow = $(this).attr("show_info") ? $(this).attr("show_info") : $(this).find("[req]").attr("show_info");
                        markerName = $(this).attr("name");
                        var marker = new google.maps.Marker({
                            'title': title
                        });
                        if (showInfoWindow == "true") {
                            var infoWindowContent = "";
                            //rendering info window
                            tagName = $(this).get(0).tagName;
                            if ((tagName == "LI") || (tagName == "OI")) {
                                //$(this).wrapInner("<div style='display:block'/>");
                                infoWindowContent = $(this).html();
                            } else {
                                if ($(this).parent().children().size() > 1) {
                                    $(this).wrap("<div/>");
                                }
                                $(this).css('display', 'block');
                                infoWindowContent = $(this).parent().html();
                                $(this).css('display', 'none');
                            }

                            var iw = new google.maps.InfoWindow({
                                content: infoWindowContent
                            });
                            google.maps.event.addListener(marker, "click", function (e) {
                                iw.open(_that.gmap, this);
                            });
                            iw.tiggziMarkerName = markerName;

                            google.maps.event.addListener(iw, 'domready', function () {
                                $("[name=" + iw.tiggziMarkerName + "_infoWindowContent]").parent().parent().css("overflow", "");
                                $("[name=" + iw.tiggziMarkerName + "_infoWindowContent]").parent().css("overflow", "");
                            });
                        }
                        //if marker address specified then geocode address
                        if (address != "") {
                            _that.geocoder.geocode({ 'address': address}, function (results, status) {
                                if (status == google.maps.GeocoderStatus.OK) {
                                    lat = results[0].geometry.location.lat();
                                    longt = results[0].geometry.location.lng();
                                    var markerPosition = new google.maps.LatLng(lat, longt);
                                    marker.setPosition(markerPosition);
                                    _that.options.mapElement.gmap('addMarker', marker);
                                } else {
                                    console.log("Geocode was not successful for the following reason: " + status);
                                }
                            });
                        } else if (lat != "" && longt != "") {
                            var markerPosition = new google.maps.LatLng(lat, longt);
                            marker.setPosition(markerPosition);
                            _that.options.mapElement.gmap('addMarker', marker);
                        }

                    }
                });
            } else {
                console.log("Is not initialized yet, please try again later");
            }
        },


        setProperty: function (name, value) {
            if (this.isInitialized) {
                if (this.gmap.hasOwnProperty(name)) {
                    this.gmap.set(name, value);
                } else {
                    if (this.options.hasOwnProperty(name)) {
                        this.options[name] = value;
                    }
                }
            } else {
                if (this.options.hasOwnProperty(name)) {
                    if (this.delayOptions == null) {
                        this.delayOptions = {};
                    }
                    this.delayOptions[name] = value;
                }
            }
        },


        __setAttribute: function (name, value) {
            this.setProperty(name, value);
        },


        attr: function (name, value) {
            this.setProperty(name, value);
        },


        setAttr: function (name, value) {
            this.setProperty(name, value);
        },


        getAttr: function (attrName) {
            return this.options[attrName];
        },


        refresh: function () {
            if (this.isInitialized) {
                _that = this;
                if (this.options.address != "") {
                    this.geocoder.geocode({ 'address': this.options.address}, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            _that.options.latitude = results[0].geometry.location.lat();
                            _that.options.longitude = results[0].geometry.location.lng();
                            _that.gmap.set("center", new google.maps.LatLng(_that.options.latitude, _that.options.longitude));
                            _that.renderMarkers();
                            _that.options.mapElement.gmap('refresh');
                        } else {
                            console.log("Geocode was not successful for the following reason: " + status);
                        }
                    });
                } else {
                    this.gmap.set("center", new google.maps.LatLng(this.options.latitude, this.options.longitude));
                    //refresh markers
                    this.renderMarkers();
                    this.options.mapElement.gmap('refresh');
                }
            } else {
                console.log("Cannot refresh, map is not initialized!");
            }
        },


        get: function (index) {
            if (index != undefined) {
                return this.options.mapElement.get(index);
            }
        }
    });

    /**
     * @class
     */
    Tiggzi.TiggziMobileCarouselComponent = $t.TiggrMobileCarouselComponent = $t.createClass($t.TiggziWrapper, /** @lends Tiggzi.TiggziMobileCarouselComponent.prototype */ {


        init: function (componentId, options) {
            //this.constructor.$super.init(componentId,options);
            this.carouselRoot = $('#' + componentId);
            this.carouselRootId = this.carouselRoot.attr("id");
            this.__element = this;
            this.initializeCarousel();
        },


        initializeCarousel: function () {
            var _that = this;
            $("#" + Tiggzi.CurrentScreen).bind("pageshow", function () {
                if ($("#" + _that.carouselRootId + " .carouselcontainer .carouselCircle").length) return;
                if (_that.carouselRoot.find('[data-carousel="true"]').size() == 1) {
                    if ($("#" + _that.carouselRootId + " .carouselitem:visible").size() == 0) {
                        return;
                    }
                    _that.carouselRoot.find('[data-carousel="true"]').carousel('refresh');
                    _that.correctComponentDimensions(_that.carouselRootId);
                }
            });
        },


        correctComponentDimensions: function (componentRootId) {
            var screen_width = screen.width;
            var items = $("#" + componentRootId + " .carouselitem:visible");
            var maxHeight = items.height();
            for (var i = 0; i < items.length; i++) {
                if (items.eq(i).height() > maxHeight) {
                    maxHeight = items.eq(i).height();
                }
                items.eq(i).css('left', i * $("#" + Tiggzi.CurrentScreen + " [data-role='content']").outerWidth() + 'px');
            }
            $("#" + componentRootId).height(maxHeight + 10);
            $("#" + componentRootId + " .carouselcontainer").height(maxHeight + 10);

            if ($("#" + componentRootId).width() > screen_width) {
                outerWidthDiff = $("[data-role='content']").outerWidth() - $("[data-role='content']").width();
                $("#" + componentRootId).width(screen_width - outerWidthDiff);
            }
            $("#" + componentRootId + " .carouselcontainer").width($("#" + componentRootId).width());
            circles = $("#" + componentRootId + " .carouselcontainer .carouselCircle");
            for (var i = 0, len = circles.length; i < len; i++) {
                circlesWidth = len * 15;
                pointOffset = $("#" + componentRootId + " .carouselcontainer").width() - circlesWidth;
                left = pointOffset / 2 + i * 15;
                $(circles[i]).css('left', left + 'px');
            }
        },


        refresh: function () {
            console.log("carousel refresh");
            if (this.carouselRoot.find('[data-carousel="true"]').size() == 1) {
                this.carouselRoot.find('[data-carousel="true"]').carousel("refresh");
                this.correctComponentDimensions(this.carouselRootId);
            }
        }
    });

    /**
     * @class
     */
    Tiggzi.TiggziMobileDatePickerComponent = $t.TiggrMobileDatePickerComponent = $t.createClass($t.TiggziWrapper, /** @lends Tiggzi.TiggziMobileDatePickerComponent.prototype */ {


        init: function (componentId, options) {
            this.datepicker_selector = "#" + componentId;
            this.datepicker_openButtonSelector = this.datepicker_selector + " .datepickeropenbutton";
            this.datepicker_calendarConteinerSelector = this.datepicker_selector + " .datePickerControls";
            this.datepicker_inputSelector = this.datepicker_selector + " input";
            this.datepicker_controlsContainerSelector = this.datepicker_selector + " .datePickerControls";
            this.datepicker_existDatePickerSelector = this.datepicker_selector + " .hasDatepicker";
            this.datepicker_dataPickerOptions = options;
            this.calendarscrollcontainerselector = this.datepicker_selector + " .calendarscroll";
            this.__element = this;
            this.initializeDataPicker();
        },

        initializeDataPicker: function () {
            // Correct Datepicker width
            var _that = this;

            if (this.datepicker_dataPickerOptions.defaultDate != undefined) {
                this.datepicker_dataPickerOptions.defaultDate = $.datepicker.formatDate(this.datepicker_dataPickerOptions.dateFormat, new Date(this.datepicker_dataPickerOptions.defaultDate));
                //Setting formatted defaultDate to input
                $(this.datepicker_inputSelector).val(this.datepicker_dataPickerOptions.defaultDate);
            } else {
                this.datepicker_dataPickerOptions.defaultDate = $.datepicker.formatDate(this.datepicker_dataPickerOptions.dateFormat, new Date());
            }
            //register input change action
            $(this.datepicker_inputSelector).change(
                function () {
                    _that.setProperty("defaultDateValue", $(this).val());
                });

            //register open calendar action
            $(this.datepicker_openButtonSelector).unbind("click").bind("click", function () {
                _that.datepicker_dataPickerOptions.onSelect = function (dateText, inst) {
                    $(_that.datepicker_inputSelector).trigger("change");
                    /* see ETST-8518 */
                    _that.setProperty("defaultDateValue", dateText);
                    $(this).datepicker("destroy");
                    $(_that.calendarscrollcontainerselector).remove();

                }
                _that.datepicker_dataPickerOptions.altField = _that.datepicker_inputSelector;
                //creates datePicker
                if ($(_that.datepicker_existDatePickerSelector).size() == 0) {
                    if (_that.datepicker_dataPickerOptions.defaultDate == undefined || _that.datepicker_dataPickerOptions.defaultDate == "") {
                        _that.datepicker_dataPickerOptions.defaultDate = $.datepicker.formatDate(datepicker_dataPickerOptions.dateFormat, new Date());
                    }
                    //save control panel width
                    var controlsContainerWidth = $(_that.datepicker_controlsContainerSelector).width();
                    //restore control panel width
                    $(_that.datepicker_controlsContainerSelector).width(controlsContainerWidth);
                    $(_that.datepicker_calendarConteinerSelector).after($("<div />").datepicker(_that.datepicker_dataPickerOptions));
                    datepicker_widthDiff = $(_that.datepicker_existDatePickerSelector + " .ui-datepicker-calendar").width() - $(_that.datepicker_existDatePickerSelector + " .ui-datepicker-header").width();
                    if (datepicker_widthDiff > 2) {
                        $(_that.datepicker_existDatePickerSelector).width($("[data-role='content']").width());
                        wrappedScrollComponent = '<div class="calendarscroll" style="overflow-x:scroll;width:' + $(_that.datepicker_selector).css("width") + '" />';
                        $(_that.datepicker_existDatePickerSelector).wrap(wrappedScrollComponent);
                    }
                } else {
                    $(_that.datepicker_existDatePickerSelector).datepicker("destroy");
                    $(_that.calendarscrollcontainerselector).remove();
                }
            });
        },


        setProperty: function (name, value) {
            if (name == "dateFormat") {
                //changing datepicker dateFormat
                try {
                    dtObject = $.datepicker.parseDate(this.datepicker_dataPickerOptions.dateFormat, this.datepicker_dataPickerOptions.defaultDate);
                    this.datepicker_dataPickerOptions.dateFormat = value;
                    dateFormattedValue = $.datepicker.formatDate(this.datepicker_dataPickerOptions.dateFormat, dtObject);
                    this.datepicker_dataPickerOptions.defaultDate = dateFormattedValue;
                    $(this.datepicker_inputSelector).val(dateFormattedValue);
                } catch (e) {
                    console.log("Error: Incorrect date format");
                    return;
                }
            }
            if (name == "defaultDateValue") {
                //setting new date
                try {
                    $.datepicker.parseDate(this.datepicker_dataPickerOptions.dateFormat, value);
                    this.datepicker_dataPickerOptions.defaultDate = value;
                    $(this.datepicker_inputSelector).val(value);
                } catch (e) {
                    console.log("Error: Input date must be in'" + this.datepicker_dataPickerOptions.dateFormat + "' format");
                    return;
                }

            }
        },

        __setAttribute: function (name, value) {
            this.setProperty(name, value);
        },


        setAttr: function (name, value) {
            this.setProperty(name, value);
        },


        attr: function (name, value) {
            if (value == undefined) {
                return this.getAttr(name);
            } else {
                this.setProperty(name, value);
            }
        },


        getAttr: function (attrName) {
            if (attrName == "defaultDateValue") {
                return this.datepicker_dataPickerOptions.defaultDate;
            } else {
                return this.datepicker_dataPickerOptions[attrName];
            }
        },


        getOptions: function () {
            return this.datepicker_dataPickerOptions;
        }
    });

    $t.screenStorage = new $t.createClass(null, $t.Storage);
    $t.persistentStorage = localStorage;

    try {
        if (window.location.href.search('file') === -1) {
            $t.applicationStorage = sessionStorage;
        }
    } catch (err) {
        console.error(err);
    }

    $t.adjustContentHeight = function () {
        if ($(window).width() >= 650) {
            var hh = $(".ui-header").outerHeight();
            hh = hh ? hh : 0;
            var fh = $(".ui-footer").outerHeight();
            fh = fh ? fh : 0;
            var h = window.innerHeight - hh - fh;
            $('.ui-content').height(h);
            $('.scroller').height(h);
        }
    };

    $t.adjustContentHeightWithPadding = function () {
        var hh = $("[data-role='page'] > .ui-header:visible").outerHeight() || 0;
        var fh = $("[data-role='page'] > .ui-footer:visible").outerHeight() || 0;
        var topPad = $("[data-role='page'] > .ui-content:visible").css('padding-top');
        var bottomPad = $("[data-role='page'] > .ui-content:visible").css('padding-bottom');
        topPad = topPad ? topPad.replace("px", "") : 0;
        bottomPad = bottomPad ? bottomPad.replace("px", "") : 0;
        var h = window.innerHeight - hh - fh - topPad - bottomPad;
        $("[data-role='page'] > .ui-content:visible").css('min-height', h);
    };


    /**
     * Loads specified page to as detail content in tablet (iPad) page layout
     * @param {string} pageUrl - page to be loaded
     */
    Tiggzi.setDetailContent = function (pageUrl) {
        // IPad template only has .content-primary and .content-secondary sections
        if ($("#" + Tiggzi.CurrentScreen + " .content-primary").length ||
            $(".ui-page-active .content-primary").length) {
            if (pageUrl.indexOf("#") == 0) {
                data = $(pageUrl);
                processResponce(data);
            } else {
                $.get(pageUrl, function (data) {
                    processResponce(data);
                });
            }
        } else {
            window.location = pageUrl;
        }


        function unwrapAndApply(selector, content) {
            var rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
            var rhead = /<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi;
            var oldContent = [];
            // Create a dummy div to hold the results
            var tmpDiv = jQuery("<div>");
            // inject the contents of the document in, removing the scripts
            // to avoid any 'Permission Denied' errors in IE
            if (typeof content == "object") {
                oldContent = jQuery(selector).find("div[data-role='page']");
                if (oldContent.length != 0) {
                    oldContent.hide();
                    $("body").append(oldContent);
                }
                tmpDiv.append(content);
            } else {
                tmpDiv.append(content.replace(rhead, ""));
            }
            window.primaryContentOnLoad = { id: tmpDiv.find("[data-role=page]").attr("id"), init: false };
            tmpDiv.find("div[data-role=header]").hide();
            tmpDiv.find("div[data-role=footer]").hide();
            jQuery(selector).html(tmpDiv);
            if (!tmpDiv.find("div[data-role='page']").hasClass('ui-page')) {
                tmpDiv.find("div[data-role='page']").addClass('ui-page');
                tmpDiv.find("div[data-role='page']").trigger("create");
                window.primaryContentOnLoad.init = true;
            }
            tmpDiv.find("div[data-role=page]").css('position', 'static');
            tmpDiv.find("div[data-role=page]").show();

            return tmpDiv.find(":jqmData(role='header')").children("h1, h2, h3, h4, h5, h6").text();
        };


        function processResponce(data) {
            var selector;
            if ($('.ui-page-active .content-primary').length == 1) {
                selector = ".ui-page-active .content-primary";
            } else {
                selector = "#" + Tiggzi.CurrentScreen + " .content-primary";
            }
            var pageTitle = unwrapAndApply(selector, data);
            if ($('.ui-scrollview-view:visible').length != 0) {
                if ($('.scroller:visible').data('scrollview') != undefined)
                    $('.scroller:visible').scrollview("scrollTo", 0, 0);
            }
            if (!pageTitle) {
                pageTitle = data.match(/<title[^>]*>([^<]*)/) && RegExp.$1;
            }
            //set title
            document.title = pageTitle;
            $("div[data-role='page']").children(":jqmData(role='header')").find(".ui-title").text(pageTitle);

            $('.content-primary input, .content-primary textarea').unbind('blur', adjustContentHeight);
            $('.content-primary input, .content-primary textarea').bind('blur', adjustContentHeight);

            if (window.primaryContentOnLoad) {
                if (window.primaryContentOnLoad.init)
                    eval(window.primaryContentOnLoad.id + "_js()");
                eval(window.primaryContentOnLoad.id + "_js(true)");
                $("#" + window.primaryContentOnLoad.id).triggerHandler('pageshow');
                window.primaryContentOnLoad = undefined;
            }
        }
    };

    /**
     * Programmatically changes from one page to specified
     *
     * @param {string} outcome - page name
     * @param {Object<String, Object>} options - exactly the same object as is required by jQuery.mobile.changePage method
     * @see The <a href="http://jquerymobile.com/test/docs/api/methods.html">JQM API methods</a>.
     */
    Tiggzi.navigateTo = function (outcome, options) {
        for (i = 0; i < this.AppPages.length; i++) {
            if (this.AppPages[i].name == outcome) {
                if (options) {
                    if (typeof options != 'object') {
                        $.mobile.changePage(this.AppPages[i].location);
                    } else {
                        $.mobile.changePage(this.AppPages[i].location, options);
                    }
                } else {
                    window.location = this.AppPages[i].location;
                }
            }
        }
    };

    /**
     * Getting uploaded image URL by it's name. Works both on tiggzi.com and in built mobile app.
     * @param {string} imageName uploaded image name (with extension)
     * @return {string} image URL
     */
    Tiggzi.getImagePath = function (imageName) {
        if (Tiggzi.env == 'web') {
            return location.protocol + '//' + location.hostname + (location.port == "" ? "" : (":" + location.port)) +
                '/views/' + location.pathname.split('\/')[2] + '/image/' +
                this.__URLEncodeSpecial(this.__URLEncodeSpecial(imageName));
        } else {
            return 'files/views/assets/image/' + this.__URLEncodeSpecial(this.__URLEncodeSpecial(imageName));
        }
    };

    /**
     * Refreshes screen jQueryMobile components, audio and video elements.
     * @param {(string|Element)} screen - jQueryMobile screen id or screen DOM Element
     */
    Tiggzi.refreshScreenFormElements = function (screen) {
        var ctx;
        if (screen) {
            if (typeof screen == 'object') {
                ctx = $(screen);
            } else if (typeof screen == 'string') {
                ctx = $("#" + screen);
            }
        }

        if (!ctx) {
            ctx = $("body");
        }

        // JQM elements
        ctx.find("input[type='radio'], input[type='checkbox']").checkboxradio("refresh");
        ctx.find("input[data-type='range']").slider("refresh");
        ctx.find("select[data-role='slider']").change();
        ctx.find("div.ui-select select").selectmenu('refresh');
        ctx.find("ul[data-role='listview']:not([_idx]), ol[data-role='listview']:not([_idx])").listview('refresh');

        // html audio and video
        ctx.find("audio, video").load();
    };

    /**
     * Process all select menus and copy custom CSS class from &lt;select .../> tag to a JQM button
     * @param {(string|Element)} screen - jQueryMobile screen id or screen DOM Element
     */
    Tiggzi.processSelectMenu = function (screen) {
        var ctx;
        if (screen) {
            if (typeof screen == 'object') {
                ctx = $(screen);
            } else if (typeof screen == 'string') {
                ctx = $("#" + screen);
            }
        }
        ctx.find('.ui-select select').each(function () {
            var selectElement = $(this);
            var customClass = selectElement.attr('class');
            var tiggziDefaultClassName = selectElement.attr('tiggzi-class');
            var button = undefined;
            if (customClass != undefined && customClass.trim() != "") {
                //get select button depends on menu type
                if (selectElement.attr("data-native-menu") != undefined && selectElement.attr("data-native-menu") == "true") {
                    button = $(selectElement).parent();
                    //delete tiggzi component class from select button, if JQM already added it and menu type is 'native menu'
                    if (button.hasClass(tiggziDefaultClassName)) {
                        button.removeClass(tiggziDefaultClassName);
                    }
                } else {
                    button = $(selectElement).prev();
                }
                var selectMenuCSSClasees = customClass.split(" ");
                for (var i = 0; i < selectMenuCSSClasees.length; i++) {
                    if (selectMenuCSSClasees[i].indexOf(tiggziDefaultClassName) == -1 && selectMenuCSSClasees[i].trim() != "") {
                        if (!button.hasClass(selectMenuCSSClasees[i])) {
                            button.addClass(selectMenuCSSClasees[i]);
                        }
                    }
                }
            }
        });
    };

    $.fn.getAttr = function (attrName) {
        if (attrName == 'visible')
            return this.is(':visible');
        else if (attrName == "value" && this.attr('data-role') === "fieldcontain")
            return (function (el) {
                var arr = [];
                var ret = "";
                el.find(":checked").each(function (idx) {
                    arr.push($(this).val());
                });
                if (arr.length == 1)
                    ret = arr[0]
                else if (arr.length > 1)
                    ret = arr
                return ret;
            })(this);
        else if (this.children('.ui-checkbox').length)
            return this.find('input[type=checkbox]').attr(attrName)
        else if (this.children('.ui-radio').length)
            return this.find('input[type=radio]').attr(attrName)
        else
            return this.attr(attrName).trim();
    };

    $.fn.setAttr = function (attrName, value) {
        var el, checkedRadio;
        if (attrName == "visible") {
            if (value == "true" || value == "visible") {
                if (this.css("display") != "none") {
                    /* no need to show, it's already shown */
                } else {
                    var display = "block";
                    if (this.attr("data-role") == "button" && this.hasClass("ui-btn-inline")) display = "inline-block";
                    this.css("display", display);
                }
            } else if (value == "false" || value == "hidden") {
                if (this.css("display") == "none") {
                    /* no need to hide, it's already hidden */
                } else {
                    this.css("display", "none");
                }
            }
        } else {
            if (this.children('.ui-checkbox').length) {
                el = this.find('input[type=checkbox]:first').attr(attrName, value);
                if (attrName == "checked") el.refresh();
            } else if (this.children('.ui-radio').length) {
                if (attrName == "checked") {
                    checkedRadio = this.closest(".ui-controlgroup-controls").find("input[type='radio']:checked");
                    el = this.find('input[type=radio]:first');
                    checkedRadio.removeAttr("checked").refresh();
                    el.attr(attrName, value).refresh();
                } else {
                    this.find('input[type=radio]:first').attr(attrName, value);
                }
            } else if (this.attr('data-role') === 'slider' && attrName == 'value') {
                var val;
                var bool = false;
                if (typeof value != "string") bool = Boolean(value)
                else if (["on", "true"].indexOf(value.toLowerCase()) != -1) bool = true;
                val = bool ? "on" : "off";
                this.val(val);
                this.refresh();
            } else {
                this.attr(attrName, value);
            }
        }

        return this;
    };

    $.fn.setText = function (str) {
        if (this.length > 0) {
            if (this.attr('data-role') && this.attr('data-role') == 'button')
                this.find('.ui-btn-text:first').text(str)
            else if (this.children('.ui-radio').length)
                this.find('.ui-btn-text:first').text(str)
            else if (this.children('.ui-checkbox').length)
                this.find('.ui-btn-text:first').text(str)
            else if (this.hasClass('ui-collapsible-heading'))
                this.find('.ui-btn-text:first').text(str)
            else if (this[0].tagName == "OPTION") {
                this.text(str)
            } else {
                this.html(String(str));
            }
        }
        return this;
    };

    $.fn.copyCSS = function (source) {
        var dom = $(source).get(0);
        var style;
        var dest = {};
        if (window.getComputedStyle) {
            var camelize = function (a, b) {
                return b.toUpperCase();
            };
            style = window.getComputedStyle(dom, null);
            for (var i = 0, l = style.length; i < l; i++) {
                var prop = style[i];
                var camel = prop.replace(/\-([a-z])/g, camelize);
                var val = style.getPropertyValue(prop);
                dest[camel] = val;
            }
            return this.css(dest);
        }
        if (style = dom.currentStyle) {
            for (var prop in style) {
                dest[prop] = style[prop];
            }
            return this.css(dest);
        }
        if (style = dom.style) {
            for (var prop in style) {
                if (typeof style[prop] != 'function') {
                    dest[prop] = style[prop];
                }
            }
        }
        return this.css(dest);
    };

}(jQuery));
