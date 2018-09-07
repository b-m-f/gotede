(function (fs,pathModule,util,assert,events,stream,readline,crypto,string_decoder,os) {
	'use strict';

	fs = fs && fs.hasOwnProperty('default') ? fs['default'] : fs;
	pathModule = pathModule && pathModule.hasOwnProperty('default') ? pathModule['default'] : pathModule;
	util = util && util.hasOwnProperty('default') ? util['default'] : util;
	assert = assert && assert.hasOwnProperty('default') ? assert['default'] : assert;
	events = events && events.hasOwnProperty('default') ? events['default'] : events;
	stream = stream && stream.hasOwnProperty('default') ? stream['default'] : stream;
	readline = readline && readline.hasOwnProperty('default') ? readline['default'] : readline;
	crypto = crypto && crypto.hasOwnProperty('default') ? crypto['default'] : crypto;
	string_decoder = string_decoder && string_decoder.hasOwnProperty('default') ? string_decoder['default'] : string_decoder;
	os = os && os.hasOwnProperty('default') ? os['default'] : os;

	var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function commonjsRequire () {
		throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
	}

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var utils = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;
	exports.extend = extend;
	exports.indexOf = indexOf;
	exports.escapeExpression = escapeExpression;
	exports.isEmpty = isEmpty;
	exports.createFrame = createFrame;
	exports.blockParams = blockParams;
	exports.appendContextPath = appendContextPath;
	var escape = {
	  '&': '&amp;',
	  '<': '&lt;',
	  '>': '&gt;',
	  '"': '&quot;',
	  "'": '&#x27;',
	  '`': '&#x60;',
	  '=': '&#x3D;'
	};

	var badChars = /[&<>"'`=]/g,
	    possible = /[&<>"'`=]/;

	function escapeChar(chr) {
	  return escape[chr];
	}

	function extend(obj /* , ...source */) {
	  for (var i = 1; i < arguments.length; i++) {
	    for (var key in arguments[i]) {
	      if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
	        obj[key] = arguments[i][key];
	      }
	    }
	  }

	  return obj;
	}

	var toString = Object.prototype.toString;

	exports.toString = toString;
	// Sourced from lodash
	// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
	/* eslint-disable func-style */
	var isFunction = function isFunction(value) {
	  return typeof value === 'function';
	};
	// fallback for older versions of Chrome and Safari
	/* istanbul ignore next */
	if (isFunction(/x/)) {
	  exports.isFunction = isFunction = function (value) {
	    return typeof value === 'function' && toString.call(value) === '[object Function]';
	  };
	}
	exports.isFunction = isFunction;

	/* eslint-enable func-style */

	/* istanbul ignore next */
	var isArray = Array.isArray || function (value) {
	  return value && typeof value === 'object' ? toString.call(value) === '[object Array]' : false;
	};

	exports.isArray = isArray;
	// Older IE versions do not directly support indexOf so we must implement our own, sadly.

	function indexOf(array, value) {
	  for (var i = 0, len = array.length; i < len; i++) {
	    if (array[i] === value) {
	      return i;
	    }
	  }
	  return -1;
	}

	function escapeExpression(string) {
	  if (typeof string !== 'string') {
	    // don't escape SafeStrings, since they're already safe
	    if (string && string.toHTML) {
	      return string.toHTML();
	    } else if (string == null) {
	      return '';
	    } else if (!string) {
	      return string + '';
	    }

	    // Force a string conversion as this will be done by the append regardless and
	    // the regex test will do this transparently behind the scenes, causing issues if
	    // an object's to string has escaped characters in it.
	    string = '' + string;
	  }

	  if (!possible.test(string)) {
	    return string;
	  }
	  return string.replace(badChars, escapeChar);
	}

	function isEmpty(value) {
	  if (!value && value !== 0) {
	    return true;
	  } else if (isArray(value) && value.length === 0) {
	    return true;
	  } else {
	    return false;
	  }
	}

	function createFrame(object) {
	  var frame = extend({}, object);
	  frame._parent = object;
	  return frame;
	}

	function blockParams(params, ids) {
	  params.path = ids;
	  return params;
	}

	function appendContextPath(contextPath, id) {
	  return (contextPath ? contextPath + '.' : '') + id;
	}

	});

	unwrapExports(utils);
	var utils_1 = utils.extend;
	var utils_2 = utils.indexOf;
	var utils_3 = utils.escapeExpression;
	var utils_4 = utils.isEmpty;
	var utils_5 = utils.createFrame;
	var utils_6 = utils.blockParams;
	var utils_7 = utils.appendContextPath;
	var utils_8 = utils.isFunction;
	var utils_9 = utils.isArray;

	var exception = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;

	var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

	function Exception(message, node) {
	  var loc = node && node.loc,
	      line = undefined,
	      column = undefined;
	  if (loc) {
	    line = loc.start.line;
	    column = loc.start.column;

	    message += ' - ' + line + ':' + column;
	  }

	  var tmp = Error.prototype.constructor.call(this, message);

	  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
	  for (var idx = 0; idx < errorProps.length; idx++) {
	    this[errorProps[idx]] = tmp[errorProps[idx]];
	  }

	  /* istanbul ignore else */
	  if (Error.captureStackTrace) {
	    Error.captureStackTrace(this, Exception);
	  }

	  try {
	    if (loc) {
	      this.lineNumber = line;

	      // Work around issue under safari where we can't directly set the column value
	      /* istanbul ignore next */
	      if (Object.defineProperty) {
	        Object.defineProperty(this, 'column', {
	          value: column,
	          enumerable: true
	        });
	      } else {
	        this.column = column;
	      }
	    }
	  } catch (nop) {
	    /* Ignore if the browser is very particular */
	  }
	}

	Exception.prototype = new Error();

	exports['default'] = Exception;
	module.exports = exports['default'];

	});

	unwrapExports(exception);

	var blockHelperMissing = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;



	exports['default'] = function (instance) {
	  instance.registerHelper('blockHelperMissing', function (context, options) {
	    var inverse = options.inverse,
	        fn = options.fn;

	    if (context === true) {
	      return fn(this);
	    } else if (context === false || context == null) {
	      return inverse(this);
	    } else if (utils.isArray(context)) {
	      if (context.length > 0) {
	        if (options.ids) {
	          options.ids = [options.name];
	        }

	        return instance.helpers.each(context, options);
	      } else {
	        return inverse(this);
	      }
	    } else {
	      if (options.data && options.ids) {
	        var data = utils.createFrame(options.data);
	        data.contextPath = utils.appendContextPath(options.data.contextPath, options.name);
	        options = { data: data };
	      }

	      return fn(context, options);
	    }
	  });
	};

	module.exports = exports['default'];

	});

	unwrapExports(blockHelperMissing);

	var each = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }





	var _exception2 = _interopRequireDefault(exception);

	exports['default'] = function (instance) {
	  instance.registerHelper('each', function (context, options) {
	    if (!options) {
	      throw new _exception2['default']('Must pass iterator to #each');
	    }

	    var fn = options.fn,
	        inverse = options.inverse,
	        i = 0,
	        ret = '',
	        data = undefined,
	        contextPath = undefined;

	    if (options.data && options.ids) {
	      contextPath = utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
	    }

	    if (utils.isFunction(context)) {
	      context = context.call(this);
	    }

	    if (options.data) {
	      data = utils.createFrame(options.data);
	    }

	    function execIteration(field, index, last) {
	      if (data) {
	        data.key = field;
	        data.index = index;
	        data.first = index === 0;
	        data.last = !!last;

	        if (contextPath) {
	          data.contextPath = contextPath + field;
	        }
	      }

	      ret = ret + fn(context[field], {
	        data: data,
	        blockParams: utils.blockParams([context[field], field], [contextPath + field, null])
	      });
	    }

	    if (context && typeof context === 'object') {
	      if (utils.isArray(context)) {
	        for (var j = context.length; i < j; i++) {
	          if (i in context) {
	            execIteration(i, i, i === context.length - 1);
	          }
	        }
	      } else {
	        var priorKey = undefined;

	        for (var key in context) {
	          if (context.hasOwnProperty(key)) {
	            // We're running the iterations one step out of sync so we can detect
	            // the last iteration without have to scan the object twice and create
	            // an itermediate keys array.
	            if (priorKey !== undefined) {
	              execIteration(priorKey, i - 1);
	            }
	            priorKey = key;
	            i++;
	          }
	        }
	        if (priorKey !== undefined) {
	          execIteration(priorKey, i - 1, true);
	        }
	      }
	    }

	    if (i === 0) {
	      ret = inverse(this);
	    }

	    return ret;
	  });
	};

	module.exports = exports['default'];

	});

	unwrapExports(each);

	var helperMissing = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }



	var _exception2 = _interopRequireDefault(exception);

	exports['default'] = function (instance) {
	  instance.registerHelper('helperMissing', function () /* [args, ]options */{
	    if (arguments.length === 1) {
	      // A missing field in a {{foo}} construct.
	      return undefined;
	    } else {
	      // Someone is actually trying to call something, blow up.
	      throw new _exception2['default']('Missing helper: "' + arguments[arguments.length - 1].name + '"');
	    }
	  });
	};

	module.exports = exports['default'];

	});

	unwrapExports(helperMissing);

	var _if = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;



	exports['default'] = function (instance) {
	  instance.registerHelper('if', function (conditional, options) {
	    if (utils.isFunction(conditional)) {
	      conditional = conditional.call(this);
	    }

	    // Default behavior is to render the positive path if the value is truthy and not empty.
	    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
	    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
	    if (!options.hash.includeZero && !conditional || utils.isEmpty(conditional)) {
	      return options.inverse(this);
	    } else {
	      return options.fn(this);
	    }
	  });

	  instance.registerHelper('unless', function (conditional, options) {
	    return instance.helpers['if'].call(this, conditional, { fn: options.inverse, inverse: options.fn, hash: options.hash });
	  });
	};

	module.exports = exports['default'];

	});

	unwrapExports(_if);

	var log = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;

	exports['default'] = function (instance) {
	  instance.registerHelper('log', function () /* message, options */{
	    var args = [undefined],
	        options = arguments[arguments.length - 1];
	    for (var i = 0; i < arguments.length - 1; i++) {
	      args.push(arguments[i]);
	    }

	    var level = 1;
	    if (options.hash.level != null) {
	      level = options.hash.level;
	    } else if (options.data && options.data.level != null) {
	      level = options.data.level;
	    }
	    args[0] = level;

	    instance.log.apply(instance, args);
	  });
	};

	module.exports = exports['default'];

	});

	unwrapExports(log);

	var lookup = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;

	exports['default'] = function (instance) {
	  instance.registerHelper('lookup', function (obj, field) {
	    return obj && obj[field];
	  });
	};

	module.exports = exports['default'];

	});

	unwrapExports(lookup);

	var _with = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;



	exports['default'] = function (instance) {
	  instance.registerHelper('with', function (context, options) {
	    if (utils.isFunction(context)) {
	      context = context.call(this);
	    }

	    var fn = options.fn;

	    if (!utils.isEmpty(context)) {
	      var data = options.data;
	      if (options.data && options.ids) {
	        data = utils.createFrame(options.data);
	        data.contextPath = utils.appendContextPath(options.data.contextPath, options.ids[0]);
	      }

	      return fn(context, {
	        data: data,
	        blockParams: utils.blockParams([context], [data && data.contextPath])
	      });
	    } else {
	      return options.inverse(this);
	    }
	  });
	};

	module.exports = exports['default'];

	});

	unwrapExports(_with);

	var helpers = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;
	exports.registerDefaultHelpers = registerDefaultHelpers;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }



	var _helpersBlockHelperMissing2 = _interopRequireDefault(blockHelperMissing);



	var _helpersEach2 = _interopRequireDefault(each);



	var _helpersHelperMissing2 = _interopRequireDefault(helperMissing);



	var _helpersIf2 = _interopRequireDefault(_if);



	var _helpersLog2 = _interopRequireDefault(log);



	var _helpersLookup2 = _interopRequireDefault(lookup);



	var _helpersWith2 = _interopRequireDefault(_with);

	function registerDefaultHelpers(instance) {
	  _helpersBlockHelperMissing2['default'](instance);
	  _helpersEach2['default'](instance);
	  _helpersHelperMissing2['default'](instance);
	  _helpersIf2['default'](instance);
	  _helpersLog2['default'](instance);
	  _helpersLookup2['default'](instance);
	  _helpersWith2['default'](instance);
	}

	});

	unwrapExports(helpers);
	var helpers_1 = helpers.registerDefaultHelpers;

	var inline = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;



	exports['default'] = function (instance) {
	  instance.registerDecorator('inline', function (fn, props, container, options) {
	    var ret = fn;
	    if (!props.partials) {
	      props.partials = {};
	      ret = function (context, options) {
	        // Create a new partials stack frame prior to exec.
	        var original = container.partials;
	        container.partials = utils.extend({}, original, props.partials);
	        var ret = fn(context, options);
	        container.partials = original;
	        return ret;
	      };
	    }

	    props.partials[options.args[0]] = options.fn;

	    return ret;
	  });
	};

	module.exports = exports['default'];

	});

	unwrapExports(inline);

	var decorators = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;
	exports.registerDefaultDecorators = registerDefaultDecorators;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }



	var _decoratorsInline2 = _interopRequireDefault(inline);

	function registerDefaultDecorators(instance) {
	  _decoratorsInline2['default'](instance);
	}

	});

	unwrapExports(decorators);
	var decorators_1 = decorators.registerDefaultDecorators;

	var logger_1 = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;



	var logger = {
	  methodMap: ['debug', 'info', 'warn', 'error'],
	  level: 'info',

	  // Maps a given level value to the `methodMap` indexes above.
	  lookupLevel: function lookupLevel(level) {
	    if (typeof level === 'string') {
	      var levelMap = utils.indexOf(logger.methodMap, level.toLowerCase());
	      if (levelMap >= 0) {
	        level = levelMap;
	      } else {
	        level = parseInt(level, 10);
	      }
	    }

	    return level;
	  },

	  // Can be overridden in the host environment
	  log: function log(level) {
	    level = logger.lookupLevel(level);

	    if (typeof console !== 'undefined' && logger.lookupLevel(logger.level) <= level) {
	      var method = logger.methodMap[level];
	      if (!console[method]) {
	        // eslint-disable-line no-console
	        method = 'log';
	      }

	      for (var _len = arguments.length, message = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	        message[_key - 1] = arguments[_key];
	      }

	      console[method].apply(console, message); // eslint-disable-line no-console
	    }
	  }
	};

	exports['default'] = logger;
	module.exports = exports['default'];

	});

	unwrapExports(logger_1);

	var base = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;
	exports.HandlebarsEnvironment = HandlebarsEnvironment;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }





	var _exception2 = _interopRequireDefault(exception);







	var _logger2 = _interopRequireDefault(logger_1);

	var VERSION = '4.0.12';
	exports.VERSION = VERSION;
	var COMPILER_REVISION = 7;

	exports.COMPILER_REVISION = COMPILER_REVISION;
	var REVISION_CHANGES = {
	  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
	  2: '== 1.0.0-rc.3',
	  3: '== 1.0.0-rc.4',
	  4: '== 1.x.x',
	  5: '== 2.0.0-alpha.x',
	  6: '>= 2.0.0-beta.1',
	  7: '>= 4.0.0'
	};

	exports.REVISION_CHANGES = REVISION_CHANGES;
	var objectType = '[object Object]';

	function HandlebarsEnvironment(helpers$$1, partials, decorators$$1) {
	  this.helpers = helpers$$1 || {};
	  this.partials = partials || {};
	  this.decorators = decorators$$1 || {};

	  helpers.registerDefaultHelpers(this);
	  decorators.registerDefaultDecorators(this);
	}

	HandlebarsEnvironment.prototype = {
	  constructor: HandlebarsEnvironment,

	  logger: _logger2['default'],
	  log: _logger2['default'].log,

	  registerHelper: function registerHelper(name, fn) {
	    if (utils.toString.call(name) === objectType) {
	      if (fn) {
	        throw new _exception2['default']('Arg not supported with multiple helpers');
	      }
	      utils.extend(this.helpers, name);
	    } else {
	      this.helpers[name] = fn;
	    }
	  },
	  unregisterHelper: function unregisterHelper(name) {
	    delete this.helpers[name];
	  },

	  registerPartial: function registerPartial(name, partial) {
	    if (utils.toString.call(name) === objectType) {
	      utils.extend(this.partials, name);
	    } else {
	      if (typeof partial === 'undefined') {
	        throw new _exception2['default']('Attempting to register a partial called "' + name + '" as undefined');
	      }
	      this.partials[name] = partial;
	    }
	  },
	  unregisterPartial: function unregisterPartial(name) {
	    delete this.partials[name];
	  },

	  registerDecorator: function registerDecorator(name, fn) {
	    if (utils.toString.call(name) === objectType) {
	      if (fn) {
	        throw new _exception2['default']('Arg not supported with multiple decorators');
	      }
	      utils.extend(this.decorators, name);
	    } else {
	      this.decorators[name] = fn;
	    }
	  },
	  unregisterDecorator: function unregisterDecorator(name) {
	    delete this.decorators[name];
	  }
	};

	var log = _logger2['default'].log;

	exports.log = log;
	exports.createFrame = utils.createFrame;
	exports.logger = _logger2['default'];

	});

	unwrapExports(base);
	var base_1 = base.HandlebarsEnvironment;
	var base_2 = base.VERSION;
	var base_3 = base.COMPILER_REVISION;
	var base_4 = base.REVISION_CHANGES;
	var base_5 = base.log;
	var base_6 = base.createFrame;
	var base_7 = base.logger;

	var safeString = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;
	function SafeString(string) {
	  this.string = string;
	}

	SafeString.prototype.toString = SafeString.prototype.toHTML = function () {
	  return '' + this.string;
	};

	exports['default'] = SafeString;
	module.exports = exports['default'];

	});

	unwrapExports(safeString);

	var runtime = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;
	exports.checkRevision = checkRevision;
	exports.template = template;
	exports.wrapProgram = wrapProgram;
	exports.resolvePartial = resolvePartial;
	exports.invokePartial = invokePartial;
	exports.noop = noop;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	// istanbul ignore next

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }



	var Utils = _interopRequireWildcard(utils);



	var _exception2 = _interopRequireDefault(exception);



	function checkRevision(compilerInfo) {
	  var compilerRevision = compilerInfo && compilerInfo[0] || 1,
	      currentRevision = base.COMPILER_REVISION;

	  if (compilerRevision !== currentRevision) {
	    if (compilerRevision < currentRevision) {
	      var runtimeVersions = base.REVISION_CHANGES[currentRevision],
	          compilerVersions = base.REVISION_CHANGES[compilerRevision];
	      throw new _exception2['default']('Template was precompiled with an older version of Handlebars than the current runtime. ' + 'Please update your precompiler to a newer version (' + runtimeVersions + ') or downgrade your runtime to an older version (' + compilerVersions + ').');
	    } else {
	      // Use the embedded version info since the runtime doesn't know about this revision yet
	      throw new _exception2['default']('Template was precompiled with a newer version of Handlebars than the current runtime. ' + 'Please update your runtime to a newer version (' + compilerInfo[1] + ').');
	    }
	  }
	}

	function template(templateSpec, env) {
	  /* istanbul ignore next */
	  if (!env) {
	    throw new _exception2['default']('No environment passed to template');
	  }
	  if (!templateSpec || !templateSpec.main) {
	    throw new _exception2['default']('Unknown template object: ' + typeof templateSpec);
	  }

	  templateSpec.main.decorator = templateSpec.main_d;

	  // Note: Using env.VM references rather than local var references throughout this section to allow
	  // for external users to override these as psuedo-supported APIs.
	  env.VM.checkRevision(templateSpec.compiler);

	  function invokePartialWrapper(partial, context, options) {
	    if (options.hash) {
	      context = Utils.extend({}, context, options.hash);
	      if (options.ids) {
	        options.ids[0] = true;
	      }
	    }

	    partial = env.VM.resolvePartial.call(this, partial, context, options);
	    var result = env.VM.invokePartial.call(this, partial, context, options);

	    if (result == null && env.compile) {
	      options.partials[options.name] = env.compile(partial, templateSpec.compilerOptions, env);
	      result = options.partials[options.name](context, options);
	    }
	    if (result != null) {
	      if (options.indent) {
	        var lines = result.split('\n');
	        for (var i = 0, l = lines.length; i < l; i++) {
	          if (!lines[i] && i + 1 === l) {
	            break;
	          }

	          lines[i] = options.indent + lines[i];
	        }
	        result = lines.join('\n');
	      }
	      return result;
	    } else {
	      throw new _exception2['default']('The partial ' + options.name + ' could not be compiled when running in runtime-only mode');
	    }
	  }

	  // Just add water
	  var container = {
	    strict: function strict(obj, name) {
	      if (!(name in obj)) {
	        throw new _exception2['default']('"' + name + '" not defined in ' + obj);
	      }
	      return obj[name];
	    },
	    lookup: function lookup(depths, name) {
	      var len = depths.length;
	      for (var i = 0; i < len; i++) {
	        if (depths[i] && depths[i][name] != null) {
	          return depths[i][name];
	        }
	      }
	    },
	    lambda: function lambda(current, context) {
	      return typeof current === 'function' ? current.call(context) : current;
	    },

	    escapeExpression: Utils.escapeExpression,
	    invokePartial: invokePartialWrapper,

	    fn: function fn(i) {
	      var ret = templateSpec[i];
	      ret.decorator = templateSpec[i + '_d'];
	      return ret;
	    },

	    programs: [],
	    program: function program(i, data, declaredBlockParams, blockParams, depths) {
	      var programWrapper = this.programs[i],
	          fn = this.fn(i);
	      if (data || depths || blockParams || declaredBlockParams) {
	        programWrapper = wrapProgram(this, i, fn, data, declaredBlockParams, blockParams, depths);
	      } else if (!programWrapper) {
	        programWrapper = this.programs[i] = wrapProgram(this, i, fn);
	      }
	      return programWrapper;
	    },

	    data: function data(value, depth) {
	      while (value && depth--) {
	        value = value._parent;
	      }
	      return value;
	    },
	    merge: function merge(param, common) {
	      var obj = param || common;

	      if (param && common && param !== common) {
	        obj = Utils.extend({}, common, param);
	      }

	      return obj;
	    },
	    // An empty object to use as replacement for null-contexts
	    nullContext: Object.seal({}),

	    noop: env.VM.noop,
	    compilerInfo: templateSpec.compiler
	  };

	  function ret(context) {
	    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	    var data = options.data;

	    ret._setup(options);
	    if (!options.partial && templateSpec.useData) {
	      data = initData(context, data);
	    }
	    var depths = undefined,
	        blockParams = templateSpec.useBlockParams ? [] : undefined;
	    if (templateSpec.useDepths) {
	      if (options.depths) {
	        depths = context != options.depths[0] ? [context].concat(options.depths) : options.depths;
	      } else {
	        depths = [context];
	      }
	    }

	    function main(context /*, options*/) {
	      return '' + templateSpec.main(container, context, container.helpers, container.partials, data, blockParams, depths);
	    }
	    main = executeDecorators(templateSpec.main, main, container, options.depths || [], data, blockParams);
	    return main(context, options);
	  }
	  ret.isTop = true;

	  ret._setup = function (options) {
	    if (!options.partial) {
	      container.helpers = container.merge(options.helpers, env.helpers);

	      if (templateSpec.usePartial) {
	        container.partials = container.merge(options.partials, env.partials);
	      }
	      if (templateSpec.usePartial || templateSpec.useDecorators) {
	        container.decorators = container.merge(options.decorators, env.decorators);
	      }
	    } else {
	      container.helpers = options.helpers;
	      container.partials = options.partials;
	      container.decorators = options.decorators;
	    }
	  };

	  ret._child = function (i, data, blockParams, depths) {
	    if (templateSpec.useBlockParams && !blockParams) {
	      throw new _exception2['default']('must pass block params');
	    }
	    if (templateSpec.useDepths && !depths) {
	      throw new _exception2['default']('must pass parent depths');
	    }

	    return wrapProgram(container, i, templateSpec[i], data, 0, blockParams, depths);
	  };
	  return ret;
	}

	function wrapProgram(container, i, fn, data, declaredBlockParams, blockParams, depths) {
	  function prog(context) {
	    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	    var currentDepths = depths;
	    if (depths && context != depths[0] && !(context === container.nullContext && depths[0] === null)) {
	      currentDepths = [context].concat(depths);
	    }

	    return fn(container, context, container.helpers, container.partials, options.data || data, blockParams && [options.blockParams].concat(blockParams), currentDepths);
	  }

	  prog = executeDecorators(fn, prog, container, depths, data, blockParams);

	  prog.program = i;
	  prog.depth = depths ? depths.length : 0;
	  prog.blockParams = declaredBlockParams || 0;
	  return prog;
	}

	function resolvePartial(partial, context, options) {
	  if (!partial) {
	    if (options.name === '@partial-block') {
	      partial = options.data['partial-block'];
	    } else {
	      partial = options.partials[options.name];
	    }
	  } else if (!partial.call && !options.name) {
	    // This is a dynamic partial that returned a string
	    options.name = partial;
	    partial = options.partials[partial];
	  }
	  return partial;
	}

	function invokePartial(partial, context, options) {
	  // Use the current closure context to save the partial-block if this partial
	  var currentPartialBlock = options.data && options.data['partial-block'];
	  options.partial = true;
	  if (options.ids) {
	    options.data.contextPath = options.ids[0] || options.data.contextPath;
	  }

	  var partialBlock = undefined;
	  if (options.fn && options.fn !== noop) {
	    (function () {
	      options.data = base.createFrame(options.data);
	      // Wrapper function to get access to currentPartialBlock from the closure
	      var fn = options.fn;
	      partialBlock = options.data['partial-block'] = function partialBlockWrapper(context) {
	        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	        // Restore the partial-block from the closure for the execution of the block
	        // i.e. the part inside the block of the partial call.
	        options.data = base.createFrame(options.data);
	        options.data['partial-block'] = currentPartialBlock;
	        return fn(context, options);
	      };
	      if (fn.partials) {
	        options.partials = Utils.extend({}, options.partials, fn.partials);
	      }
	    })();
	  }

	  if (partial === undefined && partialBlock) {
	    partial = partialBlock;
	  }

	  if (partial === undefined) {
	    throw new _exception2['default']('The partial ' + options.name + ' could not be found');
	  } else if (partial instanceof Function) {
	    return partial(context, options);
	  }
	}

	function noop() {
	  return '';
	}

	function initData(context, data) {
	  if (!data || !('root' in data)) {
	    data = data ? base.createFrame(data) : {};
	    data.root = context;
	  }
	  return data;
	}

	function executeDecorators(fn, prog, container, depths, data, blockParams) {
	  if (fn.decorator) {
	    var props = {};
	    prog = fn.decorator(prog, props, container, depths && depths[0], data, blockParams, depths);
	    Utils.extend(prog, props);
	  }
	  return prog;
	}

	});

	unwrapExports(runtime);
	var runtime_1 = runtime.checkRevision;
	var runtime_2 = runtime.template;
	var runtime_3 = runtime.wrapProgram;
	var runtime_4 = runtime.resolvePartial;
	var runtime_5 = runtime.invokePartial;
	var runtime_6 = runtime.noop;

	var noConflict = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;

	exports['default'] = function (Handlebars) {
	  /* istanbul ignore next */
	  var root = typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : window,
	      $Handlebars = root.Handlebars;
	  /* istanbul ignore next */
	  Handlebars.noConflict = function () {
	    if (root.Handlebars === Handlebars) {
	      root.Handlebars = $Handlebars;
	    }
	    return Handlebars;
	  };
	};

	module.exports = exports['default'];

	});

	unwrapExports(noConflict);

	var handlebars_runtime = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	// istanbul ignore next

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }



	var base$$1 = _interopRequireWildcard(base);

	// Each of these augment the Handlebars object. No need to setup here.
	// (This is done to easily share code between commonjs and browse envs)



	var _handlebarsSafeString2 = _interopRequireDefault(safeString);



	var _handlebarsException2 = _interopRequireDefault(exception);



	var Utils = _interopRequireWildcard(utils);



	var runtime$$1 = _interopRequireWildcard(runtime);



	var _handlebarsNoConflict2 = _interopRequireDefault(noConflict);

	// For compatibility and usage outside of module systems, make the Handlebars object a namespace
	function create() {
	  var hb = new base$$1.HandlebarsEnvironment();

	  Utils.extend(hb, base$$1);
	  hb.SafeString = _handlebarsSafeString2['default'];
	  hb.Exception = _handlebarsException2['default'];
	  hb.Utils = Utils;
	  hb.escapeExpression = Utils.escapeExpression;

	  hb.VM = runtime$$1;
	  hb.template = function (spec) {
	    return runtime$$1.template(spec, hb);
	  };

	  return hb;
	}

	var inst = create();
	inst.create = create;

	_handlebarsNoConflict2['default'](inst);

	inst['default'] = inst;

	exports['default'] = inst;
	module.exports = exports['default'];

	});

	unwrapExports(handlebars_runtime);

	var ast = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;
	var AST = {
	  // Public API used to evaluate derived attributes regarding AST nodes
	  helpers: {
	    // a mustache is definitely a helper if:
	    // * it is an eligible helper, and
	    // * it has at least one parameter or hash segment
	    helperExpression: function helperExpression(node) {
	      return node.type === 'SubExpression' || (node.type === 'MustacheStatement' || node.type === 'BlockStatement') && !!(node.params && node.params.length || node.hash);
	    },

	    scopedId: function scopedId(path) {
	      return (/^\.|this\b/.test(path.original)
	      );
	    },

	    // an ID is simple if it only has one part, and that part is not
	    // `..` or `this`.
	    simpleId: function simpleId(path) {
	      return path.parts.length === 1 && !AST.helpers.scopedId(path) && !path.depth;
	    }
	  }
	};

	// Must be exported as an object rather than the root of the module as the jison lexer
	// must modify the object to operate properly.
	exports['default'] = AST;
	module.exports = exports['default'];

	});

	unwrapExports(ast);

	var parser = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;
	var handlebars = (function () {
	    var parser = { trace: function trace() {},
	        yy: {},
	        symbols_: { "error": 2, "root": 3, "program": 4, "EOF": 5, "program_repetition0": 6, "statement": 7, "mustache": 8, "block": 9, "rawBlock": 10, "partial": 11, "partialBlock": 12, "content": 13, "COMMENT": 14, "CONTENT": 15, "openRawBlock": 16, "rawBlock_repetition_plus0": 17, "END_RAW_BLOCK": 18, "OPEN_RAW_BLOCK": 19, "helperName": 20, "openRawBlock_repetition0": 21, "openRawBlock_option0": 22, "CLOSE_RAW_BLOCK": 23, "openBlock": 24, "block_option0": 25, "closeBlock": 26, "openInverse": 27, "block_option1": 28, "OPEN_BLOCK": 29, "openBlock_repetition0": 30, "openBlock_option0": 31, "openBlock_option1": 32, "CLOSE": 33, "OPEN_INVERSE": 34, "openInverse_repetition0": 35, "openInverse_option0": 36, "openInverse_option1": 37, "openInverseChain": 38, "OPEN_INVERSE_CHAIN": 39, "openInverseChain_repetition0": 40, "openInverseChain_option0": 41, "openInverseChain_option1": 42, "inverseAndProgram": 43, "INVERSE": 44, "inverseChain": 45, "inverseChain_option0": 46, "OPEN_ENDBLOCK": 47, "OPEN": 48, "mustache_repetition0": 49, "mustache_option0": 50, "OPEN_UNESCAPED": 51, "mustache_repetition1": 52, "mustache_option1": 53, "CLOSE_UNESCAPED": 54, "OPEN_PARTIAL": 55, "partialName": 56, "partial_repetition0": 57, "partial_option0": 58, "openPartialBlock": 59, "OPEN_PARTIAL_BLOCK": 60, "openPartialBlock_repetition0": 61, "openPartialBlock_option0": 62, "param": 63, "sexpr": 64, "OPEN_SEXPR": 65, "sexpr_repetition0": 66, "sexpr_option0": 67, "CLOSE_SEXPR": 68, "hash": 69, "hash_repetition_plus0": 70, "hashSegment": 71, "ID": 72, "EQUALS": 73, "blockParams": 74, "OPEN_BLOCK_PARAMS": 75, "blockParams_repetition_plus0": 76, "CLOSE_BLOCK_PARAMS": 77, "path": 78, "dataName": 79, "STRING": 80, "NUMBER": 81, "BOOLEAN": 82, "UNDEFINED": 83, "NULL": 84, "DATA": 85, "pathSegments": 86, "SEP": 87, "$accept": 0, "$end": 1 },
	        terminals_: { 2: "error", 5: "EOF", 14: "COMMENT", 15: "CONTENT", 18: "END_RAW_BLOCK", 19: "OPEN_RAW_BLOCK", 23: "CLOSE_RAW_BLOCK", 29: "OPEN_BLOCK", 33: "CLOSE", 34: "OPEN_INVERSE", 39: "OPEN_INVERSE_CHAIN", 44: "INVERSE", 47: "OPEN_ENDBLOCK", 48: "OPEN", 51: "OPEN_UNESCAPED", 54: "CLOSE_UNESCAPED", 55: "OPEN_PARTIAL", 60: "OPEN_PARTIAL_BLOCK", 65: "OPEN_SEXPR", 68: "CLOSE_SEXPR", 72: "ID", 73: "EQUALS", 75: "OPEN_BLOCK_PARAMS", 77: "CLOSE_BLOCK_PARAMS", 80: "STRING", 81: "NUMBER", 82: "BOOLEAN", 83: "UNDEFINED", 84: "NULL", 85: "DATA", 87: "SEP" },
	        productions_: [0, [3, 2], [4, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [13, 1], [10, 3], [16, 5], [9, 4], [9, 4], [24, 6], [27, 6], [38, 6], [43, 2], [45, 3], [45, 1], [26, 3], [8, 5], [8, 5], [11, 5], [12, 3], [59, 5], [63, 1], [63, 1], [64, 5], [69, 1], [71, 3], [74, 3], [20, 1], [20, 1], [20, 1], [20, 1], [20, 1], [20, 1], [20, 1], [56, 1], [56, 1], [79, 2], [78, 1], [86, 3], [86, 1], [6, 0], [6, 2], [17, 1], [17, 2], [21, 0], [21, 2], [22, 0], [22, 1], [25, 0], [25, 1], [28, 0], [28, 1], [30, 0], [30, 2], [31, 0], [31, 1], [32, 0], [32, 1], [35, 0], [35, 2], [36, 0], [36, 1], [37, 0], [37, 1], [40, 0], [40, 2], [41, 0], [41, 1], [42, 0], [42, 1], [46, 0], [46, 1], [49, 0], [49, 2], [50, 0], [50, 1], [52, 0], [52, 2], [53, 0], [53, 1], [57, 0], [57, 2], [58, 0], [58, 1], [61, 0], [61, 2], [62, 0], [62, 1], [66, 0], [66, 2], [67, 0], [67, 1], [70, 1], [70, 2], [76, 1], [76, 2]],
	        performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$
	        /*``*/) {

	            var $0 = $$.length - 1;
	            switch (yystate) {
	                case 1:
	                    return $$[$0 - 1];
	                    break;
	                case 2:
	                    this.$ = yy.prepareProgram($$[$0]);
	                    break;
	                case 3:
	                    this.$ = $$[$0];
	                    break;
	                case 4:
	                    this.$ = $$[$0];
	                    break;
	                case 5:
	                    this.$ = $$[$0];
	                    break;
	                case 6:
	                    this.$ = $$[$0];
	                    break;
	                case 7:
	                    this.$ = $$[$0];
	                    break;
	                case 8:
	                    this.$ = $$[$0];
	                    break;
	                case 9:
	                    this.$ = {
	                        type: 'CommentStatement',
	                        value: yy.stripComment($$[$0]),
	                        strip: yy.stripFlags($$[$0], $$[$0]),
	                        loc: yy.locInfo(this._$)
	                    };

	                    break;
	                case 10:
	                    this.$ = {
	                        type: 'ContentStatement',
	                        original: $$[$0],
	                        value: $$[$0],
	                        loc: yy.locInfo(this._$)
	                    };

	                    break;
	                case 11:
	                    this.$ = yy.prepareRawBlock($$[$0 - 2], $$[$0 - 1], $$[$0], this._$);
	                    break;
	                case 12:
	                    this.$ = { path: $$[$0 - 3], params: $$[$0 - 2], hash: $$[$0 - 1] };
	                    break;
	                case 13:
	                    this.$ = yy.prepareBlock($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0], false, this._$);
	                    break;
	                case 14:
	                    this.$ = yy.prepareBlock($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0], true, this._$);
	                    break;
	                case 15:
	                    this.$ = { open: $$[$0 - 5], path: $$[$0 - 4], params: $$[$0 - 3], hash: $$[$0 - 2], blockParams: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 5], $$[$0]) };
	                    break;
	                case 16:
	                    this.$ = { path: $$[$0 - 4], params: $$[$0 - 3], hash: $$[$0 - 2], blockParams: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 5], $$[$0]) };
	                    break;
	                case 17:
	                    this.$ = { path: $$[$0 - 4], params: $$[$0 - 3], hash: $$[$0 - 2], blockParams: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 5], $$[$0]) };
	                    break;
	                case 18:
	                    this.$ = { strip: yy.stripFlags($$[$0 - 1], $$[$0 - 1]), program: $$[$0] };
	                    break;
	                case 19:
	                    var inverse = yy.prepareBlock($$[$0 - 2], $$[$0 - 1], $$[$0], $$[$0], false, this._$),
	                        program = yy.prepareProgram([inverse], $$[$0 - 1].loc);
	                    program.chained = true;

	                    this.$ = { strip: $$[$0 - 2].strip, program: program, chain: true };

	                    break;
	                case 20:
	                    this.$ = $$[$0];
	                    break;
	                case 21:
	                    this.$ = { path: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 2], $$[$0]) };
	                    break;
	                case 22:
	                    this.$ = yy.prepareMustache($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0 - 4], yy.stripFlags($$[$0 - 4], $$[$0]), this._$);
	                    break;
	                case 23:
	                    this.$ = yy.prepareMustache($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0 - 4], yy.stripFlags($$[$0 - 4], $$[$0]), this._$);
	                    break;
	                case 24:
	                    this.$ = {
	                        type: 'PartialStatement',
	                        name: $$[$0 - 3],
	                        params: $$[$0 - 2],
	                        hash: $$[$0 - 1],
	                        indent: '',
	                        strip: yy.stripFlags($$[$0 - 4], $$[$0]),
	                        loc: yy.locInfo(this._$)
	                    };

	                    break;
	                case 25:
	                    this.$ = yy.preparePartialBlock($$[$0 - 2], $$[$0 - 1], $$[$0], this._$);
	                    break;
	                case 26:
	                    this.$ = { path: $$[$0 - 3], params: $$[$0 - 2], hash: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 4], $$[$0]) };
	                    break;
	                case 27:
	                    this.$ = $$[$0];
	                    break;
	                case 28:
	                    this.$ = $$[$0];
	                    break;
	                case 29:
	                    this.$ = {
	                        type: 'SubExpression',
	                        path: $$[$0 - 3],
	                        params: $$[$0 - 2],
	                        hash: $$[$0 - 1],
	                        loc: yy.locInfo(this._$)
	                    };

	                    break;
	                case 30:
	                    this.$ = { type: 'Hash', pairs: $$[$0], loc: yy.locInfo(this._$) };
	                    break;
	                case 31:
	                    this.$ = { type: 'HashPair', key: yy.id($$[$0 - 2]), value: $$[$0], loc: yy.locInfo(this._$) };
	                    break;
	                case 32:
	                    this.$ = yy.id($$[$0 - 1]);
	                    break;
	                case 33:
	                    this.$ = $$[$0];
	                    break;
	                case 34:
	                    this.$ = $$[$0];
	                    break;
	                case 35:
	                    this.$ = { type: 'StringLiteral', value: $$[$0], original: $$[$0], loc: yy.locInfo(this._$) };
	                    break;
	                case 36:
	                    this.$ = { type: 'NumberLiteral', value: Number($$[$0]), original: Number($$[$0]), loc: yy.locInfo(this._$) };
	                    break;
	                case 37:
	                    this.$ = { type: 'BooleanLiteral', value: $$[$0] === 'true', original: $$[$0] === 'true', loc: yy.locInfo(this._$) };
	                    break;
	                case 38:
	                    this.$ = { type: 'UndefinedLiteral', original: undefined, value: undefined, loc: yy.locInfo(this._$) };
	                    break;
	                case 39:
	                    this.$ = { type: 'NullLiteral', original: null, value: null, loc: yy.locInfo(this._$) };
	                    break;
	                case 40:
	                    this.$ = $$[$0];
	                    break;
	                case 41:
	                    this.$ = $$[$0];
	                    break;
	                case 42:
	                    this.$ = yy.preparePath(true, $$[$0], this._$);
	                    break;
	                case 43:
	                    this.$ = yy.preparePath(false, $$[$0], this._$);
	                    break;
	                case 44:
	                    $$[$0 - 2].push({ part: yy.id($$[$0]), original: $$[$0], separator: $$[$0 - 1] });this.$ = $$[$0 - 2];
	                    break;
	                case 45:
	                    this.$ = [{ part: yy.id($$[$0]), original: $$[$0] }];
	                    break;
	                case 46:
	                    this.$ = [];
	                    break;
	                case 47:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 48:
	                    this.$ = [$$[$0]];
	                    break;
	                case 49:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 50:
	                    this.$ = [];
	                    break;
	                case 51:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 58:
	                    this.$ = [];
	                    break;
	                case 59:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 64:
	                    this.$ = [];
	                    break;
	                case 65:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 70:
	                    this.$ = [];
	                    break;
	                case 71:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 78:
	                    this.$ = [];
	                    break;
	                case 79:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 82:
	                    this.$ = [];
	                    break;
	                case 83:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 86:
	                    this.$ = [];
	                    break;
	                case 87:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 90:
	                    this.$ = [];
	                    break;
	                case 91:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 94:
	                    this.$ = [];
	                    break;
	                case 95:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 98:
	                    this.$ = [$$[$0]];
	                    break;
	                case 99:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 100:
	                    this.$ = [$$[$0]];
	                    break;
	                case 101:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	            }
	        },
	        table: [{ 3: 1, 4: 2, 5: [2, 46], 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 1: [3] }, { 5: [1, 4] }, { 5: [2, 2], 7: 5, 8: 6, 9: 7, 10: 8, 11: 9, 12: 10, 13: 11, 14: [1, 12], 15: [1, 20], 16: 17, 19: [1, 23], 24: 15, 27: 16, 29: [1, 21], 34: [1, 22], 39: [2, 2], 44: [2, 2], 47: [2, 2], 48: [1, 13], 51: [1, 14], 55: [1, 18], 59: 19, 60: [1, 24] }, { 1: [2, 1] }, { 5: [2, 47], 14: [2, 47], 15: [2, 47], 19: [2, 47], 29: [2, 47], 34: [2, 47], 39: [2, 47], 44: [2, 47], 47: [2, 47], 48: [2, 47], 51: [2, 47], 55: [2, 47], 60: [2, 47] }, { 5: [2, 3], 14: [2, 3], 15: [2, 3], 19: [2, 3], 29: [2, 3], 34: [2, 3], 39: [2, 3], 44: [2, 3], 47: [2, 3], 48: [2, 3], 51: [2, 3], 55: [2, 3], 60: [2, 3] }, { 5: [2, 4], 14: [2, 4], 15: [2, 4], 19: [2, 4], 29: [2, 4], 34: [2, 4], 39: [2, 4], 44: [2, 4], 47: [2, 4], 48: [2, 4], 51: [2, 4], 55: [2, 4], 60: [2, 4] }, { 5: [2, 5], 14: [2, 5], 15: [2, 5], 19: [2, 5], 29: [2, 5], 34: [2, 5], 39: [2, 5], 44: [2, 5], 47: [2, 5], 48: [2, 5], 51: [2, 5], 55: [2, 5], 60: [2, 5] }, { 5: [2, 6], 14: [2, 6], 15: [2, 6], 19: [2, 6], 29: [2, 6], 34: [2, 6], 39: [2, 6], 44: [2, 6], 47: [2, 6], 48: [2, 6], 51: [2, 6], 55: [2, 6], 60: [2, 6] }, { 5: [2, 7], 14: [2, 7], 15: [2, 7], 19: [2, 7], 29: [2, 7], 34: [2, 7], 39: [2, 7], 44: [2, 7], 47: [2, 7], 48: [2, 7], 51: [2, 7], 55: [2, 7], 60: [2, 7] }, { 5: [2, 8], 14: [2, 8], 15: [2, 8], 19: [2, 8], 29: [2, 8], 34: [2, 8], 39: [2, 8], 44: [2, 8], 47: [2, 8], 48: [2, 8], 51: [2, 8], 55: [2, 8], 60: [2, 8] }, { 5: [2, 9], 14: [2, 9], 15: [2, 9], 19: [2, 9], 29: [2, 9], 34: [2, 9], 39: [2, 9], 44: [2, 9], 47: [2, 9], 48: [2, 9], 51: [2, 9], 55: [2, 9], 60: [2, 9] }, { 20: 25, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 36, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 4: 37, 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 39: [2, 46], 44: [2, 46], 47: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 4: 38, 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 44: [2, 46], 47: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 13: 40, 15: [1, 20], 17: 39 }, { 20: 42, 56: 41, 64: 43, 65: [1, 44], 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 4: 45, 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 47: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 5: [2, 10], 14: [2, 10], 15: [2, 10], 18: [2, 10], 19: [2, 10], 29: [2, 10], 34: [2, 10], 39: [2, 10], 44: [2, 10], 47: [2, 10], 48: [2, 10], 51: [2, 10], 55: [2, 10], 60: [2, 10] }, { 20: 46, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 47, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 48, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 42, 56: 49, 64: 43, 65: [1, 44], 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 33: [2, 78], 49: 50, 65: [2, 78], 72: [2, 78], 80: [2, 78], 81: [2, 78], 82: [2, 78], 83: [2, 78], 84: [2, 78], 85: [2, 78] }, { 23: [2, 33], 33: [2, 33], 54: [2, 33], 65: [2, 33], 68: [2, 33], 72: [2, 33], 75: [2, 33], 80: [2, 33], 81: [2, 33], 82: [2, 33], 83: [2, 33], 84: [2, 33], 85: [2, 33] }, { 23: [2, 34], 33: [2, 34], 54: [2, 34], 65: [2, 34], 68: [2, 34], 72: [2, 34], 75: [2, 34], 80: [2, 34], 81: [2, 34], 82: [2, 34], 83: [2, 34], 84: [2, 34], 85: [2, 34] }, { 23: [2, 35], 33: [2, 35], 54: [2, 35], 65: [2, 35], 68: [2, 35], 72: [2, 35], 75: [2, 35], 80: [2, 35], 81: [2, 35], 82: [2, 35], 83: [2, 35], 84: [2, 35], 85: [2, 35] }, { 23: [2, 36], 33: [2, 36], 54: [2, 36], 65: [2, 36], 68: [2, 36], 72: [2, 36], 75: [2, 36], 80: [2, 36], 81: [2, 36], 82: [2, 36], 83: [2, 36], 84: [2, 36], 85: [2, 36] }, { 23: [2, 37], 33: [2, 37], 54: [2, 37], 65: [2, 37], 68: [2, 37], 72: [2, 37], 75: [2, 37], 80: [2, 37], 81: [2, 37], 82: [2, 37], 83: [2, 37], 84: [2, 37], 85: [2, 37] }, { 23: [2, 38], 33: [2, 38], 54: [2, 38], 65: [2, 38], 68: [2, 38], 72: [2, 38], 75: [2, 38], 80: [2, 38], 81: [2, 38], 82: [2, 38], 83: [2, 38], 84: [2, 38], 85: [2, 38] }, { 23: [2, 39], 33: [2, 39], 54: [2, 39], 65: [2, 39], 68: [2, 39], 72: [2, 39], 75: [2, 39], 80: [2, 39], 81: [2, 39], 82: [2, 39], 83: [2, 39], 84: [2, 39], 85: [2, 39] }, { 23: [2, 43], 33: [2, 43], 54: [2, 43], 65: [2, 43], 68: [2, 43], 72: [2, 43], 75: [2, 43], 80: [2, 43], 81: [2, 43], 82: [2, 43], 83: [2, 43], 84: [2, 43], 85: [2, 43], 87: [1, 51] }, { 72: [1, 35], 86: 52 }, { 23: [2, 45], 33: [2, 45], 54: [2, 45], 65: [2, 45], 68: [2, 45], 72: [2, 45], 75: [2, 45], 80: [2, 45], 81: [2, 45], 82: [2, 45], 83: [2, 45], 84: [2, 45], 85: [2, 45], 87: [2, 45] }, { 52: 53, 54: [2, 82], 65: [2, 82], 72: [2, 82], 80: [2, 82], 81: [2, 82], 82: [2, 82], 83: [2, 82], 84: [2, 82], 85: [2, 82] }, { 25: 54, 38: 56, 39: [1, 58], 43: 57, 44: [1, 59], 45: 55, 47: [2, 54] }, { 28: 60, 43: 61, 44: [1, 59], 47: [2, 56] }, { 13: 63, 15: [1, 20], 18: [1, 62] }, { 15: [2, 48], 18: [2, 48] }, { 33: [2, 86], 57: 64, 65: [2, 86], 72: [2, 86], 80: [2, 86], 81: [2, 86], 82: [2, 86], 83: [2, 86], 84: [2, 86], 85: [2, 86] }, { 33: [2, 40], 65: [2, 40], 72: [2, 40], 80: [2, 40], 81: [2, 40], 82: [2, 40], 83: [2, 40], 84: [2, 40], 85: [2, 40] }, { 33: [2, 41], 65: [2, 41], 72: [2, 41], 80: [2, 41], 81: [2, 41], 82: [2, 41], 83: [2, 41], 84: [2, 41], 85: [2, 41] }, { 20: 65, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 26: 66, 47: [1, 67] }, { 30: 68, 33: [2, 58], 65: [2, 58], 72: [2, 58], 75: [2, 58], 80: [2, 58], 81: [2, 58], 82: [2, 58], 83: [2, 58], 84: [2, 58], 85: [2, 58] }, { 33: [2, 64], 35: 69, 65: [2, 64], 72: [2, 64], 75: [2, 64], 80: [2, 64], 81: [2, 64], 82: [2, 64], 83: [2, 64], 84: [2, 64], 85: [2, 64] }, { 21: 70, 23: [2, 50], 65: [2, 50], 72: [2, 50], 80: [2, 50], 81: [2, 50], 82: [2, 50], 83: [2, 50], 84: [2, 50], 85: [2, 50] }, { 33: [2, 90], 61: 71, 65: [2, 90], 72: [2, 90], 80: [2, 90], 81: [2, 90], 82: [2, 90], 83: [2, 90], 84: [2, 90], 85: [2, 90] }, { 20: 75, 33: [2, 80], 50: 72, 63: 73, 64: 76, 65: [1, 44], 69: 74, 70: 77, 71: 78, 72: [1, 79], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 72: [1, 80] }, { 23: [2, 42], 33: [2, 42], 54: [2, 42], 65: [2, 42], 68: [2, 42], 72: [2, 42], 75: [2, 42], 80: [2, 42], 81: [2, 42], 82: [2, 42], 83: [2, 42], 84: [2, 42], 85: [2, 42], 87: [1, 51] }, { 20: 75, 53: 81, 54: [2, 84], 63: 82, 64: 76, 65: [1, 44], 69: 83, 70: 77, 71: 78, 72: [1, 79], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 26: 84, 47: [1, 67] }, { 47: [2, 55] }, { 4: 85, 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 39: [2, 46], 44: [2, 46], 47: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 47: [2, 20] }, { 20: 86, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 4: 87, 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 47: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 26: 88, 47: [1, 67] }, { 47: [2, 57] }, { 5: [2, 11], 14: [2, 11], 15: [2, 11], 19: [2, 11], 29: [2, 11], 34: [2, 11], 39: [2, 11], 44: [2, 11], 47: [2, 11], 48: [2, 11], 51: [2, 11], 55: [2, 11], 60: [2, 11] }, { 15: [2, 49], 18: [2, 49] }, { 20: 75, 33: [2, 88], 58: 89, 63: 90, 64: 76, 65: [1, 44], 69: 91, 70: 77, 71: 78, 72: [1, 79], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 65: [2, 94], 66: 92, 68: [2, 94], 72: [2, 94], 80: [2, 94], 81: [2, 94], 82: [2, 94], 83: [2, 94], 84: [2, 94], 85: [2, 94] }, { 5: [2, 25], 14: [2, 25], 15: [2, 25], 19: [2, 25], 29: [2, 25], 34: [2, 25], 39: [2, 25], 44: [2, 25], 47: [2, 25], 48: [2, 25], 51: [2, 25], 55: [2, 25], 60: [2, 25] }, { 20: 93, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 75, 31: 94, 33: [2, 60], 63: 95, 64: 76, 65: [1, 44], 69: 96, 70: 77, 71: 78, 72: [1, 79], 75: [2, 60], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 75, 33: [2, 66], 36: 97, 63: 98, 64: 76, 65: [1, 44], 69: 99, 70: 77, 71: 78, 72: [1, 79], 75: [2, 66], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 75, 22: 100, 23: [2, 52], 63: 101, 64: 76, 65: [1, 44], 69: 102, 70: 77, 71: 78, 72: [1, 79], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 75, 33: [2, 92], 62: 103, 63: 104, 64: 76, 65: [1, 44], 69: 105, 70: 77, 71: 78, 72: [1, 79], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 33: [1, 106] }, { 33: [2, 79], 65: [2, 79], 72: [2, 79], 80: [2, 79], 81: [2, 79], 82: [2, 79], 83: [2, 79], 84: [2, 79], 85: [2, 79] }, { 33: [2, 81] }, { 23: [2, 27], 33: [2, 27], 54: [2, 27], 65: [2, 27], 68: [2, 27], 72: [2, 27], 75: [2, 27], 80: [2, 27], 81: [2, 27], 82: [2, 27], 83: [2, 27], 84: [2, 27], 85: [2, 27] }, { 23: [2, 28], 33: [2, 28], 54: [2, 28], 65: [2, 28], 68: [2, 28], 72: [2, 28], 75: [2, 28], 80: [2, 28], 81: [2, 28], 82: [2, 28], 83: [2, 28], 84: [2, 28], 85: [2, 28] }, { 23: [2, 30], 33: [2, 30], 54: [2, 30], 68: [2, 30], 71: 107, 72: [1, 108], 75: [2, 30] }, { 23: [2, 98], 33: [2, 98], 54: [2, 98], 68: [2, 98], 72: [2, 98], 75: [2, 98] }, { 23: [2, 45], 33: [2, 45], 54: [2, 45], 65: [2, 45], 68: [2, 45], 72: [2, 45], 73: [1, 109], 75: [2, 45], 80: [2, 45], 81: [2, 45], 82: [2, 45], 83: [2, 45], 84: [2, 45], 85: [2, 45], 87: [2, 45] }, { 23: [2, 44], 33: [2, 44], 54: [2, 44], 65: [2, 44], 68: [2, 44], 72: [2, 44], 75: [2, 44], 80: [2, 44], 81: [2, 44], 82: [2, 44], 83: [2, 44], 84: [2, 44], 85: [2, 44], 87: [2, 44] }, { 54: [1, 110] }, { 54: [2, 83], 65: [2, 83], 72: [2, 83], 80: [2, 83], 81: [2, 83], 82: [2, 83], 83: [2, 83], 84: [2, 83], 85: [2, 83] }, { 54: [2, 85] }, { 5: [2, 13], 14: [2, 13], 15: [2, 13], 19: [2, 13], 29: [2, 13], 34: [2, 13], 39: [2, 13], 44: [2, 13], 47: [2, 13], 48: [2, 13], 51: [2, 13], 55: [2, 13], 60: [2, 13] }, { 38: 56, 39: [1, 58], 43: 57, 44: [1, 59], 45: 112, 46: 111, 47: [2, 76] }, { 33: [2, 70], 40: 113, 65: [2, 70], 72: [2, 70], 75: [2, 70], 80: [2, 70], 81: [2, 70], 82: [2, 70], 83: [2, 70], 84: [2, 70], 85: [2, 70] }, { 47: [2, 18] }, { 5: [2, 14], 14: [2, 14], 15: [2, 14], 19: [2, 14], 29: [2, 14], 34: [2, 14], 39: [2, 14], 44: [2, 14], 47: [2, 14], 48: [2, 14], 51: [2, 14], 55: [2, 14], 60: [2, 14] }, { 33: [1, 114] }, { 33: [2, 87], 65: [2, 87], 72: [2, 87], 80: [2, 87], 81: [2, 87], 82: [2, 87], 83: [2, 87], 84: [2, 87], 85: [2, 87] }, { 33: [2, 89] }, { 20: 75, 63: 116, 64: 76, 65: [1, 44], 67: 115, 68: [2, 96], 69: 117, 70: 77, 71: 78, 72: [1, 79], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 33: [1, 118] }, { 32: 119, 33: [2, 62], 74: 120, 75: [1, 121] }, { 33: [2, 59], 65: [2, 59], 72: [2, 59], 75: [2, 59], 80: [2, 59], 81: [2, 59], 82: [2, 59], 83: [2, 59], 84: [2, 59], 85: [2, 59] }, { 33: [2, 61], 75: [2, 61] }, { 33: [2, 68], 37: 122, 74: 123, 75: [1, 121] }, { 33: [2, 65], 65: [2, 65], 72: [2, 65], 75: [2, 65], 80: [2, 65], 81: [2, 65], 82: [2, 65], 83: [2, 65], 84: [2, 65], 85: [2, 65] }, { 33: [2, 67], 75: [2, 67] }, { 23: [1, 124] }, { 23: [2, 51], 65: [2, 51], 72: [2, 51], 80: [2, 51], 81: [2, 51], 82: [2, 51], 83: [2, 51], 84: [2, 51], 85: [2, 51] }, { 23: [2, 53] }, { 33: [1, 125] }, { 33: [2, 91], 65: [2, 91], 72: [2, 91], 80: [2, 91], 81: [2, 91], 82: [2, 91], 83: [2, 91], 84: [2, 91], 85: [2, 91] }, { 33: [2, 93] }, { 5: [2, 22], 14: [2, 22], 15: [2, 22], 19: [2, 22], 29: [2, 22], 34: [2, 22], 39: [2, 22], 44: [2, 22], 47: [2, 22], 48: [2, 22], 51: [2, 22], 55: [2, 22], 60: [2, 22] }, { 23: [2, 99], 33: [2, 99], 54: [2, 99], 68: [2, 99], 72: [2, 99], 75: [2, 99] }, { 73: [1, 109] }, { 20: 75, 63: 126, 64: 76, 65: [1, 44], 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 5: [2, 23], 14: [2, 23], 15: [2, 23], 19: [2, 23], 29: [2, 23], 34: [2, 23], 39: [2, 23], 44: [2, 23], 47: [2, 23], 48: [2, 23], 51: [2, 23], 55: [2, 23], 60: [2, 23] }, { 47: [2, 19] }, { 47: [2, 77] }, { 20: 75, 33: [2, 72], 41: 127, 63: 128, 64: 76, 65: [1, 44], 69: 129, 70: 77, 71: 78, 72: [1, 79], 75: [2, 72], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 5: [2, 24], 14: [2, 24], 15: [2, 24], 19: [2, 24], 29: [2, 24], 34: [2, 24], 39: [2, 24], 44: [2, 24], 47: [2, 24], 48: [2, 24], 51: [2, 24], 55: [2, 24], 60: [2, 24] }, { 68: [1, 130] }, { 65: [2, 95], 68: [2, 95], 72: [2, 95], 80: [2, 95], 81: [2, 95], 82: [2, 95], 83: [2, 95], 84: [2, 95], 85: [2, 95] }, { 68: [2, 97] }, { 5: [2, 21], 14: [2, 21], 15: [2, 21], 19: [2, 21], 29: [2, 21], 34: [2, 21], 39: [2, 21], 44: [2, 21], 47: [2, 21], 48: [2, 21], 51: [2, 21], 55: [2, 21], 60: [2, 21] }, { 33: [1, 131] }, { 33: [2, 63] }, { 72: [1, 133], 76: 132 }, { 33: [1, 134] }, { 33: [2, 69] }, { 15: [2, 12] }, { 14: [2, 26], 15: [2, 26], 19: [2, 26], 29: [2, 26], 34: [2, 26], 47: [2, 26], 48: [2, 26], 51: [2, 26], 55: [2, 26], 60: [2, 26] }, { 23: [2, 31], 33: [2, 31], 54: [2, 31], 68: [2, 31], 72: [2, 31], 75: [2, 31] }, { 33: [2, 74], 42: 135, 74: 136, 75: [1, 121] }, { 33: [2, 71], 65: [2, 71], 72: [2, 71], 75: [2, 71], 80: [2, 71], 81: [2, 71], 82: [2, 71], 83: [2, 71], 84: [2, 71], 85: [2, 71] }, { 33: [2, 73], 75: [2, 73] }, { 23: [2, 29], 33: [2, 29], 54: [2, 29], 65: [2, 29], 68: [2, 29], 72: [2, 29], 75: [2, 29], 80: [2, 29], 81: [2, 29], 82: [2, 29], 83: [2, 29], 84: [2, 29], 85: [2, 29] }, { 14: [2, 15], 15: [2, 15], 19: [2, 15], 29: [2, 15], 34: [2, 15], 39: [2, 15], 44: [2, 15], 47: [2, 15], 48: [2, 15], 51: [2, 15], 55: [2, 15], 60: [2, 15] }, { 72: [1, 138], 77: [1, 137] }, { 72: [2, 100], 77: [2, 100] }, { 14: [2, 16], 15: [2, 16], 19: [2, 16], 29: [2, 16], 34: [2, 16], 44: [2, 16], 47: [2, 16], 48: [2, 16], 51: [2, 16], 55: [2, 16], 60: [2, 16] }, { 33: [1, 139] }, { 33: [2, 75] }, { 33: [2, 32] }, { 72: [2, 101], 77: [2, 101] }, { 14: [2, 17], 15: [2, 17], 19: [2, 17], 29: [2, 17], 34: [2, 17], 39: [2, 17], 44: [2, 17], 47: [2, 17], 48: [2, 17], 51: [2, 17], 55: [2, 17], 60: [2, 17] }],
	        defaultActions: { 4: [2, 1], 55: [2, 55], 57: [2, 20], 61: [2, 57], 74: [2, 81], 83: [2, 85], 87: [2, 18], 91: [2, 89], 102: [2, 53], 105: [2, 93], 111: [2, 19], 112: [2, 77], 117: [2, 97], 120: [2, 63], 123: [2, 69], 124: [2, 12], 136: [2, 75], 137: [2, 32] },
	        parseError: function parseError(str, hash) {
	            throw new Error(str);
	        },
	        parse: function parse(input) {
	            var self = this,
	                stack = [0],
	                vstack = [null],
	                lstack = [],
	                table = this.table,
	                yytext = "",
	                yylineno = 0,
	                yyleng = 0,
	                recovering = 0;
	            this.lexer.setInput(input);
	            this.lexer.yy = this.yy;
	            this.yy.lexer = this.lexer;
	            this.yy.parser = this;
	            if (typeof this.lexer.yylloc == "undefined") this.lexer.yylloc = {};
	            var yyloc = this.lexer.yylloc;
	            lstack.push(yyloc);
	            var ranges = this.lexer.options && this.lexer.options.ranges;
	            if (typeof this.yy.parseError === "function") this.parseError = this.yy.parseError;
	            function lex() {
	                var token;
	                token = self.lexer.lex() || 1;
	                if (typeof token !== "number") {
	                    token = self.symbols_[token] || token;
	                }
	                return token;
	            }
	            var symbol,
	                preErrorSymbol,
	                state,
	                action,
	                r,
	                yyval = {},
	                p,
	                len,
	                newState,
	                expected;
	            while (true) {
	                state = stack[stack.length - 1];
	                if (this.defaultActions[state]) {
	                    action = this.defaultActions[state];
	                } else {
	                    if (symbol === null || typeof symbol == "undefined") {
	                        symbol = lex();
	                    }
	                    action = table[state] && table[state][symbol];
	                }
	                if (typeof action === "undefined" || !action.length || !action[0]) {
	                    var errStr = "";
	                    if (!recovering) {
	                        expected = [];
	                        for (p in table[state]) if (this.terminals_[p] && p > 2) {
	                            expected.push("'" + this.terminals_[p] + "'");
	                        }
	                        if (this.lexer.showPosition) {
	                            errStr = "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
	                        } else {
	                            errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1 ? "end of input" : "'" + (this.terminals_[symbol] || symbol) + "'");
	                        }
	                        this.parseError(errStr, { text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected });
	                    }
	                }
	                if (action[0] instanceof Array && action.length > 1) {
	                    throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
	                }
	                switch (action[0]) {
	                    case 1:
	                        stack.push(symbol);
	                        vstack.push(this.lexer.yytext);
	                        lstack.push(this.lexer.yylloc);
	                        stack.push(action[1]);
	                        symbol = null;
	                        if (!preErrorSymbol) {
	                            yyleng = this.lexer.yyleng;
	                            yytext = this.lexer.yytext;
	                            yylineno = this.lexer.yylineno;
	                            yyloc = this.lexer.yylloc;
	                            if (recovering > 0) recovering--;
	                        } else {
	                            symbol = preErrorSymbol;
	                            preErrorSymbol = null;
	                        }
	                        break;
	                    case 2:
	                        len = this.productions_[action[1]][1];
	                        yyval.$ = vstack[vstack.length - len];
	                        yyval._$ = { first_line: lstack[lstack.length - (len || 1)].first_line, last_line: lstack[lstack.length - 1].last_line, first_column: lstack[lstack.length - (len || 1)].first_column, last_column: lstack[lstack.length - 1].last_column };
	                        if (ranges) {
	                            yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
	                        }
	                        r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
	                        if (typeof r !== "undefined") {
	                            return r;
	                        }
	                        if (len) {
	                            stack = stack.slice(0, -1 * len * 2);
	                            vstack = vstack.slice(0, -1 * len);
	                            lstack = lstack.slice(0, -1 * len);
	                        }
	                        stack.push(this.productions_[action[1]][0]);
	                        vstack.push(yyval.$);
	                        lstack.push(yyval._$);
	                        newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
	                        stack.push(newState);
	                        break;
	                    case 3:
	                        return true;
	                }
	            }
	            return true;
	        }
	    };
	    /* Jison generated lexer */
	    var lexer = (function () {
	        var lexer = { EOF: 1,
	            parseError: function parseError(str, hash) {
	                if (this.yy.parser) {
	                    this.yy.parser.parseError(str, hash);
	                } else {
	                    throw new Error(str);
	                }
	            },
	            setInput: function setInput(input) {
	                this._input = input;
	                this._more = this._less = this.done = false;
	                this.yylineno = this.yyleng = 0;
	                this.yytext = this.matched = this.match = '';
	                this.conditionStack = ['INITIAL'];
	                this.yylloc = { first_line: 1, first_column: 0, last_line: 1, last_column: 0 };
	                if (this.options.ranges) this.yylloc.range = [0, 0];
	                this.offset = 0;
	                return this;
	            },
	            input: function input() {
	                var ch = this._input[0];
	                this.yytext += ch;
	                this.yyleng++;
	                this.offset++;
	                this.match += ch;
	                this.matched += ch;
	                var lines = ch.match(/(?:\r\n?|\n).*/g);
	                if (lines) {
	                    this.yylineno++;
	                    this.yylloc.last_line++;
	                } else {
	                    this.yylloc.last_column++;
	                }
	                if (this.options.ranges) this.yylloc.range[1]++;

	                this._input = this._input.slice(1);
	                return ch;
	            },
	            unput: function unput(ch) {
	                var len = ch.length;
	                var lines = ch.split(/(?:\r\n?|\n)/g);

	                this._input = ch + this._input;
	                this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);
	                //this.yyleng -= len;
	                this.offset -= len;
	                var oldLines = this.match.split(/(?:\r\n?|\n)/g);
	                this.match = this.match.substr(0, this.match.length - 1);
	                this.matched = this.matched.substr(0, this.matched.length - 1);

	                if (lines.length - 1) this.yylineno -= lines.length - 1;
	                var r = this.yylloc.range;

	                this.yylloc = { first_line: this.yylloc.first_line,
	                    last_line: this.yylineno + 1,
	                    first_column: this.yylloc.first_column,
	                    last_column: lines ? (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length : this.yylloc.first_column - len
	                };

	                if (this.options.ranges) {
	                    this.yylloc.range = [r[0], r[0] + this.yyleng - len];
	                }
	                return this;
	            },
	            more: function more() {
	                this._more = true;
	                return this;
	            },
	            less: function less(n) {
	                this.unput(this.match.slice(n));
	            },
	            pastInput: function pastInput() {
	                var past = this.matched.substr(0, this.matched.length - this.match.length);
	                return (past.length > 20 ? '...' : '') + past.substr(-20).replace(/\n/g, "");
	            },
	            upcomingInput: function upcomingInput() {
	                var next = this.match;
	                if (next.length < 20) {
	                    next += this._input.substr(0, 20 - next.length);
	                }
	                return (next.substr(0, 20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
	            },
	            showPosition: function showPosition() {
	                var pre = this.pastInput();
	                var c = new Array(pre.length + 1).join("-");
	                return pre + this.upcomingInput() + "\n" + c + "^";
	            },
	            next: function next() {
	                if (this.done) {
	                    return this.EOF;
	                }
	                if (!this._input) this.done = true;

	                var token, match, tempMatch, index, lines;
	                if (!this._more) {
	                    this.yytext = '';
	                    this.match = '';
	                }
	                var rules = this._currentRules();
	                for (var i = 0; i < rules.length; i++) {
	                    tempMatch = this._input.match(this.rules[rules[i]]);
	                    if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
	                        match = tempMatch;
	                        index = i;
	                        if (!this.options.flex) break;
	                    }
	                }
	                if (match) {
	                    lines = match[0].match(/(?:\r\n?|\n).*/g);
	                    if (lines) this.yylineno += lines.length;
	                    this.yylloc = { first_line: this.yylloc.last_line,
	                        last_line: this.yylineno + 1,
	                        first_column: this.yylloc.last_column,
	                        last_column: lines ? lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length };
	                    this.yytext += match[0];
	                    this.match += match[0];
	                    this.matches = match;
	                    this.yyleng = this.yytext.length;
	                    if (this.options.ranges) {
	                        this.yylloc.range = [this.offset, this.offset += this.yyleng];
	                    }
	                    this._more = false;
	                    this._input = this._input.slice(match[0].length);
	                    this.matched += match[0];
	                    token = this.performAction.call(this, this.yy, this, rules[index], this.conditionStack[this.conditionStack.length - 1]);
	                    if (this.done && this._input) this.done = false;
	                    if (token) return token;else return;
	                }
	                if (this._input === "") {
	                    return this.EOF;
	                } else {
	                    return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), { text: "", token: null, line: this.yylineno });
	                }
	            },
	            lex: function lex() {
	                var r = this.next();
	                if (typeof r !== 'undefined') {
	                    return r;
	                } else {
	                    return this.lex();
	                }
	            },
	            begin: function begin(condition) {
	                this.conditionStack.push(condition);
	            },
	            popState: function popState() {
	                return this.conditionStack.pop();
	            },
	            _currentRules: function _currentRules() {
	                return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
	            },
	            topState: function topState() {
	                return this.conditionStack[this.conditionStack.length - 2];
	            },
	            pushState: function begin(condition) {
	                this.begin(condition);
	            } };
	        lexer.options = {};
	        lexer.performAction = function anonymous(yy, yy_, $avoiding_name_collisions, YY_START
	        /*``*/) {

	            function strip(start, end) {
	                return yy_.yytext = yy_.yytext.substr(start, yy_.yyleng - end);
	            }
	            switch ($avoiding_name_collisions) {
	                case 0:
	                    if (yy_.yytext.slice(-2) === "\\\\") {
	                        strip(0, 1);
	                        this.begin("mu");
	                    } else if (yy_.yytext.slice(-1) === "\\") {
	                        strip(0, 1);
	                        this.begin("emu");
	                    } else {
	                        this.begin("mu");
	                    }
	                    if (yy_.yytext) return 15;

	                    break;
	                case 1:
	                    return 15;
	                    break;
	                case 2:
	                    this.popState();
	                    return 15;

	                    break;
	                case 3:
	                    this.begin('raw');return 15;
	                    break;
	                case 4:
	                    this.popState();
	                    // Should be using `this.topState()` below, but it currently
	                    // returns the second top instead of the first top. Opened an
	                    // issue about it at https://github.com/zaach/jison/issues/291
	                    if (this.conditionStack[this.conditionStack.length - 1] === 'raw') {
	                        return 15;
	                    } else {
	                        yy_.yytext = yy_.yytext.substr(5, yy_.yyleng - 9);
	                        return 'END_RAW_BLOCK';
	                    }

	                    break;
	                case 5:
	                    return 15;
	                    break;
	                case 6:
	                    this.popState();
	                    return 14;

	                    break;
	                case 7:
	                    return 65;
	                    break;
	                case 8:
	                    return 68;
	                    break;
	                case 9:
	                    return 19;
	                    break;
	                case 10:
	                    this.popState();
	                    this.begin('raw');
	                    return 23;

	                    break;
	                case 11:
	                    return 55;
	                    break;
	                case 12:
	                    return 60;
	                    break;
	                case 13:
	                    return 29;
	                    break;
	                case 14:
	                    return 47;
	                    break;
	                case 15:
	                    this.popState();return 44;
	                    break;
	                case 16:
	                    this.popState();return 44;
	                    break;
	                case 17:
	                    return 34;
	                    break;
	                case 18:
	                    return 39;
	                    break;
	                case 19:
	                    return 51;
	                    break;
	                case 20:
	                    return 48;
	                    break;
	                case 21:
	                    this.unput(yy_.yytext);
	                    this.popState();
	                    this.begin('com');

	                    break;
	                case 22:
	                    this.popState();
	                    return 14;

	                    break;
	                case 23:
	                    return 48;
	                    break;
	                case 24:
	                    return 73;
	                    break;
	                case 25:
	                    return 72;
	                    break;
	                case 26:
	                    return 72;
	                    break;
	                case 27:
	                    return 87;
	                    break;
	                case 28:
	                    // ignore whitespace
	                    break;
	                case 29:
	                    this.popState();return 54;
	                    break;
	                case 30:
	                    this.popState();return 33;
	                    break;
	                case 31:
	                    yy_.yytext = strip(1, 2).replace(/\\"/g, '"');return 80;
	                    break;
	                case 32:
	                    yy_.yytext = strip(1, 2).replace(/\\'/g, "'");return 80;
	                    break;
	                case 33:
	                    return 85;
	                    break;
	                case 34:
	                    return 82;
	                    break;
	                case 35:
	                    return 82;
	                    break;
	                case 36:
	                    return 83;
	                    break;
	                case 37:
	                    return 84;
	                    break;
	                case 38:
	                    return 81;
	                    break;
	                case 39:
	                    return 75;
	                    break;
	                case 40:
	                    return 77;
	                    break;
	                case 41:
	                    return 72;
	                    break;
	                case 42:
	                    yy_.yytext = yy_.yytext.replace(/\\([\\\]])/g, '$1');return 72;
	                    break;
	                case 43:
	                    return 'INVALID';
	                    break;
	                case 44:
	                    return 5;
	                    break;
	            }
	        };
	        lexer.rules = [/^(?:[^\x00]*?(?=(\{\{)))/, /^(?:[^\x00]+)/, /^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/, /^(?:\{\{\{\{(?=[^\/]))/, /^(?:\{\{\{\{\/[^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=[=}\s\/.])\}\}\}\})/, /^(?:[^\x00]*?(?=(\{\{\{\{)))/, /^(?:[\s\S]*?--(~)?\}\})/, /^(?:\()/, /^(?:\))/, /^(?:\{\{\{\{)/, /^(?:\}\}\}\})/, /^(?:\{\{(~)?>)/, /^(?:\{\{(~)?#>)/, /^(?:\{\{(~)?#\*?)/, /^(?:\{\{(~)?\/)/, /^(?:\{\{(~)?\^\s*(~)?\}\})/, /^(?:\{\{(~)?\s*else\s*(~)?\}\})/, /^(?:\{\{(~)?\^)/, /^(?:\{\{(~)?\s*else\b)/, /^(?:\{\{(~)?\{)/, /^(?:\{\{(~)?&)/, /^(?:\{\{(~)?!--)/, /^(?:\{\{(~)?![\s\S]*?\}\})/, /^(?:\{\{(~)?\*?)/, /^(?:=)/, /^(?:\.\.)/, /^(?:\.(?=([=~}\s\/.)|])))/, /^(?:[\/.])/, /^(?:\s+)/, /^(?:\}(~)?\}\})/, /^(?:(~)?\}\})/, /^(?:"(\\["]|[^"])*")/, /^(?:'(\\[']|[^'])*')/, /^(?:@)/, /^(?:true(?=([~}\s)])))/, /^(?:false(?=([~}\s)])))/, /^(?:undefined(?=([~}\s)])))/, /^(?:null(?=([~}\s)])))/, /^(?:-?[0-9]+(?:\.[0-9]+)?(?=([~}\s)])))/, /^(?:as\s+\|)/, /^(?:\|)/, /^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)|]))))/, /^(?:\[(\\\]|[^\]])*\])/, /^(?:.)/, /^(?:$)/];
	        lexer.conditions = { "mu": { "rules": [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44], "inclusive": false }, "emu": { "rules": [2], "inclusive": false }, "com": { "rules": [6], "inclusive": false }, "raw": { "rules": [3, 4, 5], "inclusive": false }, "INITIAL": { "rules": [0, 1, 44], "inclusive": true } };
	        return lexer;
	    })();
	    parser.lexer = lexer;
	    function Parser() {
	        this.yy = {};
	    }Parser.prototype = parser;parser.Parser = Parser;
	    return new Parser();
	})();exports["default"] = handlebars;
	module.exports = exports["default"];

	});

	unwrapExports(parser);

	var visitor = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }



	var _exception2 = _interopRequireDefault(exception);

	function Visitor() {
	  this.parents = [];
	}

	Visitor.prototype = {
	  constructor: Visitor,
	  mutating: false,

	  // Visits a given value. If mutating, will replace the value if necessary.
	  acceptKey: function acceptKey(node, name) {
	    var value = this.accept(node[name]);
	    if (this.mutating) {
	      // Hacky sanity check: This may have a few false positives for type for the helper
	      // methods but will generally do the right thing without a lot of overhead.
	      if (value && !Visitor.prototype[value.type]) {
	        throw new _exception2['default']('Unexpected node type "' + value.type + '" found when accepting ' + name + ' on ' + node.type);
	      }
	      node[name] = value;
	    }
	  },

	  // Performs an accept operation with added sanity check to ensure
	  // required keys are not removed.
	  acceptRequired: function acceptRequired(node, name) {
	    this.acceptKey(node, name);

	    if (!node[name]) {
	      throw new _exception2['default'](node.type + ' requires ' + name);
	    }
	  },

	  // Traverses a given array. If mutating, empty respnses will be removed
	  // for child elements.
	  acceptArray: function acceptArray(array) {
	    for (var i = 0, l = array.length; i < l; i++) {
	      this.acceptKey(array, i);

	      if (!array[i]) {
	        array.splice(i, 1);
	        i--;
	        l--;
	      }
	    }
	  },

	  accept: function accept(object) {
	    if (!object) {
	      return;
	    }

	    /* istanbul ignore next: Sanity code */
	    if (!this[object.type]) {
	      throw new _exception2['default']('Unknown type: ' + object.type, object);
	    }

	    if (this.current) {
	      this.parents.unshift(this.current);
	    }
	    this.current = object;

	    var ret = this[object.type](object);

	    this.current = this.parents.shift();

	    if (!this.mutating || ret) {
	      return ret;
	    } else if (ret !== false) {
	      return object;
	    }
	  },

	  Program: function Program(program) {
	    this.acceptArray(program.body);
	  },

	  MustacheStatement: visitSubExpression,
	  Decorator: visitSubExpression,

	  BlockStatement: visitBlock,
	  DecoratorBlock: visitBlock,

	  PartialStatement: visitPartial,
	  PartialBlockStatement: function PartialBlockStatement(partial) {
	    visitPartial.call(this, partial);

	    this.acceptKey(partial, 'program');
	  },

	  ContentStatement: function ContentStatement() /* content */{},
	  CommentStatement: function CommentStatement() /* comment */{},

	  SubExpression: visitSubExpression,

	  PathExpression: function PathExpression() /* path */{},

	  StringLiteral: function StringLiteral() /* string */{},
	  NumberLiteral: function NumberLiteral() /* number */{},
	  BooleanLiteral: function BooleanLiteral() /* bool */{},
	  UndefinedLiteral: function UndefinedLiteral() /* literal */{},
	  NullLiteral: function NullLiteral() /* literal */{},

	  Hash: function Hash(hash) {
	    this.acceptArray(hash.pairs);
	  },
	  HashPair: function HashPair(pair) {
	    this.acceptRequired(pair, 'value');
	  }
	};

	function visitSubExpression(mustache) {
	  this.acceptRequired(mustache, 'path');
	  this.acceptArray(mustache.params);
	  this.acceptKey(mustache, 'hash');
	}
	function visitBlock(block) {
	  visitSubExpression.call(this, block);

	  this.acceptKey(block, 'program');
	  this.acceptKey(block, 'inverse');
	}
	function visitPartial(partial) {
	  this.acceptRequired(partial, 'name');
	  this.acceptArray(partial.params);
	  this.acceptKey(partial, 'hash');
	}

	exports['default'] = Visitor;
	module.exports = exports['default'];

	});

	unwrapExports(visitor);

	var whitespaceControl = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }



	var _visitor2 = _interopRequireDefault(visitor);

	function WhitespaceControl() {
	  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	  this.options = options;
	}
	WhitespaceControl.prototype = new _visitor2['default']();

	WhitespaceControl.prototype.Program = function (program) {
	  var doStandalone = !this.options.ignoreStandalone;

	  var isRoot = !this.isRootSeen;
	  this.isRootSeen = true;

	  var body = program.body;
	  for (var i = 0, l = body.length; i < l; i++) {
	    var current = body[i],
	        strip = this.accept(current);

	    if (!strip) {
	      continue;
	    }

	    var _isPrevWhitespace = isPrevWhitespace(body, i, isRoot),
	        _isNextWhitespace = isNextWhitespace(body, i, isRoot),
	        openStandalone = strip.openStandalone && _isPrevWhitespace,
	        closeStandalone = strip.closeStandalone && _isNextWhitespace,
	        inlineStandalone = strip.inlineStandalone && _isPrevWhitespace && _isNextWhitespace;

	    if (strip.close) {
	      omitRight(body, i, true);
	    }
	    if (strip.open) {
	      omitLeft(body, i, true);
	    }

	    if (doStandalone && inlineStandalone) {
	      omitRight(body, i);

	      if (omitLeft(body, i)) {
	        // If we are on a standalone node, save the indent info for partials
	        if (current.type === 'PartialStatement') {
	          // Pull out the whitespace from the final line
	          current.indent = /([ \t]+$)/.exec(body[i - 1].original)[1];
	        }
	      }
	    }
	    if (doStandalone && openStandalone) {
	      omitRight((current.program || current.inverse).body);

	      // Strip out the previous content node if it's whitespace only
	      omitLeft(body, i);
	    }
	    if (doStandalone && closeStandalone) {
	      // Always strip the next node
	      omitRight(body, i);

	      omitLeft((current.inverse || current.program).body);
	    }
	  }

	  return program;
	};

	WhitespaceControl.prototype.BlockStatement = WhitespaceControl.prototype.DecoratorBlock = WhitespaceControl.prototype.PartialBlockStatement = function (block) {
	  this.accept(block.program);
	  this.accept(block.inverse);

	  // Find the inverse program that is involed with whitespace stripping.
	  var program = block.program || block.inverse,
	      inverse = block.program && block.inverse,
	      firstInverse = inverse,
	      lastInverse = inverse;

	  if (inverse && inverse.chained) {
	    firstInverse = inverse.body[0].program;

	    // Walk the inverse chain to find the last inverse that is actually in the chain.
	    while (lastInverse.chained) {
	      lastInverse = lastInverse.body[lastInverse.body.length - 1].program;
	    }
	  }

	  var strip = {
	    open: block.openStrip.open,
	    close: block.closeStrip.close,

	    // Determine the standalone candiacy. Basically flag our content as being possibly standalone
	    // so our parent can determine if we actually are standalone
	    openStandalone: isNextWhitespace(program.body),
	    closeStandalone: isPrevWhitespace((firstInverse || program).body)
	  };

	  if (block.openStrip.close) {
	    omitRight(program.body, null, true);
	  }

	  if (inverse) {
	    var inverseStrip = block.inverseStrip;

	    if (inverseStrip.open) {
	      omitLeft(program.body, null, true);
	    }

	    if (inverseStrip.close) {
	      omitRight(firstInverse.body, null, true);
	    }
	    if (block.closeStrip.open) {
	      omitLeft(lastInverse.body, null, true);
	    }

	    // Find standalone else statments
	    if (!this.options.ignoreStandalone && isPrevWhitespace(program.body) && isNextWhitespace(firstInverse.body)) {
	      omitLeft(program.body);
	      omitRight(firstInverse.body);
	    }
	  } else if (block.closeStrip.open) {
	    omitLeft(program.body, null, true);
	  }

	  return strip;
	};

	WhitespaceControl.prototype.Decorator = WhitespaceControl.prototype.MustacheStatement = function (mustache) {
	  return mustache.strip;
	};

	WhitespaceControl.prototype.PartialStatement = WhitespaceControl.prototype.CommentStatement = function (node) {
	  /* istanbul ignore next */
	  var strip = node.strip || {};
	  return {
	    inlineStandalone: true,
	    open: strip.open,
	    close: strip.close
	  };
	};

	function isPrevWhitespace(body, i, isRoot) {
	  if (i === undefined) {
	    i = body.length;
	  }

	  // Nodes that end with newlines are considered whitespace (but are special
	  // cased for strip operations)
	  var prev = body[i - 1],
	      sibling = body[i - 2];
	  if (!prev) {
	    return isRoot;
	  }

	  if (prev.type === 'ContentStatement') {
	    return (sibling || !isRoot ? /\r?\n\s*?$/ : /(^|\r?\n)\s*?$/).test(prev.original);
	  }
	}
	function isNextWhitespace(body, i, isRoot) {
	  if (i === undefined) {
	    i = -1;
	  }

	  var next = body[i + 1],
	      sibling = body[i + 2];
	  if (!next) {
	    return isRoot;
	  }

	  if (next.type === 'ContentStatement') {
	    return (sibling || !isRoot ? /^\s*?\r?\n/ : /^\s*?(\r?\n|$)/).test(next.original);
	  }
	}

	// Marks the node to the right of the position as omitted.
	// I.e. {{foo}}' ' will mark the ' ' node as omitted.
	//
	// If i is undefined, then the first child will be marked as such.
	//
	// If mulitple is truthy then all whitespace will be stripped out until non-whitespace
	// content is met.
	function omitRight(body, i, multiple) {
	  var current = body[i == null ? 0 : i + 1];
	  if (!current || current.type !== 'ContentStatement' || !multiple && current.rightStripped) {
	    return;
	  }

	  var original = current.value;
	  current.value = current.value.replace(multiple ? /^\s+/ : /^[ \t]*\r?\n?/, '');
	  current.rightStripped = current.value !== original;
	}

	// Marks the node to the left of the position as omitted.
	// I.e. ' '{{foo}} will mark the ' ' node as omitted.
	//
	// If i is undefined then the last child will be marked as such.
	//
	// If mulitple is truthy then all whitespace will be stripped out until non-whitespace
	// content is met.
	function omitLeft(body, i, multiple) {
	  var current = body[i == null ? body.length - 1 : i - 1];
	  if (!current || current.type !== 'ContentStatement' || !multiple && current.leftStripped) {
	    return;
	  }

	  // We omit the last node if it's whitespace only and not preceeded by a non-content node.
	  var original = current.value;
	  current.value = current.value.replace(multiple ? /\s+$/ : /[ \t]+$/, '');
	  current.leftStripped = current.value !== original;
	  return current.leftStripped;
	}

	exports['default'] = WhitespaceControl;
	module.exports = exports['default'];

	});

	unwrapExports(whitespaceControl);

	var helpers$2 = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;
	exports.SourceLocation = SourceLocation;
	exports.id = id;
	exports.stripFlags = stripFlags;
	exports.stripComment = stripComment;
	exports.preparePath = preparePath;
	exports.prepareMustache = prepareMustache;
	exports.prepareRawBlock = prepareRawBlock;
	exports.prepareBlock = prepareBlock;
	exports.prepareProgram = prepareProgram;
	exports.preparePartialBlock = preparePartialBlock;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }



	var _exception2 = _interopRequireDefault(exception);

	function validateClose(open, close) {
	  close = close.path ? close.path.original : close;

	  if (open.path.original !== close) {
	    var errorNode = { loc: open.path.loc };

	    throw new _exception2['default'](open.path.original + " doesn't match " + close, errorNode);
	  }
	}

	function SourceLocation(source, locInfo) {
	  this.source = source;
	  this.start = {
	    line: locInfo.first_line,
	    column: locInfo.first_column
	  };
	  this.end = {
	    line: locInfo.last_line,
	    column: locInfo.last_column
	  };
	}

	function id(token) {
	  if (/^\[.*\]$/.test(token)) {
	    return token.substr(1, token.length - 2);
	  } else {
	    return token;
	  }
	}

	function stripFlags(open, close) {
	  return {
	    open: open.charAt(2) === '~',
	    close: close.charAt(close.length - 3) === '~'
	  };
	}

	function stripComment(comment) {
	  return comment.replace(/^\{\{~?!-?-?/, '').replace(/-?-?~?\}\}$/, '');
	}

	function preparePath(data, parts, loc) {
	  loc = this.locInfo(loc);

	  var original = data ? '@' : '',
	      dig = [],
	      depth = 0;

	  for (var i = 0, l = parts.length; i < l; i++) {
	    var part = parts[i].part,

	    // If we have [] syntax then we do not treat path references as operators,
	    // i.e. foo.[this] resolves to approximately context.foo['this']
	    isLiteral = parts[i].original !== part;
	    original += (parts[i].separator || '') + part;

	    if (!isLiteral && (part === '..' || part === '.' || part === 'this')) {
	      if (dig.length > 0) {
	        throw new _exception2['default']('Invalid path: ' + original, { loc: loc });
	      } else if (part === '..') {
	        depth++;
	      }
	    } else {
	      dig.push(part);
	    }
	  }

	  return {
	    type: 'PathExpression',
	    data: data,
	    depth: depth,
	    parts: dig,
	    original: original,
	    loc: loc
	  };
	}

	function prepareMustache(path, params, hash, open, strip, locInfo) {
	  // Must use charAt to support IE pre-10
	  var escapeFlag = open.charAt(3) || open.charAt(2),
	      escaped = escapeFlag !== '{' && escapeFlag !== '&';

	  var decorator = /\*/.test(open);
	  return {
	    type: decorator ? 'Decorator' : 'MustacheStatement',
	    path: path,
	    params: params,
	    hash: hash,
	    escaped: escaped,
	    strip: strip,
	    loc: this.locInfo(locInfo)
	  };
	}

	function prepareRawBlock(openRawBlock, contents, close, locInfo) {
	  validateClose(openRawBlock, close);

	  locInfo = this.locInfo(locInfo);
	  var program = {
	    type: 'Program',
	    body: contents,
	    strip: {},
	    loc: locInfo
	  };

	  return {
	    type: 'BlockStatement',
	    path: openRawBlock.path,
	    params: openRawBlock.params,
	    hash: openRawBlock.hash,
	    program: program,
	    openStrip: {},
	    inverseStrip: {},
	    closeStrip: {},
	    loc: locInfo
	  };
	}

	function prepareBlock(openBlock, program, inverseAndProgram, close, inverted, locInfo) {
	  if (close && close.path) {
	    validateClose(openBlock, close);
	  }

	  var decorator = /\*/.test(openBlock.open);

	  program.blockParams = openBlock.blockParams;

	  var inverse = undefined,
	      inverseStrip = undefined;

	  if (inverseAndProgram) {
	    if (decorator) {
	      throw new _exception2['default']('Unexpected inverse block on decorator', inverseAndProgram);
	    }

	    if (inverseAndProgram.chain) {
	      inverseAndProgram.program.body[0].closeStrip = close.strip;
	    }

	    inverseStrip = inverseAndProgram.strip;
	    inverse = inverseAndProgram.program;
	  }

	  if (inverted) {
	    inverted = inverse;
	    inverse = program;
	    program = inverted;
	  }

	  return {
	    type: decorator ? 'DecoratorBlock' : 'BlockStatement',
	    path: openBlock.path,
	    params: openBlock.params,
	    hash: openBlock.hash,
	    program: program,
	    inverse: inverse,
	    openStrip: openBlock.strip,
	    inverseStrip: inverseStrip,
	    closeStrip: close && close.strip,
	    loc: this.locInfo(locInfo)
	  };
	}

	function prepareProgram(statements, loc) {
	  if (!loc && statements.length) {
	    var firstLoc = statements[0].loc,
	        lastLoc = statements[statements.length - 1].loc;

	    /* istanbul ignore else */
	    if (firstLoc && lastLoc) {
	      loc = {
	        source: firstLoc.source,
	        start: {
	          line: firstLoc.start.line,
	          column: firstLoc.start.column
	        },
	        end: {
	          line: lastLoc.end.line,
	          column: lastLoc.end.column
	        }
	      };
	    }
	  }

	  return {
	    type: 'Program',
	    body: statements,
	    strip: {},
	    loc: loc
	  };
	}

	function preparePartialBlock(open, program, close, locInfo) {
	  validateClose(open, close);

	  return {
	    type: 'PartialBlockStatement',
	    name: open.path,
	    params: open.params,
	    hash: open.hash,
	    program: program,
	    openStrip: open.strip,
	    closeStrip: close && close.strip,
	    loc: this.locInfo(locInfo)
	  };
	}

	});

	unwrapExports(helpers$2);
	var helpers_1$1 = helpers$2.SourceLocation;
	var helpers_2 = helpers$2.id;
	var helpers_3 = helpers$2.stripFlags;
	var helpers_4 = helpers$2.stripComment;
	var helpers_5 = helpers$2.preparePath;
	var helpers_6 = helpers$2.prepareMustache;
	var helpers_7 = helpers$2.prepareRawBlock;
	var helpers_8 = helpers$2.prepareBlock;
	var helpers_9 = helpers$2.prepareProgram;
	var helpers_10 = helpers$2.preparePartialBlock;

	var base$2 = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;
	exports.parse = parse;
	// istanbul ignore next

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }



	var _parser2 = _interopRequireDefault(parser);



	var _whitespaceControl2 = _interopRequireDefault(whitespaceControl);



	var Helpers = _interopRequireWildcard(helpers$2);



	exports.parser = _parser2['default'];

	var yy = {};
	utils.extend(yy, Helpers);

	function parse(input, options) {
	  // Just return if an already-compiled AST was passed in.
	  if (input.type === 'Program') {
	    return input;
	  }

	  _parser2['default'].yy = yy;

	  // Altering the shared object here, but this is ok as parser is a sync operation
	  yy.locInfo = function (locInfo) {
	    return new yy.SourceLocation(options && options.srcName, locInfo);
	  };

	  var strip = new _whitespaceControl2['default'](options);
	  return strip.accept(_parser2['default'].parse(input));
	}

	});

	unwrapExports(base$2);
	var base_1$1 = base$2.parse;
	var base_2$1 = base$2.parser;

	var compiler = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;
	exports.Compiler = Compiler;
	exports.precompile = precompile;
	exports.compile = compile;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }



	var _exception2 = _interopRequireDefault(exception);





	var _ast2 = _interopRequireDefault(ast);

	var slice = [].slice;

	function Compiler() {}

	// the foundHelper register will disambiguate helper lookup from finding a
	// function in a context. This is necessary for mustache compatibility, which
	// requires that context functions in blocks are evaluated by blockHelperMissing,
	// and then proceed as if the resulting value was provided to blockHelperMissing.

	Compiler.prototype = {
	  compiler: Compiler,

	  equals: function equals(other) {
	    var len = this.opcodes.length;
	    if (other.opcodes.length !== len) {
	      return false;
	    }

	    for (var i = 0; i < len; i++) {
	      var opcode = this.opcodes[i],
	          otherOpcode = other.opcodes[i];
	      if (opcode.opcode !== otherOpcode.opcode || !argEquals(opcode.args, otherOpcode.args)) {
	        return false;
	      }
	    }

	    // We know that length is the same between the two arrays because they are directly tied
	    // to the opcode behavior above.
	    len = this.children.length;
	    for (var i = 0; i < len; i++) {
	      if (!this.children[i].equals(other.children[i])) {
	        return false;
	      }
	    }

	    return true;
	  },

	  guid: 0,

	  compile: function compile(program, options) {
	    this.sourceNode = [];
	    this.opcodes = [];
	    this.children = [];
	    this.options = options;
	    this.stringParams = options.stringParams;
	    this.trackIds = options.trackIds;

	    options.blockParams = options.blockParams || [];

	    // These changes will propagate to the other compiler components
	    var knownHelpers = options.knownHelpers;
	    options.knownHelpers = {
	      'helperMissing': true,
	      'blockHelperMissing': true,
	      'each': true,
	      'if': true,
	      'unless': true,
	      'with': true,
	      'log': true,
	      'lookup': true
	    };
	    if (knownHelpers) {
	      // the next line should use "Object.keys", but the code has been like this a long time and changing it, might
	      // cause backwards-compatibility issues... It's an old library...
	      // eslint-disable-next-line guard-for-in
	      for (var _name in knownHelpers) {
	        this.options.knownHelpers[_name] = knownHelpers[_name];
	      }
	    }

	    return this.accept(program);
	  },

	  compileProgram: function compileProgram(program) {
	    var childCompiler = new this.compiler(),
	        // eslint-disable-line new-cap
	    result = childCompiler.compile(program, this.options),
	        guid = this.guid++;

	    this.usePartial = this.usePartial || result.usePartial;

	    this.children[guid] = result;
	    this.useDepths = this.useDepths || result.useDepths;

	    return guid;
	  },

	  accept: function accept(node) {
	    /* istanbul ignore next: Sanity code */
	    if (!this[node.type]) {
	      throw new _exception2['default']('Unknown type: ' + node.type, node);
	    }

	    this.sourceNode.unshift(node);
	    var ret = this[node.type](node);
	    this.sourceNode.shift();
	    return ret;
	  },

	  Program: function Program(program) {
	    this.options.blockParams.unshift(program.blockParams);

	    var body = program.body,
	        bodyLength = body.length;
	    for (var i = 0; i < bodyLength; i++) {
	      this.accept(body[i]);
	    }

	    this.options.blockParams.shift();

	    this.isSimple = bodyLength === 1;
	    this.blockParams = program.blockParams ? program.blockParams.length : 0;

	    return this;
	  },

	  BlockStatement: function BlockStatement(block) {
	    transformLiteralToPath(block);

	    var program = block.program,
	        inverse = block.inverse;

	    program = program && this.compileProgram(program);
	    inverse = inverse && this.compileProgram(inverse);

	    var type = this.classifySexpr(block);

	    if (type === 'helper') {
	      this.helperSexpr(block, program, inverse);
	    } else if (type === 'simple') {
	      this.simpleSexpr(block);

	      // now that the simple mustache is resolved, we need to
	      // evaluate it by executing `blockHelperMissing`
	      this.opcode('pushProgram', program);
	      this.opcode('pushProgram', inverse);
	      this.opcode('emptyHash');
	      this.opcode('blockValue', block.path.original);
	    } else {
	      this.ambiguousSexpr(block, program, inverse);

	      // now that the simple mustache is resolved, we need to
	      // evaluate it by executing `blockHelperMissing`
	      this.opcode('pushProgram', program);
	      this.opcode('pushProgram', inverse);
	      this.opcode('emptyHash');
	      this.opcode('ambiguousBlockValue');
	    }

	    this.opcode('append');
	  },

	  DecoratorBlock: function DecoratorBlock(decorator) {
	    var program = decorator.program && this.compileProgram(decorator.program);
	    var params = this.setupFullMustacheParams(decorator, program, undefined),
	        path = decorator.path;

	    this.useDecorators = true;
	    this.opcode('registerDecorator', params.length, path.original);
	  },

	  PartialStatement: function PartialStatement(partial) {
	    this.usePartial = true;

	    var program = partial.program;
	    if (program) {
	      program = this.compileProgram(partial.program);
	    }

	    var params = partial.params;
	    if (params.length > 1) {
	      throw new _exception2['default']('Unsupported number of partial arguments: ' + params.length, partial);
	    } else if (!params.length) {
	      if (this.options.explicitPartialContext) {
	        this.opcode('pushLiteral', 'undefined');
	      } else {
	        params.push({ type: 'PathExpression', parts: [], depth: 0 });
	      }
	    }

	    var partialName = partial.name.original,
	        isDynamic = partial.name.type === 'SubExpression';
	    if (isDynamic) {
	      this.accept(partial.name);
	    }

	    this.setupFullMustacheParams(partial, program, undefined, true);

	    var indent = partial.indent || '';
	    if (this.options.preventIndent && indent) {
	      this.opcode('appendContent', indent);
	      indent = '';
	    }

	    this.opcode('invokePartial', isDynamic, partialName, indent);
	    this.opcode('append');
	  },
	  PartialBlockStatement: function PartialBlockStatement(partialBlock) {
	    this.PartialStatement(partialBlock);
	  },

	  MustacheStatement: function MustacheStatement(mustache) {
	    this.SubExpression(mustache);

	    if (mustache.escaped && !this.options.noEscape) {
	      this.opcode('appendEscaped');
	    } else {
	      this.opcode('append');
	    }
	  },
	  Decorator: function Decorator(decorator) {
	    this.DecoratorBlock(decorator);
	  },

	  ContentStatement: function ContentStatement(content) {
	    if (content.value) {
	      this.opcode('appendContent', content.value);
	    }
	  },

	  CommentStatement: function CommentStatement() {},

	  SubExpression: function SubExpression(sexpr) {
	    transformLiteralToPath(sexpr);
	    var type = this.classifySexpr(sexpr);

	    if (type === 'simple') {
	      this.simpleSexpr(sexpr);
	    } else if (type === 'helper') {
	      this.helperSexpr(sexpr);
	    } else {
	      this.ambiguousSexpr(sexpr);
	    }
	  },
	  ambiguousSexpr: function ambiguousSexpr(sexpr, program, inverse) {
	    var path = sexpr.path,
	        name = path.parts[0],
	        isBlock = program != null || inverse != null;

	    this.opcode('getContext', path.depth);

	    this.opcode('pushProgram', program);
	    this.opcode('pushProgram', inverse);

	    path.strict = true;
	    this.accept(path);

	    this.opcode('invokeAmbiguous', name, isBlock);
	  },

	  simpleSexpr: function simpleSexpr(sexpr) {
	    var path = sexpr.path;
	    path.strict = true;
	    this.accept(path);
	    this.opcode('resolvePossibleLambda');
	  },

	  helperSexpr: function helperSexpr(sexpr, program, inverse) {
	    var params = this.setupFullMustacheParams(sexpr, program, inverse),
	        path = sexpr.path,
	        name = path.parts[0];

	    if (this.options.knownHelpers[name]) {
	      this.opcode('invokeKnownHelper', params.length, name);
	    } else if (this.options.knownHelpersOnly) {
	      throw new _exception2['default']('You specified knownHelpersOnly, but used the unknown helper ' + name, sexpr);
	    } else {
	      path.strict = true;
	      path.falsy = true;

	      this.accept(path);
	      this.opcode('invokeHelper', params.length, path.original, _ast2['default'].helpers.simpleId(path));
	    }
	  },

	  PathExpression: function PathExpression(path) {
	    this.addDepth(path.depth);
	    this.opcode('getContext', path.depth);

	    var name = path.parts[0],
	        scoped = _ast2['default'].helpers.scopedId(path),
	        blockParamId = !path.depth && !scoped && this.blockParamIndex(name);

	    if (blockParamId) {
	      this.opcode('lookupBlockParam', blockParamId, path.parts);
	    } else if (!name) {
	      // Context reference, i.e. `{{foo .}}` or `{{foo ..}}`
	      this.opcode('pushContext');
	    } else if (path.data) {
	      this.options.data = true;
	      this.opcode('lookupData', path.depth, path.parts, path.strict);
	    } else {
	      this.opcode('lookupOnContext', path.parts, path.falsy, path.strict, scoped);
	    }
	  },

	  StringLiteral: function StringLiteral(string) {
	    this.opcode('pushString', string.value);
	  },

	  NumberLiteral: function NumberLiteral(number) {
	    this.opcode('pushLiteral', number.value);
	  },

	  BooleanLiteral: function BooleanLiteral(bool) {
	    this.opcode('pushLiteral', bool.value);
	  },

	  UndefinedLiteral: function UndefinedLiteral() {
	    this.opcode('pushLiteral', 'undefined');
	  },

	  NullLiteral: function NullLiteral() {
	    this.opcode('pushLiteral', 'null');
	  },

	  Hash: function Hash(hash) {
	    var pairs = hash.pairs,
	        i = 0,
	        l = pairs.length;

	    this.opcode('pushHash');

	    for (; i < l; i++) {
	      this.pushParam(pairs[i].value);
	    }
	    while (i--) {
	      this.opcode('assignToHash', pairs[i].key);
	    }
	    this.opcode('popHash');
	  },

	  // HELPERS
	  opcode: function opcode(name) {
	    this.opcodes.push({ opcode: name, args: slice.call(arguments, 1), loc: this.sourceNode[0].loc });
	  },

	  addDepth: function addDepth(depth) {
	    if (!depth) {
	      return;
	    }

	    this.useDepths = true;
	  },

	  classifySexpr: function classifySexpr(sexpr) {
	    var isSimple = _ast2['default'].helpers.simpleId(sexpr.path);

	    var isBlockParam = isSimple && !!this.blockParamIndex(sexpr.path.parts[0]);

	    // a mustache is an eligible helper if:
	    // * its id is simple (a single part, not `this` or `..`)
	    var isHelper = !isBlockParam && _ast2['default'].helpers.helperExpression(sexpr);

	    // if a mustache is an eligible helper but not a definite
	    // helper, it is ambiguous, and will be resolved in a later
	    // pass or at runtime.
	    var isEligible = !isBlockParam && (isHelper || isSimple);

	    // if ambiguous, we can possibly resolve the ambiguity now
	    // An eligible helper is one that does not have a complex path, i.e. `this.foo`, `../foo` etc.
	    if (isEligible && !isHelper) {
	      var _name2 = sexpr.path.parts[0],
	          options = this.options;

	      if (options.knownHelpers[_name2]) {
	        isHelper = true;
	      } else if (options.knownHelpersOnly) {
	        isEligible = false;
	      }
	    }

	    if (isHelper) {
	      return 'helper';
	    } else if (isEligible) {
	      return 'ambiguous';
	    } else {
	      return 'simple';
	    }
	  },

	  pushParams: function pushParams(params) {
	    for (var i = 0, l = params.length; i < l; i++) {
	      this.pushParam(params[i]);
	    }
	  },

	  pushParam: function pushParam(val) {
	    var value = val.value != null ? val.value : val.original || '';

	    if (this.stringParams) {
	      if (value.replace) {
	        value = value.replace(/^(\.?\.\/)*/g, '').replace(/\//g, '.');
	      }

	      if (val.depth) {
	        this.addDepth(val.depth);
	      }
	      this.opcode('getContext', val.depth || 0);
	      this.opcode('pushStringParam', value, val.type);

	      if (val.type === 'SubExpression') {
	        // SubExpressions get evaluated and passed in
	        // in string params mode.
	        this.accept(val);
	      }
	    } else {
	      if (this.trackIds) {
	        var blockParamIndex = undefined;
	        if (val.parts && !_ast2['default'].helpers.scopedId(val) && !val.depth) {
	          blockParamIndex = this.blockParamIndex(val.parts[0]);
	        }
	        if (blockParamIndex) {
	          var blockParamChild = val.parts.slice(1).join('.');
	          this.opcode('pushId', 'BlockParam', blockParamIndex, blockParamChild);
	        } else {
	          value = val.original || value;
	          if (value.replace) {
	            value = value.replace(/^this(?:\.|$)/, '').replace(/^\.\//, '').replace(/^\.$/, '');
	          }

	          this.opcode('pushId', val.type, value);
	        }
	      }
	      this.accept(val);
	    }
	  },

	  setupFullMustacheParams: function setupFullMustacheParams(sexpr, program, inverse, omitEmpty) {
	    var params = sexpr.params;
	    this.pushParams(params);

	    this.opcode('pushProgram', program);
	    this.opcode('pushProgram', inverse);

	    if (sexpr.hash) {
	      this.accept(sexpr.hash);
	    } else {
	      this.opcode('emptyHash', omitEmpty);
	    }

	    return params;
	  },

	  blockParamIndex: function blockParamIndex(name) {
	    for (var depth = 0, len = this.options.blockParams.length; depth < len; depth++) {
	      var blockParams = this.options.blockParams[depth],
	          param = blockParams && utils.indexOf(blockParams, name);
	      if (blockParams && param >= 0) {
	        return [depth, param];
	      }
	    }
	  }
	};

	function precompile(input, options, env) {
	  if (input == null || typeof input !== 'string' && input.type !== 'Program') {
	    throw new _exception2['default']('You must pass a string or Handlebars AST to Handlebars.precompile. You passed ' + input);
	  }

	  options = options || {};
	  if (!('data' in options)) {
	    options.data = true;
	  }
	  if (options.compat) {
	    options.useDepths = true;
	  }

	  var ast$$1 = env.parse(input, options),
	      environment = new env.Compiler().compile(ast$$1, options);
	  return new env.JavaScriptCompiler().compile(environment, options);
	}

	function compile(input, options, env) {
	  if (options === undefined) options = {};

	  if (input == null || typeof input !== 'string' && input.type !== 'Program') {
	    throw new _exception2['default']('You must pass a string or Handlebars AST to Handlebars.compile. You passed ' + input);
	  }

	  options = utils.extend({}, options);
	  if (!('data' in options)) {
	    options.data = true;
	  }
	  if (options.compat) {
	    options.useDepths = true;
	  }

	  var compiled = undefined;

	  function compileInput() {
	    var ast$$1 = env.parse(input, options),
	        environment = new env.Compiler().compile(ast$$1, options),
	        templateSpec = new env.JavaScriptCompiler().compile(environment, options, undefined, true);
	    return env.template(templateSpec);
	  }

	  // Template is only compiled on first use and cached after that point.
	  function ret(context, execOptions) {
	    if (!compiled) {
	      compiled = compileInput();
	    }
	    return compiled.call(this, context, execOptions);
	  }
	  ret._setup = function (setupOptions) {
	    if (!compiled) {
	      compiled = compileInput();
	    }
	    return compiled._setup(setupOptions);
	  };
	  ret._child = function (i, data, blockParams, depths) {
	    if (!compiled) {
	      compiled = compileInput();
	    }
	    return compiled._child(i, data, blockParams, depths);
	  };
	  return ret;
	}

	function argEquals(a, b) {
	  if (a === b) {
	    return true;
	  }

	  if (utils.isArray(a) && utils.isArray(b) && a.length === b.length) {
	    for (var i = 0; i < a.length; i++) {
	      if (!argEquals(a[i], b[i])) {
	        return false;
	      }
	    }
	    return true;
	  }
	}

	function transformLiteralToPath(sexpr) {
	  if (!sexpr.path.parts) {
	    var literal = sexpr.path;
	    // Casting to string here to make false and 0 literal values play nicely with the rest
	    // of the system.
	    sexpr.path = {
	      type: 'PathExpression',
	      data: false,
	      depth: 0,
	      parts: [literal.original + ''],
	      original: literal.original + '',
	      loc: literal.loc
	    };
	  }
	}

	});

	unwrapExports(compiler);
	var compiler_1 = compiler.Compiler;
	var compiler_2 = compiler.precompile;
	var compiler_3 = compiler.compile;

	/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */

	var intToCharMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

	/**
	 * Encode an integer in the range of 0 to 63 to a single base 64 digit.
	 */
	var encode = function (number) {
	  if (0 <= number && number < intToCharMap.length) {
	    return intToCharMap[number];
	  }
	  throw new TypeError("Must be between 0 and 63: " + number);
	};

	/**
	 * Decode a single base 64 character code digit to an integer. Returns -1 on
	 * failure.
	 */
	var decode = function (charCode) {
	  var bigA = 65;     // 'A'
	  var bigZ = 90;     // 'Z'

	  var littleA = 97;  // 'a'
	  var littleZ = 122; // 'z'

	  var zero = 48;     // '0'
	  var nine = 57;     // '9'

	  var plus = 43;     // '+'
	  var slash = 47;    // '/'

	  var littleOffset = 26;
	  var numberOffset = 52;

	  // 0 - 25: ABCDEFGHIJKLMNOPQRSTUVWXYZ
	  if (bigA <= charCode && charCode <= bigZ) {
	    return (charCode - bigA);
	  }

	  // 26 - 51: abcdefghijklmnopqrstuvwxyz
	  if (littleA <= charCode && charCode <= littleZ) {
	    return (charCode - littleA + littleOffset);
	  }

	  // 52 - 61: 0123456789
	  if (zero <= charCode && charCode <= nine) {
	    return (charCode - zero + numberOffset);
	  }

	  // 62: +
	  if (charCode == plus) {
	    return 62;
	  }

	  // 63: /
	  if (charCode == slash) {
	    return 63;
	  }

	  // Invalid base64 digit.
	  return -1;
	};

	var base64 = {
		encode: encode,
		decode: decode
	};

	/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 *
	 * Based on the Base 64 VLQ implementation in Closure Compiler:
	 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
	 *
	 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
	 * Redistribution and use in source and binary forms, with or without
	 * modification, are permitted provided that the following conditions are
	 * met:
	 *
	 *  * Redistributions of source code must retain the above copyright
	 *    notice, this list of conditions and the following disclaimer.
	 *  * Redistributions in binary form must reproduce the above
	 *    copyright notice, this list of conditions and the following
	 *    disclaimer in the documentation and/or other materials provided
	 *    with the distribution.
	 *  * Neither the name of Google Inc. nor the names of its
	 *    contributors may be used to endorse or promote products derived
	 *    from this software without specific prior written permission.
	 *
	 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
	 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
	 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
	 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
	 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
	 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
	 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
	 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
	 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */



	// A single base 64 digit can contain 6 bits of data. For the base 64 variable
	// length quantities we use in the source map spec, the first bit is the sign,
	// the next four bits are the actual value, and the 6th bit is the
	// continuation bit. The continuation bit tells us whether there are more
	// digits in this value following this digit.
	//
	//   Continuation
	//   |    Sign
	//   |    |
	//   V    V
	//   101011

	var VLQ_BASE_SHIFT = 5;

	// binary: 100000
	var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

	// binary: 011111
	var VLQ_BASE_MASK = VLQ_BASE - 1;

	// binary: 100000
	var VLQ_CONTINUATION_BIT = VLQ_BASE;

	/**
	 * Converts from a two-complement value to a value where the sign bit is
	 * placed in the least significant bit.  For example, as decimals:
	 *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
	 *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
	 */
	function toVLQSigned(aValue) {
	  return aValue < 0
	    ? ((-aValue) << 1) + 1
	    : (aValue << 1) + 0;
	}

	/**
	 * Converts to a two-complement value from a value where the sign bit is
	 * placed in the least significant bit.  For example, as decimals:
	 *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
	 *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
	 */
	function fromVLQSigned(aValue) {
	  var isNegative = (aValue & 1) === 1;
	  var shifted = aValue >> 1;
	  return isNegative
	    ? -shifted
	    : shifted;
	}

	/**
	 * Returns the base 64 VLQ encoded value.
	 */
	var encode$1 = function base64VLQ_encode(aValue) {
	  var encoded = "";
	  var digit;

	  var vlq = toVLQSigned(aValue);

	  do {
	    digit = vlq & VLQ_BASE_MASK;
	    vlq >>>= VLQ_BASE_SHIFT;
	    if (vlq > 0) {
	      // There are still more digits in this value, so we must make sure the
	      // continuation bit is marked.
	      digit |= VLQ_CONTINUATION_BIT;
	    }
	    encoded += base64.encode(digit);
	  } while (vlq > 0);

	  return encoded;
	};

	/**
	 * Decodes the next base 64 VLQ value from the given string and returns the
	 * value and the rest of the string via the out parameter.
	 */
	var decode$1 = function base64VLQ_decode(aStr, aIndex, aOutParam) {
	  var strLen = aStr.length;
	  var result = 0;
	  var shift = 0;
	  var continuation, digit;

	  do {
	    if (aIndex >= strLen) {
	      throw new Error("Expected more digits in base 64 VLQ value.");
	    }

	    digit = base64.decode(aStr.charCodeAt(aIndex++));
	    if (digit === -1) {
	      throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
	    }

	    continuation = !!(digit & VLQ_CONTINUATION_BIT);
	    digit &= VLQ_BASE_MASK;
	    result = result + (digit << shift);
	    shift += VLQ_BASE_SHIFT;
	  } while (continuation);

	  aOutParam.value = fromVLQSigned(result);
	  aOutParam.rest = aIndex;
	};

	var base64Vlq = {
		encode: encode$1,
		decode: decode$1
	};

	var util$1 = createCommonjsModule(function (module, exports) {
	/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */

	/**
	 * This is a helper function for getting values from parameter/options
	 * objects.
	 *
	 * @param args The object we are extracting values from
	 * @param name The name of the property we are getting.
	 * @param defaultValue An optional value to return if the property is missing
	 * from the object. If this is not specified and the property is missing, an
	 * error will be thrown.
	 */
	function getArg(aArgs, aName, aDefaultValue) {
	  if (aName in aArgs) {
	    return aArgs[aName];
	  } else if (arguments.length === 3) {
	    return aDefaultValue;
	  } else {
	    throw new Error('"' + aName + '" is a required argument.');
	  }
	}
	exports.getArg = getArg;

	var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.-]*)(?::(\d+))?(.*)$/;
	var dataUrlRegexp = /^data:.+\,.+$/;

	function urlParse(aUrl) {
	  var match = aUrl.match(urlRegexp);
	  if (!match) {
	    return null;
	  }
	  return {
	    scheme: match[1],
	    auth: match[2],
	    host: match[3],
	    port: match[4],
	    path: match[5]
	  };
	}
	exports.urlParse = urlParse;

	function urlGenerate(aParsedUrl) {
	  var url = '';
	  if (aParsedUrl.scheme) {
	    url += aParsedUrl.scheme + ':';
	  }
	  url += '//';
	  if (aParsedUrl.auth) {
	    url += aParsedUrl.auth + '@';
	  }
	  if (aParsedUrl.host) {
	    url += aParsedUrl.host;
	  }
	  if (aParsedUrl.port) {
	    url += ":" + aParsedUrl.port;
	  }
	  if (aParsedUrl.path) {
	    url += aParsedUrl.path;
	  }
	  return url;
	}
	exports.urlGenerate = urlGenerate;

	/**
	 * Normalizes a path, or the path portion of a URL:
	 *
	 * - Replaces consecutive slashes with one slash.
	 * - Removes unnecessary '.' parts.
	 * - Removes unnecessary '<dir>/..' parts.
	 *
	 * Based on code in the Node.js 'path' core module.
	 *
	 * @param aPath The path or url to normalize.
	 */
	function normalize(aPath) {
	  var path = aPath;
	  var url = urlParse(aPath);
	  if (url) {
	    if (!url.path) {
	      return aPath;
	    }
	    path = url.path;
	  }
	  var isAbsolute = exports.isAbsolute(path);

	  var parts = path.split(/\/+/);
	  for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
	    part = parts[i];
	    if (part === '.') {
	      parts.splice(i, 1);
	    } else if (part === '..') {
	      up++;
	    } else if (up > 0) {
	      if (part === '') {
	        // The first part is blank if the path is absolute. Trying to go
	        // above the root is a no-op. Therefore we can remove all '..' parts
	        // directly after the root.
	        parts.splice(i + 1, up);
	        up = 0;
	      } else {
	        parts.splice(i, 2);
	        up--;
	      }
	    }
	  }
	  path = parts.join('/');

	  if (path === '') {
	    path = isAbsolute ? '/' : '.';
	  }

	  if (url) {
	    url.path = path;
	    return urlGenerate(url);
	  }
	  return path;
	}
	exports.normalize = normalize;

	/**
	 * Joins two paths/URLs.
	 *
	 * @param aRoot The root path or URL.
	 * @param aPath The path or URL to be joined with the root.
	 *
	 * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
	 *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
	 *   first.
	 * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
	 *   is updated with the result and aRoot is returned. Otherwise the result
	 *   is returned.
	 *   - If aPath is absolute, the result is aPath.
	 *   - Otherwise the two paths are joined with a slash.
	 * - Joining for example 'http://' and 'www.example.com' is also supported.
	 */
	function join(aRoot, aPath) {
	  if (aRoot === "") {
	    aRoot = ".";
	  }
	  if (aPath === "") {
	    aPath = ".";
	  }
	  var aPathUrl = urlParse(aPath);
	  var aRootUrl = urlParse(aRoot);
	  if (aRootUrl) {
	    aRoot = aRootUrl.path || '/';
	  }

	  // `join(foo, '//www.example.org')`
	  if (aPathUrl && !aPathUrl.scheme) {
	    if (aRootUrl) {
	      aPathUrl.scheme = aRootUrl.scheme;
	    }
	    return urlGenerate(aPathUrl);
	  }

	  if (aPathUrl || aPath.match(dataUrlRegexp)) {
	    return aPath;
	  }

	  // `join('http://', 'www.example.com')`
	  if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
	    aRootUrl.host = aPath;
	    return urlGenerate(aRootUrl);
	  }

	  var joined = aPath.charAt(0) === '/'
	    ? aPath
	    : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);

	  if (aRootUrl) {
	    aRootUrl.path = joined;
	    return urlGenerate(aRootUrl);
	  }
	  return joined;
	}
	exports.join = join;

	exports.isAbsolute = function (aPath) {
	  return aPath.charAt(0) === '/' || urlRegexp.test(aPath);
	};

	/**
	 * Make a path relative to a URL or another path.
	 *
	 * @param aRoot The root path or URL.
	 * @param aPath The path or URL to be made relative to aRoot.
	 */
	function relative(aRoot, aPath) {
	  if (aRoot === "") {
	    aRoot = ".";
	  }

	  aRoot = aRoot.replace(/\/$/, '');

	  // It is possible for the path to be above the root. In this case, simply
	  // checking whether the root is a prefix of the path won't work. Instead, we
	  // need to remove components from the root one by one, until either we find
	  // a prefix that fits, or we run out of components to remove.
	  var level = 0;
	  while (aPath.indexOf(aRoot + '/') !== 0) {
	    var index = aRoot.lastIndexOf("/");
	    if (index < 0) {
	      return aPath;
	    }

	    // If the only part of the root that is left is the scheme (i.e. http://,
	    // file:///, etc.), one or more slashes (/), or simply nothing at all, we
	    // have exhausted all components, so the path is not relative to the root.
	    aRoot = aRoot.slice(0, index);
	    if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
	      return aPath;
	    }

	    ++level;
	  }

	  // Make sure we add a "../" for each component we removed from the root.
	  return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
	}
	exports.relative = relative;

	var supportsNullProto = (function () {
	  var obj = Object.create(null);
	  return !('__proto__' in obj);
	}());

	function identity (s) {
	  return s;
	}

	/**
	 * Because behavior goes wacky when you set `__proto__` on objects, we
	 * have to prefix all the strings in our set with an arbitrary character.
	 *
	 * See https://github.com/mozilla/source-map/pull/31 and
	 * https://github.com/mozilla/source-map/issues/30
	 *
	 * @param String aStr
	 */
	function toSetString(aStr) {
	  if (isProtoString(aStr)) {
	    return '$' + aStr;
	  }

	  return aStr;
	}
	exports.toSetString = supportsNullProto ? identity : toSetString;

	function fromSetString(aStr) {
	  if (isProtoString(aStr)) {
	    return aStr.slice(1);
	  }

	  return aStr;
	}
	exports.fromSetString = supportsNullProto ? identity : fromSetString;

	function isProtoString(s) {
	  if (!s) {
	    return false;
	  }

	  var length = s.length;

	  if (length < 9 /* "__proto__".length */) {
	    return false;
	  }

	  if (s.charCodeAt(length - 1) !== 95  /* '_' */ ||
	      s.charCodeAt(length - 2) !== 95  /* '_' */ ||
	      s.charCodeAt(length - 3) !== 111 /* 'o' */ ||
	      s.charCodeAt(length - 4) !== 116 /* 't' */ ||
	      s.charCodeAt(length - 5) !== 111 /* 'o' */ ||
	      s.charCodeAt(length - 6) !== 114 /* 'r' */ ||
	      s.charCodeAt(length - 7) !== 112 /* 'p' */ ||
	      s.charCodeAt(length - 8) !== 95  /* '_' */ ||
	      s.charCodeAt(length - 9) !== 95  /* '_' */) {
	    return false;
	  }

	  for (var i = length - 10; i >= 0; i--) {
	    if (s.charCodeAt(i) !== 36 /* '$' */) {
	      return false;
	    }
	  }

	  return true;
	}

	/**
	 * Comparator between two mappings where the original positions are compared.
	 *
	 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
	 * mappings with the same original source/line/column, but different generated
	 * line and column the same. Useful when searching for a mapping with a
	 * stubbed out mapping.
	 */
	function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
	  var cmp = strcmp(mappingA.source, mappingB.source);
	  if (cmp !== 0) {
	    return cmp;
	  }

	  cmp = mappingA.originalLine - mappingB.originalLine;
	  if (cmp !== 0) {
	    return cmp;
	  }

	  cmp = mappingA.originalColumn - mappingB.originalColumn;
	  if (cmp !== 0 || onlyCompareOriginal) {
	    return cmp;
	  }

	  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
	  if (cmp !== 0) {
	    return cmp;
	  }

	  cmp = mappingA.generatedLine - mappingB.generatedLine;
	  if (cmp !== 0) {
	    return cmp;
	  }

	  return strcmp(mappingA.name, mappingB.name);
	}
	exports.compareByOriginalPositions = compareByOriginalPositions;

	/**
	 * Comparator between two mappings with deflated source and name indices where
	 * the generated positions are compared.
	 *
	 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
	 * mappings with the same generated line and column, but different
	 * source/name/original line and column the same. Useful when searching for a
	 * mapping with a stubbed out mapping.
	 */
	function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
	  var cmp = mappingA.generatedLine - mappingB.generatedLine;
	  if (cmp !== 0) {
	    return cmp;
	  }

	  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
	  if (cmp !== 0 || onlyCompareGenerated) {
	    return cmp;
	  }

	  cmp = strcmp(mappingA.source, mappingB.source);
	  if (cmp !== 0) {
	    return cmp;
	  }

	  cmp = mappingA.originalLine - mappingB.originalLine;
	  if (cmp !== 0) {
	    return cmp;
	  }

	  cmp = mappingA.originalColumn - mappingB.originalColumn;
	  if (cmp !== 0) {
	    return cmp;
	  }

	  return strcmp(mappingA.name, mappingB.name);
	}
	exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;

	function strcmp(aStr1, aStr2) {
	  if (aStr1 === aStr2) {
	    return 0;
	  }

	  if (aStr1 === null) {
	    return 1; // aStr2 !== null
	  }

	  if (aStr2 === null) {
	    return -1; // aStr1 !== null
	  }

	  if (aStr1 > aStr2) {
	    return 1;
	  }

	  return -1;
	}

	/**
	 * Comparator between two mappings with inflated source and name strings where
	 * the generated positions are compared.
	 */
	function compareByGeneratedPositionsInflated(mappingA, mappingB) {
	  var cmp = mappingA.generatedLine - mappingB.generatedLine;
	  if (cmp !== 0) {
	    return cmp;
	  }

	  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
	  if (cmp !== 0) {
	    return cmp;
	  }

	  cmp = strcmp(mappingA.source, mappingB.source);
	  if (cmp !== 0) {
	    return cmp;
	  }

	  cmp = mappingA.originalLine - mappingB.originalLine;
	  if (cmp !== 0) {
	    return cmp;
	  }

	  cmp = mappingA.originalColumn - mappingB.originalColumn;
	  if (cmp !== 0) {
	    return cmp;
	  }

	  return strcmp(mappingA.name, mappingB.name);
	}
	exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;

	/**
	 * Strip any JSON XSSI avoidance prefix from the string (as documented
	 * in the source maps specification), and then parse the string as
	 * JSON.
	 */
	function parseSourceMapInput(str) {
	  return JSON.parse(str.replace(/^\)]}'[^\n]*\n/, ''));
	}
	exports.parseSourceMapInput = parseSourceMapInput;

	/**
	 * Compute the URL of a source given the the source root, the source's
	 * URL, and the source map's URL.
	 */
	function computeSourceURL(sourceRoot, sourceURL, sourceMapURL) {
	  sourceURL = sourceURL || '';

	  if (sourceRoot) {
	    // This follows what Chrome does.
	    if (sourceRoot[sourceRoot.length - 1] !== '/' && sourceURL[0] !== '/') {
	      sourceRoot += '/';
	    }
	    // The spec says:
	    //   Line 4: An optional source root, useful for relocating source
	    //   files on a server or removing repeated values in the
	    //   “sources” entry.  This value is prepended to the individual
	    //   entries in the “source” field.
	    sourceURL = sourceRoot + sourceURL;
	  }

	  // Historically, SourceMapConsumer did not take the sourceMapURL as
	  // a parameter.  This mode is still somewhat supported, which is why
	  // this code block is conditional.  However, it's preferable to pass
	  // the source map URL to SourceMapConsumer, so that this function
	  // can implement the source URL resolution algorithm as outlined in
	  // the spec.  This block is basically the equivalent of:
	  //    new URL(sourceURL, sourceMapURL).toString()
	  // ... except it avoids using URL, which wasn't available in the
	  // older releases of node still supported by this library.
	  //
	  // The spec says:
	  //   If the sources are not absolute URLs after prepending of the
	  //   “sourceRoot”, the sources are resolved relative to the
	  //   SourceMap (like resolving script src in a html document).
	  if (sourceMapURL) {
	    var parsed = urlParse(sourceMapURL);
	    if (!parsed) {
	      throw new Error("sourceMapURL could not be parsed");
	    }
	    if (parsed.path) {
	      // Strip the last path component, but keep the "/".
	      var index = parsed.path.lastIndexOf('/');
	      if (index >= 0) {
	        parsed.path = parsed.path.substring(0, index + 1);
	      }
	    }
	    sourceURL = join(urlGenerate(parsed), sourceURL);
	  }

	  return normalize(sourceURL);
	}
	exports.computeSourceURL = computeSourceURL;
	});
	var util_1 = util$1.getArg;
	var util_2 = util$1.urlParse;
	var util_3 = util$1.urlGenerate;
	var util_4 = util$1.normalize;
	var util_5 = util$1.join;
	var util_6 = util$1.isAbsolute;
	var util_7 = util$1.relative;
	var util_8 = util$1.toSetString;
	var util_9 = util$1.fromSetString;
	var util_10 = util$1.compareByOriginalPositions;
	var util_11 = util$1.compareByGeneratedPositionsDeflated;
	var util_12 = util$1.compareByGeneratedPositionsInflated;
	var util_13 = util$1.parseSourceMapInput;
	var util_14 = util$1.computeSourceURL;

	/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */


	var has = Object.prototype.hasOwnProperty;
	var hasNativeMap = typeof Map !== "undefined";

	/**
	 * A data structure which is a combination of an array and a set. Adding a new
	 * member is O(1), testing for membership is O(1), and finding the index of an
	 * element is O(1). Removing elements from the set is not supported. Only
	 * strings are supported for membership.
	 */
	function ArraySet() {
	  this._array = [];
	  this._set = hasNativeMap ? new Map() : Object.create(null);
	}

	/**
	 * Static method for creating ArraySet instances from an existing array.
	 */
	ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
	  var set = new ArraySet();
	  for (var i = 0, len = aArray.length; i < len; i++) {
	    set.add(aArray[i], aAllowDuplicates);
	  }
	  return set;
	};

	/**
	 * Return how many unique items are in this ArraySet. If duplicates have been
	 * added, than those do not count towards the size.
	 *
	 * @returns Number
	 */
	ArraySet.prototype.size = function ArraySet_size() {
	  return hasNativeMap ? this._set.size : Object.getOwnPropertyNames(this._set).length;
	};

	/**
	 * Add the given string to this set.
	 *
	 * @param String aStr
	 */
	ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
	  var sStr = hasNativeMap ? aStr : util$1.toSetString(aStr);
	  var isDuplicate = hasNativeMap ? this.has(aStr) : has.call(this._set, sStr);
	  var idx = this._array.length;
	  if (!isDuplicate || aAllowDuplicates) {
	    this._array.push(aStr);
	  }
	  if (!isDuplicate) {
	    if (hasNativeMap) {
	      this._set.set(aStr, idx);
	    } else {
	      this._set[sStr] = idx;
	    }
	  }
	};

	/**
	 * Is the given string a member of this set?
	 *
	 * @param String aStr
	 */
	ArraySet.prototype.has = function ArraySet_has(aStr) {
	  if (hasNativeMap) {
	    return this._set.has(aStr);
	  } else {
	    var sStr = util$1.toSetString(aStr);
	    return has.call(this._set, sStr);
	  }
	};

	/**
	 * What is the index of the given string in the array?
	 *
	 * @param String aStr
	 */
	ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
	  if (hasNativeMap) {
	    var idx = this._set.get(aStr);
	    if (idx >= 0) {
	        return idx;
	    }
	  } else {
	    var sStr = util$1.toSetString(aStr);
	    if (has.call(this._set, sStr)) {
	      return this._set[sStr];
	    }
	  }

	  throw new Error('"' + aStr + '" is not in the set.');
	};

	/**
	 * What is the element at the given index?
	 *
	 * @param Number aIdx
	 */
	ArraySet.prototype.at = function ArraySet_at(aIdx) {
	  if (aIdx >= 0 && aIdx < this._array.length) {
	    return this._array[aIdx];
	  }
	  throw new Error('No element indexed by ' + aIdx);
	};

	/**
	 * Returns the array representation of this set (which has the proper indices
	 * indicated by indexOf). Note that this is a copy of the internal array used
	 * for storing the members so that no one can mess with internal state.
	 */
	ArraySet.prototype.toArray = function ArraySet_toArray() {
	  return this._array.slice();
	};

	var ArraySet_1 = ArraySet;

	var arraySet = {
		ArraySet: ArraySet_1
	};

	/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2014 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */



	/**
	 * Determine whether mappingB is after mappingA with respect to generated
	 * position.
	 */
	function generatedPositionAfter(mappingA, mappingB) {
	  // Optimized for most common case
	  var lineA = mappingA.generatedLine;
	  var lineB = mappingB.generatedLine;
	  var columnA = mappingA.generatedColumn;
	  var columnB = mappingB.generatedColumn;
	  return lineB > lineA || lineB == lineA && columnB >= columnA ||
	         util$1.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
	}

	/**
	 * A data structure to provide a sorted view of accumulated mappings in a
	 * performance conscious manner. It trades a neglibable overhead in general
	 * case for a large speedup in case of mappings being added in order.
	 */
	function MappingList() {
	  this._array = [];
	  this._sorted = true;
	  // Serves as infimum
	  this._last = {generatedLine: -1, generatedColumn: 0};
	}

	/**
	 * Iterate through internal items. This method takes the same arguments that
	 * `Array.prototype.forEach` takes.
	 *
	 * NOTE: The order of the mappings is NOT guaranteed.
	 */
	MappingList.prototype.unsortedForEach =
	  function MappingList_forEach(aCallback, aThisArg) {
	    this._array.forEach(aCallback, aThisArg);
	  };

	/**
	 * Add the given source mapping.
	 *
	 * @param Object aMapping
	 */
	MappingList.prototype.add = function MappingList_add(aMapping) {
	  if (generatedPositionAfter(this._last, aMapping)) {
	    this._last = aMapping;
	    this._array.push(aMapping);
	  } else {
	    this._sorted = false;
	    this._array.push(aMapping);
	  }
	};

	/**
	 * Returns the flat, sorted array of mappings. The mappings are sorted by
	 * generated position.
	 *
	 * WARNING: This method returns internal data without copying, for
	 * performance. The return value must NOT be mutated, and should be treated as
	 * an immutable borrow. If you want to take ownership, you must make your own
	 * copy.
	 */
	MappingList.prototype.toArray = function MappingList_toArray() {
	  if (!this._sorted) {
	    this._array.sort(util$1.compareByGeneratedPositionsInflated);
	    this._sorted = true;
	  }
	  return this._array;
	};

	var MappingList_1 = MappingList;

	var mappingList = {
		MappingList: MappingList_1
	};

	/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */



	var ArraySet$1 = arraySet.ArraySet;
	var MappingList$1 = mappingList.MappingList;

	/**
	 * An instance of the SourceMapGenerator represents a source map which is
	 * being built incrementally. You may pass an object with the following
	 * properties:
	 *
	 *   - file: The filename of the generated source.
	 *   - sourceRoot: A root for all relative URLs in this source map.
	 */
	function SourceMapGenerator(aArgs) {
	  if (!aArgs) {
	    aArgs = {};
	  }
	  this._file = util$1.getArg(aArgs, 'file', null);
	  this._sourceRoot = util$1.getArg(aArgs, 'sourceRoot', null);
	  this._skipValidation = util$1.getArg(aArgs, 'skipValidation', false);
	  this._sources = new ArraySet$1();
	  this._names = new ArraySet$1();
	  this._mappings = new MappingList$1();
	  this._sourcesContents = null;
	}

	SourceMapGenerator.prototype._version = 3;

	/**
	 * Creates a new SourceMapGenerator based on a SourceMapConsumer
	 *
	 * @param aSourceMapConsumer The SourceMap.
	 */
	SourceMapGenerator.fromSourceMap =
	  function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
	    var sourceRoot = aSourceMapConsumer.sourceRoot;
	    var generator = new SourceMapGenerator({
	      file: aSourceMapConsumer.file,
	      sourceRoot: sourceRoot
	    });
	    aSourceMapConsumer.eachMapping(function (mapping) {
	      var newMapping = {
	        generated: {
	          line: mapping.generatedLine,
	          column: mapping.generatedColumn
	        }
	      };

	      if (mapping.source != null) {
	        newMapping.source = mapping.source;
	        if (sourceRoot != null) {
	          newMapping.source = util$1.relative(sourceRoot, newMapping.source);
	        }

	        newMapping.original = {
	          line: mapping.originalLine,
	          column: mapping.originalColumn
	        };

	        if (mapping.name != null) {
	          newMapping.name = mapping.name;
	        }
	      }

	      generator.addMapping(newMapping);
	    });
	    aSourceMapConsumer.sources.forEach(function (sourceFile) {
	      var sourceRelative = sourceFile;
	      if (sourceRoot !== null) {
	        sourceRelative = util$1.relative(sourceRoot, sourceFile);
	      }

	      if (!generator._sources.has(sourceRelative)) {
	        generator._sources.add(sourceRelative);
	      }

	      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
	      if (content != null) {
	        generator.setSourceContent(sourceFile, content);
	      }
	    });
	    return generator;
	  };

	/**
	 * Add a single mapping from original source line and column to the generated
	 * source's line and column for this source map being created. The mapping
	 * object should have the following properties:
	 *
	 *   - generated: An object with the generated line and column positions.
	 *   - original: An object with the original line and column positions.
	 *   - source: The original source file (relative to the sourceRoot).
	 *   - name: An optional original token name for this mapping.
	 */
	SourceMapGenerator.prototype.addMapping =
	  function SourceMapGenerator_addMapping(aArgs) {
	    var generated = util$1.getArg(aArgs, 'generated');
	    var original = util$1.getArg(aArgs, 'original', null);
	    var source = util$1.getArg(aArgs, 'source', null);
	    var name = util$1.getArg(aArgs, 'name', null);

	    if (!this._skipValidation) {
	      this._validateMapping(generated, original, source, name);
	    }

	    if (source != null) {
	      source = String(source);
	      if (!this._sources.has(source)) {
	        this._sources.add(source);
	      }
	    }

	    if (name != null) {
	      name = String(name);
	      if (!this._names.has(name)) {
	        this._names.add(name);
	      }
	    }

	    this._mappings.add({
	      generatedLine: generated.line,
	      generatedColumn: generated.column,
	      originalLine: original != null && original.line,
	      originalColumn: original != null && original.column,
	      source: source,
	      name: name
	    });
	  };

	/**
	 * Set the source content for a source file.
	 */
	SourceMapGenerator.prototype.setSourceContent =
	  function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
	    var source = aSourceFile;
	    if (this._sourceRoot != null) {
	      source = util$1.relative(this._sourceRoot, source);
	    }

	    if (aSourceContent != null) {
	      // Add the source content to the _sourcesContents map.
	      // Create a new _sourcesContents map if the property is null.
	      if (!this._sourcesContents) {
	        this._sourcesContents = Object.create(null);
	      }
	      this._sourcesContents[util$1.toSetString(source)] = aSourceContent;
	    } else if (this._sourcesContents) {
	      // Remove the source file from the _sourcesContents map.
	      // If the _sourcesContents map is empty, set the property to null.
	      delete this._sourcesContents[util$1.toSetString(source)];
	      if (Object.keys(this._sourcesContents).length === 0) {
	        this._sourcesContents = null;
	      }
	    }
	  };

	/**
	 * Applies the mappings of a sub-source-map for a specific source file to the
	 * source map being generated. Each mapping to the supplied source file is
	 * rewritten using the supplied source map. Note: The resolution for the
	 * resulting mappings is the minimium of this map and the supplied map.
	 *
	 * @param aSourceMapConsumer The source map to be applied.
	 * @param aSourceFile Optional. The filename of the source file.
	 *        If omitted, SourceMapConsumer's file property will be used.
	 * @param aSourceMapPath Optional. The dirname of the path to the source map
	 *        to be applied. If relative, it is relative to the SourceMapConsumer.
	 *        This parameter is needed when the two source maps aren't in the same
	 *        directory, and the source map to be applied contains relative source
	 *        paths. If so, those relative source paths need to be rewritten
	 *        relative to the SourceMapGenerator.
	 */
	SourceMapGenerator.prototype.applySourceMap =
	  function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
	    var sourceFile = aSourceFile;
	    // If aSourceFile is omitted, we will use the file property of the SourceMap
	    if (aSourceFile == null) {
	      if (aSourceMapConsumer.file == null) {
	        throw new Error(
	          'SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, ' +
	          'or the source map\'s "file" property. Both were omitted.'
	        );
	      }
	      sourceFile = aSourceMapConsumer.file;
	    }
	    var sourceRoot = this._sourceRoot;
	    // Make "sourceFile" relative if an absolute Url is passed.
	    if (sourceRoot != null) {
	      sourceFile = util$1.relative(sourceRoot, sourceFile);
	    }
	    // Applying the SourceMap can add and remove items from the sources and
	    // the names array.
	    var newSources = new ArraySet$1();
	    var newNames = new ArraySet$1();

	    // Find mappings for the "sourceFile"
	    this._mappings.unsortedForEach(function (mapping) {
	      if (mapping.source === sourceFile && mapping.originalLine != null) {
	        // Check if it can be mapped by the source map, then update the mapping.
	        var original = aSourceMapConsumer.originalPositionFor({
	          line: mapping.originalLine,
	          column: mapping.originalColumn
	        });
	        if (original.source != null) {
	          // Copy mapping
	          mapping.source = original.source;
	          if (aSourceMapPath != null) {
	            mapping.source = util$1.join(aSourceMapPath, mapping.source);
	          }
	          if (sourceRoot != null) {
	            mapping.source = util$1.relative(sourceRoot, mapping.source);
	          }
	          mapping.originalLine = original.line;
	          mapping.originalColumn = original.column;
	          if (original.name != null) {
	            mapping.name = original.name;
	          }
	        }
	      }

	      var source = mapping.source;
	      if (source != null && !newSources.has(source)) {
	        newSources.add(source);
	      }

	      var name = mapping.name;
	      if (name != null && !newNames.has(name)) {
	        newNames.add(name);
	      }

	    }, this);
	    this._sources = newSources;
	    this._names = newNames;

	    // Copy sourcesContents of applied map.
	    aSourceMapConsumer.sources.forEach(function (sourceFile) {
	      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
	      if (content != null) {
	        if (aSourceMapPath != null) {
	          sourceFile = util$1.join(aSourceMapPath, sourceFile);
	        }
	        if (sourceRoot != null) {
	          sourceFile = util$1.relative(sourceRoot, sourceFile);
	        }
	        this.setSourceContent(sourceFile, content);
	      }
	    }, this);
	  };

	/**
	 * A mapping can have one of the three levels of data:
	 *
	 *   1. Just the generated position.
	 *   2. The Generated position, original position, and original source.
	 *   3. Generated and original position, original source, as well as a name
	 *      token.
	 *
	 * To maintain consistency, we validate that any new mapping being added falls
	 * in to one of these categories.
	 */
	SourceMapGenerator.prototype._validateMapping =
	  function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource,
	                                              aName) {
	    // When aOriginal is truthy but has empty values for .line and .column,
	    // it is most likely a programmer error. In this case we throw a very
	    // specific error message to try to guide them the right way.
	    // For example: https://github.com/Polymer/polymer-bundler/pull/519
	    if (aOriginal && typeof aOriginal.line !== 'number' && typeof aOriginal.column !== 'number') {
	        throw new Error(
	            'original.line and original.column are not numbers -- you probably meant to omit ' +
	            'the original mapping entirely and only map the generated position. If so, pass ' +
	            'null for the original mapping instead of an object with empty or null values.'
	        );
	    }

	    if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
	        && aGenerated.line > 0 && aGenerated.column >= 0
	        && !aOriginal && !aSource && !aName) {
	      // Case 1.
	      return;
	    }
	    else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
	             && aOriginal && 'line' in aOriginal && 'column' in aOriginal
	             && aGenerated.line > 0 && aGenerated.column >= 0
	             && aOriginal.line > 0 && aOriginal.column >= 0
	             && aSource) {
	      // Cases 2 and 3.
	      return;
	    }
	    else {
	      throw new Error('Invalid mapping: ' + JSON.stringify({
	        generated: aGenerated,
	        source: aSource,
	        original: aOriginal,
	        name: aName
	      }));
	    }
	  };

	/**
	 * Serialize the accumulated mappings in to the stream of base 64 VLQs
	 * specified by the source map format.
	 */
	SourceMapGenerator.prototype._serializeMappings =
	  function SourceMapGenerator_serializeMappings() {
	    var previousGeneratedColumn = 0;
	    var previousGeneratedLine = 1;
	    var previousOriginalColumn = 0;
	    var previousOriginalLine = 0;
	    var previousName = 0;
	    var previousSource = 0;
	    var result = '';
	    var next;
	    var mapping;
	    var nameIdx;
	    var sourceIdx;

	    var mappings = this._mappings.toArray();
	    for (var i = 0, len = mappings.length; i < len; i++) {
	      mapping = mappings[i];
	      next = '';

	      if (mapping.generatedLine !== previousGeneratedLine) {
	        previousGeneratedColumn = 0;
	        while (mapping.generatedLine !== previousGeneratedLine) {
	          next += ';';
	          previousGeneratedLine++;
	        }
	      }
	      else {
	        if (i > 0) {
	          if (!util$1.compareByGeneratedPositionsInflated(mapping, mappings[i - 1])) {
	            continue;
	          }
	          next += ',';
	        }
	      }

	      next += base64Vlq.encode(mapping.generatedColumn
	                                 - previousGeneratedColumn);
	      previousGeneratedColumn = mapping.generatedColumn;

	      if (mapping.source != null) {
	        sourceIdx = this._sources.indexOf(mapping.source);
	        next += base64Vlq.encode(sourceIdx - previousSource);
	        previousSource = sourceIdx;

	        // lines are stored 0-based in SourceMap spec version 3
	        next += base64Vlq.encode(mapping.originalLine - 1
	                                   - previousOriginalLine);
	        previousOriginalLine = mapping.originalLine - 1;

	        next += base64Vlq.encode(mapping.originalColumn
	                                   - previousOriginalColumn);
	        previousOriginalColumn = mapping.originalColumn;

	        if (mapping.name != null) {
	          nameIdx = this._names.indexOf(mapping.name);
	          next += base64Vlq.encode(nameIdx - previousName);
	          previousName = nameIdx;
	        }
	      }

	      result += next;
	    }

	    return result;
	  };

	SourceMapGenerator.prototype._generateSourcesContent =
	  function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
	    return aSources.map(function (source) {
	      if (!this._sourcesContents) {
	        return null;
	      }
	      if (aSourceRoot != null) {
	        source = util$1.relative(aSourceRoot, source);
	      }
	      var key = util$1.toSetString(source);
	      return Object.prototype.hasOwnProperty.call(this._sourcesContents, key)
	        ? this._sourcesContents[key]
	        : null;
	    }, this);
	  };

	/**
	 * Externalize the source map.
	 */
	SourceMapGenerator.prototype.toJSON =
	  function SourceMapGenerator_toJSON() {
	    var map = {
	      version: this._version,
	      sources: this._sources.toArray(),
	      names: this._names.toArray(),
	      mappings: this._serializeMappings()
	    };
	    if (this._file != null) {
	      map.file = this._file;
	    }
	    if (this._sourceRoot != null) {
	      map.sourceRoot = this._sourceRoot;
	    }
	    if (this._sourcesContents) {
	      map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
	    }

	    return map;
	  };

	/**
	 * Render the source map being generated to a string.
	 */
	SourceMapGenerator.prototype.toString =
	  function SourceMapGenerator_toString() {
	    return JSON.stringify(this.toJSON());
	  };

	var SourceMapGenerator_1 = SourceMapGenerator;

	var sourceMapGenerator = {
		SourceMapGenerator: SourceMapGenerator_1
	};

	var binarySearch = createCommonjsModule(function (module, exports) {
	/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */

	exports.GREATEST_LOWER_BOUND = 1;
	exports.LEAST_UPPER_BOUND = 2;

	/**
	 * Recursive implementation of binary search.
	 *
	 * @param aLow Indices here and lower do not contain the needle.
	 * @param aHigh Indices here and higher do not contain the needle.
	 * @param aNeedle The element being searched for.
	 * @param aHaystack The non-empty array being searched.
	 * @param aCompare Function which takes two elements and returns -1, 0, or 1.
	 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
	 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
	 *     closest element that is smaller than or greater than the one we are
	 *     searching for, respectively, if the exact element cannot be found.
	 */
	function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
	  // This function terminates when one of the following is true:
	  //
	  //   1. We find the exact element we are looking for.
	  //
	  //   2. We did not find the exact element, but we can return the index of
	  //      the next-closest element.
	  //
	  //   3. We did not find the exact element, and there is no next-closest
	  //      element than the one we are searching for, so we return -1.
	  var mid = Math.floor((aHigh - aLow) / 2) + aLow;
	  var cmp = aCompare(aNeedle, aHaystack[mid], true);
	  if (cmp === 0) {
	    // Found the element we are looking for.
	    return mid;
	  }
	  else if (cmp > 0) {
	    // Our needle is greater than aHaystack[mid].
	    if (aHigh - mid > 1) {
	      // The element is in the upper half.
	      return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
	    }

	    // The exact needle element was not found in this haystack. Determine if
	    // we are in termination case (3) or (2) and return the appropriate thing.
	    if (aBias == exports.LEAST_UPPER_BOUND) {
	      return aHigh < aHaystack.length ? aHigh : -1;
	    } else {
	      return mid;
	    }
	  }
	  else {
	    // Our needle is less than aHaystack[mid].
	    if (mid - aLow > 1) {
	      // The element is in the lower half.
	      return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
	    }

	    // we are in termination case (3) or (2) and return the appropriate thing.
	    if (aBias == exports.LEAST_UPPER_BOUND) {
	      return mid;
	    } else {
	      return aLow < 0 ? -1 : aLow;
	    }
	  }
	}

	/**
	 * This is an implementation of binary search which will always try and return
	 * the index of the closest element if there is no exact hit. This is because
	 * mappings between original and generated line/col pairs are single points,
	 * and there is an implicit region between each of them, so a miss just means
	 * that you aren't on the very start of a region.
	 *
	 * @param aNeedle The element you are looking for.
	 * @param aHaystack The array that is being searched.
	 * @param aCompare A function which takes the needle and an element in the
	 *     array and returns -1, 0, or 1 depending on whether the needle is less
	 *     than, equal to, or greater than the element, respectively.
	 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
	 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
	 *     closest element that is smaller than or greater than the one we are
	 *     searching for, respectively, if the exact element cannot be found.
	 *     Defaults to 'binarySearch.GREATEST_LOWER_BOUND'.
	 */
	exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
	  if (aHaystack.length === 0) {
	    return -1;
	  }

	  var index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack,
	                              aCompare, aBias || exports.GREATEST_LOWER_BOUND);
	  if (index < 0) {
	    return -1;
	  }

	  // We have found either the exact element, or the next-closest element than
	  // the one we are searching for. However, there may be more than one such
	  // element. Make sure we always return the smallest of these.
	  while (index - 1 >= 0) {
	    if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
	      break;
	    }
	    --index;
	  }

	  return index;
	};
	});
	var binarySearch_1 = binarySearch.GREATEST_LOWER_BOUND;
	var binarySearch_2 = binarySearch.LEAST_UPPER_BOUND;
	var binarySearch_3 = binarySearch.search;

	/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */

	// It turns out that some (most?) JavaScript engines don't self-host
	// `Array.prototype.sort`. This makes sense because C++ will likely remain
	// faster than JS when doing raw CPU-intensive sorting. However, when using a
	// custom comparator function, calling back and forth between the VM's C++ and
	// JIT'd JS is rather slow *and* loses JIT type information, resulting in
	// worse generated code for the comparator function than would be optimal. In
	// fact, when sorting with a comparator, these costs outweigh the benefits of
	// sorting in C++. By using our own JS-implemented Quick Sort (below), we get
	// a ~3500ms mean speed-up in `bench/bench.html`.

	/**
	 * Swap the elements indexed by `x` and `y` in the array `ary`.
	 *
	 * @param {Array} ary
	 *        The array.
	 * @param {Number} x
	 *        The index of the first item.
	 * @param {Number} y
	 *        The index of the second item.
	 */
	function swap(ary, x, y) {
	  var temp = ary[x];
	  ary[x] = ary[y];
	  ary[y] = temp;
	}

	/**
	 * Returns a random integer within the range `low .. high` inclusive.
	 *
	 * @param {Number} low
	 *        The lower bound on the range.
	 * @param {Number} high
	 *        The upper bound on the range.
	 */
	function randomIntInRange(low, high) {
	  return Math.round(low + (Math.random() * (high - low)));
	}

	/**
	 * The Quick Sort algorithm.
	 *
	 * @param {Array} ary
	 *        An array to sort.
	 * @param {function} comparator
	 *        Function to use to compare two items.
	 * @param {Number} p
	 *        Start index of the array
	 * @param {Number} r
	 *        End index of the array
	 */
	function doQuickSort(ary, comparator, p, r) {
	  // If our lower bound is less than our upper bound, we (1) partition the
	  // array into two pieces and (2) recurse on each half. If it is not, this is
	  // the empty array and our base case.

	  if (p < r) {
	    // (1) Partitioning.
	    //
	    // The partitioning chooses a pivot between `p` and `r` and moves all
	    // elements that are less than or equal to the pivot to the before it, and
	    // all the elements that are greater than it after it. The effect is that
	    // once partition is done, the pivot is in the exact place it will be when
	    // the array is put in sorted order, and it will not need to be moved
	    // again. This runs in O(n) time.

	    // Always choose a random pivot so that an input array which is reverse
	    // sorted does not cause O(n^2) running time.
	    var pivotIndex = randomIntInRange(p, r);
	    var i = p - 1;

	    swap(ary, pivotIndex, r);
	    var pivot = ary[r];

	    // Immediately after `j` is incremented in this loop, the following hold
	    // true:
	    //
	    //   * Every element in `ary[p .. i]` is less than or equal to the pivot.
	    //
	    //   * Every element in `ary[i+1 .. j-1]` is greater than the pivot.
	    for (var j = p; j < r; j++) {
	      if (comparator(ary[j], pivot) <= 0) {
	        i += 1;
	        swap(ary, i, j);
	      }
	    }

	    swap(ary, i + 1, j);
	    var q = i + 1;

	    // (2) Recurse on each half.

	    doQuickSort(ary, comparator, p, q - 1);
	    doQuickSort(ary, comparator, q + 1, r);
	  }
	}

	/**
	 * Sort the given array in-place with the given comparator function.
	 *
	 * @param {Array} ary
	 *        An array to sort.
	 * @param {function} comparator
	 *        Function to use to compare two items.
	 */
	var quickSort_1 = function (ary, comparator) {
	  doQuickSort(ary, comparator, 0, ary.length - 1);
	};

	var quickSort = {
		quickSort: quickSort_1
	};

	/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */



	var ArraySet$2 = arraySet.ArraySet;

	var quickSort$1 = quickSort.quickSort;

	function SourceMapConsumer(aSourceMap, aSourceMapURL) {
	  var sourceMap = aSourceMap;
	  if (typeof aSourceMap === 'string') {
	    sourceMap = util$1.parseSourceMapInput(aSourceMap);
	  }

	  return sourceMap.sections != null
	    ? new IndexedSourceMapConsumer(sourceMap, aSourceMapURL)
	    : new BasicSourceMapConsumer(sourceMap, aSourceMapURL);
	}

	SourceMapConsumer.fromSourceMap = function(aSourceMap, aSourceMapURL) {
	  return BasicSourceMapConsumer.fromSourceMap(aSourceMap, aSourceMapURL);
	};

	/**
	 * The version of the source mapping spec that we are consuming.
	 */
	SourceMapConsumer.prototype._version = 3;

	// `__generatedMappings` and `__originalMappings` are arrays that hold the
	// parsed mapping coordinates from the source map's "mappings" attribute. They
	// are lazily instantiated, accessed via the `_generatedMappings` and
	// `_originalMappings` getters respectively, and we only parse the mappings
	// and create these arrays once queried for a source location. We jump through
	// these hoops because there can be many thousands of mappings, and parsing
	// them is expensive, so we only want to do it if we must.
	//
	// Each object in the arrays is of the form:
	//
	//     {
	//       generatedLine: The line number in the generated code,
	//       generatedColumn: The column number in the generated code,
	//       source: The path to the original source file that generated this
	//               chunk of code,
	//       originalLine: The line number in the original source that
	//                     corresponds to this chunk of generated code,
	//       originalColumn: The column number in the original source that
	//                       corresponds to this chunk of generated code,
	//       name: The name of the original symbol which generated this chunk of
	//             code.
	//     }
	//
	// All properties except for `generatedLine` and `generatedColumn` can be
	// `null`.
	//
	// `_generatedMappings` is ordered by the generated positions.
	//
	// `_originalMappings` is ordered by the original positions.

	SourceMapConsumer.prototype.__generatedMappings = null;
	Object.defineProperty(SourceMapConsumer.prototype, '_generatedMappings', {
	  configurable: true,
	  enumerable: true,
	  get: function () {
	    if (!this.__generatedMappings) {
	      this._parseMappings(this._mappings, this.sourceRoot);
	    }

	    return this.__generatedMappings;
	  }
	});

	SourceMapConsumer.prototype.__originalMappings = null;
	Object.defineProperty(SourceMapConsumer.prototype, '_originalMappings', {
	  configurable: true,
	  enumerable: true,
	  get: function () {
	    if (!this.__originalMappings) {
	      this._parseMappings(this._mappings, this.sourceRoot);
	    }

	    return this.__originalMappings;
	  }
	});

	SourceMapConsumer.prototype._charIsMappingSeparator =
	  function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
	    var c = aStr.charAt(index);
	    return c === ";" || c === ",";
	  };

	/**
	 * Parse the mappings in a string in to a data structure which we can easily
	 * query (the ordered arrays in the `this.__generatedMappings` and
	 * `this.__originalMappings` properties).
	 */
	SourceMapConsumer.prototype._parseMappings =
	  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
	    throw new Error("Subclasses must implement _parseMappings");
	  };

	SourceMapConsumer.GENERATED_ORDER = 1;
	SourceMapConsumer.ORIGINAL_ORDER = 2;

	SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
	SourceMapConsumer.LEAST_UPPER_BOUND = 2;

	/**
	 * Iterate over each mapping between an original source/line/column and a
	 * generated line/column in this source map.
	 *
	 * @param Function aCallback
	 *        The function that is called with each mapping.
	 * @param Object aContext
	 *        Optional. If specified, this object will be the value of `this` every
	 *        time that `aCallback` is called.
	 * @param aOrder
	 *        Either `SourceMapConsumer.GENERATED_ORDER` or
	 *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
	 *        iterate over the mappings sorted by the generated file's line/column
	 *        order or the original's source/line/column order, respectively. Defaults to
	 *        `SourceMapConsumer.GENERATED_ORDER`.
	 */
	SourceMapConsumer.prototype.eachMapping =
	  function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
	    var context = aContext || null;
	    var order = aOrder || SourceMapConsumer.GENERATED_ORDER;

	    var mappings;
	    switch (order) {
	    case SourceMapConsumer.GENERATED_ORDER:
	      mappings = this._generatedMappings;
	      break;
	    case SourceMapConsumer.ORIGINAL_ORDER:
	      mappings = this._originalMappings;
	      break;
	    default:
	      throw new Error("Unknown order of iteration.");
	    }

	    var sourceRoot = this.sourceRoot;
	    mappings.map(function (mapping) {
	      var source = mapping.source === null ? null : this._sources.at(mapping.source);
	      source = util$1.computeSourceURL(sourceRoot, source, this._sourceMapURL);
	      return {
	        source: source,
	        generatedLine: mapping.generatedLine,
	        generatedColumn: mapping.generatedColumn,
	        originalLine: mapping.originalLine,
	        originalColumn: mapping.originalColumn,
	        name: mapping.name === null ? null : this._names.at(mapping.name)
	      };
	    }, this).forEach(aCallback, context);
	  };

	/**
	 * Returns all generated line and column information for the original source,
	 * line, and column provided. If no column is provided, returns all mappings
	 * corresponding to a either the line we are searching for or the next
	 * closest line that has any mappings. Otherwise, returns all mappings
	 * corresponding to the given line and either the column we are searching for
	 * or the next closest column that has any offsets.
	 *
	 * The only argument is an object with the following properties:
	 *
	 *   - source: The filename of the original source.
	 *   - line: The line number in the original source.  The line number is 1-based.
	 *   - column: Optional. the column number in the original source.
	 *    The column number is 0-based.
	 *
	 * and an array of objects is returned, each with the following properties:
	 *
	 *   - line: The line number in the generated source, or null.  The
	 *    line number is 1-based.
	 *   - column: The column number in the generated source, or null.
	 *    The column number is 0-based.
	 */
	SourceMapConsumer.prototype.allGeneratedPositionsFor =
	  function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
	    var line = util$1.getArg(aArgs, 'line');

	    // When there is no exact match, BasicSourceMapConsumer.prototype._findMapping
	    // returns the index of the closest mapping less than the needle. By
	    // setting needle.originalColumn to 0, we thus find the last mapping for
	    // the given line, provided such a mapping exists.
	    var needle = {
	      source: util$1.getArg(aArgs, 'source'),
	      originalLine: line,
	      originalColumn: util$1.getArg(aArgs, 'column', 0)
	    };

	    needle.source = this._findSourceIndex(needle.source);
	    if (needle.source < 0) {
	      return [];
	    }

	    var mappings = [];

	    var index = this._findMapping(needle,
	                                  this._originalMappings,
	                                  "originalLine",
	                                  "originalColumn",
	                                  util$1.compareByOriginalPositions,
	                                  binarySearch.LEAST_UPPER_BOUND);
	    if (index >= 0) {
	      var mapping = this._originalMappings[index];

	      if (aArgs.column === undefined) {
	        var originalLine = mapping.originalLine;

	        // Iterate until either we run out of mappings, or we run into
	        // a mapping for a different line than the one we found. Since
	        // mappings are sorted, this is guaranteed to find all mappings for
	        // the line we found.
	        while (mapping && mapping.originalLine === originalLine) {
	          mappings.push({
	            line: util$1.getArg(mapping, 'generatedLine', null),
	            column: util$1.getArg(mapping, 'generatedColumn', null),
	            lastColumn: util$1.getArg(mapping, 'lastGeneratedColumn', null)
	          });

	          mapping = this._originalMappings[++index];
	        }
	      } else {
	        var originalColumn = mapping.originalColumn;

	        // Iterate until either we run out of mappings, or we run into
	        // a mapping for a different line than the one we were searching for.
	        // Since mappings are sorted, this is guaranteed to find all mappings for
	        // the line we are searching for.
	        while (mapping &&
	               mapping.originalLine === line &&
	               mapping.originalColumn == originalColumn) {
	          mappings.push({
	            line: util$1.getArg(mapping, 'generatedLine', null),
	            column: util$1.getArg(mapping, 'generatedColumn', null),
	            lastColumn: util$1.getArg(mapping, 'lastGeneratedColumn', null)
	          });

	          mapping = this._originalMappings[++index];
	        }
	      }
	    }

	    return mappings;
	  };

	var SourceMapConsumer_1 = SourceMapConsumer;

	/**
	 * A BasicSourceMapConsumer instance represents a parsed source map which we can
	 * query for information about the original file positions by giving it a file
	 * position in the generated source.
	 *
	 * The first parameter is the raw source map (either as a JSON string, or
	 * already parsed to an object). According to the spec, source maps have the
	 * following attributes:
	 *
	 *   - version: Which version of the source map spec this map is following.
	 *   - sources: An array of URLs to the original source files.
	 *   - names: An array of identifiers which can be referrenced by individual mappings.
	 *   - sourceRoot: Optional. The URL root from which all sources are relative.
	 *   - sourcesContent: Optional. An array of contents of the original source files.
	 *   - mappings: A string of base64 VLQs which contain the actual mappings.
	 *   - file: Optional. The generated file this source map is associated with.
	 *
	 * Here is an example source map, taken from the source map spec[0]:
	 *
	 *     {
	 *       version : 3,
	 *       file: "out.js",
	 *       sourceRoot : "",
	 *       sources: ["foo.js", "bar.js"],
	 *       names: ["src", "maps", "are", "fun"],
	 *       mappings: "AA,AB;;ABCDE;"
	 *     }
	 *
	 * The second parameter, if given, is a string whose value is the URL
	 * at which the source map was found.  This URL is used to compute the
	 * sources array.
	 *
	 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
	 */
	function BasicSourceMapConsumer(aSourceMap, aSourceMapURL) {
	  var sourceMap = aSourceMap;
	  if (typeof aSourceMap === 'string') {
	    sourceMap = util$1.parseSourceMapInput(aSourceMap);
	  }

	  var version = util$1.getArg(sourceMap, 'version');
	  var sources = util$1.getArg(sourceMap, 'sources');
	  // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
	  // requires the array) to play nice here.
	  var names = util$1.getArg(sourceMap, 'names', []);
	  var sourceRoot = util$1.getArg(sourceMap, 'sourceRoot', null);
	  var sourcesContent = util$1.getArg(sourceMap, 'sourcesContent', null);
	  var mappings = util$1.getArg(sourceMap, 'mappings');
	  var file = util$1.getArg(sourceMap, 'file', null);

	  // Once again, Sass deviates from the spec and supplies the version as a
	  // string rather than a number, so we use loose equality checking here.
	  if (version != this._version) {
	    throw new Error('Unsupported version: ' + version);
	  }

	  if (sourceRoot) {
	    sourceRoot = util$1.normalize(sourceRoot);
	  }

	  sources = sources
	    .map(String)
	    // Some source maps produce relative source paths like "./foo.js" instead of
	    // "foo.js".  Normalize these first so that future comparisons will succeed.
	    // See bugzil.la/1090768.
	    .map(util$1.normalize)
	    // Always ensure that absolute sources are internally stored relative to
	    // the source root, if the source root is absolute. Not doing this would
	    // be particularly problematic when the source root is a prefix of the
	    // source (valid, but why??). See github issue #199 and bugzil.la/1188982.
	    .map(function (source) {
	      return sourceRoot && util$1.isAbsolute(sourceRoot) && util$1.isAbsolute(source)
	        ? util$1.relative(sourceRoot, source)
	        : source;
	    });

	  // Pass `true` below to allow duplicate names and sources. While source maps
	  // are intended to be compressed and deduplicated, the TypeScript compiler
	  // sometimes generates source maps with duplicates in them. See Github issue
	  // #72 and bugzil.la/889492.
	  this._names = ArraySet$2.fromArray(names.map(String), true);
	  this._sources = ArraySet$2.fromArray(sources, true);

	  this._absoluteSources = this._sources.toArray().map(function (s) {
	    return util$1.computeSourceURL(sourceRoot, s, aSourceMapURL);
	  });

	  this.sourceRoot = sourceRoot;
	  this.sourcesContent = sourcesContent;
	  this._mappings = mappings;
	  this._sourceMapURL = aSourceMapURL;
	  this.file = file;
	}

	BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
	BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer;

	/**
	 * Utility function to find the index of a source.  Returns -1 if not
	 * found.
	 */
	BasicSourceMapConsumer.prototype._findSourceIndex = function(aSource) {
	  var relativeSource = aSource;
	  if (this.sourceRoot != null) {
	    relativeSource = util$1.relative(this.sourceRoot, relativeSource);
	  }

	  if (this._sources.has(relativeSource)) {
	    return this._sources.indexOf(relativeSource);
	  }

	  // Maybe aSource is an absolute URL as returned by |sources|.  In
	  // this case we can't simply undo the transform.
	  var i;
	  for (i = 0; i < this._absoluteSources.length; ++i) {
	    if (this._absoluteSources[i] == aSource) {
	      return i;
	    }
	  }

	  return -1;
	};

	/**
	 * Create a BasicSourceMapConsumer from a SourceMapGenerator.
	 *
	 * @param SourceMapGenerator aSourceMap
	 *        The source map that will be consumed.
	 * @param String aSourceMapURL
	 *        The URL at which the source map can be found (optional)
	 * @returns BasicSourceMapConsumer
	 */
	BasicSourceMapConsumer.fromSourceMap =
	  function SourceMapConsumer_fromSourceMap(aSourceMap, aSourceMapURL) {
	    var smc = Object.create(BasicSourceMapConsumer.prototype);

	    var names = smc._names = ArraySet$2.fromArray(aSourceMap._names.toArray(), true);
	    var sources = smc._sources = ArraySet$2.fromArray(aSourceMap._sources.toArray(), true);
	    smc.sourceRoot = aSourceMap._sourceRoot;
	    smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
	                                                            smc.sourceRoot);
	    smc.file = aSourceMap._file;
	    smc._sourceMapURL = aSourceMapURL;
	    smc._absoluteSources = smc._sources.toArray().map(function (s) {
	      return util$1.computeSourceURL(smc.sourceRoot, s, aSourceMapURL);
	    });

	    // Because we are modifying the entries (by converting string sources and
	    // names to indices into the sources and names ArraySets), we have to make
	    // a copy of the entry or else bad things happen. Shared mutable state
	    // strikes again! See github issue #191.

	    var generatedMappings = aSourceMap._mappings.toArray().slice();
	    var destGeneratedMappings = smc.__generatedMappings = [];
	    var destOriginalMappings = smc.__originalMappings = [];

	    for (var i = 0, length = generatedMappings.length; i < length; i++) {
	      var srcMapping = generatedMappings[i];
	      var destMapping = new Mapping;
	      destMapping.generatedLine = srcMapping.generatedLine;
	      destMapping.generatedColumn = srcMapping.generatedColumn;

	      if (srcMapping.source) {
	        destMapping.source = sources.indexOf(srcMapping.source);
	        destMapping.originalLine = srcMapping.originalLine;
	        destMapping.originalColumn = srcMapping.originalColumn;

	        if (srcMapping.name) {
	          destMapping.name = names.indexOf(srcMapping.name);
	        }

	        destOriginalMappings.push(destMapping);
	      }

	      destGeneratedMappings.push(destMapping);
	    }

	    quickSort$1(smc.__originalMappings, util$1.compareByOriginalPositions);

	    return smc;
	  };

	/**
	 * The version of the source mapping spec that we are consuming.
	 */
	BasicSourceMapConsumer.prototype._version = 3;

	/**
	 * The list of original sources.
	 */
	Object.defineProperty(BasicSourceMapConsumer.prototype, 'sources', {
	  get: function () {
	    return this._absoluteSources.slice();
	  }
	});

	/**
	 * Provide the JIT with a nice shape / hidden class.
	 */
	function Mapping() {
	  this.generatedLine = 0;
	  this.generatedColumn = 0;
	  this.source = null;
	  this.originalLine = null;
	  this.originalColumn = null;
	  this.name = null;
	}

	/**
	 * Parse the mappings in a string in to a data structure which we can easily
	 * query (the ordered arrays in the `this.__generatedMappings` and
	 * `this.__originalMappings` properties).
	 */
	BasicSourceMapConsumer.prototype._parseMappings =
	  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
	    var generatedLine = 1;
	    var previousGeneratedColumn = 0;
	    var previousOriginalLine = 0;
	    var previousOriginalColumn = 0;
	    var previousSource = 0;
	    var previousName = 0;
	    var length = aStr.length;
	    var index = 0;
	    var cachedSegments = {};
	    var temp = {};
	    var originalMappings = [];
	    var generatedMappings = [];
	    var mapping, str, segment, end, value;

	    while (index < length) {
	      if (aStr.charAt(index) === ';') {
	        generatedLine++;
	        index++;
	        previousGeneratedColumn = 0;
	      }
	      else if (aStr.charAt(index) === ',') {
	        index++;
	      }
	      else {
	        mapping = new Mapping();
	        mapping.generatedLine = generatedLine;

	        // Because each offset is encoded relative to the previous one,
	        // many segments often have the same encoding. We can exploit this
	        // fact by caching the parsed variable length fields of each segment,
	        // allowing us to avoid a second parse if we encounter the same
	        // segment again.
	        for (end = index; end < length; end++) {
	          if (this._charIsMappingSeparator(aStr, end)) {
	            break;
	          }
	        }
	        str = aStr.slice(index, end);

	        segment = cachedSegments[str];
	        if (segment) {
	          index += str.length;
	        } else {
	          segment = [];
	          while (index < end) {
	            base64Vlq.decode(aStr, index, temp);
	            value = temp.value;
	            index = temp.rest;
	            segment.push(value);
	          }

	          if (segment.length === 2) {
	            throw new Error('Found a source, but no line and column');
	          }

	          if (segment.length === 3) {
	            throw new Error('Found a source and line, but no column');
	          }

	          cachedSegments[str] = segment;
	        }

	        // Generated column.
	        mapping.generatedColumn = previousGeneratedColumn + segment[0];
	        previousGeneratedColumn = mapping.generatedColumn;

	        if (segment.length > 1) {
	          // Original source.
	          mapping.source = previousSource + segment[1];
	          previousSource += segment[1];

	          // Original line.
	          mapping.originalLine = previousOriginalLine + segment[2];
	          previousOriginalLine = mapping.originalLine;
	          // Lines are stored 0-based
	          mapping.originalLine += 1;

	          // Original column.
	          mapping.originalColumn = previousOriginalColumn + segment[3];
	          previousOriginalColumn = mapping.originalColumn;

	          if (segment.length > 4) {
	            // Original name.
	            mapping.name = previousName + segment[4];
	            previousName += segment[4];
	          }
	        }

	        generatedMappings.push(mapping);
	        if (typeof mapping.originalLine === 'number') {
	          originalMappings.push(mapping);
	        }
	      }
	    }

	    quickSort$1(generatedMappings, util$1.compareByGeneratedPositionsDeflated);
	    this.__generatedMappings = generatedMappings;

	    quickSort$1(originalMappings, util$1.compareByOriginalPositions);
	    this.__originalMappings = originalMappings;
	  };

	/**
	 * Find the mapping that best matches the hypothetical "needle" mapping that
	 * we are searching for in the given "haystack" of mappings.
	 */
	BasicSourceMapConsumer.prototype._findMapping =
	  function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
	                                         aColumnName, aComparator, aBias) {
	    // To return the position we are searching for, we must first find the
	    // mapping for the given position and then return the opposite position it
	    // points to. Because the mappings are sorted, we can use binary search to
	    // find the best mapping.

	    if (aNeedle[aLineName] <= 0) {
	      throw new TypeError('Line must be greater than or equal to 1, got '
	                          + aNeedle[aLineName]);
	    }
	    if (aNeedle[aColumnName] < 0) {
	      throw new TypeError('Column must be greater than or equal to 0, got '
	                          + aNeedle[aColumnName]);
	    }

	    return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
	  };

	/**
	 * Compute the last column for each generated mapping. The last column is
	 * inclusive.
	 */
	BasicSourceMapConsumer.prototype.computeColumnSpans =
	  function SourceMapConsumer_computeColumnSpans() {
	    for (var index = 0; index < this._generatedMappings.length; ++index) {
	      var mapping = this._generatedMappings[index];

	      // Mappings do not contain a field for the last generated columnt. We
	      // can come up with an optimistic estimate, however, by assuming that
	      // mappings are contiguous (i.e. given two consecutive mappings, the
	      // first mapping ends where the second one starts).
	      if (index + 1 < this._generatedMappings.length) {
	        var nextMapping = this._generatedMappings[index + 1];

	        if (mapping.generatedLine === nextMapping.generatedLine) {
	          mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
	          continue;
	        }
	      }

	      // The last mapping for each line spans the entire line.
	      mapping.lastGeneratedColumn = Infinity;
	    }
	  };

	/**
	 * Returns the original source, line, and column information for the generated
	 * source's line and column positions provided. The only argument is an object
	 * with the following properties:
	 *
	 *   - line: The line number in the generated source.  The line number
	 *     is 1-based.
	 *   - column: The column number in the generated source.  The column
	 *     number is 0-based.
	 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
	 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
	 *     closest element that is smaller than or greater than the one we are
	 *     searching for, respectively, if the exact element cannot be found.
	 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
	 *
	 * and an object is returned with the following properties:
	 *
	 *   - source: The original source file, or null.
	 *   - line: The line number in the original source, or null.  The
	 *     line number is 1-based.
	 *   - column: The column number in the original source, or null.  The
	 *     column number is 0-based.
	 *   - name: The original identifier, or null.
	 */
	BasicSourceMapConsumer.prototype.originalPositionFor =
	  function SourceMapConsumer_originalPositionFor(aArgs) {
	    var needle = {
	      generatedLine: util$1.getArg(aArgs, 'line'),
	      generatedColumn: util$1.getArg(aArgs, 'column')
	    };

	    var index = this._findMapping(
	      needle,
	      this._generatedMappings,
	      "generatedLine",
	      "generatedColumn",
	      util$1.compareByGeneratedPositionsDeflated,
	      util$1.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
	    );

	    if (index >= 0) {
	      var mapping = this._generatedMappings[index];

	      if (mapping.generatedLine === needle.generatedLine) {
	        var source = util$1.getArg(mapping, 'source', null);
	        if (source !== null) {
	          source = this._sources.at(source);
	          source = util$1.computeSourceURL(this.sourceRoot, source, this._sourceMapURL);
	        }
	        var name = util$1.getArg(mapping, 'name', null);
	        if (name !== null) {
	          name = this._names.at(name);
	        }
	        return {
	          source: source,
	          line: util$1.getArg(mapping, 'originalLine', null),
	          column: util$1.getArg(mapping, 'originalColumn', null),
	          name: name
	        };
	      }
	    }

	    return {
	      source: null,
	      line: null,
	      column: null,
	      name: null
	    };
	  };

	/**
	 * Return true if we have the source content for every source in the source
	 * map, false otherwise.
	 */
	BasicSourceMapConsumer.prototype.hasContentsOfAllSources =
	  function BasicSourceMapConsumer_hasContentsOfAllSources() {
	    if (!this.sourcesContent) {
	      return false;
	    }
	    return this.sourcesContent.length >= this._sources.size() &&
	      !this.sourcesContent.some(function (sc) { return sc == null; });
	  };

	/**
	 * Returns the original source content. The only argument is the url of the
	 * original source file. Returns null if no original source content is
	 * available.
	 */
	BasicSourceMapConsumer.prototype.sourceContentFor =
	  function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
	    if (!this.sourcesContent) {
	      return null;
	    }

	    var index = this._findSourceIndex(aSource);
	    if (index >= 0) {
	      return this.sourcesContent[index];
	    }

	    var relativeSource = aSource;
	    if (this.sourceRoot != null) {
	      relativeSource = util$1.relative(this.sourceRoot, relativeSource);
	    }

	    var url;
	    if (this.sourceRoot != null
	        && (url = util$1.urlParse(this.sourceRoot))) {
	      // XXX: file:// URIs and absolute paths lead to unexpected behavior for
	      // many users. We can help them out when they expect file:// URIs to
	      // behave like it would if they were running a local HTTP server. See
	      // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
	      var fileUriAbsPath = relativeSource.replace(/^file:\/\//, "");
	      if (url.scheme == "file"
	          && this._sources.has(fileUriAbsPath)) {
	        return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
	      }

	      if ((!url.path || url.path == "/")
	          && this._sources.has("/" + relativeSource)) {
	        return this.sourcesContent[this._sources.indexOf("/" + relativeSource)];
	      }
	    }

	    // This function is used recursively from
	    // IndexedSourceMapConsumer.prototype.sourceContentFor. In that case, we
	    // don't want to throw if we can't find the source - we just want to
	    // return null, so we provide a flag to exit gracefully.
	    if (nullOnMissing) {
	      return null;
	    }
	    else {
	      throw new Error('"' + relativeSource + '" is not in the SourceMap.');
	    }
	  };

	/**
	 * Returns the generated line and column information for the original source,
	 * line, and column positions provided. The only argument is an object with
	 * the following properties:
	 *
	 *   - source: The filename of the original source.
	 *   - line: The line number in the original source.  The line number
	 *     is 1-based.
	 *   - column: The column number in the original source.  The column
	 *     number is 0-based.
	 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
	 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
	 *     closest element that is smaller than or greater than the one we are
	 *     searching for, respectively, if the exact element cannot be found.
	 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
	 *
	 * and an object is returned with the following properties:
	 *
	 *   - line: The line number in the generated source, or null.  The
	 *     line number is 1-based.
	 *   - column: The column number in the generated source, or null.
	 *     The column number is 0-based.
	 */
	BasicSourceMapConsumer.prototype.generatedPositionFor =
	  function SourceMapConsumer_generatedPositionFor(aArgs) {
	    var source = util$1.getArg(aArgs, 'source');
	    source = this._findSourceIndex(source);
	    if (source < 0) {
	      return {
	        line: null,
	        column: null,
	        lastColumn: null
	      };
	    }

	    var needle = {
	      source: source,
	      originalLine: util$1.getArg(aArgs, 'line'),
	      originalColumn: util$1.getArg(aArgs, 'column')
	    };

	    var index = this._findMapping(
	      needle,
	      this._originalMappings,
	      "originalLine",
	      "originalColumn",
	      util$1.compareByOriginalPositions,
	      util$1.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
	    );

	    if (index >= 0) {
	      var mapping = this._originalMappings[index];

	      if (mapping.source === needle.source) {
	        return {
	          line: util$1.getArg(mapping, 'generatedLine', null),
	          column: util$1.getArg(mapping, 'generatedColumn', null),
	          lastColumn: util$1.getArg(mapping, 'lastGeneratedColumn', null)
	        };
	      }
	    }

	    return {
	      line: null,
	      column: null,
	      lastColumn: null
	    };
	  };

	var BasicSourceMapConsumer_1 = BasicSourceMapConsumer;

	/**
	 * An IndexedSourceMapConsumer instance represents a parsed source map which
	 * we can query for information. It differs from BasicSourceMapConsumer in
	 * that it takes "indexed" source maps (i.e. ones with a "sections" field) as
	 * input.
	 *
	 * The first parameter is a raw source map (either as a JSON string, or already
	 * parsed to an object). According to the spec for indexed source maps, they
	 * have the following attributes:
	 *
	 *   - version: Which version of the source map spec this map is following.
	 *   - file: Optional. The generated file this source map is associated with.
	 *   - sections: A list of section definitions.
	 *
	 * Each value under the "sections" field has two fields:
	 *   - offset: The offset into the original specified at which this section
	 *       begins to apply, defined as an object with a "line" and "column"
	 *       field.
	 *   - map: A source map definition. This source map could also be indexed,
	 *       but doesn't have to be.
	 *
	 * Instead of the "map" field, it's also possible to have a "url" field
	 * specifying a URL to retrieve a source map from, but that's currently
	 * unsupported.
	 *
	 * Here's an example source map, taken from the source map spec[0], but
	 * modified to omit a section which uses the "url" field.
	 *
	 *  {
	 *    version : 3,
	 *    file: "app.js",
	 *    sections: [{
	 *      offset: {line:100, column:10},
	 *      map: {
	 *        version : 3,
	 *        file: "section.js",
	 *        sources: ["foo.js", "bar.js"],
	 *        names: ["src", "maps", "are", "fun"],
	 *        mappings: "AAAA,E;;ABCDE;"
	 *      }
	 *    }],
	 *  }
	 *
	 * The second parameter, if given, is a string whose value is the URL
	 * at which the source map was found.  This URL is used to compute the
	 * sources array.
	 *
	 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.535es3xeprgt
	 */
	function IndexedSourceMapConsumer(aSourceMap, aSourceMapURL) {
	  var sourceMap = aSourceMap;
	  if (typeof aSourceMap === 'string') {
	    sourceMap = util$1.parseSourceMapInput(aSourceMap);
	  }

	  var version = util$1.getArg(sourceMap, 'version');
	  var sections = util$1.getArg(sourceMap, 'sections');

	  if (version != this._version) {
	    throw new Error('Unsupported version: ' + version);
	  }

	  this._sources = new ArraySet$2();
	  this._names = new ArraySet$2();

	  var lastOffset = {
	    line: -1,
	    column: 0
	  };
	  this._sections = sections.map(function (s) {
	    if (s.url) {
	      // The url field will require support for asynchronicity.
	      // See https://github.com/mozilla/source-map/issues/16
	      throw new Error('Support for url field in sections not implemented.');
	    }
	    var offset = util$1.getArg(s, 'offset');
	    var offsetLine = util$1.getArg(offset, 'line');
	    var offsetColumn = util$1.getArg(offset, 'column');

	    if (offsetLine < lastOffset.line ||
	        (offsetLine === lastOffset.line && offsetColumn < lastOffset.column)) {
	      throw new Error('Section offsets must be ordered and non-overlapping.');
	    }
	    lastOffset = offset;

	    return {
	      generatedOffset: {
	        // The offset fields are 0-based, but we use 1-based indices when
	        // encoding/decoding from VLQ.
	        generatedLine: offsetLine + 1,
	        generatedColumn: offsetColumn + 1
	      },
	      consumer: new SourceMapConsumer(util$1.getArg(s, 'map'), aSourceMapURL)
	    }
	  });
	}

	IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
	IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer;

	/**
	 * The version of the source mapping spec that we are consuming.
	 */
	IndexedSourceMapConsumer.prototype._version = 3;

	/**
	 * The list of original sources.
	 */
	Object.defineProperty(IndexedSourceMapConsumer.prototype, 'sources', {
	  get: function () {
	    var sources = [];
	    for (var i = 0; i < this._sections.length; i++) {
	      for (var j = 0; j < this._sections[i].consumer.sources.length; j++) {
	        sources.push(this._sections[i].consumer.sources[j]);
	      }
	    }
	    return sources;
	  }
	});

	/**
	 * Returns the original source, line, and column information for the generated
	 * source's line and column positions provided. The only argument is an object
	 * with the following properties:
	 *
	 *   - line: The line number in the generated source.  The line number
	 *     is 1-based.
	 *   - column: The column number in the generated source.  The column
	 *     number is 0-based.
	 *
	 * and an object is returned with the following properties:
	 *
	 *   - source: The original source file, or null.
	 *   - line: The line number in the original source, or null.  The
	 *     line number is 1-based.
	 *   - column: The column number in the original source, or null.  The
	 *     column number is 0-based.
	 *   - name: The original identifier, or null.
	 */
	IndexedSourceMapConsumer.prototype.originalPositionFor =
	  function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
	    var needle = {
	      generatedLine: util$1.getArg(aArgs, 'line'),
	      generatedColumn: util$1.getArg(aArgs, 'column')
	    };

	    // Find the section containing the generated position we're trying to map
	    // to an original position.
	    var sectionIndex = binarySearch.search(needle, this._sections,
	      function(needle, section) {
	        var cmp = needle.generatedLine - section.generatedOffset.generatedLine;
	        if (cmp) {
	          return cmp;
	        }

	        return (needle.generatedColumn -
	                section.generatedOffset.generatedColumn);
	      });
	    var section = this._sections[sectionIndex];

	    if (!section) {
	      return {
	        source: null,
	        line: null,
	        column: null,
	        name: null
	      };
	    }

	    return section.consumer.originalPositionFor({
	      line: needle.generatedLine -
	        (section.generatedOffset.generatedLine - 1),
	      column: needle.generatedColumn -
	        (section.generatedOffset.generatedLine === needle.generatedLine
	         ? section.generatedOffset.generatedColumn - 1
	         : 0),
	      bias: aArgs.bias
	    });
	  };

	/**
	 * Return true if we have the source content for every source in the source
	 * map, false otherwise.
	 */
	IndexedSourceMapConsumer.prototype.hasContentsOfAllSources =
	  function IndexedSourceMapConsumer_hasContentsOfAllSources() {
	    return this._sections.every(function (s) {
	      return s.consumer.hasContentsOfAllSources();
	    });
	  };

	/**
	 * Returns the original source content. The only argument is the url of the
	 * original source file. Returns null if no original source content is
	 * available.
	 */
	IndexedSourceMapConsumer.prototype.sourceContentFor =
	  function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
	    for (var i = 0; i < this._sections.length; i++) {
	      var section = this._sections[i];

	      var content = section.consumer.sourceContentFor(aSource, true);
	      if (content) {
	        return content;
	      }
	    }
	    if (nullOnMissing) {
	      return null;
	    }
	    else {
	      throw new Error('"' + aSource + '" is not in the SourceMap.');
	    }
	  };

	/**
	 * Returns the generated line and column information for the original source,
	 * line, and column positions provided. The only argument is an object with
	 * the following properties:
	 *
	 *   - source: The filename of the original source.
	 *   - line: The line number in the original source.  The line number
	 *     is 1-based.
	 *   - column: The column number in the original source.  The column
	 *     number is 0-based.
	 *
	 * and an object is returned with the following properties:
	 *
	 *   - line: The line number in the generated source, or null.  The
	 *     line number is 1-based. 
	 *   - column: The column number in the generated source, or null.
	 *     The column number is 0-based.
	 */
	IndexedSourceMapConsumer.prototype.generatedPositionFor =
	  function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
	    for (var i = 0; i < this._sections.length; i++) {
	      var section = this._sections[i];

	      // Only consider this section if the requested source is in the list of
	      // sources of the consumer.
	      if (section.consumer._findSourceIndex(util$1.getArg(aArgs, 'source')) === -1) {
	        continue;
	      }
	      var generatedPosition = section.consumer.generatedPositionFor(aArgs);
	      if (generatedPosition) {
	        var ret = {
	          line: generatedPosition.line +
	            (section.generatedOffset.generatedLine - 1),
	          column: generatedPosition.column +
	            (section.generatedOffset.generatedLine === generatedPosition.line
	             ? section.generatedOffset.generatedColumn - 1
	             : 0)
	        };
	        return ret;
	      }
	    }

	    return {
	      line: null,
	      column: null
	    };
	  };

	/**
	 * Parse the mappings in a string in to a data structure which we can easily
	 * query (the ordered arrays in the `this.__generatedMappings` and
	 * `this.__originalMappings` properties).
	 */
	IndexedSourceMapConsumer.prototype._parseMappings =
	  function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
	    this.__generatedMappings = [];
	    this.__originalMappings = [];
	    for (var i = 0; i < this._sections.length; i++) {
	      var section = this._sections[i];
	      var sectionMappings = section.consumer._generatedMappings;
	      for (var j = 0; j < sectionMappings.length; j++) {
	        var mapping = sectionMappings[j];

	        var source = section.consumer._sources.at(mapping.source);
	        source = util$1.computeSourceURL(section.consumer.sourceRoot, source, this._sourceMapURL);
	        this._sources.add(source);
	        source = this._sources.indexOf(source);

	        var name = null;
	        if (mapping.name) {
	          name = section.consumer._names.at(mapping.name);
	          this._names.add(name);
	          name = this._names.indexOf(name);
	        }

	        // The mappings coming from the consumer for the section have
	        // generated positions relative to the start of the section, so we
	        // need to offset them to be relative to the start of the concatenated
	        // generated file.
	        var adjustedMapping = {
	          source: source,
	          generatedLine: mapping.generatedLine +
	            (section.generatedOffset.generatedLine - 1),
	          generatedColumn: mapping.generatedColumn +
	            (section.generatedOffset.generatedLine === mapping.generatedLine
	            ? section.generatedOffset.generatedColumn - 1
	            : 0),
	          originalLine: mapping.originalLine,
	          originalColumn: mapping.originalColumn,
	          name: name
	        };

	        this.__generatedMappings.push(adjustedMapping);
	        if (typeof adjustedMapping.originalLine === 'number') {
	          this.__originalMappings.push(adjustedMapping);
	        }
	      }
	    }

	    quickSort$1(this.__generatedMappings, util$1.compareByGeneratedPositionsDeflated);
	    quickSort$1(this.__originalMappings, util$1.compareByOriginalPositions);
	  };

	var IndexedSourceMapConsumer_1 = IndexedSourceMapConsumer;

	var sourceMapConsumer = {
		SourceMapConsumer: SourceMapConsumer_1,
		BasicSourceMapConsumer: BasicSourceMapConsumer_1,
		IndexedSourceMapConsumer: IndexedSourceMapConsumer_1
	};

	/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */

	var SourceMapGenerator$1 = sourceMapGenerator.SourceMapGenerator;


	// Matches a Windows-style `\r\n` newline or a `\n` newline used by all other
	// operating systems these days (capturing the result).
	var REGEX_NEWLINE = /(\r?\n)/;

	// Newline character code for charCodeAt() comparisons
	var NEWLINE_CODE = 10;

	// Private symbol for identifying `SourceNode`s when multiple versions of
	// the source-map library are loaded. This MUST NOT CHANGE across
	// versions!
	var isSourceNode = "$$$isSourceNode$$$";

	/**
	 * SourceNodes provide a way to abstract over interpolating/concatenating
	 * snippets of generated JavaScript source code while maintaining the line and
	 * column information associated with the original source code.
	 *
	 * @param aLine The original line number.
	 * @param aColumn The original column number.
	 * @param aSource The original source's filename.
	 * @param aChunks Optional. An array of strings which are snippets of
	 *        generated JS, or other SourceNodes.
	 * @param aName The original identifier.
	 */
	function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
	  this.children = [];
	  this.sourceContents = {};
	  this.line = aLine == null ? null : aLine;
	  this.column = aColumn == null ? null : aColumn;
	  this.source = aSource == null ? null : aSource;
	  this.name = aName == null ? null : aName;
	  this[isSourceNode] = true;
	  if (aChunks != null) this.add(aChunks);
	}

	/**
	 * Creates a SourceNode from generated code and a SourceMapConsumer.
	 *
	 * @param aGeneratedCode The generated code
	 * @param aSourceMapConsumer The SourceMap for the generated code
	 * @param aRelativePath Optional. The path that relative sources in the
	 *        SourceMapConsumer should be relative to.
	 */
	SourceNode.fromStringWithSourceMap =
	  function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
	    // The SourceNode we want to fill with the generated code
	    // and the SourceMap
	    var node = new SourceNode();

	    // All even indices of this array are one line of the generated code,
	    // while all odd indices are the newlines between two adjacent lines
	    // (since `REGEX_NEWLINE` captures its match).
	    // Processed fragments are accessed by calling `shiftNextLine`.
	    var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
	    var remainingLinesIndex = 0;
	    var shiftNextLine = function() {
	      var lineContents = getNextLine();
	      // The last line of a file might not have a newline.
	      var newLine = getNextLine() || "";
	      return lineContents + newLine;

	      function getNextLine() {
	        return remainingLinesIndex < remainingLines.length ?
	            remainingLines[remainingLinesIndex++] : undefined;
	      }
	    };

	    // We need to remember the position of "remainingLines"
	    var lastGeneratedLine = 1, lastGeneratedColumn = 0;

	    // The generate SourceNodes we need a code range.
	    // To extract it current and last mapping is used.
	    // Here we store the last mapping.
	    var lastMapping = null;

	    aSourceMapConsumer.eachMapping(function (mapping) {
	      if (lastMapping !== null) {
	        // We add the code from "lastMapping" to "mapping":
	        // First check if there is a new line in between.
	        if (lastGeneratedLine < mapping.generatedLine) {
	          // Associate first line with "lastMapping"
	          addMappingWithCode(lastMapping, shiftNextLine());
	          lastGeneratedLine++;
	          lastGeneratedColumn = 0;
	          // The remaining code is added without mapping
	        } else {
	          // There is no new line in between.
	          // Associate the code between "lastGeneratedColumn" and
	          // "mapping.generatedColumn" with "lastMapping"
	          var nextLine = remainingLines[remainingLinesIndex] || '';
	          var code = nextLine.substr(0, mapping.generatedColumn -
	                                        lastGeneratedColumn);
	          remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn -
	                                              lastGeneratedColumn);
	          lastGeneratedColumn = mapping.generatedColumn;
	          addMappingWithCode(lastMapping, code);
	          // No more remaining code, continue
	          lastMapping = mapping;
	          return;
	        }
	      }
	      // We add the generated code until the first mapping
	      // to the SourceNode without any mapping.
	      // Each line is added as separate string.
	      while (lastGeneratedLine < mapping.generatedLine) {
	        node.add(shiftNextLine());
	        lastGeneratedLine++;
	      }
	      if (lastGeneratedColumn < mapping.generatedColumn) {
	        var nextLine = remainingLines[remainingLinesIndex] || '';
	        node.add(nextLine.substr(0, mapping.generatedColumn));
	        remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn);
	        lastGeneratedColumn = mapping.generatedColumn;
	      }
	      lastMapping = mapping;
	    }, this);
	    // We have processed all mappings.
	    if (remainingLinesIndex < remainingLines.length) {
	      if (lastMapping) {
	        // Associate the remaining code in the current line with "lastMapping"
	        addMappingWithCode(lastMapping, shiftNextLine());
	      }
	      // and add the remaining lines without any mapping
	      node.add(remainingLines.splice(remainingLinesIndex).join(""));
	    }

	    // Copy sourcesContent into SourceNode
	    aSourceMapConsumer.sources.forEach(function (sourceFile) {
	      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
	      if (content != null) {
	        if (aRelativePath != null) {
	          sourceFile = util$1.join(aRelativePath, sourceFile);
	        }
	        node.setSourceContent(sourceFile, content);
	      }
	    });

	    return node;

	    function addMappingWithCode(mapping, code) {
	      if (mapping === null || mapping.source === undefined) {
	        node.add(code);
	      } else {
	        var source = aRelativePath
	          ? util$1.join(aRelativePath, mapping.source)
	          : mapping.source;
	        node.add(new SourceNode(mapping.originalLine,
	                                mapping.originalColumn,
	                                source,
	                                code,
	                                mapping.name));
	      }
	    }
	  };

	/**
	 * Add a chunk of generated JS to this source node.
	 *
	 * @param aChunk A string snippet of generated JS code, another instance of
	 *        SourceNode, or an array where each member is one of those things.
	 */
	SourceNode.prototype.add = function SourceNode_add(aChunk) {
	  if (Array.isArray(aChunk)) {
	    aChunk.forEach(function (chunk) {
	      this.add(chunk);
	    }, this);
	  }
	  else if (aChunk[isSourceNode] || typeof aChunk === "string") {
	    if (aChunk) {
	      this.children.push(aChunk);
	    }
	  }
	  else {
	    throw new TypeError(
	      "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
	    );
	  }
	  return this;
	};

	/**
	 * Add a chunk of generated JS to the beginning of this source node.
	 *
	 * @param aChunk A string snippet of generated JS code, another instance of
	 *        SourceNode, or an array where each member is one of those things.
	 */
	SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
	  if (Array.isArray(aChunk)) {
	    for (var i = aChunk.length-1; i >= 0; i--) {
	      this.prepend(aChunk[i]);
	    }
	  }
	  else if (aChunk[isSourceNode] || typeof aChunk === "string") {
	    this.children.unshift(aChunk);
	  }
	  else {
	    throw new TypeError(
	      "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
	    );
	  }
	  return this;
	};

	/**
	 * Walk over the tree of JS snippets in this node and its children. The
	 * walking function is called once for each snippet of JS and is passed that
	 * snippet and the its original associated source's line/column location.
	 *
	 * @param aFn The traversal function.
	 */
	SourceNode.prototype.walk = function SourceNode_walk(aFn) {
	  var chunk;
	  for (var i = 0, len = this.children.length; i < len; i++) {
	    chunk = this.children[i];
	    if (chunk[isSourceNode]) {
	      chunk.walk(aFn);
	    }
	    else {
	      if (chunk !== '') {
	        aFn(chunk, { source: this.source,
	                     line: this.line,
	                     column: this.column,
	                     name: this.name });
	      }
	    }
	  }
	};

	/**
	 * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
	 * each of `this.children`.
	 *
	 * @param aSep The separator.
	 */
	SourceNode.prototype.join = function SourceNode_join(aSep) {
	  var newChildren;
	  var i;
	  var len = this.children.length;
	  if (len > 0) {
	    newChildren = [];
	    for (i = 0; i < len-1; i++) {
	      newChildren.push(this.children[i]);
	      newChildren.push(aSep);
	    }
	    newChildren.push(this.children[i]);
	    this.children = newChildren;
	  }
	  return this;
	};

	/**
	 * Call String.prototype.replace on the very right-most source snippet. Useful
	 * for trimming whitespace from the end of a source node, etc.
	 *
	 * @param aPattern The pattern to replace.
	 * @param aReplacement The thing to replace the pattern with.
	 */
	SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
	  var lastChild = this.children[this.children.length - 1];
	  if (lastChild[isSourceNode]) {
	    lastChild.replaceRight(aPattern, aReplacement);
	  }
	  else if (typeof lastChild === 'string') {
	    this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
	  }
	  else {
	    this.children.push(''.replace(aPattern, aReplacement));
	  }
	  return this;
	};

	/**
	 * Set the source content for a source file. This will be added to the SourceMapGenerator
	 * in the sourcesContent field.
	 *
	 * @param aSourceFile The filename of the source file
	 * @param aSourceContent The content of the source file
	 */
	SourceNode.prototype.setSourceContent =
	  function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
	    this.sourceContents[util$1.toSetString(aSourceFile)] = aSourceContent;
	  };

	/**
	 * Walk over the tree of SourceNodes. The walking function is called for each
	 * source file content and is passed the filename and source content.
	 *
	 * @param aFn The traversal function.
	 */
	SourceNode.prototype.walkSourceContents =
	  function SourceNode_walkSourceContents(aFn) {
	    for (var i = 0, len = this.children.length; i < len; i++) {
	      if (this.children[i][isSourceNode]) {
	        this.children[i].walkSourceContents(aFn);
	      }
	    }

	    var sources = Object.keys(this.sourceContents);
	    for (var i = 0, len = sources.length; i < len; i++) {
	      aFn(util$1.fromSetString(sources[i]), this.sourceContents[sources[i]]);
	    }
	  };

	/**
	 * Return the string representation of this source node. Walks over the tree
	 * and concatenates all the various snippets together to one string.
	 */
	SourceNode.prototype.toString = function SourceNode_toString() {
	  var str = "";
	  this.walk(function (chunk) {
	    str += chunk;
	  });
	  return str;
	};

	/**
	 * Returns the string representation of this source node along with a source
	 * map.
	 */
	SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
	  var generated = {
	    code: "",
	    line: 1,
	    column: 0
	  };
	  var map = new SourceMapGenerator$1(aArgs);
	  var sourceMappingActive = false;
	  var lastOriginalSource = null;
	  var lastOriginalLine = null;
	  var lastOriginalColumn = null;
	  var lastOriginalName = null;
	  this.walk(function (chunk, original) {
	    generated.code += chunk;
	    if (original.source !== null
	        && original.line !== null
	        && original.column !== null) {
	      if(lastOriginalSource !== original.source
	         || lastOriginalLine !== original.line
	         || lastOriginalColumn !== original.column
	         || lastOriginalName !== original.name) {
	        map.addMapping({
	          source: original.source,
	          original: {
	            line: original.line,
	            column: original.column
	          },
	          generated: {
	            line: generated.line,
	            column: generated.column
	          },
	          name: original.name
	        });
	      }
	      lastOriginalSource = original.source;
	      lastOriginalLine = original.line;
	      lastOriginalColumn = original.column;
	      lastOriginalName = original.name;
	      sourceMappingActive = true;
	    } else if (sourceMappingActive) {
	      map.addMapping({
	        generated: {
	          line: generated.line,
	          column: generated.column
	        }
	      });
	      lastOriginalSource = null;
	      sourceMappingActive = false;
	    }
	    for (var idx = 0, length = chunk.length; idx < length; idx++) {
	      if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
	        generated.line++;
	        generated.column = 0;
	        // Mappings end at eol
	        if (idx + 1 === length) {
	          lastOriginalSource = null;
	          sourceMappingActive = false;
	        } else if (sourceMappingActive) {
	          map.addMapping({
	            source: original.source,
	            original: {
	              line: original.line,
	              column: original.column
	            },
	            generated: {
	              line: generated.line,
	              column: generated.column
	            },
	            name: original.name
	          });
	        }
	      } else {
	        generated.column++;
	      }
	    }
	  });
	  this.walkSourceContents(function (sourceFile, sourceContent) {
	    map.setSourceContent(sourceFile, sourceContent);
	  });

	  return { code: generated.code, map: map };
	};

	var SourceNode_1 = SourceNode;

	var sourceNode = {
		SourceNode: SourceNode_1
	};

	/*
	 * Copyright 2009-2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE.txt or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */
	var SourceMapGenerator$2 = sourceMapGenerator.SourceMapGenerator;
	var SourceMapConsumer$1 = sourceMapConsumer.SourceMapConsumer;
	var SourceNode$1 = sourceNode.SourceNode;

	var sourceMap = {
		SourceMapGenerator: SourceMapGenerator$2,
		SourceMapConsumer: SourceMapConsumer$1,
		SourceNode: SourceNode$1
	};

	var codeGen = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;



	var SourceNode = undefined;

	try {
	  /* istanbul ignore next */
	  {
	    // We don't support this in AMD environments. For these environments, we asusme that
	    // they are running on the browser and thus have no need for the source-map library.
	    var SourceMap = sourceMap;
	    SourceNode = SourceMap.SourceNode;
	  }
	} catch (err) {}
	/* NOP */

	/* istanbul ignore if: tested but not covered in istanbul due to dist build  */
	if (!SourceNode) {
	  SourceNode = function (line, column, srcFile, chunks) {
	    this.src = '';
	    if (chunks) {
	      this.add(chunks);
	    }
	  };
	  /* istanbul ignore next */
	  SourceNode.prototype = {
	    add: function add(chunks) {
	      if (utils.isArray(chunks)) {
	        chunks = chunks.join('');
	      }
	      this.src += chunks;
	    },
	    prepend: function prepend(chunks) {
	      if (utils.isArray(chunks)) {
	        chunks = chunks.join('');
	      }
	      this.src = chunks + this.src;
	    },
	    toStringWithSourceMap: function toStringWithSourceMap() {
	      return { code: this.toString() };
	    },
	    toString: function toString() {
	      return this.src;
	    }
	  };
	}

	function castChunk(chunk, codeGen, loc) {
	  if (utils.isArray(chunk)) {
	    var ret = [];

	    for (var i = 0, len = chunk.length; i < len; i++) {
	      ret.push(codeGen.wrap(chunk[i], loc));
	    }
	    return ret;
	  } else if (typeof chunk === 'boolean' || typeof chunk === 'number') {
	    // Handle primitives that the SourceNode will throw up on
	    return chunk + '';
	  }
	  return chunk;
	}

	function CodeGen(srcFile) {
	  this.srcFile = srcFile;
	  this.source = [];
	}

	CodeGen.prototype = {
	  isEmpty: function isEmpty() {
	    return !this.source.length;
	  },
	  prepend: function prepend(source, loc) {
	    this.source.unshift(this.wrap(source, loc));
	  },
	  push: function push(source, loc) {
	    this.source.push(this.wrap(source, loc));
	  },

	  merge: function merge() {
	    var source = this.empty();
	    this.each(function (line) {
	      source.add(['  ', line, '\n']);
	    });
	    return source;
	  },

	  each: function each(iter) {
	    for (var i = 0, len = this.source.length; i < len; i++) {
	      iter(this.source[i]);
	    }
	  },

	  empty: function empty() {
	    var loc = this.currentLocation || { start: {} };
	    return new SourceNode(loc.start.line, loc.start.column, this.srcFile);
	  },
	  wrap: function wrap(chunk) {
	    var loc = arguments.length <= 1 || arguments[1] === undefined ? this.currentLocation || { start: {} } : arguments[1];

	    if (chunk instanceof SourceNode) {
	      return chunk;
	    }

	    chunk = castChunk(chunk, this, loc);

	    return new SourceNode(loc.start.line, loc.start.column, this.srcFile, chunk);
	  },

	  functionCall: function functionCall(fn, type, params) {
	    params = this.generateList(params);
	    return this.wrap([fn, type ? '.' + type + '(' : '(', params, ')']);
	  },

	  quotedString: function quotedString(str) {
	    return '"' + (str + '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\u2028/g, '\\u2028') // Per Ecma-262 7.3 + 7.8.4
	    .replace(/\u2029/g, '\\u2029') + '"';
	  },

	  objectLiteral: function objectLiteral(obj) {
	    var pairs = [];

	    for (var key in obj) {
	      if (obj.hasOwnProperty(key)) {
	        var value = castChunk(obj[key], this);
	        if (value !== 'undefined') {
	          pairs.push([this.quotedString(key), ':', value]);
	        }
	      }
	    }

	    var ret = this.generateList(pairs);
	    ret.prepend('{');
	    ret.add('}');
	    return ret;
	  },

	  generateList: function generateList(entries) {
	    var ret = this.empty();

	    for (var i = 0, len = entries.length; i < len; i++) {
	      if (i) {
	        ret.add(',');
	      }

	      ret.add(castChunk(entries[i], this));
	    }

	    return ret;
	  },

	  generateArray: function generateArray(entries) {
	    var ret = this.generateList(entries);
	    ret.prepend('[');
	    ret.add(']');

	    return ret;
	  }
	};

	exports['default'] = CodeGen;
	module.exports = exports['default'];

	});

	unwrapExports(codeGen);

	var javascriptCompiler = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }





	var _exception2 = _interopRequireDefault(exception);





	var _codeGen2 = _interopRequireDefault(codeGen);

	function Literal(value) {
	  this.value = value;
	}

	function JavaScriptCompiler() {}

	JavaScriptCompiler.prototype = {
	  // PUBLIC API: You can override these methods in a subclass to provide
	  // alternative compiled forms for name lookup and buffering semantics
	  nameLookup: function nameLookup(parent, name /* , type*/) {
	    if (JavaScriptCompiler.isValidJavaScriptVariableName(name)) {
	      return [parent, '.', name];
	    } else {
	      return [parent, '[', JSON.stringify(name), ']'];
	    }
	  },
	  depthedLookup: function depthedLookup(name) {
	    return [this.aliasable('container.lookup'), '(depths, "', name, '")'];
	  },

	  compilerInfo: function compilerInfo() {
	    var revision = base.COMPILER_REVISION,
	        versions = base.REVISION_CHANGES[revision];
	    return [revision, versions];
	  },

	  appendToBuffer: function appendToBuffer(source, location, explicit) {
	    // Force a source as this simplifies the merge logic.
	    if (!utils.isArray(source)) {
	      source = [source];
	    }
	    source = this.source.wrap(source, location);

	    if (this.environment.isSimple) {
	      return ['return ', source, ';'];
	    } else if (explicit) {
	      // This is a case where the buffer operation occurs as a child of another
	      // construct, generally braces. We have to explicitly output these buffer
	      // operations to ensure that the emitted code goes in the correct location.
	      return ['buffer += ', source, ';'];
	    } else {
	      source.appendToBuffer = true;
	      return source;
	    }
	  },

	  initializeBuffer: function initializeBuffer() {
	    return this.quotedString('');
	  },
	  // END PUBLIC API

	  compile: function compile(environment, options, context, asObject) {
	    this.environment = environment;
	    this.options = options;
	    this.stringParams = this.options.stringParams;
	    this.trackIds = this.options.trackIds;
	    this.precompile = !asObject;

	    this.name = this.environment.name;
	    this.isChild = !!context;
	    this.context = context || {
	      decorators: [],
	      programs: [],
	      environments: []
	    };

	    this.preamble();

	    this.stackSlot = 0;
	    this.stackVars = [];
	    this.aliases = {};
	    this.registers = { list: [] };
	    this.hashes = [];
	    this.compileStack = [];
	    this.inlineStack = [];
	    this.blockParams = [];

	    this.compileChildren(environment, options);

	    this.useDepths = this.useDepths || environment.useDepths || environment.useDecorators || this.options.compat;
	    this.useBlockParams = this.useBlockParams || environment.useBlockParams;

	    var opcodes = environment.opcodes,
	        opcode = undefined,
	        firstLoc = undefined,
	        i = undefined,
	        l = undefined;

	    for (i = 0, l = opcodes.length; i < l; i++) {
	      opcode = opcodes[i];

	      this.source.currentLocation = opcode.loc;
	      firstLoc = firstLoc || opcode.loc;
	      this[opcode.opcode].apply(this, opcode.args);
	    }

	    // Flush any trailing content that might be pending.
	    this.source.currentLocation = firstLoc;
	    this.pushSource('');

	    /* istanbul ignore next */
	    if (this.stackSlot || this.inlineStack.length || this.compileStack.length) {
	      throw new _exception2['default']('Compile completed with content left on stack');
	    }

	    if (!this.decorators.isEmpty()) {
	      this.useDecorators = true;

	      this.decorators.prepend('var decorators = container.decorators;\n');
	      this.decorators.push('return fn;');

	      if (asObject) {
	        this.decorators = Function.apply(this, ['fn', 'props', 'container', 'depth0', 'data', 'blockParams', 'depths', this.decorators.merge()]);
	      } else {
	        this.decorators.prepend('function(fn, props, container, depth0, data, blockParams, depths) {\n');
	        this.decorators.push('}\n');
	        this.decorators = this.decorators.merge();
	      }
	    } else {
	      this.decorators = undefined;
	    }

	    var fn = this.createFunctionContext(asObject);
	    if (!this.isChild) {
	      var ret = {
	        compiler: this.compilerInfo(),
	        main: fn
	      };

	      if (this.decorators) {
	        ret.main_d = this.decorators; // eslint-disable-line camelcase
	        ret.useDecorators = true;
	      }

	      var _context = this.context;
	      var programs = _context.programs;
	      var decorators = _context.decorators;

	      for (i = 0, l = programs.length; i < l; i++) {
	        if (programs[i]) {
	          ret[i] = programs[i];
	          if (decorators[i]) {
	            ret[i + '_d'] = decorators[i];
	            ret.useDecorators = true;
	          }
	        }
	      }

	      if (this.environment.usePartial) {
	        ret.usePartial = true;
	      }
	      if (this.options.data) {
	        ret.useData = true;
	      }
	      if (this.useDepths) {
	        ret.useDepths = true;
	      }
	      if (this.useBlockParams) {
	        ret.useBlockParams = true;
	      }
	      if (this.options.compat) {
	        ret.compat = true;
	      }

	      if (!asObject) {
	        ret.compiler = JSON.stringify(ret.compiler);

	        this.source.currentLocation = { start: { line: 1, column: 0 } };
	        ret = this.objectLiteral(ret);

	        if (options.srcName) {
	          ret = ret.toStringWithSourceMap({ file: options.destName });
	          ret.map = ret.map && ret.map.toString();
	        } else {
	          ret = ret.toString();
	        }
	      } else {
	        ret.compilerOptions = this.options;
	      }

	      return ret;
	    } else {
	      return fn;
	    }
	  },

	  preamble: function preamble() {
	    // track the last context pushed into place to allow skipping the
	    // getContext opcode when it would be a noop
	    this.lastContext = 0;
	    this.source = new _codeGen2['default'](this.options.srcName);
	    this.decorators = new _codeGen2['default'](this.options.srcName);
	  },

	  createFunctionContext: function createFunctionContext(asObject) {
	    var varDeclarations = '';

	    var locals = this.stackVars.concat(this.registers.list);
	    if (locals.length > 0) {
	      varDeclarations += ', ' + locals.join(', ');
	    }

	    // Generate minimizer alias mappings
	    //
	    // When using true SourceNodes, this will update all references to the given alias
	    // as the source nodes are reused in situ. For the non-source node compilation mode,
	    // aliases will not be used, but this case is already being run on the client and
	    // we aren't concern about minimizing the template size.
	    var aliasCount = 0;
	    for (var alias in this.aliases) {
	      // eslint-disable-line guard-for-in
	      var node = this.aliases[alias];

	      if (this.aliases.hasOwnProperty(alias) && node.children && node.referenceCount > 1) {
	        varDeclarations += ', alias' + ++aliasCount + '=' + alias;
	        node.children[0] = 'alias' + aliasCount;
	      }
	    }

	    var params = ['container', 'depth0', 'helpers', 'partials', 'data'];

	    if (this.useBlockParams || this.useDepths) {
	      params.push('blockParams');
	    }
	    if (this.useDepths) {
	      params.push('depths');
	    }

	    // Perform a second pass over the output to merge content when possible
	    var source = this.mergeSource(varDeclarations);

	    if (asObject) {
	      params.push(source);

	      return Function.apply(this, params);
	    } else {
	      return this.source.wrap(['function(', params.join(','), ') {\n  ', source, '}']);
	    }
	  },
	  mergeSource: function mergeSource(varDeclarations) {
	    var isSimple = this.environment.isSimple,
	        appendOnly = !this.forceBuffer,
	        appendFirst = undefined,
	        sourceSeen = undefined,
	        bufferStart = undefined,
	        bufferEnd = undefined;
	    this.source.each(function (line) {
	      if (line.appendToBuffer) {
	        if (bufferStart) {
	          line.prepend('  + ');
	        } else {
	          bufferStart = line;
	        }
	        bufferEnd = line;
	      } else {
	        if (bufferStart) {
	          if (!sourceSeen) {
	            appendFirst = true;
	          } else {
	            bufferStart.prepend('buffer += ');
	          }
	          bufferEnd.add(';');
	          bufferStart = bufferEnd = undefined;
	        }

	        sourceSeen = true;
	        if (!isSimple) {
	          appendOnly = false;
	        }
	      }
	    });

	    if (appendOnly) {
	      if (bufferStart) {
	        bufferStart.prepend('return ');
	        bufferEnd.add(';');
	      } else if (!sourceSeen) {
	        this.source.push('return "";');
	      }
	    } else {
	      varDeclarations += ', buffer = ' + (appendFirst ? '' : this.initializeBuffer());

	      if (bufferStart) {
	        bufferStart.prepend('return buffer + ');
	        bufferEnd.add(';');
	      } else {
	        this.source.push('return buffer;');
	      }
	    }

	    if (varDeclarations) {
	      this.source.prepend('var ' + varDeclarations.substring(2) + (appendFirst ? '' : ';\n'));
	    }

	    return this.source.merge();
	  },

	  // [blockValue]
	  //
	  // On stack, before: hash, inverse, program, value
	  // On stack, after: return value of blockHelperMissing
	  //
	  // The purpose of this opcode is to take a block of the form
	  // `{{#this.foo}}...{{/this.foo}}`, resolve the value of `foo`, and
	  // replace it on the stack with the result of properly
	  // invoking blockHelperMissing.
	  blockValue: function blockValue(name) {
	    var blockHelperMissing = this.aliasable('helpers.blockHelperMissing'),
	        params = [this.contextName(0)];
	    this.setupHelperArgs(name, 0, params);

	    var blockName = this.popStack();
	    params.splice(1, 0, blockName);

	    this.push(this.source.functionCall(blockHelperMissing, 'call', params));
	  },

	  // [ambiguousBlockValue]
	  //
	  // On stack, before: hash, inverse, program, value
	  // Compiler value, before: lastHelper=value of last found helper, if any
	  // On stack, after, if no lastHelper: same as [blockValue]
	  // On stack, after, if lastHelper: value
	  ambiguousBlockValue: function ambiguousBlockValue() {
	    // We're being a bit cheeky and reusing the options value from the prior exec
	    var blockHelperMissing = this.aliasable('helpers.blockHelperMissing'),
	        params = [this.contextName(0)];
	    this.setupHelperArgs('', 0, params, true);

	    this.flushInline();

	    var current = this.topStack();
	    params.splice(1, 0, current);

	    this.pushSource(['if (!', this.lastHelper, ') { ', current, ' = ', this.source.functionCall(blockHelperMissing, 'call', params), '}']);
	  },

	  // [appendContent]
	  //
	  // On stack, before: ...
	  // On stack, after: ...
	  //
	  // Appends the string value of `content` to the current buffer
	  appendContent: function appendContent(content) {
	    if (this.pendingContent) {
	      content = this.pendingContent + content;
	    } else {
	      this.pendingLocation = this.source.currentLocation;
	    }

	    this.pendingContent = content;
	  },

	  // [append]
	  //
	  // On stack, before: value, ...
	  // On stack, after: ...
	  //
	  // Coerces `value` to a String and appends it to the current buffer.
	  //
	  // If `value` is truthy, or 0, it is coerced into a string and appended
	  // Otherwise, the empty string is appended
	  append: function append() {
	    if (this.isInline()) {
	      this.replaceStack(function (current) {
	        return [' != null ? ', current, ' : ""'];
	      });

	      this.pushSource(this.appendToBuffer(this.popStack()));
	    } else {
	      var local = this.popStack();
	      this.pushSource(['if (', local, ' != null) { ', this.appendToBuffer(local, undefined, true), ' }']);
	      if (this.environment.isSimple) {
	        this.pushSource(['else { ', this.appendToBuffer("''", undefined, true), ' }']);
	      }
	    }
	  },

	  // [appendEscaped]
	  //
	  // On stack, before: value, ...
	  // On stack, after: ...
	  //
	  // Escape `value` and append it to the buffer
	  appendEscaped: function appendEscaped() {
	    this.pushSource(this.appendToBuffer([this.aliasable('container.escapeExpression'), '(', this.popStack(), ')']));
	  },

	  // [getContext]
	  //
	  // On stack, before: ...
	  // On stack, after: ...
	  // Compiler value, after: lastContext=depth
	  //
	  // Set the value of the `lastContext` compiler value to the depth
	  getContext: function getContext(depth) {
	    this.lastContext = depth;
	  },

	  // [pushContext]
	  //
	  // On stack, before: ...
	  // On stack, after: currentContext, ...
	  //
	  // Pushes the value of the current context onto the stack.
	  pushContext: function pushContext() {
	    this.pushStackLiteral(this.contextName(this.lastContext));
	  },

	  // [lookupOnContext]
	  //
	  // On stack, before: ...
	  // On stack, after: currentContext[name], ...
	  //
	  // Looks up the value of `name` on the current context and pushes
	  // it onto the stack.
	  lookupOnContext: function lookupOnContext(parts, falsy, strict, scoped) {
	    var i = 0;

	    if (!scoped && this.options.compat && !this.lastContext) {
	      // The depthed query is expected to handle the undefined logic for the root level that
	      // is implemented below, so we evaluate that directly in compat mode
	      this.push(this.depthedLookup(parts[i++]));
	    } else {
	      this.pushContext();
	    }

	    this.resolvePath('context', parts, i, falsy, strict);
	  },

	  // [lookupBlockParam]
	  //
	  // On stack, before: ...
	  // On stack, after: blockParam[name], ...
	  //
	  // Looks up the value of `parts` on the given block param and pushes
	  // it onto the stack.
	  lookupBlockParam: function lookupBlockParam(blockParamId, parts) {
	    this.useBlockParams = true;

	    this.push(['blockParams[', blockParamId[0], '][', blockParamId[1], ']']);
	    this.resolvePath('context', parts, 1);
	  },

	  // [lookupData]
	  //
	  // On stack, before: ...
	  // On stack, after: data, ...
	  //
	  // Push the data lookup operator
	  lookupData: function lookupData(depth, parts, strict) {
	    if (!depth) {
	      this.pushStackLiteral('data');
	    } else {
	      this.pushStackLiteral('container.data(data, ' + depth + ')');
	    }

	    this.resolvePath('data', parts, 0, true, strict);
	  },

	  resolvePath: function resolvePath(type, parts, i, falsy, strict) {
	    // istanbul ignore next

	    var _this = this;

	    if (this.options.strict || this.options.assumeObjects) {
	      this.push(strictLookup(this.options.strict && strict, this, parts, type));
	      return;
	    }

	    var len = parts.length;
	    for (; i < len; i++) {
	      /* eslint-disable no-loop-func */
	      this.replaceStack(function (current) {
	        var lookup = _this.nameLookup(current, parts[i], type);
	        // We want to ensure that zero and false are handled properly if the context (falsy flag)
	        // needs to have the special handling for these values.
	        if (!falsy) {
	          return [' != null ? ', lookup, ' : ', current];
	        } else {
	          // Otherwise we can use generic falsy handling
	          return [' && ', lookup];
	        }
	      });
	      /* eslint-enable no-loop-func */
	    }
	  },

	  // [resolvePossibleLambda]
	  //
	  // On stack, before: value, ...
	  // On stack, after: resolved value, ...
	  //
	  // If the `value` is a lambda, replace it on the stack by
	  // the return value of the lambda
	  resolvePossibleLambda: function resolvePossibleLambda() {
	    this.push([this.aliasable('container.lambda'), '(', this.popStack(), ', ', this.contextName(0), ')']);
	  },

	  // [pushStringParam]
	  //
	  // On stack, before: ...
	  // On stack, after: string, currentContext, ...
	  //
	  // This opcode is designed for use in string mode, which
	  // provides the string value of a parameter along with its
	  // depth rather than resolving it immediately.
	  pushStringParam: function pushStringParam(string, type) {
	    this.pushContext();
	    this.pushString(type);

	    // If it's a subexpression, the string result
	    // will be pushed after this opcode.
	    if (type !== 'SubExpression') {
	      if (typeof string === 'string') {
	        this.pushString(string);
	      } else {
	        this.pushStackLiteral(string);
	      }
	    }
	  },

	  emptyHash: function emptyHash(omitEmpty) {
	    if (this.trackIds) {
	      this.push('{}'); // hashIds
	    }
	    if (this.stringParams) {
	      this.push('{}'); // hashContexts
	      this.push('{}'); // hashTypes
	    }
	    this.pushStackLiteral(omitEmpty ? 'undefined' : '{}');
	  },
	  pushHash: function pushHash() {
	    if (this.hash) {
	      this.hashes.push(this.hash);
	    }
	    this.hash = { values: [], types: [], contexts: [], ids: [] };
	  },
	  popHash: function popHash() {
	    var hash = this.hash;
	    this.hash = this.hashes.pop();

	    if (this.trackIds) {
	      this.push(this.objectLiteral(hash.ids));
	    }
	    if (this.stringParams) {
	      this.push(this.objectLiteral(hash.contexts));
	      this.push(this.objectLiteral(hash.types));
	    }

	    this.push(this.objectLiteral(hash.values));
	  },

	  // [pushString]
	  //
	  // On stack, before: ...
	  // On stack, after: quotedString(string), ...
	  //
	  // Push a quoted version of `string` onto the stack
	  pushString: function pushString(string) {
	    this.pushStackLiteral(this.quotedString(string));
	  },

	  // [pushLiteral]
	  //
	  // On stack, before: ...
	  // On stack, after: value, ...
	  //
	  // Pushes a value onto the stack. This operation prevents
	  // the compiler from creating a temporary variable to hold
	  // it.
	  pushLiteral: function pushLiteral(value) {
	    this.pushStackLiteral(value);
	  },

	  // [pushProgram]
	  //
	  // On stack, before: ...
	  // On stack, after: program(guid), ...
	  //
	  // Push a program expression onto the stack. This takes
	  // a compile-time guid and converts it into a runtime-accessible
	  // expression.
	  pushProgram: function pushProgram(guid) {
	    if (guid != null) {
	      this.pushStackLiteral(this.programExpression(guid));
	    } else {
	      this.pushStackLiteral(null);
	    }
	  },

	  // [registerDecorator]
	  //
	  // On stack, before: hash, program, params..., ...
	  // On stack, after: ...
	  //
	  // Pops off the decorator's parameters, invokes the decorator,
	  // and inserts the decorator into the decorators list.
	  registerDecorator: function registerDecorator(paramSize, name) {
	    var foundDecorator = this.nameLookup('decorators', name, 'decorator'),
	        options = this.setupHelperArgs(name, paramSize);

	    this.decorators.push(['fn = ', this.decorators.functionCall(foundDecorator, '', ['fn', 'props', 'container', options]), ' || fn;']);
	  },

	  // [invokeHelper]
	  //
	  // On stack, before: hash, inverse, program, params..., ...
	  // On stack, after: result of helper invocation
	  //
	  // Pops off the helper's parameters, invokes the helper,
	  // and pushes the helper's return value onto the stack.
	  //
	  // If the helper is not found, `helperMissing` is called.
	  invokeHelper: function invokeHelper(paramSize, name, isSimple) {
	    var nonHelper = this.popStack(),
	        helper = this.setupHelper(paramSize, name),
	        simple = isSimple ? [helper.name, ' || '] : '';

	    var lookup = ['('].concat(simple, nonHelper);
	    if (!this.options.strict) {
	      lookup.push(' || ', this.aliasable('helpers.helperMissing'));
	    }
	    lookup.push(')');

	    this.push(this.source.functionCall(lookup, 'call', helper.callParams));
	  },

	  // [invokeKnownHelper]
	  //
	  // On stack, before: hash, inverse, program, params..., ...
	  // On stack, after: result of helper invocation
	  //
	  // This operation is used when the helper is known to exist,
	  // so a `helperMissing` fallback is not required.
	  invokeKnownHelper: function invokeKnownHelper(paramSize, name) {
	    var helper = this.setupHelper(paramSize, name);
	    this.push(this.source.functionCall(helper.name, 'call', helper.callParams));
	  },

	  // [invokeAmbiguous]
	  //
	  // On stack, before: hash, inverse, program, params..., ...
	  // On stack, after: result of disambiguation
	  //
	  // This operation is used when an expression like `{{foo}}`
	  // is provided, but we don't know at compile-time whether it
	  // is a helper or a path.
	  //
	  // This operation emits more code than the other options,
	  // and can be avoided by passing the `knownHelpers` and
	  // `knownHelpersOnly` flags at compile-time.
	  invokeAmbiguous: function invokeAmbiguous(name, helperCall) {
	    this.useRegister('helper');

	    var nonHelper = this.popStack();

	    this.emptyHash();
	    var helper = this.setupHelper(0, name, helperCall);

	    var helperName = this.lastHelper = this.nameLookup('helpers', name, 'helper');

	    var lookup = ['(', '(helper = ', helperName, ' || ', nonHelper, ')'];
	    if (!this.options.strict) {
	      lookup[0] = '(helper = ';
	      lookup.push(' != null ? helper : ', this.aliasable('helpers.helperMissing'));
	    }

	    this.push(['(', lookup, helper.paramsInit ? ['),(', helper.paramsInit] : [], '),', '(typeof helper === ', this.aliasable('"function"'), ' ? ', this.source.functionCall('helper', 'call', helper.callParams), ' : helper))']);
	  },

	  // [invokePartial]
	  //
	  // On stack, before: context, ...
	  // On stack after: result of partial invocation
	  //
	  // This operation pops off a context, invokes a partial with that context,
	  // and pushes the result of the invocation back.
	  invokePartial: function invokePartial(isDynamic, name, indent) {
	    var params = [],
	        options = this.setupParams(name, 1, params);

	    if (isDynamic) {
	      name = this.popStack();
	      delete options.name;
	    }

	    if (indent) {
	      options.indent = JSON.stringify(indent);
	    }
	    options.helpers = 'helpers';
	    options.partials = 'partials';
	    options.decorators = 'container.decorators';

	    if (!isDynamic) {
	      params.unshift(this.nameLookup('partials', name, 'partial'));
	    } else {
	      params.unshift(name);
	    }

	    if (this.options.compat) {
	      options.depths = 'depths';
	    }
	    options = this.objectLiteral(options);
	    params.push(options);

	    this.push(this.source.functionCall('container.invokePartial', '', params));
	  },

	  // [assignToHash]
	  //
	  // On stack, before: value, ..., hash, ...
	  // On stack, after: ..., hash, ...
	  //
	  // Pops a value off the stack and assigns it to the current hash
	  assignToHash: function assignToHash(key) {
	    var value = this.popStack(),
	        context = undefined,
	        type = undefined,
	        id = undefined;

	    if (this.trackIds) {
	      id = this.popStack();
	    }
	    if (this.stringParams) {
	      type = this.popStack();
	      context = this.popStack();
	    }

	    var hash = this.hash;
	    if (context) {
	      hash.contexts[key] = context;
	    }
	    if (type) {
	      hash.types[key] = type;
	    }
	    if (id) {
	      hash.ids[key] = id;
	    }
	    hash.values[key] = value;
	  },

	  pushId: function pushId(type, name, child) {
	    if (type === 'BlockParam') {
	      this.pushStackLiteral('blockParams[' + name[0] + '].path[' + name[1] + ']' + (child ? ' + ' + JSON.stringify('.' + child) : ''));
	    } else if (type === 'PathExpression') {
	      this.pushString(name);
	    } else if (type === 'SubExpression') {
	      this.pushStackLiteral('true');
	    } else {
	      this.pushStackLiteral('null');
	    }
	  },

	  // HELPERS

	  compiler: JavaScriptCompiler,

	  compileChildren: function compileChildren(environment, options) {
	    var children = environment.children,
	        child = undefined,
	        compiler = undefined;

	    for (var i = 0, l = children.length; i < l; i++) {
	      child = children[i];
	      compiler = new this.compiler(); // eslint-disable-line new-cap

	      var existing = this.matchExistingProgram(child);

	      if (existing == null) {
	        this.context.programs.push(''); // Placeholder to prevent name conflicts for nested children
	        var index = this.context.programs.length;
	        child.index = index;
	        child.name = 'program' + index;
	        this.context.programs[index] = compiler.compile(child, options, this.context, !this.precompile);
	        this.context.decorators[index] = compiler.decorators;
	        this.context.environments[index] = child;

	        this.useDepths = this.useDepths || compiler.useDepths;
	        this.useBlockParams = this.useBlockParams || compiler.useBlockParams;
	        child.useDepths = this.useDepths;
	        child.useBlockParams = this.useBlockParams;
	      } else {
	        child.index = existing.index;
	        child.name = 'program' + existing.index;

	        this.useDepths = this.useDepths || existing.useDepths;
	        this.useBlockParams = this.useBlockParams || existing.useBlockParams;
	      }
	    }
	  },
	  matchExistingProgram: function matchExistingProgram(child) {
	    for (var i = 0, len = this.context.environments.length; i < len; i++) {
	      var environment = this.context.environments[i];
	      if (environment && environment.equals(child)) {
	        return environment;
	      }
	    }
	  },

	  programExpression: function programExpression(guid) {
	    var child = this.environment.children[guid],
	        programParams = [child.index, 'data', child.blockParams];

	    if (this.useBlockParams || this.useDepths) {
	      programParams.push('blockParams');
	    }
	    if (this.useDepths) {
	      programParams.push('depths');
	    }

	    return 'container.program(' + programParams.join(', ') + ')';
	  },

	  useRegister: function useRegister(name) {
	    if (!this.registers[name]) {
	      this.registers[name] = true;
	      this.registers.list.push(name);
	    }
	  },

	  push: function push(expr) {
	    if (!(expr instanceof Literal)) {
	      expr = this.source.wrap(expr);
	    }

	    this.inlineStack.push(expr);
	    return expr;
	  },

	  pushStackLiteral: function pushStackLiteral(item) {
	    this.push(new Literal(item));
	  },

	  pushSource: function pushSource(source) {
	    if (this.pendingContent) {
	      this.source.push(this.appendToBuffer(this.source.quotedString(this.pendingContent), this.pendingLocation));
	      this.pendingContent = undefined;
	    }

	    if (source) {
	      this.source.push(source);
	    }
	  },

	  replaceStack: function replaceStack(callback) {
	    var prefix = ['('],
	        stack = undefined,
	        createdStack = undefined,
	        usedLiteral = undefined;

	    /* istanbul ignore next */
	    if (!this.isInline()) {
	      throw new _exception2['default']('replaceStack on non-inline');
	    }

	    // We want to merge the inline statement into the replacement statement via ','
	    var top = this.popStack(true);

	    if (top instanceof Literal) {
	      // Literals do not need to be inlined
	      stack = [top.value];
	      prefix = ['(', stack];
	      usedLiteral = true;
	    } else {
	      // Get or create the current stack name for use by the inline
	      createdStack = true;
	      var _name = this.incrStack();

	      prefix = ['((', this.push(_name), ' = ', top, ')'];
	      stack = this.topStack();
	    }

	    var item = callback.call(this, stack);

	    if (!usedLiteral) {
	      this.popStack();
	    }
	    if (createdStack) {
	      this.stackSlot--;
	    }
	    this.push(prefix.concat(item, ')'));
	  },

	  incrStack: function incrStack() {
	    this.stackSlot++;
	    if (this.stackSlot > this.stackVars.length) {
	      this.stackVars.push('stack' + this.stackSlot);
	    }
	    return this.topStackName();
	  },
	  topStackName: function topStackName() {
	    return 'stack' + this.stackSlot;
	  },
	  flushInline: function flushInline() {
	    var inlineStack = this.inlineStack;
	    this.inlineStack = [];
	    for (var i = 0, len = inlineStack.length; i < len; i++) {
	      var entry = inlineStack[i];
	      /* istanbul ignore if */
	      if (entry instanceof Literal) {
	        this.compileStack.push(entry);
	      } else {
	        var stack = this.incrStack();
	        this.pushSource([stack, ' = ', entry, ';']);
	        this.compileStack.push(stack);
	      }
	    }
	  },
	  isInline: function isInline() {
	    return this.inlineStack.length;
	  },

	  popStack: function popStack(wrapped) {
	    var inline = this.isInline(),
	        item = (inline ? this.inlineStack : this.compileStack).pop();

	    if (!wrapped && item instanceof Literal) {
	      return item.value;
	    } else {
	      if (!inline) {
	        /* istanbul ignore next */
	        if (!this.stackSlot) {
	          throw new _exception2['default']('Invalid stack pop');
	        }
	        this.stackSlot--;
	      }
	      return item;
	    }
	  },

	  topStack: function topStack() {
	    var stack = this.isInline() ? this.inlineStack : this.compileStack,
	        item = stack[stack.length - 1];

	    /* istanbul ignore if */
	    if (item instanceof Literal) {
	      return item.value;
	    } else {
	      return item;
	    }
	  },

	  contextName: function contextName(context) {
	    if (this.useDepths && context) {
	      return 'depths[' + context + ']';
	    } else {
	      return 'depth' + context;
	    }
	  },

	  quotedString: function quotedString(str) {
	    return this.source.quotedString(str);
	  },

	  objectLiteral: function objectLiteral(obj) {
	    return this.source.objectLiteral(obj);
	  },

	  aliasable: function aliasable(name) {
	    var ret = this.aliases[name];
	    if (ret) {
	      ret.referenceCount++;
	      return ret;
	    }

	    ret = this.aliases[name] = this.source.wrap(name);
	    ret.aliasable = true;
	    ret.referenceCount = 1;

	    return ret;
	  },

	  setupHelper: function setupHelper(paramSize, name, blockHelper) {
	    var params = [],
	        paramsInit = this.setupHelperArgs(name, paramSize, params, blockHelper);
	    var foundHelper = this.nameLookup('helpers', name, 'helper'),
	        callContext = this.aliasable(this.contextName(0) + ' != null ? ' + this.contextName(0) + ' : (container.nullContext || {})');

	    return {
	      params: params,
	      paramsInit: paramsInit,
	      name: foundHelper,
	      callParams: [callContext].concat(params)
	    };
	  },

	  setupParams: function setupParams(helper, paramSize, params) {
	    var options = {},
	        contexts = [],
	        types = [],
	        ids = [],
	        objectArgs = !params,
	        param = undefined;

	    if (objectArgs) {
	      params = [];
	    }

	    options.name = this.quotedString(helper);
	    options.hash = this.popStack();

	    if (this.trackIds) {
	      options.hashIds = this.popStack();
	    }
	    if (this.stringParams) {
	      options.hashTypes = this.popStack();
	      options.hashContexts = this.popStack();
	    }

	    var inverse = this.popStack(),
	        program = this.popStack();

	    // Avoid setting fn and inverse if neither are set. This allows
	    // helpers to do a check for `if (options.fn)`
	    if (program || inverse) {
	      options.fn = program || 'container.noop';
	      options.inverse = inverse || 'container.noop';
	    }

	    // The parameters go on to the stack in order (making sure that they are evaluated in order)
	    // so we need to pop them off the stack in reverse order
	    var i = paramSize;
	    while (i--) {
	      param = this.popStack();
	      params[i] = param;

	      if (this.trackIds) {
	        ids[i] = this.popStack();
	      }
	      if (this.stringParams) {
	        types[i] = this.popStack();
	        contexts[i] = this.popStack();
	      }
	    }

	    if (objectArgs) {
	      options.args = this.source.generateArray(params);
	    }

	    if (this.trackIds) {
	      options.ids = this.source.generateArray(ids);
	    }
	    if (this.stringParams) {
	      options.types = this.source.generateArray(types);
	      options.contexts = this.source.generateArray(contexts);
	    }

	    if (this.options.data) {
	      options.data = 'data';
	    }
	    if (this.useBlockParams) {
	      options.blockParams = 'blockParams';
	    }
	    return options;
	  },

	  setupHelperArgs: function setupHelperArgs(helper, paramSize, params, useRegister) {
	    var options = this.setupParams(helper, paramSize, params);
	    options = this.objectLiteral(options);
	    if (useRegister) {
	      this.useRegister('options');
	      params.push('options');
	      return ['options=', options];
	    } else if (params) {
	      params.push(options);
	      return '';
	    } else {
	      return options;
	    }
	  }
	};

	(function () {
	  var reservedWords = ('break else new var' + ' case finally return void' + ' catch for switch while' + ' continue function this with' + ' default if throw' + ' delete in try' + ' do instanceof typeof' + ' abstract enum int short' + ' boolean export interface static' + ' byte extends long super' + ' char final native synchronized' + ' class float package throws' + ' const goto private transient' + ' debugger implements protected volatile' + ' double import public let yield await' + ' null true false').split(' ');

	  var compilerWords = JavaScriptCompiler.RESERVED_WORDS = {};

	  for (var i = 0, l = reservedWords.length; i < l; i++) {
	    compilerWords[reservedWords[i]] = true;
	  }
	})();

	JavaScriptCompiler.isValidJavaScriptVariableName = function (name) {
	  return !JavaScriptCompiler.RESERVED_WORDS[name] && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(name);
	};

	function strictLookup(requireTerminal, compiler, parts, type) {
	  var stack = compiler.popStack(),
	      i = 0,
	      len = parts.length;
	  if (requireTerminal) {
	    len--;
	  }

	  for (; i < len; i++) {
	    stack = compiler.nameLookup(stack, parts[i], type);
	  }

	  if (requireTerminal) {
	    return [compiler.aliasable('container.strict'), '(', stack, ', ', compiler.quotedString(parts[i]), ')'];
	  } else {
	    return stack;
	  }
	}

	exports['default'] = JavaScriptCompiler;
	module.exports = exports['default'];

	});

	unwrapExports(javascriptCompiler);

	var handlebars = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }



	var _handlebarsRuntime2 = _interopRequireDefault(handlebars_runtime);

	// Compiler imports



	var _handlebarsCompilerAst2 = _interopRequireDefault(ast);







	var _handlebarsCompilerJavascriptCompiler2 = _interopRequireDefault(javascriptCompiler);



	var _handlebarsCompilerVisitor2 = _interopRequireDefault(visitor);



	var _handlebarsNoConflict2 = _interopRequireDefault(noConflict);

	var _create = _handlebarsRuntime2['default'].create;
	function create() {
	  var hb = _create();

	  hb.compile = function (input, options) {
	    return compiler.compile(input, options, hb);
	  };
	  hb.precompile = function (input, options) {
	    return compiler.precompile(input, options, hb);
	  };

	  hb.AST = _handlebarsCompilerAst2['default'];
	  hb.Compiler = compiler.Compiler;
	  hb.JavaScriptCompiler = _handlebarsCompilerJavascriptCompiler2['default'];
	  hb.Parser = base$2.parser;
	  hb.parse = base$2.parse;

	  return hb;
	}

	var inst = create();
	inst.create = create;

	_handlebarsNoConflict2['default'](inst);

	inst.Visitor = _handlebarsCompilerVisitor2['default'];

	inst['default'] = inst;

	exports['default'] = inst;
	module.exports = exports['default'];

	});

	unwrapExports(handlebars);

	var printer = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;
	exports.print = print;
	exports.PrintVisitor = PrintVisitor;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }



	var _visitor2 = _interopRequireDefault(visitor);

	function print(ast) {
	  return new PrintVisitor().accept(ast);
	}

	function PrintVisitor() {
	  this.padding = 0;
	}

	PrintVisitor.prototype = new _visitor2['default']();

	PrintVisitor.prototype.pad = function (string) {
	  var out = '';

	  for (var i = 0, l = this.padding; i < l; i++) {
	    out += '  ';
	  }

	  out += string + '\n';
	  return out;
	};

	PrintVisitor.prototype.Program = function (program) {
	  var out = '',
	      body = program.body,
	      i = undefined,
	      l = undefined;

	  if (program.blockParams) {
	    var blockParams = 'BLOCK PARAMS: [';
	    for (i = 0, l = program.blockParams.length; i < l; i++) {
	      blockParams += ' ' + program.blockParams[i];
	    }
	    blockParams += ' ]';
	    out += this.pad(blockParams);
	  }

	  for (i = 0, l = body.length; i < l; i++) {
	    out += this.accept(body[i]);
	  }

	  this.padding--;

	  return out;
	};

	PrintVisitor.prototype.MustacheStatement = function (mustache) {
	  return this.pad('{{ ' + this.SubExpression(mustache) + ' }}');
	};
	PrintVisitor.prototype.Decorator = function (mustache) {
	  return this.pad('{{ DIRECTIVE ' + this.SubExpression(mustache) + ' }}');
	};

	PrintVisitor.prototype.BlockStatement = PrintVisitor.prototype.DecoratorBlock = function (block) {
	  var out = '';

	  out += this.pad((block.type === 'DecoratorBlock' ? 'DIRECTIVE ' : '') + 'BLOCK:');
	  this.padding++;
	  out += this.pad(this.SubExpression(block));
	  if (block.program) {
	    out += this.pad('PROGRAM:');
	    this.padding++;
	    out += this.accept(block.program);
	    this.padding--;
	  }
	  if (block.inverse) {
	    if (block.program) {
	      this.padding++;
	    }
	    out += this.pad('{{^}}');
	    this.padding++;
	    out += this.accept(block.inverse);
	    this.padding--;
	    if (block.program) {
	      this.padding--;
	    }
	  }
	  this.padding--;

	  return out;
	};

	PrintVisitor.prototype.PartialStatement = function (partial) {
	  var content = 'PARTIAL:' + partial.name.original;
	  if (partial.params[0]) {
	    content += ' ' + this.accept(partial.params[0]);
	  }
	  if (partial.hash) {
	    content += ' ' + this.accept(partial.hash);
	  }
	  return this.pad('{{> ' + content + ' }}');
	};
	PrintVisitor.prototype.PartialBlockStatement = function (partial) {
	  var content = 'PARTIAL BLOCK:' + partial.name.original;
	  if (partial.params[0]) {
	    content += ' ' + this.accept(partial.params[0]);
	  }
	  if (partial.hash) {
	    content += ' ' + this.accept(partial.hash);
	  }

	  content += ' ' + this.pad('PROGRAM:');
	  this.padding++;
	  content += this.accept(partial.program);
	  this.padding--;

	  return this.pad('{{> ' + content + ' }}');
	};

	PrintVisitor.prototype.ContentStatement = function (content) {
	  return this.pad("CONTENT[ '" + content.value + "' ]");
	};

	PrintVisitor.prototype.CommentStatement = function (comment) {
	  return this.pad("{{! '" + comment.value + "' }}");
	};

	PrintVisitor.prototype.SubExpression = function (sexpr) {
	  var params = sexpr.params,
	      paramStrings = [],
	      hash = undefined;

	  for (var i = 0, l = params.length; i < l; i++) {
	    paramStrings.push(this.accept(params[i]));
	  }

	  params = '[' + paramStrings.join(', ') + ']';

	  hash = sexpr.hash ? ' ' + this.accept(sexpr.hash) : '';

	  return this.accept(sexpr.path) + ' ' + params + hash;
	};

	PrintVisitor.prototype.PathExpression = function (id) {
	  var path = id.parts.join('/');
	  return (id.data ? '@' : '') + 'PATH:' + path;
	};

	PrintVisitor.prototype.StringLiteral = function (string) {
	  return '"' + string.value + '"';
	};

	PrintVisitor.prototype.NumberLiteral = function (number) {
	  return 'NUMBER{' + number.value + '}';
	};

	PrintVisitor.prototype.BooleanLiteral = function (bool) {
	  return 'BOOLEAN{' + bool.value + '}';
	};

	PrintVisitor.prototype.UndefinedLiteral = function () {
	  return 'UNDEFINED';
	};

	PrintVisitor.prototype.NullLiteral = function () {
	  return 'NULL';
	};

	PrintVisitor.prototype.Hash = function (hash) {
	  var pairs = hash.pairs,
	      joinedPairs = [];

	  for (var i = 0, l = pairs.length; i < l; i++) {
	    joinedPairs.push(this.accept(pairs[i]));
	  }

	  return 'HASH{' + joinedPairs.join(', ') + '}';
	};
	PrintVisitor.prototype.HashPair = function (pair) {
	  return pair.key + '=' + this.accept(pair.value);
	};
	/* eslint-enable new-cap */

	});

	unwrapExports(printer);
	var printer_1 = printer.print;
	var printer_2 = printer.PrintVisitor;

	// USAGE:
	// var handlebars = require('handlebars');
	/* eslint-disable no-var */

	// var local = handlebars.create();

	var handlebars$2 = handlebars['default'];


	handlebars$2.PrintVisitor = printer.PrintVisitor;
	handlebars$2.print = printer.print;

	var lib = handlebars$2;

	// Publish a Node.js require() handler for .handlebars and .hbs files
	function extension(module, filename) {
	  var fs$$1 = fs;
	  var templateString = fs$$1.readFileSync(filename, 'utf8');
	  module.exports = handlebars$2.compile(templateString);
	}
	/* istanbul ignore else */
	if (typeof commonjsRequire !== 'undefined' && commonjsRequire.extensions) {
	  commonjsRequire.extensions['.handlebars'] = extension;
	  commonjsRequire.extensions['.hbs'] = extension;
	}

	function log$2(...data){
	  console.log(data);
	}

	function readFile(path){
	  return new Promise((res, rej) => {
	    fs.readFile(path, 'utf8', function (err, data) {
	      if (err) {
	        rej(err);
	        return;
	      }
	      res(data);
	    });
	  })
	}

	function writeToOutput(path, content, outputDir){
	  const outputPath = path.replace(/input/, outputDir );

	  // make sure all dirs exist before writing file
	  outputPath.split('/').reduce(function(prev, curr, i) {
	    if (fs.existsSync(prev) === false) {
	      fs.mkdirSync(prev);
	    }
	    return prev + '/' + curr;
	  });

	  return new Promise((res, rej) => {
	    fs.writeFile(outputPath, content, function(err) {
	      if(err) {
	        rej(err);
	        return;
	      }
	      res(true);
	    });
	  })
	}

	async function compileFile(path, config) {
	  const file = await readFile(path);
	  const template = lib.compile(file);
	  const result = template(config);
	  writeToOutput(path, result, config.output);

	}

	async function isDir(path){
	  return new Promise((res, rej) => {
	      fs.stat(path, async (err, stats) => {
	        if(err) {
	          rej(err);
	          return;
	        }
	        if(stats.isDirectory()){
	          res(true);
	          return;
	        }
	        res(false);
	      }); 
	  })
	}

	async function compileFilesInDir(path, config) {
	  return new Promise((res, rej) => {
	    fs.readdir(path, async (err, files) => {
	      const compilePromises = files.map(file => {
	        return new Promise(async (res, rej) => {
	          const filePath = `${path}/${file}`;
	          try {
	            const isDirectory = await isDir(filePath);
	            if (isDirectory){
	              await compileFilesInDir(filePath, config);
	              res();
	            }
	            else {
	              try{
	                await compileFile(filePath, config);
	                res();
	              }
	              catch(e){
	                rej(e);
	              }
	            }
	          }
	          catch(e){
	            rej(e);
	          }
	        })
	      });
	      await Promise.all(compilePromises);
	      res();
	    });
	  })
	}

	var async = createCommonjsModule(function (module) {
	/*!
	 * async
	 * https://github.com/caolan/async
	 *
	 * Copyright 2010-2014 Caolan McMahon
	 * Released under the MIT license
	 */
	/*jshint onevar: false, indent:4 */
	/*global setImmediate: false, setTimeout: false, console: false */
	(function () {

	    var async = {};

	    // global on the server, window in the browser
	    var root, previous_async;

	    root = this;
	    if (root != null) {
	      previous_async = root.async;
	    }

	    async.noConflict = function () {
	        root.async = previous_async;
	        return async;
	    };

	    function only_once(fn) {
	        var called = false;
	        return function() {
	            if (called) throw new Error("Callback was already called.");
	            called = true;
	            fn.apply(root, arguments);
	        }
	    }

	    //// cross-browser compatiblity functions ////

	    var _toString = Object.prototype.toString;

	    var _isArray = Array.isArray || function (obj) {
	        return _toString.call(obj) === '[object Array]';
	    };

	    var _each = function (arr, iterator) {
	        for (var i = 0; i < arr.length; i += 1) {
	            iterator(arr[i], i, arr);
	        }
	    };

	    var _map = function (arr, iterator) {
	        if (arr.map) {
	            return arr.map(iterator);
	        }
	        var results = [];
	        _each(arr, function (x, i, a) {
	            results.push(iterator(x, i, a));
	        });
	        return results;
	    };

	    var _reduce = function (arr, iterator, memo) {
	        if (arr.reduce) {
	            return arr.reduce(iterator, memo);
	        }
	        _each(arr, function (x, i, a) {
	            memo = iterator(memo, x, i, a);
	        });
	        return memo;
	    };

	    var _keys = function (obj) {
	        if (Object.keys) {
	            return Object.keys(obj);
	        }
	        var keys = [];
	        for (var k in obj) {
	            if (obj.hasOwnProperty(k)) {
	                keys.push(k);
	            }
	        }
	        return keys;
	    };

	    //// exported async module functions ////

	    //// nextTick implementation with browser-compatible fallback ////
	    if (typeof process === 'undefined' || !(process.nextTick)) {
	        if (typeof setImmediate === 'function') {
	            async.nextTick = function (fn) {
	                // not a direct alias for IE10 compatibility
	                setImmediate(fn);
	            };
	            async.setImmediate = async.nextTick;
	        }
	        else {
	            async.nextTick = function (fn) {
	                setTimeout(fn, 0);
	            };
	            async.setImmediate = async.nextTick;
	        }
	    }
	    else {
	        async.nextTick = process.nextTick;
	        if (typeof setImmediate !== 'undefined') {
	            async.setImmediate = function (fn) {
	              // not a direct alias for IE10 compatibility
	              setImmediate(fn);
	            };
	        }
	        else {
	            async.setImmediate = async.nextTick;
	        }
	    }

	    async.each = function (arr, iterator, callback) {
	        callback = callback || function () {};
	        if (!arr.length) {
	            return callback();
	        }
	        var completed = 0;
	        _each(arr, function (x) {
	            iterator(x, only_once(done) );
	        });
	        function done(err) {
	          if (err) {
	              callback(err);
	              callback = function () {};
	          }
	          else {
	              completed += 1;
	              if (completed >= arr.length) {
	                  callback();
	              }
	          }
	        }
	    };
	    async.forEach = async.each;

	    async.eachSeries = function (arr, iterator, callback) {
	        callback = callback || function () {};
	        if (!arr.length) {
	            return callback();
	        }
	        var completed = 0;
	        var iterate = function () {
	            iterator(arr[completed], function (err) {
	                if (err) {
	                    callback(err);
	                    callback = function () {};
	                }
	                else {
	                    completed += 1;
	                    if (completed >= arr.length) {
	                        callback();
	                    }
	                    else {
	                        iterate();
	                    }
	                }
	            });
	        };
	        iterate();
	    };
	    async.forEachSeries = async.eachSeries;

	    async.eachLimit = function (arr, limit, iterator, callback) {
	        var fn = _eachLimit(limit);
	        fn.apply(null, [arr, iterator, callback]);
	    };
	    async.forEachLimit = async.eachLimit;

	    var _eachLimit = function (limit) {

	        return function (arr, iterator, callback) {
	            callback = callback || function () {};
	            if (!arr.length || limit <= 0) {
	                return callback();
	            }
	            var completed = 0;
	            var started = 0;
	            var running = 0;

	            (function replenish () {
	                if (completed >= arr.length) {
	                    return callback();
	                }

	                while (running < limit && started < arr.length) {
	                    started += 1;
	                    running += 1;
	                    iterator(arr[started - 1], function (err) {
	                        if (err) {
	                            callback(err);
	                            callback = function () {};
	                        }
	                        else {
	                            completed += 1;
	                            running -= 1;
	                            if (completed >= arr.length) {
	                                callback();
	                            }
	                            else {
	                                replenish();
	                            }
	                        }
	                    });
	                }
	            })();
	        };
	    };


	    var doParallel = function (fn) {
	        return function () {
	            var args = Array.prototype.slice.call(arguments);
	            return fn.apply(null, [async.each].concat(args));
	        };
	    };
	    var doParallelLimit = function(limit, fn) {
	        return function () {
	            var args = Array.prototype.slice.call(arguments);
	            return fn.apply(null, [_eachLimit(limit)].concat(args));
	        };
	    };
	    var doSeries = function (fn) {
	        return function () {
	            var args = Array.prototype.slice.call(arguments);
	            return fn.apply(null, [async.eachSeries].concat(args));
	        };
	    };


	    var _asyncMap = function (eachfn, arr, iterator, callback) {
	        arr = _map(arr, function (x, i) {
	            return {index: i, value: x};
	        });
	        if (!callback) {
	            eachfn(arr, function (x, callback) {
	                iterator(x.value, function (err) {
	                    callback(err);
	                });
	            });
	        } else {
	            var results = [];
	            eachfn(arr, function (x, callback) {
	                iterator(x.value, function (err, v) {
	                    results[x.index] = v;
	                    callback(err);
	                });
	            }, function (err) {
	                callback(err, results);
	            });
	        }
	    };
	    async.map = doParallel(_asyncMap);
	    async.mapSeries = doSeries(_asyncMap);
	    async.mapLimit = function (arr, limit, iterator, callback) {
	        return _mapLimit(limit)(arr, iterator, callback);
	    };

	    var _mapLimit = function(limit) {
	        return doParallelLimit(limit, _asyncMap);
	    };

	    // reduce only has a series version, as doing reduce in parallel won't
	    // work in many situations.
	    async.reduce = function (arr, memo, iterator, callback) {
	        async.eachSeries(arr, function (x, callback) {
	            iterator(memo, x, function (err, v) {
	                memo = v;
	                callback(err);
	            });
	        }, function (err) {
	            callback(err, memo);
	        });
	    };
	    // inject alias
	    async.inject = async.reduce;
	    // foldl alias
	    async.foldl = async.reduce;

	    async.reduceRight = function (arr, memo, iterator, callback) {
	        var reversed = _map(arr, function (x) {
	            return x;
	        }).reverse();
	        async.reduce(reversed, memo, iterator, callback);
	    };
	    // foldr alias
	    async.foldr = async.reduceRight;

	    var _filter = function (eachfn, arr, iterator, callback) {
	        var results = [];
	        arr = _map(arr, function (x, i) {
	            return {index: i, value: x};
	        });
	        eachfn(arr, function (x, callback) {
	            iterator(x.value, function (v) {
	                if (v) {
	                    results.push(x);
	                }
	                callback();
	            });
	        }, function (err) {
	            callback(_map(results.sort(function (a, b) {
	                return a.index - b.index;
	            }), function (x) {
	                return x.value;
	            }));
	        });
	    };
	    async.filter = doParallel(_filter);
	    async.filterSeries = doSeries(_filter);
	    // select alias
	    async.select = async.filter;
	    async.selectSeries = async.filterSeries;

	    var _reject = function (eachfn, arr, iterator, callback) {
	        var results = [];
	        arr = _map(arr, function (x, i) {
	            return {index: i, value: x};
	        });
	        eachfn(arr, function (x, callback) {
	            iterator(x.value, function (v) {
	                if (!v) {
	                    results.push(x);
	                }
	                callback();
	            });
	        }, function (err) {
	            callback(_map(results.sort(function (a, b) {
	                return a.index - b.index;
	            }), function (x) {
	                return x.value;
	            }));
	        });
	    };
	    async.reject = doParallel(_reject);
	    async.rejectSeries = doSeries(_reject);

	    var _detect = function (eachfn, arr, iterator, main_callback) {
	        eachfn(arr, function (x, callback) {
	            iterator(x, function (result) {
	                if (result) {
	                    main_callback(x);
	                    main_callback = function () {};
	                }
	                else {
	                    callback();
	                }
	            });
	        }, function (err) {
	            main_callback();
	        });
	    };
	    async.detect = doParallel(_detect);
	    async.detectSeries = doSeries(_detect);

	    async.some = function (arr, iterator, main_callback) {
	        async.each(arr, function (x, callback) {
	            iterator(x, function (v) {
	                if (v) {
	                    main_callback(true);
	                    main_callback = function () {};
	                }
	                callback();
	            });
	        }, function (err) {
	            main_callback(false);
	        });
	    };
	    // any alias
	    async.any = async.some;

	    async.every = function (arr, iterator, main_callback) {
	        async.each(arr, function (x, callback) {
	            iterator(x, function (v) {
	                if (!v) {
	                    main_callback(false);
	                    main_callback = function () {};
	                }
	                callback();
	            });
	        }, function (err) {
	            main_callback(true);
	        });
	    };
	    // all alias
	    async.all = async.every;

	    async.sortBy = function (arr, iterator, callback) {
	        async.map(arr, function (x, callback) {
	            iterator(x, function (err, criteria) {
	                if (err) {
	                    callback(err);
	                }
	                else {
	                    callback(null, {value: x, criteria: criteria});
	                }
	            });
	        }, function (err, results) {
	            if (err) {
	                return callback(err);
	            }
	            else {
	                var fn = function (left, right) {
	                    var a = left.criteria, b = right.criteria;
	                    return a < b ? -1 : a > b ? 1 : 0;
	                };
	                callback(null, _map(results.sort(fn), function (x) {
	                    return x.value;
	                }));
	            }
	        });
	    };

	    async.auto = function (tasks, callback) {
	        callback = callback || function () {};
	        var keys = _keys(tasks);
	        var remainingTasks = keys.length;
	        if (!remainingTasks) {
	            return callback();
	        }

	        var results = {};

	        var listeners = [];
	        var addListener = function (fn) {
	            listeners.unshift(fn);
	        };
	        var removeListener = function (fn) {
	            for (var i = 0; i < listeners.length; i += 1) {
	                if (listeners[i] === fn) {
	                    listeners.splice(i, 1);
	                    return;
	                }
	            }
	        };
	        var taskComplete = function () {
	            remainingTasks--;
	            _each(listeners.slice(0), function (fn) {
	                fn();
	            });
	        };

	        addListener(function () {
	            if (!remainingTasks) {
	                var theCallback = callback;
	                // prevent final callback from calling itself if it errors
	                callback = function () {};

	                theCallback(null, results);
	            }
	        });

	        _each(keys, function (k) {
	            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
	            var taskCallback = function (err) {
	                var args = Array.prototype.slice.call(arguments, 1);
	                if (args.length <= 1) {
	                    args = args[0];
	                }
	                if (err) {
	                    var safeResults = {};
	                    _each(_keys(results), function(rkey) {
	                        safeResults[rkey] = results[rkey];
	                    });
	                    safeResults[k] = args;
	                    callback(err, safeResults);
	                    // stop subsequent errors hitting callback multiple times
	                    callback = function () {};
	                }
	                else {
	                    results[k] = args;
	                    async.setImmediate(taskComplete);
	                }
	            };
	            var requires = task.slice(0, Math.abs(task.length - 1)) || [];
	            var ready = function () {
	                return _reduce(requires, function (a, x) {
	                    return (a && results.hasOwnProperty(x));
	                }, true) && !results.hasOwnProperty(k);
	            };
	            if (ready()) {
	                task[task.length - 1](taskCallback, results);
	            }
	            else {
	                var listener = function () {
	                    if (ready()) {
	                        removeListener(listener);
	                        task[task.length - 1](taskCallback, results);
	                    }
	                };
	                addListener(listener);
	            }
	        });
	    };

	    async.retry = function(times, task, callback) {
	        var DEFAULT_TIMES = 5;
	        var attempts = [];
	        // Use defaults if times not passed
	        if (typeof times === 'function') {
	            callback = task;
	            task = times;
	            times = DEFAULT_TIMES;
	        }
	        // Make sure times is a number
	        times = parseInt(times, 10) || DEFAULT_TIMES;
	        var wrappedTask = function(wrappedCallback, wrappedResults) {
	            var retryAttempt = function(task, finalAttempt) {
	                return function(seriesCallback) {
	                    task(function(err, result){
	                        seriesCallback(!err || finalAttempt, {err: err, result: result});
	                    }, wrappedResults);
	                };
	            };
	            while (times) {
	                attempts.push(retryAttempt(task, !(times-=1)));
	            }
	            async.series(attempts, function(done, data){
	                data = data[data.length - 1];
	                (wrappedCallback || callback)(data.err, data.result);
	            });
	        };
	        // If a callback is passed, run this as a controll flow
	        return callback ? wrappedTask() : wrappedTask
	    };

	    async.waterfall = function (tasks, callback) {
	        callback = callback || function () {};
	        if (!_isArray(tasks)) {
	          var err = new Error('First argument to waterfall must be an array of functions');
	          return callback(err);
	        }
	        if (!tasks.length) {
	            return callback();
	        }
	        var wrapIterator = function (iterator) {
	            return function (err) {
	                if (err) {
	                    callback.apply(null, arguments);
	                    callback = function () {};
	                }
	                else {
	                    var args = Array.prototype.slice.call(arguments, 1);
	                    var next = iterator.next();
	                    if (next) {
	                        args.push(wrapIterator(next));
	                    }
	                    else {
	                        args.push(callback);
	                    }
	                    async.setImmediate(function () {
	                        iterator.apply(null, args);
	                    });
	                }
	            };
	        };
	        wrapIterator(async.iterator(tasks))();
	    };

	    var _parallel = function(eachfn, tasks, callback) {
	        callback = callback || function () {};
	        if (_isArray(tasks)) {
	            eachfn.map(tasks, function (fn, callback) {
	                if (fn) {
	                    fn(function (err) {
	                        var args = Array.prototype.slice.call(arguments, 1);
	                        if (args.length <= 1) {
	                            args = args[0];
	                        }
	                        callback.call(null, err, args);
	                    });
	                }
	            }, callback);
	        }
	        else {
	            var results = {};
	            eachfn.each(_keys(tasks), function (k, callback) {
	                tasks[k](function (err) {
	                    var args = Array.prototype.slice.call(arguments, 1);
	                    if (args.length <= 1) {
	                        args = args[0];
	                    }
	                    results[k] = args;
	                    callback(err);
	                });
	            }, function (err) {
	                callback(err, results);
	            });
	        }
	    };

	    async.parallel = function (tasks, callback) {
	        _parallel({ map: async.map, each: async.each }, tasks, callback);
	    };

	    async.parallelLimit = function(tasks, limit, callback) {
	        _parallel({ map: _mapLimit(limit), each: _eachLimit(limit) }, tasks, callback);
	    };

	    async.series = function (tasks, callback) {
	        callback = callback || function () {};
	        if (_isArray(tasks)) {
	            async.mapSeries(tasks, function (fn, callback) {
	                if (fn) {
	                    fn(function (err) {
	                        var args = Array.prototype.slice.call(arguments, 1);
	                        if (args.length <= 1) {
	                            args = args[0];
	                        }
	                        callback.call(null, err, args);
	                    });
	                }
	            }, callback);
	        }
	        else {
	            var results = {};
	            async.eachSeries(_keys(tasks), function (k, callback) {
	                tasks[k](function (err) {
	                    var args = Array.prototype.slice.call(arguments, 1);
	                    if (args.length <= 1) {
	                        args = args[0];
	                    }
	                    results[k] = args;
	                    callback(err);
	                });
	            }, function (err) {
	                callback(err, results);
	            });
	        }
	    };

	    async.iterator = function (tasks) {
	        var makeCallback = function (index) {
	            var fn = function () {
	                if (tasks.length) {
	                    tasks[index].apply(null, arguments);
	                }
	                return fn.next();
	            };
	            fn.next = function () {
	                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
	            };
	            return fn;
	        };
	        return makeCallback(0);
	    };

	    async.apply = function (fn) {
	        var args = Array.prototype.slice.call(arguments, 1);
	        return function () {
	            return fn.apply(
	                null, args.concat(Array.prototype.slice.call(arguments))
	            );
	        };
	    };

	    var _concat = function (eachfn, arr, fn, callback) {
	        var r = [];
	        eachfn(arr, function (x, cb) {
	            fn(x, function (err, y) {
	                r = r.concat(y || []);
	                cb(err);
	            });
	        }, function (err) {
	            callback(err, r);
	        });
	    };
	    async.concat = doParallel(_concat);
	    async.concatSeries = doSeries(_concat);

	    async.whilst = function (test, iterator, callback) {
	        if (test()) {
	            iterator(function (err) {
	                if (err) {
	                    return callback(err);
	                }
	                async.whilst(test, iterator, callback);
	            });
	        }
	        else {
	            callback();
	        }
	    };

	    async.doWhilst = function (iterator, test, callback) {
	        iterator(function (err) {
	            if (err) {
	                return callback(err);
	            }
	            var args = Array.prototype.slice.call(arguments, 1);
	            if (test.apply(null, args)) {
	                async.doWhilst(iterator, test, callback);
	            }
	            else {
	                callback();
	            }
	        });
	    };

	    async.until = function (test, iterator, callback) {
	        if (!test()) {
	            iterator(function (err) {
	                if (err) {
	                    return callback(err);
	                }
	                async.until(test, iterator, callback);
	            });
	        }
	        else {
	            callback();
	        }
	    };

	    async.doUntil = function (iterator, test, callback) {
	        iterator(function (err) {
	            if (err) {
	                return callback(err);
	            }
	            var args = Array.prototype.slice.call(arguments, 1);
	            if (!test.apply(null, args)) {
	                async.doUntil(iterator, test, callback);
	            }
	            else {
	                callback();
	            }
	        });
	    };

	    async.queue = function (worker, concurrency) {
	        if (concurrency === undefined) {
	            concurrency = 1;
	        }
	        function _insert(q, data, pos, callback) {
	          if (!q.started){
	            q.started = true;
	          }
	          if (!_isArray(data)) {
	              data = [data];
	          }
	          if(data.length == 0) {
	             // call drain immediately if there are no tasks
	             return async.setImmediate(function() {
	                 if (q.drain) {
	                     q.drain();
	                 }
	             });
	          }
	          _each(data, function(task) {
	              var item = {
	                  data: task,
	                  callback: typeof callback === 'function' ? callback : null
	              };

	              if (pos) {
	                q.tasks.unshift(item);
	              } else {
	                q.tasks.push(item);
	              }

	              if (q.saturated && q.tasks.length === q.concurrency) {
	                  q.saturated();
	              }
	              async.setImmediate(q.process);
	          });
	        }

	        var workers = 0;
	        var q = {
	            tasks: [],
	            concurrency: concurrency,
	            saturated: null,
	            empty: null,
	            drain: null,
	            started: false,
	            paused: false,
	            push: function (data, callback) {
	              _insert(q, data, false, callback);
	            },
	            kill: function () {
	              q.drain = null;
	              q.tasks = [];
	            },
	            unshift: function (data, callback) {
	              _insert(q, data, true, callback);
	            },
	            process: function () {
	                if (!q.paused && workers < q.concurrency && q.tasks.length) {
	                    var task = q.tasks.shift();
	                    if (q.empty && q.tasks.length === 0) {
	                        q.empty();
	                    }
	                    workers += 1;
	                    var next = function () {
	                        workers -= 1;
	                        if (task.callback) {
	                            task.callback.apply(task, arguments);
	                        }
	                        if (q.drain && q.tasks.length + workers === 0) {
	                            q.drain();
	                        }
	                        q.process();
	                    };
	                    var cb = only_once(next);
	                    worker(task.data, cb);
	                }
	            },
	            length: function () {
	                return q.tasks.length;
	            },
	            running: function () {
	                return workers;
	            },
	            idle: function() {
	                return q.tasks.length + workers === 0;
	            },
	            pause: function () {
	                if (q.paused === true) { return; }
	                q.paused = true;
	            },
	            resume: function () {
	                if (q.paused === false) { return; }
	                q.paused = false;
	                // Need to call q.process once per concurrent
	                // worker to preserve full concurrency after pause
	                for (var w = 1; w <= q.concurrency; w++) {
	                    async.setImmediate(q.process);
	                }
	            }
	        };
	        return q;
	    };

	    async.priorityQueue = function (worker, concurrency) {

	        function _compareTasks(a, b){
	          return a.priority - b.priority;
	        }
	        function _binarySearch(sequence, item, compare) {
	          var beg = -1,
	              end = sequence.length - 1;
	          while (beg < end) {
	            var mid = beg + ((end - beg + 1) >>> 1);
	            if (compare(item, sequence[mid]) >= 0) {
	              beg = mid;
	            } else {
	              end = mid - 1;
	            }
	          }
	          return beg;
	        }

	        function _insert(q, data, priority, callback) {
	          if (!q.started){
	            q.started = true;
	          }
	          if (!_isArray(data)) {
	              data = [data];
	          }
	          if(data.length == 0) {
	             // call drain immediately if there are no tasks
	             return async.setImmediate(function() {
	                 if (q.drain) {
	                     q.drain();
	                 }
	             });
	          }
	          _each(data, function(task) {
	              var item = {
	                  data: task,
	                  priority: priority,
	                  callback: typeof callback === 'function' ? callback : null
	              };

	              q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

	              if (q.saturated && q.tasks.length === q.concurrency) {
	                  q.saturated();
	              }
	              async.setImmediate(q.process);
	          });
	        }

	        // Start with a normal queue
	        var q = async.queue(worker, concurrency);

	        // Override push to accept second parameter representing priority
	        q.push = function (data, priority, callback) {
	          _insert(q, data, priority, callback);
	        };

	        // Remove unshift function
	        delete q.unshift;

	        return q;
	    };

	    async.cargo = function (worker, payload) {
	        var working     = false,
	            tasks       = [];

	        var cargo = {
	            tasks: tasks,
	            payload: payload,
	            saturated: null,
	            empty: null,
	            drain: null,
	            drained: true,
	            push: function (data, callback) {
	                if (!_isArray(data)) {
	                    data = [data];
	                }
	                _each(data, function(task) {
	                    tasks.push({
	                        data: task,
	                        callback: typeof callback === 'function' ? callback : null
	                    });
	                    cargo.drained = false;
	                    if (cargo.saturated && tasks.length === payload) {
	                        cargo.saturated();
	                    }
	                });
	                async.setImmediate(cargo.process);
	            },
	            process: function process() {
	                if (working) return;
	                if (tasks.length === 0) {
	                    if(cargo.drain && !cargo.drained) cargo.drain();
	                    cargo.drained = true;
	                    return;
	                }

	                var ts = typeof payload === 'number'
	                            ? tasks.splice(0, payload)
	                            : tasks.splice(0, tasks.length);

	                var ds = _map(ts, function (task) {
	                    return task.data;
	                });

	                if(cargo.empty) cargo.empty();
	                working = true;
	                worker(ds, function () {
	                    working = false;

	                    var args = arguments;
	                    _each(ts, function (data) {
	                        if (data.callback) {
	                            data.callback.apply(null, args);
	                        }
	                    });

	                    process();
	                });
	            },
	            length: function () {
	                return tasks.length;
	            },
	            running: function () {
	                return working;
	            }
	        };
	        return cargo;
	    };

	    var _console_fn = function (name) {
	        return function (fn) {
	            var args = Array.prototype.slice.call(arguments, 1);
	            fn.apply(null, args.concat([function (err) {
	                var args = Array.prototype.slice.call(arguments, 1);
	                if (typeof console !== 'undefined') {
	                    if (err) {
	                        if (console.error) {
	                            console.error(err);
	                        }
	                    }
	                    else if (console[name]) {
	                        _each(args, function (x) {
	                            console[name](x);
	                        });
	                    }
	                }
	            }]));
	        };
	    };
	    async.log = _console_fn('log');
	    async.dir = _console_fn('dir');
	    /*async.info = _console_fn('info');
	    async.warn = _console_fn('warn');
	    async.error = _console_fn('error');*/

	    async.memoize = function (fn, hasher) {
	        var memo = {};
	        var queues = {};
	        hasher = hasher || function (x) {
	            return x;
	        };
	        var memoized = function () {
	            var args = Array.prototype.slice.call(arguments);
	            var callback = args.pop();
	            var key = hasher.apply(null, args);
	            if (key in memo) {
	                async.nextTick(function () {
	                    callback.apply(null, memo[key]);
	                });
	            }
	            else if (key in queues) {
	                queues[key].push(callback);
	            }
	            else {
	                queues[key] = [callback];
	                fn.apply(null, args.concat([function () {
	                    memo[key] = arguments;
	                    var q = queues[key];
	                    delete queues[key];
	                    for (var i = 0, l = q.length; i < l; i++) {
	                      q[i].apply(null, arguments);
	                    }
	                }]));
	            }
	        };
	        memoized.memo = memo;
	        memoized.unmemoized = fn;
	        return memoized;
	    };

	    async.unmemoize = function (fn) {
	      return function () {
	        return (fn.unmemoized || fn).apply(null, arguments);
	      };
	    };

	    async.times = function (count, iterator, callback) {
	        var counter = [];
	        for (var i = 0; i < count; i++) {
	            counter.push(i);
	        }
	        return async.map(counter, iterator, callback);
	    };

	    async.timesSeries = function (count, iterator, callback) {
	        var counter = [];
	        for (var i = 0; i < count; i++) {
	            counter.push(i);
	        }
	        return async.mapSeries(counter, iterator, callback);
	    };

	    async.seq = function (/* functions... */) {
	        var fns = arguments;
	        return function () {
	            var that = this;
	            var args = Array.prototype.slice.call(arguments);
	            var callback = args.pop();
	            async.reduce(fns, args, function (newargs, fn, cb) {
	                fn.apply(that, newargs.concat([function () {
	                    var err = arguments[0];
	                    var nextargs = Array.prototype.slice.call(arguments, 1);
	                    cb(err, nextargs);
	                }]));
	            },
	            function (err, results) {
	                callback.apply(that, [err].concat(results));
	            });
	        };
	    };

	    async.compose = function (/* functions... */) {
	      return async.seq.apply(null, Array.prototype.reverse.call(arguments));
	    };

	    var _applyEach = function (eachfn, fns /*args...*/) {
	        var go = function () {
	            var that = this;
	            var args = Array.prototype.slice.call(arguments);
	            var callback = args.pop();
	            return eachfn(fns, function (fn, cb) {
	                fn.apply(that, args.concat([cb]));
	            },
	            callback);
	        };
	        if (arguments.length > 2) {
	            var args = Array.prototype.slice.call(arguments, 2);
	            return go.apply(this, args);
	        }
	        else {
	            return go;
	        }
	    };
	    async.applyEach = doParallel(_applyEach);
	    async.applyEachSeries = doSeries(_applyEach);

	    async.forever = function (fn, callback) {
	        function next(err) {
	            if (err) {
	                if (callback) {
	                    return callback(err);
	                }
	                throw err;
	            }
	            fn(next);
	        }
	        next();
	    };

	    // Node.js
	    if (module.exports) {
	        module.exports = async;
	    }
	    // AMD / RequireJS
	    else {
	        root.async = async;
	    }

	}());
	});

	var util$2 = createCommonjsModule(function (module) {
	// Some utility functions in js

	var u = module.exports = {
	  array: {
	    // Returns a copy of the array with the value removed once
	    //
	    //     [1, 2, 3, 1].del 1 #=> [2, 3, 1]
	    //     [1, 2, 3].del 4    #=> [1, 2, 3]
	    del: function (arr, val) {
	      var index = arr.indexOf(val);

	      if (index != -1) {
	        if (index == 0) {
	         return arr.slice(1)
	        } else {
	          return arr.slice(0, index).concat(arr.slice(index+1));
	        }
	      } else {
	        return arr;
	      }
	    },

	    // Returns the first element of the array
	    //
	    //     [1, 2, 3].first() #=> 1
	    first: function(arr) {
	      return arr[0];
	    },

	    // Returns the last element of the array
	    //
	    //     [1, 2, 3].last()  #=> 3
	    last: function(arr) {
	      return arr[arr.length-1];
	    }
	  },
	  string: {
	    // Returns a copy of str with all occurrences of pattern replaced with either replacement or the return value of a function.
	    // The pattern will typically be a Regexp; if it is a String then no regular expression metacharacters will be interpreted
	    // (that is /\d/ will match a digit, but ‘\d’ will match a backslash followed by a ‘d’).
	    //
	    // In the function form, the current match object is passed in as a parameter to the function, and variables such as
	    // $[1], $[2], $[3] (where $ is the match object) will be set appropriately. The value returned by the function will be
	    // substituted for the match on each call.
	    //
	    // The result inherits any tainting in the original string or any supplied replacement string.
	    //
	    //     "hello".gsub /[aeiou]/, '*'      #=> "h*ll*"
	    //     "hello".gsub /[aeiou]/, '<$1>'   #=> "h<e>ll<o>"
	    //     "hello".gsub /[aeiou]/, ($) {
	    //       "<#{$[1]}>"                    #=> "h<e>ll<o>"
	    //
	    gsub: function (str, pattern, replacement) {
	      var i, match, matchCmpr, matchCmprPrev, replacementStr, result, self;
	      if (!((pattern != null) && (replacement != null))) return u.string.value(str);
	      result = '';
	      self = str;
	      while (self.length > 0) {
	        if ((match = self.match(pattern))) {
	          result += self.slice(0, match.index);
	          if (typeof replacement === 'function') {
	            match[1] = match[1] || match[0];
	            result += replacement(match);
	          } else if (replacement.match(/\$[1-9]/)) {
	            matchCmprPrev = match;
	            matchCmpr = u.array.del(match, void 0);
	            while (matchCmpr !== matchCmprPrev) {
	              matchCmprPrev = matchCmpr;
	              matchCmpr = u.array.del(matchCmpr, void 0);
	            }
	            match[1] = match[1] || match[0];
	            replacementStr = replacement;
	            for (i = 1; i <= 9; i++) {
	              if (matchCmpr[i]) {
	                replacementStr = u.string.gsub(replacementStr, new RegExp("\\\$" + i), matchCmpr[i]);
	              }
	            }
	            result += replacementStr;
	          } else {
	            result += replacement;
	          }
	          self = self.slice(match.index + match[0].length);
	        } else {
	          result += self;
	          self = '';
	        }
	      }
	      return result;
	    },

	    // Returns a copy of the String with the first letter being upper case
	    //
	    //     "hello".upcase #=> "Hello"
	    upcase: function(str) {
	      var self = u.string.gsub(str, /_([a-z])/, function ($) {
	        return "_" + $[1].toUpperCase();
	      });

	      self = u.string.gsub(self, /\/([a-z])/, function ($) {
	        return "/" + $[1].toUpperCase();
	      });

	      return self[0].toUpperCase() + self.substr(1);
	    },

	    // Returns a copy of capitalized string
	    //
	    //     "employee salary" #=> "Employee Salary"
	    capitalize: function (str, spaces) {
	      if (!str.length) {
	        return str;
	      }

	      var self = str.toLowerCase();

	      if (!spaces) {
	        self = u.string.gsub(self, /\s([a-z])/, function ($) {
	          return " " + $[1].toUpperCase();
	        });
	      }

	      return self[0].toUpperCase() + self.substr(1);
	    },

	    // Returns a copy of the String with the first letter being lower case
	    //
	    //     "HELLO".downcase #=> "hELLO"
	    downcase: function(str) {
	      var self = u.string.gsub(str, /_([A-Z])/, function ($) {
	        return "_" + $[1].toLowerCase();
	      });

	      self = u.string.gsub(self, /\/([A-Z])/, function ($) {
	        return "/" + $[1].toLowerCase();
	      });

	      return self[0].toLowerCase() + self.substr(1);
	    },

	    // Returns a string value for the String object
	    //
	    //     "hello".value() #=> "hello"
	    value: function (str) {
	      return str.substr(0);
	    }
	  }
	};
	});
	var util_1$1 = util$2.array;
	var util_2$1 = util$2.string;

	// Default inflections
	var defaults = function (inflect) {

	  inflect.plural(/$/, 's');
	  inflect.plural(/s$/i, 's');
	  inflect.plural(/(ax|test)is$/i, '$1es');
	  inflect.plural(/(octop|vir)us$/i, '$1i');
	  inflect.plural(/(octop|vir)i$/i, '$1i');
	  inflect.plural(/(alias|status)$/i, '$1es');
	  inflect.plural(/(bu)s$/i, '$1ses');
	  inflect.plural(/(buffal|tomat)o$/i, '$1oes');
	  inflect.plural(/([ti])um$/i, '$1a');
	  inflect.plural(/([ti])a$/i, '$1a');
	  inflect.plural(/sis$/i, 'ses');
	  inflect.plural(/(?:([^fa])fe|(?:(oa)f)|([lr])f)$/i, '$1ves');
	  inflect.plural(/(hive)$/i, '$1s');
	  inflect.plural(/([^aeiouy]|qu)y$/i, '$1ies');
	  inflect.plural(/(x|ch|ss|sh)$/i, '$1es');
	  inflect.plural(/(matr|vert|ind)(?:ix|ex)$/i, '$1ices');
	  inflect.plural(/([m|l])ouse$/i, '$1ice');
	  inflect.plural(/([m|l])ice$/i, '$1ice');
	  inflect.plural(/^(ox)$/i, '$1en');
	  inflect.plural(/^(oxen)$/i, '$1');
	  inflect.plural(/(quiz)$/i, '$1zes');

	  inflect.singular(/s$/i, '');
	  inflect.singular(/(n)ews$/i, '$1ews');
	  inflect.singular(/([ti])a$/i, '$1um');
	  inflect.singular(/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/i, '$1sis');
	  inflect.singular(/(^analy)ses$/i, '$1sis');
	  inflect.singular(/([^f])ves$/i, '$1fe');
	  inflect.singular(/(hive)s$/i, '$1');
	  inflect.singular(/(tive)s$/i, '$1');
	  inflect.singular(/(oave)s$/i, 'oaf');
	  inflect.singular(/([lr])ves$/i, '$1f');
	  inflect.singular(/([^aeiouy]|qu)ies$/i, '$1y');
	  inflect.singular(/(s)eries$/i, '$1eries');
	  inflect.singular(/(m)ovies$/i, '$1ovie');
	  inflect.singular(/(x|ch|ss|sh)es$/i, '$1');
	  inflect.singular(/([m|l])ice$/i, '$1ouse');
	  inflect.singular(/(bus)es$/i, '$1');
	  inflect.singular(/(o)es$/i, '$1');
	  inflect.singular(/(shoe)s$/i, '$1');
	  inflect.singular(/(cris|ax|test)es$/i, '$1is');
	  inflect.singular(/(octop|vir)i$/i, '$1us');
	  inflect.singular(/(alias|status)es$/i, '$1');
	  inflect.singular(/^(ox)en/i, '$1');
	  inflect.singular(/(vert|ind)ices$/i, '$1ex');
	  inflect.singular(/(matr)ices$/i, '$1ix');
	  inflect.singular(/(quiz)zes$/i, '$1');
	  inflect.singular(/(database)s$/i, '$1');

	  inflect.irregular('child', 'children');
	  inflect.irregular('person', 'people');
	  inflect.irregular('man', 'men');
	  inflect.irregular('child', 'children');
	  inflect.irregular('sex', 'sexes');
	  inflect.irregular('move', 'moves');
	  inflect.irregular('cow', 'kine');
	  inflect.irregular('zombie', 'zombies');
	  inflect.irregular('oaf', 'oafs', true);
	  inflect.irregular('jefe', 'jefes');
	  inflect.irregular('save', 'saves');
	  inflect.irregular('safe', 'safes');
	  inflect.irregular('fife', 'fifes');

	  inflect.uncountable(['equipment', 'information', 'rice', 'money', 'species', 'series', 'fish', 'sheep', 'jeans', 'sushi']);
	};

	// A singleton instance of this class is yielded by Inflector.inflections, which can then be used to specify additional
	// inflection rules. Examples:
	//
	//     BulletSupport.Inflector.inflect ($) ->
	//       $.plural /^(ox)$/i, '$1en'
	//       $.singular /^(ox)en/i, '$1'
	//
	//       $.irregular 'octopus', 'octopi'
	//
	//       $.uncountable "equipment"
	//
	// New rules are added at the top. So in the example above, the irregular rule for octopus will now be the first of the
	// pluralization and singularization rules that is runs. This guarantees that your rules run before any of the rules that may
	// already have been loaded.



	var Inflections = function () {
	  this.plurals = [];
	  this.singulars = [];
	  this.uncountables = [];
	  this.humans = [];
	  defaults(this);
	  return this;
	};

	// Specifies a new pluralization rule and its replacement. The rule can either be a string or a regular expression.
	// The replacement should always be a string that may include references to the matched data from the rule.
	Inflections.prototype.plural = function (rule, replacement) {
	  if (typeof rule == 'string') {
	    this.uncountables = util$2.array.del(this.uncountables, rule);
	  }
	  this.uncountables = util$2.array.del(this.uncountables, replacement);
	  this.plurals.unshift([rule, replacement]);
	};

	// Specifies a new singularization rule and its replacement. The rule can either be a string or a regular expression.
	// The replacement should always be a string that may include references to the matched data from the rule.
	Inflections.prototype.singular = function (rule, replacement) {
	  if (typeof rule == 'string') {
	    this.uncountables = util$2.array.del(this.uncountables, rule);
	  }
	  this.uncountables = util$2.array.del(this.uncountables, replacement);
	  this.singulars.unshift([rule, replacement]);
	};

	// Specifies a new irregular that applies to both pluralization and singularization at the same time. This can only be used
	// for strings, not regular expressions. You simply pass the irregular in singular and plural form.
	//
	//     irregular 'octopus', 'octopi'
	//     irregular 'person', 'people'
	Inflections.prototype.irregular =  function (singular, plural, fullMatchRequired) {
	  this.uncountables = util$2.array.del(this.uncountables, singular);
	  this.uncountables = util$2.array.del(this.uncountables, plural);
	  var prefix = "";
	  if (fullMatchRequired) {
	    prefix = "^";
	  }
	  if (singular[0].toUpperCase() == plural[0].toUpperCase()) {
	    this.plural(new RegExp("(" + prefix + singular[0] + ")" + singular.slice(1) + "$", "i"), '$1' + plural.slice(1));
	    this.plural(new RegExp("(" + prefix + plural[0] + ")" + plural.slice(1) + "$", "i"), '$1' + plural.slice(1));
	    this.singular(new RegExp("(" + prefix + plural[0] + ")" + plural.slice(1) + "$", "i"), '$1' + singular.slice(1));
	  } else {
	    this.plural(new RegExp(prefix + (singular[0].toUpperCase()) + singular.slice(1) + "$"), plural[0].toUpperCase() + plural.slice(1));
	    this.plural(new RegExp(prefix + (singular[0].toLowerCase()) + singular.slice(1) + "$"), plural[0].toLowerCase() + plural.slice(1));
	    this.plural(new RegExp(prefix + (plural[0].toUpperCase()) + plural.slice(1) + "$"), plural[0].toUpperCase() + plural.slice(1));
	    this.plural(new RegExp(prefix + (plural[0].toLowerCase()) + plural.slice(1) + "$"), plural[0].toLowerCase() + plural.slice(1));
	    this.singular(new RegExp(prefix + (plural[0].toUpperCase()) + plural.slice(1) + "$"), singular[0].toUpperCase() + singular.slice(1));
	    this.singular(new RegExp(prefix + (plural[0].toLowerCase()) + plural.slice(1) + "$"), singular[0].toLowerCase() + singular.slice(1));
	  }
	};

	// Specifies a humanized form of a string by a regular expression rule or by a string mapping.
	// When using a regular expression based replacement, the normal humanize formatting is called after the replacement.
	// When a string is used, the human form should be specified as desired (example: 'The name', not 'the_name')
	//
	//     human /(.*)_cnt$/i, '$1_count'
	//     human "legacy_col_person_name", "Name"
	Inflections.prototype.human = function (rule, replacement) {
	  this.humans.unshift([rule, replacement]);
	};

	// Add uncountable words that shouldn't be attempted inflected.
	//
	//     uncountable "money"
	//     uncountable ["money", "information"]
	Inflections.prototype.uncountable = function (words) {
	  this.uncountables = this.uncountables.concat(words);
	};

	// Clears the loaded inflections within a given scope (default is _'all'_).
	// Give the scope as a symbol of the inflection type, the options are: _'plurals'_,
	// _'singulars'_, _'uncountables'_, _'humans'_.
	//
	//     clear 'all'
	//     clear 'plurals'
	Inflections.prototype.clear = function (scope) {
	  if (scope == null) scope = 'all';
	  switch (scope) {
	    case 'all':
	      this.plurals = [];
	      this.singulars = [];
	      this.uncountables = [];
	      this.humans = [];
	    default:
	      this[scope] = [];
	  }
	};

	// Clears the loaded inflections and initializes them to [default](../inflections.html)
	Inflections.prototype.default = function () {
	  this.plurals = [];
	  this.singulars = [];
	  this.uncountables = [];
	  this.humans = [];
	  defaults(this);
	  return this;
	};

	var inflections = new Inflections();

	var methods = createCommonjsModule(function (module) {
	// The Inflector transforms words from singular to plural, class names to table names, modularized class names to ones without,
	// and class names to foreign keys. The default inflections for pluralization, singularization, and uncountable words are kept
	// in inflections.coffee
	//
	// If you discover an incorrect inflection and require it for your application, you'll need
	// to correct it yourself (explained below).



	var inflect = module.exports;

	// Import [inflections](inflections.html) instance
	inflect.inflections = inflections;

	// Gives easy access to add inflections to this class
	inflect.inflect = function (fn) {
	  fn(inflect.inflections);
	};

	// By default, _camelize_ converts strings to UpperCamelCase. If the argument to _camelize_
	// is set to _false_ then _camelize_ produces lowerCamelCase.
	//
	// _camelize_ will also convert '/' to '.' which is useful for converting paths to namespaces.
	//
	//     "bullet_record".camelize()             // => "BulletRecord"
	//     "bullet_record".camelize(false)        // => "bulletRecord"
	//     "bullet_record/errors".camelize()      // => "BulletRecord.Errors"
	//     "bullet_record/errors".camelize(false) // => "bulletRecord.Errors"
	//
	// As a rule of thumb you can think of _camelize_ as the inverse of _underscore_,
	// though there are cases where that does not hold:
	//
	//     "SSLError".underscore.camelize // => "SslError"
	inflect.camelize = function(lower_case_and_underscored_word, first_letter_in_uppercase) {
	  var result;
	  if (first_letter_in_uppercase == null) first_letter_in_uppercase = true;
	  result = util$2.string.gsub(lower_case_and_underscored_word, /\/(.?)/, function($) {
	    return "." + (util$2.string.upcase($[1]));
	  });
	  result = util$2.string.gsub(result, /(?:_)(.)/, function($) {
	    return util$2.string.upcase($[1]);
	  });
	  if (first_letter_in_uppercase) {
	    return util$2.string.upcase(result);
	  } else {
	    return util$2.string.downcase(result);
	  }
	};

	// Makes an underscored, lowercase form from the expression in the string.
	//
	// Changes '.' to '/' to convert namespaces to paths.
	//
	//     "BulletRecord".underscore()         // => "bullet_record"
	//     "BulletRecord.Errors".underscore()  // => "bullet_record/errors"
	//
	// As a rule of thumb you can think of +underscore+ as the inverse of +camelize+,
	// though there are cases where that does not hold:
	//
	//     "SSLError".underscore().camelize() // => "SslError"
	inflect.underscore = function (camel_cased_word) {
	  var self;
	  self = util$2.string.gsub(camel_cased_word, /\./, '/');
	  self = util$2.string.gsub(self, /([A-Z]+)([A-Z][a-z])/, "$1_$2");
	  self = util$2.string.gsub(self, /([a-z\d])([A-Z])/, "$1_$2");
	  self = util$2.string.gsub(self, /-/, '_');
	  return self.toLowerCase();
	};

	// Replaces underscores with dashes in the string.
	//
	//     "puni_puni".dasherize()   // => "puni-puni"
	inflect.dasherize = function (underscored_word) {
	  return util$2.string.gsub(underscored_word, /_/, '-');
	};

	// Removes the module part from the expression in the string.
	//
	//     "BulletRecord.String.Inflections".demodulize() // => "Inflections"
	//     "Inflections".demodulize()                     // => "Inflections"
	inflect.demodulize = function (class_name_in_module) {
	  return util$2.string.gsub(class_name_in_module, /^.*\./, '');
	};

	// Creates a foreign key name from a class name.
	// _separate_class_name_and_id_with_underscore_ sets whether
	// the method should put '_' between the name and 'id'.
	//
	//     "Message".foreign_key()      // => "message_id"
	//     "Message".foreign_key(false) // => "messageid"
	//     "Admin::Post".foreign_key()  // => "post_id"
	inflect.foreign_key = function (class_name, separate_class_name_and_id_with_underscore) {
	  if (separate_class_name_and_id_with_underscore == null) {
	    separate_class_name_and_id_with_underscore = true;
	  }
	  return inflect.underscore(inflect.demodulize(class_name)) + (separate_class_name_and_id_with_underscore ? "_id" : "id");
	};

	// Turns a number into an ordinal string used to denote the position in an
	// ordered sequence such as 1st, 2nd, 3rd, 4th.
	//
	//     ordinalize(1)     // => "1st"
	//     ordinalize(2)     // => "2nd"
	//     ordinalize(1002)  // => "1002nd"
	//     ordinalize(1003)  // => "1003rd"
	//     ordinalize(-11)   // => "-11th"
	//     ordinalize(-1021) // => "-1021st"
	inflect.ordinalize = function (number) {
	  var _ref;
	  number = parseInt(number);
	  if ((_ref = Math.abs(number) % 100) === 11 || _ref === 12 || _ref === 13) {
	    return "" + number + "th";
	  } else {
	    switch (Math.abs(number) % 10) {
	      case 1:
	        return "" + number + "st";
	      case 2:
	        return "" + number + "nd";
	      case 3:
	        return "" + number + "rd";
	      default:
	        return "" + number + "th";
	    }
	  }
	};

	// Checks a given word for uncountability
	//
	//     "money".uncountability()     // => true
	//     "my money".uncountability()  // => true
	inflect.uncountability = function (word) {
	  return inflect.inflections.uncountables.some(function(ele, ind, arr) {
	    return word.match(new RegExp("(\\b|_)" + ele + "$", 'i')) != null;
	  });
	};

	// Returns the plural form of the word in the string.
	//
	//     "post".pluralize()             // => "posts"
	//     "octopus".pluralize()          // => "octopi"
	//     "sheep".pluralize()            // => "sheep"
	//     "words".pluralize()            // => "words"
	//     "CamelOctopus".pluralize()     // => "CamelOctopi"
	inflect.pluralize = function (word) {
	  var plural, result;
	  result = word;
	  if (word === '' || inflect.uncountability(word)) {
	    return result;
	  } else {
	    for (var i = 0; i < inflect.inflections.plurals.length; i++) {
	      plural = inflect.inflections.plurals[i];
	      result = util$2.string.gsub(result, plural[0], plural[1]);
	      if (word.match(plural[0]) != null) break;
	    }
	    return result;
	  }
	};

	// The reverse of _pluralize_, returns the singular form of a word in a string.
	//
	//     "posts".singularize()            // => "post"
	//     "octopi".singularize()           // => "octopus"
	//     "sheep".singularize()            // => "sheep"
	//     "word".singularize()             // => "word"
	//     "CamelOctopi".singularize()      // => "CamelOctopus"
	inflect.singularize = function (word) {
	  var result, singular;
	  result = word;
	  if (word === '' || inflect.uncountability(word)) {
	    return result;
	  } else {
	    for (var i = 0; i < inflect.inflections.singulars.length; i++) {
	      singular = inflect.inflections.singulars[i];
	      result = util$2.string.gsub(result, singular[0], singular[1]);
	      if (word.match(singular[0])) break;
	    }
	    return result;
	  }
	};

	// Capitalizes the first word and turns underscores into spaces and strips a
	// trailing "_id", if any. Like _titleize_, this is meant for creating pretty output.
	//
	//     "employee_salary".humanize()   // => "Employee salary"
	//     "author_id".humanize()         // => "Author"
	inflect.humanize = function (lower_case_and_underscored_word) {
	  var human, result;
	  result = lower_case_and_underscored_word;
	  for (var i = 0; i < inflect.inflections.humans.length; i++) {
	    human = inflect.inflections.humans[i];
	    result = util$2.string.gsub(result, human[0], human[1]);
	  }
	  result = util$2.string.gsub(result, /_id$/, "");
	  result = util$2.string.gsub(result, /_/, " ");
	  return util$2.string.capitalize(result, true);
	};

	// Capitalizes all the words and replaces some characters in the string to create
	// a nicer looking title. _titleize_ is meant for creating pretty output. It is not
	// used in the Bullet internals.
	//
	//
	//     "man from the boondocks".titleize()   // => "Man From The Boondocks"
	//     "x-men: the last stand".titleize()    // => "X Men: The Last Stand"
	inflect.titleize = function (word) {
	  var self;
	  self = inflect.humanize(inflect.underscore(word));
	  return util$2.string.capitalize(self);
	};

	// Create the name of a table like Bullet does for models to table names. This method
	// uses the _pluralize_ method on the last word in the string.
	//
	//     "RawScaledScorer".tableize()   // => "raw_scaled_scorers"
	//     "egg_and_ham".tableize()       // => "egg_and_hams"
	//     "fancyCategory".tableize()     // => "fancy_categories"
	inflect.tableize = function (class_name) {
	  return inflect.pluralize(inflect.underscore(class_name));
	};

	// Create a class name from a plural table name like Bullet does for table names to models.
	// Note that this returns a string and not a Class.
	//
	//     "egg_and_hams".classify()   // => "EggAndHam"
	//     "posts".classify()          // => "Post"
	//
	// Singular names are not handled correctly:
	//
	//     "business".classify()       // => "Busines"
	inflect.classify = function (table_name) {
	  return inflect.camelize(inflect.singularize(util$2.string.gsub(table_name, /.*\./, '')));
	};
	});

	var native_1 = function (obj) {

	  var addProperty = function (method, func) {
	    String.prototype.__defineGetter__(method, func);
	  };

	  var stringPrototypeBlacklist = [
	    '__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__', 'charAt', 'constructor',
	    'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf', 'charCodeAt',
	    'indexOf', 'lastIndexof', 'length', 'localeCompare', 'match', 'replace', 'search', 'slice', 'split', 'substring',
	    'toLocaleLowerCase', 'toLocaleUpperCase', 'toLowerCase', 'toUpperCase', 'trim', 'trimLeft', 'trimRight', 'gsub'
	  ];

	  Object.keys(obj).forEach(function (key) {
	    if (key != 'inflect' && key != 'inflections') {
	      if (stringPrototypeBlacklist.indexOf(key) !== -1) {
	        console.log('warn: You should not override String.prototype.' + key);
	      } else {
	        addProperty(key, function () {
	          return obj[key](this);
	        });
	      }
	    }
	  });

	};

	// Requiring modules

	var inflect = function (attach) {
	  var methods$$1 = methods;

	  if (attach) {
	    native_1(methods$$1);
	  }

	  return methods$$1
	};

	var _0777 = parseInt('0777', 8);

	var mkdirp = mkdirP.mkdirp = mkdirP.mkdirP = mkdirP;

	function mkdirP (p, opts, f, made) {
	    if (typeof opts === 'function') {
	        f = opts;
	        opts = {};
	    }
	    else if (!opts || typeof opts !== 'object') {
	        opts = { mode: opts };
	    }
	    
	    var mode = opts.mode;
	    var xfs = opts.fs || fs;
	    
	    if (mode === undefined) {
	        mode = _0777 & (~process.umask());
	    }
	    if (!made) made = null;
	    
	    var cb = f || function () {};
	    p = pathModule.resolve(p);
	    
	    xfs.mkdir(p, mode, function (er) {
	        if (!er) {
	            made = made || p;
	            return cb(null, made);
	        }
	        switch (er.code) {
	            case 'ENOENT':
	                mkdirP(pathModule.dirname(p), opts, function (er, made) {
	                    if (er) cb(er, made);
	                    else mkdirP(p, opts, cb, made);
	                });
	                break;

	            // In the case of any other error, just see if there's a dir
	            // there already.  If so, then hooray!  If not, then something
	            // is borked.
	            default:
	                xfs.stat(p, function (er2, stat) {
	                    // if the stat fails, then that's super weird.
	                    // let the original error be the failure reason.
	                    if (er2 || !stat.isDirectory()) cb(er, made);
	                    else cb(null, made);
	                });
	                break;
	        }
	    });
	}

	mkdirP.sync = function sync (p, opts, made) {
	    if (!opts || typeof opts !== 'object') {
	        opts = { mode: opts };
	    }
	    
	    var mode = opts.mode;
	    var xfs = opts.fs || fs;
	    
	    if (mode === undefined) {
	        mode = _0777 & (~process.umask());
	    }
	    if (!made) made = null;

	    p = pathModule.resolve(p);

	    try {
	        xfs.mkdirSync(p, mode);
	        made = made || p;
	    }
	    catch (err0) {
	        switch (err0.code) {
	            case 'ENOENT' :
	                made = sync(pathModule.dirname(p), opts, made);
	                sync(p, opts, made);
	                break;

	            // In the case of any other error, just see if there's a dir
	            // there already.  If so, then hooray!  If not, then something
	            // is borked.
	            default:
	                var stat;
	                try {
	                    stat = xfs.statSync(p);
	                }
	                catch (err1) {
	                    throw err0;
	                }
	                if (!stat.isDirectory()) throw err0;
	                break;
	        }
	    }

	    return made;
	};

	var keys = createCommonjsModule(function (module, exports) {
	exports = module.exports = typeof Object.keys === 'function'
	  ? Object.keys : shim;

	exports.shim = shim;
	function shim (obj) {
	  var keys = [];
	  for (var key in obj) keys.push(key);
	  return keys;
	}
	});
	var keys_1 = keys.shim;

	var is_arguments = createCommonjsModule(function (module, exports) {
	var supportsArgumentsClass = (function(){
	  return Object.prototype.toString.call(arguments)
	})() == '[object Arguments]';

	exports = module.exports = supportsArgumentsClass ? supported : unsupported;

	exports.supported = supported;
	function supported(object) {
	  return Object.prototype.toString.call(object) == '[object Arguments]';
	}
	exports.unsupported = unsupported;
	function unsupported(object){
	  return object &&
	    typeof object == 'object' &&
	    typeof object.length == 'number' &&
	    Object.prototype.hasOwnProperty.call(object, 'callee') &&
	    !Object.prototype.propertyIsEnumerable.call(object, 'callee') ||
	    false;
	}});
	var is_arguments_1 = is_arguments.supported;
	var is_arguments_2 = is_arguments.unsupported;

	var deepEqual_1 = createCommonjsModule(function (module) {
	var pSlice = Array.prototype.slice;



	var deepEqual = module.exports = function (actual, expected, opts) {
	  if (!opts) opts = {};
	  // 7.1. All identical values are equivalent, as determined by ===.
	  if (actual === expected) {
	    return true;

	  } else if (actual instanceof Date && expected instanceof Date) {
	    return actual.getTime() === expected.getTime();

	  // 7.3. Other pairs that do not both pass typeof value == 'object',
	  // equivalence is determined by ==.
	  } else if (typeof actual != 'object' && typeof expected != 'object') {
	    return opts.strict ? actual === expected : actual == expected;

	  // 7.4. For all other Object pairs, including Array objects, equivalence is
	  // determined by having the same number of owned properties (as verified
	  // with Object.prototype.hasOwnProperty.call), the same set of keys
	  // (although not necessarily the same order), equivalent values for every
	  // corresponding key, and an identical 'prototype' property. Note: this
	  // accounts for both named and indexed properties on Arrays.
	  } else {
	    return objEquiv(actual, expected, opts);
	  }
	};

	function isUndefinedOrNull(value) {
	  return value === null || value === undefined;
	}

	function isBuffer (x) {
	  if (!x || typeof x !== 'object' || typeof x.length !== 'number') return false;
	  if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
	    return false;
	  }
	  if (x.length > 0 && typeof x[0] !== 'number') return false;
	  return true;
	}

	function objEquiv(a, b, opts) {
	  var i, key;
	  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
	    return false;
	  // an identical 'prototype' property.
	  if (a.prototype !== b.prototype) return false;
	  //~~~I've managed to break Object.keys through screwy arguments passing.
	  //   Converting to array solves the problem.
	  if (is_arguments(a)) {
	    if (!is_arguments(b)) {
	      return false;
	    }
	    a = pSlice.call(a);
	    b = pSlice.call(b);
	    return deepEqual(a, b, opts);
	  }
	  if (isBuffer(a)) {
	    if (!isBuffer(b)) {
	      return false;
	    }
	    if (a.length !== b.length) return false;
	    for (i = 0; i < a.length; i++) {
	      if (a[i] !== b[i]) return false;
	    }
	    return true;
	  }
	  try {
	    var ka = keys(a),
	        kb = keys(b);
	  } catch (e) {//happens when one is a string literal and the other isn't
	    return false;
	  }
	  // having the same number of owned properties (keys incorporates
	  // hasOwnProperty)
	  if (ka.length != kb.length)
	    return false;
	  //the same set of keys (although not necessarily the same order),
	  ka.sort();
	  kb.sort();
	  //~~~cheap key test
	  for (i = ka.length - 1; i >= 0; i--) {
	    if (ka[i] != kb[i])
	      return false;
	  }
	  //equivalent values for every corresponding key, and
	  //~~~possibly expensive deep test
	  for (i = ka.length - 1; i >= 0; i--) {
	    key = ka[i];
	    if (!deepEqual(a[key], b[key], opts)) return false;
	  }
	  return typeof a === typeof b;
	}
	});

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.


	var isWindows = process.platform === 'win32';


	// JavaScript implementation of realpath, ported from node pre-v6

	var DEBUG = process.env.NODE_DEBUG && /fs/.test(process.env.NODE_DEBUG);

	function rethrow() {
	  // Only enable in debug mode. A backtrace uses ~1000 bytes of heap space and
	  // is fairly slow to generate.
	  var callback;
	  if (DEBUG) {
	    var backtrace = new Error;
	    callback = debugCallback;
	  } else
	    callback = missingCallback;

	  return callback;

	  function debugCallback(err) {
	    if (err) {
	      backtrace.message = err.message;
	      err = backtrace;
	      missingCallback(err);
	    }
	  }

	  function missingCallback(err) {
	    if (err) {
	      if (process.throwDeprecation)
	        throw err;  // Forgot a callback but don't know where? Use NODE_DEBUG=fs
	      else if (!process.noDeprecation) {
	        var msg = 'fs: missing callback ' + (err.stack || err.message);
	        if (process.traceDeprecation)
	          console.trace(msg);
	        else
	          console.error(msg);
	      }
	    }
	  }
	}

	function maybeCallback(cb) {
	  return typeof cb === 'function' ? cb : rethrow();
	}

	var normalize = pathModule.normalize;

	// Regexp that finds the next partion of a (partial) path
	// result is [base_with_slash, base], e.g. ['somedir/', 'somedir']
	if (isWindows) {
	  var nextPartRe = /(.*?)(?:[\/\\]+|$)/g;
	} else {
	  var nextPartRe = /(.*?)(?:[\/]+|$)/g;
	}

	// Regex to find the device root, including trailing slash. E.g. 'c:\\'.
	if (isWindows) {
	  var splitRootRe = /^(?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/][^\\\/]+)?[\\\/]*/;
	} else {
	  var splitRootRe = /^[\/]*/;
	}

	var realpathSync = function realpathSync(p, cache) {
	  // make p is absolute
	  p = pathModule.resolve(p);

	  if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
	    return cache[p];
	  }

	  var original = p,
	      seenLinks = {},
	      knownHard = {};

	  // current character position in p
	  var pos;
	  // the partial path so far, including a trailing slash if any
	  var current;
	  // the partial path without a trailing slash (except when pointing at a root)
	  var base;
	  // the partial path scanned in the previous round, with slash
	  var previous;

	  start();

	  function start() {
	    // Skip over roots
	    var m = splitRootRe.exec(p);
	    pos = m[0].length;
	    current = m[0];
	    base = m[0];
	    previous = '';

	    // On windows, check that the root exists. On unix there is no need.
	    if (isWindows && !knownHard[base]) {
	      fs.lstatSync(base);
	      knownHard[base] = true;
	    }
	  }

	  // walk down the path, swapping out linked pathparts for their real
	  // values
	  // NB: p.length changes.
	  while (pos < p.length) {
	    // find the next part
	    nextPartRe.lastIndex = pos;
	    var result = nextPartRe.exec(p);
	    previous = current;
	    current += result[0];
	    base = previous + result[1];
	    pos = nextPartRe.lastIndex;

	    // continue if not a symlink
	    if (knownHard[base] || (cache && cache[base] === base)) {
	      continue;
	    }

	    var resolvedLink;
	    if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
	      // some known symbolic link.  no need to stat again.
	      resolvedLink = cache[base];
	    } else {
	      var stat = fs.lstatSync(base);
	      if (!stat.isSymbolicLink()) {
	        knownHard[base] = true;
	        if (cache) cache[base] = base;
	        continue;
	      }

	      // read the link if it wasn't read before
	      // dev/ino always return 0 on windows, so skip the check.
	      var linkTarget = null;
	      if (!isWindows) {
	        var id = stat.dev.toString(32) + ':' + stat.ino.toString(32);
	        if (seenLinks.hasOwnProperty(id)) {
	          linkTarget = seenLinks[id];
	        }
	      }
	      if (linkTarget === null) {
	        fs.statSync(base);
	        linkTarget = fs.readlinkSync(base);
	      }
	      resolvedLink = pathModule.resolve(previous, linkTarget);
	      // track this, if given a cache.
	      if (cache) cache[base] = resolvedLink;
	      if (!isWindows) seenLinks[id] = linkTarget;
	    }

	    // resolve the link, then start over
	    p = pathModule.resolve(resolvedLink, p.slice(pos));
	    start();
	  }

	  if (cache) cache[original] = p;

	  return p;
	};


	var realpath = function realpath(p, cache, cb) {
	  if (typeof cb !== 'function') {
	    cb = maybeCallback(cache);
	    cache = null;
	  }

	  // make p is absolute
	  p = pathModule.resolve(p);

	  if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
	    return process.nextTick(cb.bind(null, null, cache[p]));
	  }

	  var original = p,
	      seenLinks = {},
	      knownHard = {};

	  // current character position in p
	  var pos;
	  // the partial path so far, including a trailing slash if any
	  var current;
	  // the partial path without a trailing slash (except when pointing at a root)
	  var base;
	  // the partial path scanned in the previous round, with slash
	  var previous;

	  start();

	  function start() {
	    // Skip over roots
	    var m = splitRootRe.exec(p);
	    pos = m[0].length;
	    current = m[0];
	    base = m[0];
	    previous = '';

	    // On windows, check that the root exists. On unix there is no need.
	    if (isWindows && !knownHard[base]) {
	      fs.lstat(base, function(err) {
	        if (err) return cb(err);
	        knownHard[base] = true;
	        LOOP();
	      });
	    } else {
	      process.nextTick(LOOP);
	    }
	  }

	  // walk down the path, swapping out linked pathparts for their real
	  // values
	  function LOOP() {
	    // stop if scanned past end of path
	    if (pos >= p.length) {
	      if (cache) cache[original] = p;
	      return cb(null, p);
	    }

	    // find the next part
	    nextPartRe.lastIndex = pos;
	    var result = nextPartRe.exec(p);
	    previous = current;
	    current += result[0];
	    base = previous + result[1];
	    pos = nextPartRe.lastIndex;

	    // continue if not a symlink
	    if (knownHard[base] || (cache && cache[base] === base)) {
	      return process.nextTick(LOOP);
	    }

	    if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
	      // known symbolic link.  no need to stat again.
	      return gotResolvedLink(cache[base]);
	    }

	    return fs.lstat(base, gotStat);
	  }

	  function gotStat(err, stat) {
	    if (err) return cb(err);

	    // if not a symlink, skip to the next path part
	    if (!stat.isSymbolicLink()) {
	      knownHard[base] = true;
	      if (cache) cache[base] = base;
	      return process.nextTick(LOOP);
	    }

	    // stat & read the link if not read before
	    // call gotTarget as soon as the link target is known
	    // dev/ino always return 0 on windows, so skip the check.
	    if (!isWindows) {
	      var id = stat.dev.toString(32) + ':' + stat.ino.toString(32);
	      if (seenLinks.hasOwnProperty(id)) {
	        return gotTarget(null, seenLinks[id], base);
	      }
	    }
	    fs.stat(base, function(err) {
	      if (err) return cb(err);

	      fs.readlink(base, function(err, target) {
	        if (!isWindows) seenLinks[id] = target;
	        gotTarget(err, target);
	      });
	    });
	  }

	  function gotTarget(err, target, base) {
	    if (err) return cb(err);

	    var resolvedLink = pathModule.resolve(previous, target);
	    if (cache) cache[base] = resolvedLink;
	    gotResolvedLink(resolvedLink);
	  }

	  function gotResolvedLink(resolvedLink) {
	    // resolve the link, then start over
	    p = pathModule.resolve(resolvedLink, p.slice(pos));
	    start();
	  }
	};

	var old = {
		realpathSync: realpathSync,
		realpath: realpath
	};

	var fs_realpath = realpath$1;
	realpath$1.realpath = realpath$1;
	realpath$1.sync = realpathSync$1;
	realpath$1.realpathSync = realpathSync$1;
	realpath$1.monkeypatch = monkeypatch;
	realpath$1.unmonkeypatch = unmonkeypatch;


	var origRealpath = fs.realpath;
	var origRealpathSync = fs.realpathSync;

	var version = process.version;
	var ok = /^v[0-5]\./.test(version);


	function newError (er) {
	  return er && er.syscall === 'realpath' && (
	    er.code === 'ELOOP' ||
	    er.code === 'ENOMEM' ||
	    er.code === 'ENAMETOOLONG'
	  )
	}

	function realpath$1 (p, cache, cb) {
	  if (ok) {
	    return origRealpath(p, cache, cb)
	  }

	  if (typeof cache === 'function') {
	    cb = cache;
	    cache = null;
	  }
	  origRealpath(p, cache, function (er, result) {
	    if (newError(er)) {
	      old.realpath(p, cache, cb);
	    } else {
	      cb(er, result);
	    }
	  });
	}

	function realpathSync$1 (p, cache) {
	  if (ok) {
	    return origRealpathSync(p, cache)
	  }

	  try {
	    return origRealpathSync(p, cache)
	  } catch (er) {
	    if (newError(er)) {
	      return old.realpathSync(p, cache)
	    } else {
	      throw er
	    }
	  }
	}

	function monkeypatch () {
	  fs.realpath = realpath$1;
	  fs.realpathSync = realpathSync$1;
	}

	function unmonkeypatch () {
	  fs.realpath = origRealpath;
	  fs.realpathSync = origRealpathSync;
	}

	var concatMap = function (xs, fn) {
	    var res = [];
	    for (var i = 0; i < xs.length; i++) {
	        var x = fn(xs[i], i);
	        if (isArray(x)) res.push.apply(res, x);
	        else res.push(x);
	    }
	    return res;
	};

	var isArray = Array.isArray || function (xs) {
	    return Object.prototype.toString.call(xs) === '[object Array]';
	};

	var balancedMatch = balanced;
	function balanced(a, b, str) {
	  if (a instanceof RegExp) a = maybeMatch(a, str);
	  if (b instanceof RegExp) b = maybeMatch(b, str);

	  var r = range(a, b, str);

	  return r && {
	    start: r[0],
	    end: r[1],
	    pre: str.slice(0, r[0]),
	    body: str.slice(r[0] + a.length, r[1]),
	    post: str.slice(r[1] + b.length)
	  };
	}

	function maybeMatch(reg, str) {
	  var m = str.match(reg);
	  return m ? m[0] : null;
	}

	balanced.range = range;
	function range(a, b, str) {
	  var begs, beg, left, right, result;
	  var ai = str.indexOf(a);
	  var bi = str.indexOf(b, ai + 1);
	  var i = ai;

	  if (ai >= 0 && bi > 0) {
	    begs = [];
	    left = str.length;

	    while (i >= 0 && !result) {
	      if (i == ai) {
	        begs.push(i);
	        ai = str.indexOf(a, i + 1);
	      } else if (begs.length == 1) {
	        result = [ begs.pop(), bi ];
	      } else {
	        beg = begs.pop();
	        if (beg < left) {
	          left = beg;
	          right = bi;
	        }

	        bi = str.indexOf(b, i + 1);
	      }

	      i = ai < bi && ai >= 0 ? ai : bi;
	    }

	    if (begs.length) {
	      result = [ left, right ];
	    }
	  }

	  return result;
	}

	var braceExpansion = expandTop;

	var escSlash = '\0SLASH'+Math.random()+'\0';
	var escOpen = '\0OPEN'+Math.random()+'\0';
	var escClose = '\0CLOSE'+Math.random()+'\0';
	var escComma = '\0COMMA'+Math.random()+'\0';
	var escPeriod = '\0PERIOD'+Math.random()+'\0';

	function numeric(str) {
	  return parseInt(str, 10) == str
	    ? parseInt(str, 10)
	    : str.charCodeAt(0);
	}

	function escapeBraces(str) {
	  return str.split('\\\\').join(escSlash)
	            .split('\\{').join(escOpen)
	            .split('\\}').join(escClose)
	            .split('\\,').join(escComma)
	            .split('\\.').join(escPeriod);
	}

	function unescapeBraces(str) {
	  return str.split(escSlash).join('\\')
	            .split(escOpen).join('{')
	            .split(escClose).join('}')
	            .split(escComma).join(',')
	            .split(escPeriod).join('.');
	}


	// Basically just str.split(","), but handling cases
	// where we have nested braced sections, which should be
	// treated as individual members, like {a,{b,c},d}
	function parseCommaParts(str) {
	  if (!str)
	    return [''];

	  var parts = [];
	  var m = balancedMatch('{', '}', str);

	  if (!m)
	    return str.split(',');

	  var pre = m.pre;
	  var body = m.body;
	  var post = m.post;
	  var p = pre.split(',');

	  p[p.length-1] += '{' + body + '}';
	  var postParts = parseCommaParts(post);
	  if (post.length) {
	    p[p.length-1] += postParts.shift();
	    p.push.apply(p, postParts);
	  }

	  parts.push.apply(parts, p);

	  return parts;
	}

	function expandTop(str) {
	  if (!str)
	    return [];

	  // I don't know why Bash 4.3 does this, but it does.
	  // Anything starting with {} will have the first two bytes preserved
	  // but *only* at the top level, so {},a}b will not expand to anything,
	  // but a{},b}c will be expanded to [a}c,abc].
	  // One could argue that this is a bug in Bash, but since the goal of
	  // this module is to match Bash's rules, we escape a leading {}
	  if (str.substr(0, 2) === '{}') {
	    str = '\\{\\}' + str.substr(2);
	  }

	  return expand(escapeBraces(str), true).map(unescapeBraces);
	}

	function embrace(str) {
	  return '{' + str + '}';
	}
	function isPadded(el) {
	  return /^-?0\d/.test(el);
	}

	function lte(i, y) {
	  return i <= y;
	}
	function gte(i, y) {
	  return i >= y;
	}

	function expand(str, isTop) {
	  var expansions = [];

	  var m = balancedMatch('{', '}', str);
	  if (!m || /\$$/.test(m.pre)) return [str];

	  var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
	  var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
	  var isSequence = isNumericSequence || isAlphaSequence;
	  var isOptions = m.body.indexOf(',') >= 0;
	  if (!isSequence && !isOptions) {
	    // {a},b}
	    if (m.post.match(/,.*\}/)) {
	      str = m.pre + '{' + m.body + escClose + m.post;
	      return expand(str);
	    }
	    return [str];
	  }

	  var n;
	  if (isSequence) {
	    n = m.body.split(/\.\./);
	  } else {
	    n = parseCommaParts(m.body);
	    if (n.length === 1) {
	      // x{{a,b}}y ==> x{a}y x{b}y
	      n = expand(n[0], false).map(embrace);
	      if (n.length === 1) {
	        var post = m.post.length
	          ? expand(m.post, false)
	          : [''];
	        return post.map(function(p) {
	          return m.pre + n[0] + p;
	        });
	      }
	    }
	  }

	  // at this point, n is the parts, and we know it's not a comma set
	  // with a single entry.

	  // no need to expand pre, since it is guaranteed to be free of brace-sets
	  var pre = m.pre;
	  var post = m.post.length
	    ? expand(m.post, false)
	    : [''];

	  var N;

	  if (isSequence) {
	    var x = numeric(n[0]);
	    var y = numeric(n[1]);
	    var width = Math.max(n[0].length, n[1].length);
	    var incr = n.length == 3
	      ? Math.abs(numeric(n[2]))
	      : 1;
	    var test = lte;
	    var reverse = y < x;
	    if (reverse) {
	      incr *= -1;
	      test = gte;
	    }
	    var pad = n.some(isPadded);

	    N = [];

	    for (var i = x; test(i, y); i += incr) {
	      var c;
	      if (isAlphaSequence) {
	        c = String.fromCharCode(i);
	        if (c === '\\')
	          c = '';
	      } else {
	        c = String(i);
	        if (pad) {
	          var need = width - c.length;
	          if (need > 0) {
	            var z = new Array(need + 1).join('0');
	            if (i < 0)
	              c = '-' + z + c.slice(1);
	            else
	              c = z + c;
	          }
	        }
	      }
	      N.push(c);
	    }
	  } else {
	    N = concatMap(n, function(el) { return expand(el, false) });
	  }

	  for (var j = 0; j < N.length; j++) {
	    for (var k = 0; k < post.length; k++) {
	      var expansion = pre + N[j] + post[k];
	      if (!isTop || isSequence || expansion)
	        expansions.push(expansion);
	    }
	  }

	  return expansions;
	}

	var minimatch_1 = minimatch;
	minimatch.Minimatch = Minimatch;

	var path = { sep: '/' };
	try {
	  path = pathModule;
	} catch (er) {}

	var GLOBSTAR = minimatch.GLOBSTAR = Minimatch.GLOBSTAR = {};


	var plTypes = {
	  '!': { open: '(?:(?!(?:', close: '))[^/]*?)'},
	  '?': { open: '(?:', close: ')?' },
	  '+': { open: '(?:', close: ')+' },
	  '*': { open: '(?:', close: ')*' },
	  '@': { open: '(?:', close: ')' }
	};

	// any single thing other than /
	// don't need to escape / when using new RegExp()
	var qmark = '[^/]';

	// * => any number of characters
	var star = qmark + '*?';

	// ** when dots are allowed.  Anything goes, except .. and .
	// not (^ or / followed by one or two dots followed by $ or /),
	// followed by anything, any number of times.
	var twoStarDot = '(?:(?!(?:\\\/|^)(?:\\.{1,2})($|\\\/)).)*?';

	// not a ^ or / followed by a dot,
	// followed by anything, any number of times.
	var twoStarNoDot = '(?:(?!(?:\\\/|^)\\.).)*?';

	// characters that need to be escaped in RegExp.
	var reSpecials = charSet('().*{}+?[]^$\\!');

	// "abc" -> { a:true, b:true, c:true }
	function charSet (s) {
	  return s.split('').reduce(function (set, c) {
	    set[c] = true;
	    return set
	  }, {})
	}

	// normalizes slashes.
	var slashSplit = /\/+/;

	minimatch.filter = filter;
	function filter (pattern, options) {
	  options = options || {};
	  return function (p, i, list) {
	    return minimatch(p, pattern, options)
	  }
	}

	function ext (a, b) {
	  a = a || {};
	  b = b || {};
	  var t = {};
	  Object.keys(b).forEach(function (k) {
	    t[k] = b[k];
	  });
	  Object.keys(a).forEach(function (k) {
	    t[k] = a[k];
	  });
	  return t
	}

	minimatch.defaults = function (def) {
	  if (!def || !Object.keys(def).length) return minimatch

	  var orig = minimatch;

	  var m = function minimatch (p, pattern, options) {
	    return orig.minimatch(p, pattern, ext(def, options))
	  };

	  m.Minimatch = function Minimatch (pattern, options) {
	    return new orig.Minimatch(pattern, ext(def, options))
	  };

	  return m
	};

	Minimatch.defaults = function (def) {
	  if (!def || !Object.keys(def).length) return Minimatch
	  return minimatch.defaults(def).Minimatch
	};

	function minimatch (p, pattern, options) {
	  if (typeof pattern !== 'string') {
	    throw new TypeError('glob pattern string required')
	  }

	  if (!options) options = {};

	  // shortcut: comments match nothing.
	  if (!options.nocomment && pattern.charAt(0) === '#') {
	    return false
	  }

	  // "" only matches ""
	  if (pattern.trim() === '') return p === ''

	  return new Minimatch(pattern, options).match(p)
	}

	function Minimatch (pattern, options) {
	  if (!(this instanceof Minimatch)) {
	    return new Minimatch(pattern, options)
	  }

	  if (typeof pattern !== 'string') {
	    throw new TypeError('glob pattern string required')
	  }

	  if (!options) options = {};
	  pattern = pattern.trim();

	  // windows support: need to use /, not \
	  if (path.sep !== '/') {
	    pattern = pattern.split(path.sep).join('/');
	  }

	  this.options = options;
	  this.set = [];
	  this.pattern = pattern;
	  this.regexp = null;
	  this.negate = false;
	  this.comment = false;
	  this.empty = false;

	  // make the set of regexps etc.
	  this.make();
	}

	Minimatch.prototype.debug = function () {};

	Minimatch.prototype.make = make;
	function make () {
	  // don't do it more than once.
	  if (this._made) return

	  var pattern = this.pattern;
	  var options = this.options;

	  // empty patterns and comments match nothing.
	  if (!options.nocomment && pattern.charAt(0) === '#') {
	    this.comment = true;
	    return
	  }
	  if (!pattern) {
	    this.empty = true;
	    return
	  }

	  // step 1: figure out negation, etc.
	  this.parseNegate();

	  // step 2: expand braces
	  var set = this.globSet = this.braceExpand();

	  if (options.debug) this.debug = console.error;

	  this.debug(this.pattern, set);

	  // step 3: now we have a set, so turn each one into a series of path-portion
	  // matching patterns.
	  // These will be regexps, except in the case of "**", which is
	  // set to the GLOBSTAR object for globstar behavior,
	  // and will not contain any / characters
	  set = this.globParts = set.map(function (s) {
	    return s.split(slashSplit)
	  });

	  this.debug(this.pattern, set);

	  // glob --> regexps
	  set = set.map(function (s, si, set) {
	    return s.map(this.parse, this)
	  }, this);

	  this.debug(this.pattern, set);

	  // filter out everything that didn't compile properly.
	  set = set.filter(function (s) {
	    return s.indexOf(false) === -1
	  });

	  this.debug(this.pattern, set);

	  this.set = set;
	}

	Minimatch.prototype.parseNegate = parseNegate;
	function parseNegate () {
	  var pattern = this.pattern;
	  var negate = false;
	  var options = this.options;
	  var negateOffset = 0;

	  if (options.nonegate) return

	  for (var i = 0, l = pattern.length
	    ; i < l && pattern.charAt(i) === '!'
	    ; i++) {
	    negate = !negate;
	    negateOffset++;
	  }

	  if (negateOffset) this.pattern = pattern.substr(negateOffset);
	  this.negate = negate;
	}

	// Brace expansion:
	// a{b,c}d -> abd acd
	// a{b,}c -> abc ac
	// a{0..3}d -> a0d a1d a2d a3d
	// a{b,c{d,e}f}g -> abg acdfg acefg
	// a{b,c}d{e,f}g -> abdeg acdeg abdeg abdfg
	//
	// Invalid sets are not expanded.
	// a{2..}b -> a{2..}b
	// a{b}c -> a{b}c
	minimatch.braceExpand = function (pattern, options) {
	  return braceExpand(pattern, options)
	};

	Minimatch.prototype.braceExpand = braceExpand;

	function braceExpand (pattern, options) {
	  if (!options) {
	    if (this instanceof Minimatch) {
	      options = this.options;
	    } else {
	      options = {};
	    }
	  }

	  pattern = typeof pattern === 'undefined'
	    ? this.pattern : pattern;

	  if (typeof pattern === 'undefined') {
	    throw new TypeError('undefined pattern')
	  }

	  if (options.nobrace ||
	    !pattern.match(/\{.*\}/)) {
	    // shortcut. no need to expand.
	    return [pattern]
	  }

	  return braceExpansion(pattern)
	}

	// parse a component of the expanded set.
	// At this point, no pattern may contain "/" in it
	// so we're going to return a 2d array, where each entry is the full
	// pattern, split on '/', and then turned into a regular expression.
	// A regexp is made at the end which joins each array with an
	// escaped /, and another full one which joins each regexp with |.
	//
	// Following the lead of Bash 4.1, note that "**" only has special meaning
	// when it is the *only* thing in a path portion.  Otherwise, any series
	// of * is equivalent to a single *.  Globstar behavior is enabled by
	// default, and can be disabled by setting options.noglobstar.
	Minimatch.prototype.parse = parse;
	var SUBPARSE = {};
	function parse (pattern, isSub) {
	  if (pattern.length > 1024 * 64) {
	    throw new TypeError('pattern is too long')
	  }

	  var options = this.options;

	  // shortcuts
	  if (!options.noglobstar && pattern === '**') return GLOBSTAR
	  if (pattern === '') return ''

	  var re = '';
	  var hasMagic = !!options.nocase;
	  var escaping = false;
	  // ? => one single character
	  var patternListStack = [];
	  var negativeLists = [];
	  var stateChar;
	  var inClass = false;
	  var reClassStart = -1;
	  var classStart = -1;
	  // . and .. never match anything that doesn't start with .,
	  // even when options.dot is set.
	  var patternStart = pattern.charAt(0) === '.' ? '' // anything
	  // not (start or / followed by . or .. followed by / or end)
	  : options.dot ? '(?!(?:^|\\\/)\\.{1,2}(?:$|\\\/))'
	  : '(?!\\.)';
	  var self = this;

	  function clearStateChar () {
	    if (stateChar) {
	      // we had some state-tracking character
	      // that wasn't consumed by this pass.
	      switch (stateChar) {
	        case '*':
	          re += star;
	          hasMagic = true;
	        break
	        case '?':
	          re += qmark;
	          hasMagic = true;
	        break
	        default:
	          re += '\\' + stateChar;
	        break
	      }
	      self.debug('clearStateChar %j %j', stateChar, re);
	      stateChar = false;
	    }
	  }

	  for (var i = 0, len = pattern.length, c
	    ; (i < len) && (c = pattern.charAt(i))
	    ; i++) {
	    this.debug('%s\t%s %s %j', pattern, i, re, c);

	    // skip over any that are escaped.
	    if (escaping && reSpecials[c]) {
	      re += '\\' + c;
	      escaping = false;
	      continue
	    }

	    switch (c) {
	      case '/':
	        // completely not allowed, even escaped.
	        // Should already be path-split by now.
	        return false

	      case '\\':
	        clearStateChar();
	        escaping = true;
	      continue

	      // the various stateChar values
	      // for the "extglob" stuff.
	      case '?':
	      case '*':
	      case '+':
	      case '@':
	      case '!':
	        this.debug('%s\t%s %s %j <-- stateChar', pattern, i, re, c);

	        // all of those are literals inside a class, except that
	        // the glob [!a] means [^a] in regexp
	        if (inClass) {
	          this.debug('  in class');
	          if (c === '!' && i === classStart + 1) c = '^';
	          re += c;
	          continue
	        }

	        // if we already have a stateChar, then it means
	        // that there was something like ** or +? in there.
	        // Handle the stateChar, then proceed with this one.
	        self.debug('call clearStateChar %j', stateChar);
	        clearStateChar();
	        stateChar = c;
	        // if extglob is disabled, then +(asdf|foo) isn't a thing.
	        // just clear the statechar *now*, rather than even diving into
	        // the patternList stuff.
	        if (options.noext) clearStateChar();
	      continue

	      case '(':
	        if (inClass) {
	          re += '(';
	          continue
	        }

	        if (!stateChar) {
	          re += '\\(';
	          continue
	        }

	        patternListStack.push({
	          type: stateChar,
	          start: i - 1,
	          reStart: re.length,
	          open: plTypes[stateChar].open,
	          close: plTypes[stateChar].close
	        });
	        // negation is (?:(?!js)[^/]*)
	        re += stateChar === '!' ? '(?:(?!(?:' : '(?:';
	        this.debug('plType %j %j', stateChar, re);
	        stateChar = false;
	      continue

	      case ')':
	        if (inClass || !patternListStack.length) {
	          re += '\\)';
	          continue
	        }

	        clearStateChar();
	        hasMagic = true;
	        var pl = patternListStack.pop();
	        // negation is (?:(?!js)[^/]*)
	        // The others are (?:<pattern>)<type>
	        re += pl.close;
	        if (pl.type === '!') {
	          negativeLists.push(pl);
	        }
	        pl.reEnd = re.length;
	      continue

	      case '|':
	        if (inClass || !patternListStack.length || escaping) {
	          re += '\\|';
	          escaping = false;
	          continue
	        }

	        clearStateChar();
	        re += '|';
	      continue

	      // these are mostly the same in regexp and glob
	      case '[':
	        // swallow any state-tracking char before the [
	        clearStateChar();

	        if (inClass) {
	          re += '\\' + c;
	          continue
	        }

	        inClass = true;
	        classStart = i;
	        reClassStart = re.length;
	        re += c;
	      continue

	      case ']':
	        //  a right bracket shall lose its special
	        //  meaning and represent itself in
	        //  a bracket expression if it occurs
	        //  first in the list.  -- POSIX.2 2.8.3.2
	        if (i === classStart + 1 || !inClass) {
	          re += '\\' + c;
	          escaping = false;
	          continue
	        }

	        // handle the case where we left a class open.
	        // "[z-a]" is valid, equivalent to "\[z-a\]"
	        if (inClass) {
	          // split where the last [ was, make sure we don't have
	          // an invalid re. if so, re-walk the contents of the
	          // would-be class to re-translate any characters that
	          // were passed through as-is
	          // TODO: It would probably be faster to determine this
	          // without a try/catch and a new RegExp, but it's tricky
	          // to do safely.  For now, this is safe and works.
	          var cs = pattern.substring(classStart + 1, i);
	          try {
	          } catch (er) {
	            // not a valid class!
	            var sp = this.parse(cs, SUBPARSE);
	            re = re.substr(0, reClassStart) + '\\[' + sp[0] + '\\]';
	            hasMagic = hasMagic || sp[1];
	            inClass = false;
	            continue
	          }
	        }

	        // finish up the class.
	        hasMagic = true;
	        inClass = false;
	        re += c;
	      continue

	      default:
	        // swallow any state char that wasn't consumed
	        clearStateChar();

	        if (escaping) {
	          // no need
	          escaping = false;
	        } else if (reSpecials[c]
	          && !(c === '^' && inClass)) {
	          re += '\\';
	        }

	        re += c;

	    } // switch
	  } // for

	  // handle the case where we left a class open.
	  // "[abc" is valid, equivalent to "\[abc"
	  if (inClass) {
	    // split where the last [ was, and escape it
	    // this is a huge pita.  We now have to re-walk
	    // the contents of the would-be class to re-translate
	    // any characters that were passed through as-is
	    cs = pattern.substr(classStart + 1);
	    sp = this.parse(cs, SUBPARSE);
	    re = re.substr(0, reClassStart) + '\\[' + sp[0];
	    hasMagic = hasMagic || sp[1];
	  }

	  // handle the case where we had a +( thing at the *end*
	  // of the pattern.
	  // each pattern list stack adds 3 chars, and we need to go through
	  // and escape any | chars that were passed through as-is for the regexp.
	  // Go through and escape them, taking care not to double-escape any
	  // | chars that were already escaped.
	  for (pl = patternListStack.pop(); pl; pl = patternListStack.pop()) {
	    var tail = re.slice(pl.reStart + pl.open.length);
	    this.debug('setting tail', re, pl);
	    // maybe some even number of \, then maybe 1 \, followed by a |
	    tail = tail.replace(/((?:\\{2}){0,64})(\\?)\|/g, function (_, $1, $2) {
	      if (!$2) {
	        // the | isn't already escaped, so escape it.
	        $2 = '\\';
	      }

	      // need to escape all those slashes *again*, without escaping the
	      // one that we need for escaping the | character.  As it works out,
	      // escaping an even number of slashes can be done by simply repeating
	      // it exactly after itself.  That's why this trick works.
	      //
	      // I am sorry that you have to see this.
	      return $1 + $1 + $2 + '|'
	    });

	    this.debug('tail=%j\n   %s', tail, tail, pl, re);
	    var t = pl.type === '*' ? star
	      : pl.type === '?' ? qmark
	      : '\\' + pl.type;

	    hasMagic = true;
	    re = re.slice(0, pl.reStart) + t + '\\(' + tail;
	  }

	  // handle trailing things that only matter at the very end.
	  clearStateChar();
	  if (escaping) {
	    // trailing \\
	    re += '\\\\';
	  }

	  // only need to apply the nodot start if the re starts with
	  // something that could conceivably capture a dot
	  var addPatternStart = false;
	  switch (re.charAt(0)) {
	    case '.':
	    case '[':
	    case '(': addPatternStart = true;
	  }

	  // Hack to work around lack of negative lookbehind in JS
	  // A pattern like: *.!(x).!(y|z) needs to ensure that a name
	  // like 'a.xyz.yz' doesn't match.  So, the first negative
	  // lookahead, has to look ALL the way ahead, to the end of
	  // the pattern.
	  for (var n = negativeLists.length - 1; n > -1; n--) {
	    var nl = negativeLists[n];

	    var nlBefore = re.slice(0, nl.reStart);
	    var nlFirst = re.slice(nl.reStart, nl.reEnd - 8);
	    var nlLast = re.slice(nl.reEnd - 8, nl.reEnd);
	    var nlAfter = re.slice(nl.reEnd);

	    nlLast += nlAfter;

	    // Handle nested stuff like *(*.js|!(*.json)), where open parens
	    // mean that we should *not* include the ) in the bit that is considered
	    // "after" the negated section.
	    var openParensBefore = nlBefore.split('(').length - 1;
	    var cleanAfter = nlAfter;
	    for (i = 0; i < openParensBefore; i++) {
	      cleanAfter = cleanAfter.replace(/\)[+*?]?/, '');
	    }
	    nlAfter = cleanAfter;

	    var dollar = '';
	    if (nlAfter === '' && isSub !== SUBPARSE) {
	      dollar = '$';
	    }
	    var newRe = nlBefore + nlFirst + nlAfter + dollar + nlLast;
	    re = newRe;
	  }

	  // if the re is not "" at this point, then we need to make sure
	  // it doesn't match against an empty path part.
	  // Otherwise a/* will match a/, which it should not.
	  if (re !== '' && hasMagic) {
	    re = '(?=.)' + re;
	  }

	  if (addPatternStart) {
	    re = patternStart + re;
	  }

	  // parsing just a piece of a larger pattern.
	  if (isSub === SUBPARSE) {
	    return [re, hasMagic]
	  }

	  // skip the regexp for non-magical patterns
	  // unescape anything in it, though, so that it'll be
	  // an exact match against a file etc.
	  if (!hasMagic) {
	    return globUnescape(pattern)
	  }

	  var flags = options.nocase ? 'i' : '';
	  try {
	    var regExp = new RegExp('^' + re + '$', flags);
	  } catch (er) {
	    // If it was an invalid regular expression, then it can't match
	    // anything.  This trick looks for a character after the end of
	    // the string, which is of course impossible, except in multi-line
	    // mode, but it's not a /m regex.
	    return new RegExp('$.')
	  }

	  regExp._glob = pattern;
	  regExp._src = re;

	  return regExp
	}

	minimatch.makeRe = function (pattern, options) {
	  return new Minimatch(pattern, options || {}).makeRe()
	};

	Minimatch.prototype.makeRe = makeRe;
	function makeRe () {
	  if (this.regexp || this.regexp === false) return this.regexp

	  // at this point, this.set is a 2d array of partial
	  // pattern strings, or "**".
	  //
	  // It's better to use .match().  This function shouldn't
	  // be used, really, but it's pretty convenient sometimes,
	  // when you just want to work with a regex.
	  var set = this.set;

	  if (!set.length) {
	    this.regexp = false;
	    return this.regexp
	  }
	  var options = this.options;

	  var twoStar = options.noglobstar ? star
	    : options.dot ? twoStarDot
	    : twoStarNoDot;
	  var flags = options.nocase ? 'i' : '';

	  var re = set.map(function (pattern) {
	    return pattern.map(function (p) {
	      return (p === GLOBSTAR) ? twoStar
	      : (typeof p === 'string') ? regExpEscape(p)
	      : p._src
	    }).join('\\\/')
	  }).join('|');

	  // must match entire pattern
	  // ending in a * or ** will make it less strict.
	  re = '^(?:' + re + ')$';

	  // can match anything, as long as it's not this.
	  if (this.negate) re = '^(?!' + re + ').*$';

	  try {
	    this.regexp = new RegExp(re, flags);
	  } catch (ex) {
	    this.regexp = false;
	  }
	  return this.regexp
	}

	minimatch.match = function (list, pattern, options) {
	  options = options || {};
	  var mm = new Minimatch(pattern, options);
	  list = list.filter(function (f) {
	    return mm.match(f)
	  });
	  if (mm.options.nonull && !list.length) {
	    list.push(pattern);
	  }
	  return list
	};

	Minimatch.prototype.match = match;
	function match (f, partial) {
	  this.debug('match', f, this.pattern);
	  // short-circuit in the case of busted things.
	  // comments, etc.
	  if (this.comment) return false
	  if (this.empty) return f === ''

	  if (f === '/' && partial) return true

	  var options = this.options;

	  // windows: need to use /, not \
	  if (path.sep !== '/') {
	    f = f.split(path.sep).join('/');
	  }

	  // treat the test path as a set of pathparts.
	  f = f.split(slashSplit);
	  this.debug(this.pattern, 'split', f);

	  // just ONE of the pattern sets in this.set needs to match
	  // in order for it to be valid.  If negating, then just one
	  // match means that we have failed.
	  // Either way, return on the first hit.

	  var set = this.set;
	  this.debug(this.pattern, 'set', set);

	  // Find the basename of the path by looking for the last non-empty segment
	  var filename;
	  var i;
	  for (i = f.length - 1; i >= 0; i--) {
	    filename = f[i];
	    if (filename) break
	  }

	  for (i = 0; i < set.length; i++) {
	    var pattern = set[i];
	    var file = f;
	    if (options.matchBase && pattern.length === 1) {
	      file = [filename];
	    }
	    var hit = this.matchOne(file, pattern, partial);
	    if (hit) {
	      if (options.flipNegate) return true
	      return !this.negate
	    }
	  }

	  // didn't get any hits.  this is success if it's a negative
	  // pattern, failure otherwise.
	  if (options.flipNegate) return false
	  return this.negate
	}

	// set partial to true to test if, for example,
	// "/a/b" matches the start of "/*/b/*/d"
	// Partial means, if you run out of file before you run
	// out of pattern, then that's fine, as long as all
	// the parts match.
	Minimatch.prototype.matchOne = function (file, pattern, partial) {
	  var options = this.options;

	  this.debug('matchOne',
	    { 'this': this, file: file, pattern: pattern });

	  this.debug('matchOne', file.length, pattern.length);

	  for (var fi = 0,
	      pi = 0,
	      fl = file.length,
	      pl = pattern.length
	      ; (fi < fl) && (pi < pl)
	      ; fi++, pi++) {
	    this.debug('matchOne loop');
	    var p = pattern[pi];
	    var f = file[fi];

	    this.debug(pattern, p, f);

	    // should be impossible.
	    // some invalid regexp stuff in the set.
	    if (p === false) return false

	    if (p === GLOBSTAR) {
	      this.debug('GLOBSTAR', [pattern, p, f]);

	      // "**"
	      // a/**/b/**/c would match the following:
	      // a/b/x/y/z/c
	      // a/x/y/z/b/c
	      // a/b/x/b/x/c
	      // a/b/c
	      // To do this, take the rest of the pattern after
	      // the **, and see if it would match the file remainder.
	      // If so, return success.
	      // If not, the ** "swallows" a segment, and try again.
	      // This is recursively awful.
	      //
	      // a/**/b/**/c matching a/b/x/y/z/c
	      // - a matches a
	      // - doublestar
	      //   - matchOne(b/x/y/z/c, b/**/c)
	      //     - b matches b
	      //     - doublestar
	      //       - matchOne(x/y/z/c, c) -> no
	      //       - matchOne(y/z/c, c) -> no
	      //       - matchOne(z/c, c) -> no
	      //       - matchOne(c, c) yes, hit
	      var fr = fi;
	      var pr = pi + 1;
	      if (pr === pl) {
	        this.debug('** at the end');
	        // a ** at the end will just swallow the rest.
	        // We have found a match.
	        // however, it will not swallow /.x, unless
	        // options.dot is set.
	        // . and .. are *never* matched by **, for explosively
	        // exponential reasons.
	        for (; fi < fl; fi++) {
	          if (file[fi] === '.' || file[fi] === '..' ||
	            (!options.dot && file[fi].charAt(0) === '.')) return false
	        }
	        return true
	      }

	      // ok, let's see if we can swallow whatever we can.
	      while (fr < fl) {
	        var swallowee = file[fr];

	        this.debug('\nglobstar while', file, fr, pattern, pr, swallowee);

	        // XXX remove this slice.  Just pass the start index.
	        if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
	          this.debug('globstar found match!', fr, fl, swallowee);
	          // found a match.
	          return true
	        } else {
	          // can't swallow "." or ".." ever.
	          // can only swallow ".foo" when explicitly asked.
	          if (swallowee === '.' || swallowee === '..' ||
	            (!options.dot && swallowee.charAt(0) === '.')) {
	            this.debug('dot detected!', file, fr, pattern, pr);
	            break
	          }

	          // ** swallows a segment, and continue.
	          this.debug('globstar swallow a segment, and continue');
	          fr++;
	        }
	      }

	      // no match was found.
	      // However, in partial mode, we can't say this is necessarily over.
	      // If there's more *pattern* left, then
	      if (partial) {
	        // ran out of file
	        this.debug('\n>>> no match, partial?', file, fr, pattern, pr);
	        if (fr === fl) return true
	      }
	      return false
	    }

	    // something other than **
	    // non-magic patterns just have to match exactly
	    // patterns with magic have been turned into regexps.
	    var hit;
	    if (typeof p === 'string') {
	      if (options.nocase) {
	        hit = f.toLowerCase() === p.toLowerCase();
	      } else {
	        hit = f === p;
	      }
	      this.debug('string match', p, f, hit);
	    } else {
	      hit = f.match(p);
	      this.debug('pattern match', p, f, hit);
	    }

	    if (!hit) return false
	  }

	  // Note: ending in / means that we'll get a final ""
	  // at the end of the pattern.  This can only match a
	  // corresponding "" at the end of the file.
	  // If the file ends in /, then it can only match a
	  // a pattern that ends in /, unless the pattern just
	  // doesn't have any more for it. But, a/b/ should *not*
	  // match "a/b/*", even though "" matches against the
	  // [^/]*? pattern, except in partial mode, where it might
	  // simply not be reached yet.
	  // However, a/b/ should still satisfy a/*

	  // now either we fell off the end of the pattern, or we're done.
	  if (fi === fl && pi === pl) {
	    // ran out of pattern and filename at the same time.
	    // an exact hit!
	    return true
	  } else if (fi === fl) {
	    // ran out of file, but still had pattern left.
	    // this is ok if we're doing the match as part of
	    // a glob fs traversal.
	    return partial
	  } else if (pi === pl) {
	    // ran out of pattern, still have file left.
	    // this is only acceptable if we're on the very last
	    // empty segment of a file with a trailing slash.
	    // a/* should match a/b/
	    var emptyFileEnd = (fi === fl - 1) && (file[fi] === '');
	    return emptyFileEnd
	  }

	  // should be unreachable.
	  throw new Error('wtf?')
	};

	// replace stuff like \* with *
	function globUnescape (s) {
	  return s.replace(/\\(.)/g, '$1')
	}

	function regExpEscape (s) {
	  return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
	}

	var inherits_browser = createCommonjsModule(function (module) {
	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor;
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor;
	    var TempCtor = function () {};
	    TempCtor.prototype = superCtor.prototype;
	    ctor.prototype = new TempCtor();
	    ctor.prototype.constructor = ctor;
	  };
	}
	});

	var inherits = createCommonjsModule(function (module) {
	try {
	  var util$$1 = util;
	  if (typeof util$$1.inherits !== 'function') throw '';
	  module.exports = util$$1.inherits;
	} catch (e) {
	  module.exports = inherits_browser;
	}
	});

	function posix(path) {
		return path.charAt(0) === '/';
	}

	function win32(path) {
		// https://github.com/nodejs/node/blob/b3fcc245fb25539909ef1d5eaa01dbf92e168633/lib/path.js#L56
		var splitDeviceRe = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;
		var result = splitDeviceRe.exec(path);
		var device = result[1] || '';
		var isUnc = Boolean(device && device.charAt(1) !== ':');

		// UNC paths are always absolute
		return Boolean(result[2] || isUnc);
	}

	var pathIsAbsolute = process.platform === 'win32' ? win32 : posix;
	var posix_1 = posix;
	var win32_1 = win32;
	pathIsAbsolute.posix = posix_1;
	pathIsAbsolute.win32 = win32_1;

	var alphasort_1 = alphasort;
	var alphasorti_1 = alphasorti;
	var setopts_1 = setopts;
	var ownProp_1 = ownProp;
	var makeAbs_1 = makeAbs;
	var finish_1 = finish;
	var mark_1 = mark;
	var isIgnored_1 = isIgnored;
	var childrenIgnored_1 = childrenIgnored;

	function ownProp (obj, field) {
	  return Object.prototype.hasOwnProperty.call(obj, field)
	}




	var Minimatch$1 = minimatch_1.Minimatch;

	function alphasorti (a, b) {
	  return a.toLowerCase().localeCompare(b.toLowerCase())
	}

	function alphasort (a, b) {
	  return a.localeCompare(b)
	}

	function setupIgnores (self, options) {
	  self.ignore = options.ignore || [];

	  if (!Array.isArray(self.ignore))
	    self.ignore = [self.ignore];

	  if (self.ignore.length) {
	    self.ignore = self.ignore.map(ignoreMap);
	  }
	}

	// ignore patterns are always in dot:true mode.
	function ignoreMap (pattern) {
	  var gmatcher = null;
	  if (pattern.slice(-3) === '/**') {
	    var gpattern = pattern.replace(/(\/\*\*)+$/, '');
	    gmatcher = new Minimatch$1(gpattern, { dot: true });
	  }

	  return {
	    matcher: new Minimatch$1(pattern, { dot: true }),
	    gmatcher: gmatcher
	  }
	}

	function setopts (self, pattern, options) {
	  if (!options)
	    options = {};

	  // base-matching: just use globstar for that.
	  if (options.matchBase && -1 === pattern.indexOf("/")) {
	    if (options.noglobstar) {
	      throw new Error("base matching requires globstar")
	    }
	    pattern = "**/" + pattern;
	  }

	  self.silent = !!options.silent;
	  self.pattern = pattern;
	  self.strict = options.strict !== false;
	  self.realpath = !!options.realpath;
	  self.realpathCache = options.realpathCache || Object.create(null);
	  self.follow = !!options.follow;
	  self.dot = !!options.dot;
	  self.mark = !!options.mark;
	  self.nodir = !!options.nodir;
	  if (self.nodir)
	    self.mark = true;
	  self.sync = !!options.sync;
	  self.nounique = !!options.nounique;
	  self.nonull = !!options.nonull;
	  self.nosort = !!options.nosort;
	  self.nocase = !!options.nocase;
	  self.stat = !!options.stat;
	  self.noprocess = !!options.noprocess;
	  self.absolute = !!options.absolute;

	  self.maxLength = options.maxLength || Infinity;
	  self.cache = options.cache || Object.create(null);
	  self.statCache = options.statCache || Object.create(null);
	  self.symlinks = options.symlinks || Object.create(null);

	  setupIgnores(self, options);

	  self.changedCwd = false;
	  var cwd = process.cwd();
	  if (!ownProp(options, "cwd"))
	    self.cwd = cwd;
	  else {
	    self.cwd = pathModule.resolve(options.cwd);
	    self.changedCwd = self.cwd !== cwd;
	  }

	  self.root = options.root || pathModule.resolve(self.cwd, "/");
	  self.root = pathModule.resolve(self.root);
	  if (process.platform === "win32")
	    self.root = self.root.replace(/\\/g, "/");

	  // TODO: is an absolute `cwd` supposed to be resolved against `root`?
	  // e.g. { cwd: '/test', root: __dirname } === path.join(__dirname, '/test')
	  self.cwdAbs = pathIsAbsolute(self.cwd) ? self.cwd : makeAbs(self, self.cwd);
	  if (process.platform === "win32")
	    self.cwdAbs = self.cwdAbs.replace(/\\/g, "/");
	  self.nomount = !!options.nomount;

	  // disable comments and negation in Minimatch.
	  // Note that they are not supported in Glob itself anyway.
	  options.nonegate = true;
	  options.nocomment = true;

	  self.minimatch = new Minimatch$1(pattern, options);
	  self.options = self.minimatch.options;
	}

	function finish (self) {
	  var nou = self.nounique;
	  var all = nou ? [] : Object.create(null);

	  for (var i = 0, l = self.matches.length; i < l; i ++) {
	    var matches = self.matches[i];
	    if (!matches || Object.keys(matches).length === 0) {
	      if (self.nonull) {
	        // do like the shell, and spit out the literal glob
	        var literal = self.minimatch.globSet[i];
	        if (nou)
	          all.push(literal);
	        else
	          all[literal] = true;
	      }
	    } else {
	      // had matches
	      var m = Object.keys(matches);
	      if (nou)
	        all.push.apply(all, m);
	      else
	        m.forEach(function (m) {
	          all[m] = true;
	        });
	    }
	  }

	  if (!nou)
	    all = Object.keys(all);

	  if (!self.nosort)
	    all = all.sort(self.nocase ? alphasorti : alphasort);

	  // at *some* point we statted all of these
	  if (self.mark) {
	    for (var i = 0; i < all.length; i++) {
	      all[i] = self._mark(all[i]);
	    }
	    if (self.nodir) {
	      all = all.filter(function (e) {
	        var notDir = !(/\/$/.test(e));
	        var c = self.cache[e] || self.cache[makeAbs(self, e)];
	        if (notDir && c)
	          notDir = c !== 'DIR' && !Array.isArray(c);
	        return notDir
	      });
	    }
	  }

	  if (self.ignore.length)
	    all = all.filter(function(m) {
	      return !isIgnored(self, m)
	    });

	  self.found = all;
	}

	function mark (self, p) {
	  var abs = makeAbs(self, p);
	  var c = self.cache[abs];
	  var m = p;
	  if (c) {
	    var isDir = c === 'DIR' || Array.isArray(c);
	    var slash = p.slice(-1) === '/';

	    if (isDir && !slash)
	      m += '/';
	    else if (!isDir && slash)
	      m = m.slice(0, -1);

	    if (m !== p) {
	      var mabs = makeAbs(self, m);
	      self.statCache[mabs] = self.statCache[abs];
	      self.cache[mabs] = self.cache[abs];
	    }
	  }

	  return m
	}

	// lotta situps...
	function makeAbs (self, f) {
	  var abs = f;
	  if (f.charAt(0) === '/') {
	    abs = pathModule.join(self.root, f);
	  } else if (pathIsAbsolute(f) || f === '') {
	    abs = f;
	  } else if (self.changedCwd) {
	    abs = pathModule.resolve(self.cwd, f);
	  } else {
	    abs = pathModule.resolve(f);
	  }

	  if (process.platform === 'win32')
	    abs = abs.replace(/\\/g, '/');

	  return abs
	}


	// Return true, if pattern ends with globstar '**', for the accompanying parent directory.
	// Ex:- If node_modules/** is the pattern, add 'node_modules' to ignore list along with it's contents
	function isIgnored (self, path) {
	  if (!self.ignore.length)
	    return false

	  return self.ignore.some(function(item) {
	    return item.matcher.match(path) || !!(item.gmatcher && item.gmatcher.match(path))
	  })
	}

	function childrenIgnored (self, path) {
	  if (!self.ignore.length)
	    return false

	  return self.ignore.some(function(item) {
	    return !!(item.gmatcher && item.gmatcher.match(path))
	  })
	}

	var common = {
		alphasort: alphasort_1,
		alphasorti: alphasorti_1,
		setopts: setopts_1,
		ownProp: ownProp_1,
		makeAbs: makeAbs_1,
		finish: finish_1,
		mark: mark_1,
		isIgnored: isIgnored_1,
		childrenIgnored: childrenIgnored_1
	};

	var sync = globSync;
	globSync.GlobSync = GlobSync;
	var setopts$1 = common.setopts;
	var ownProp$1 = common.ownProp;
	var childrenIgnored$1 = common.childrenIgnored;
	var isIgnored$1 = common.isIgnored;

	function globSync (pattern, options) {
	  if (typeof options === 'function' || arguments.length === 3)
	    throw new TypeError('callback provided to sync glob\n'+
	                        'See: https://github.com/isaacs/node-glob/issues/167')

	  return new GlobSync(pattern, options).found
	}

	function GlobSync (pattern, options) {
	  if (!pattern)
	    throw new Error('must provide pattern')

	  if (typeof options === 'function' || arguments.length === 3)
	    throw new TypeError('callback provided to sync glob\n'+
	                        'See: https://github.com/isaacs/node-glob/issues/167')

	  if (!(this instanceof GlobSync))
	    return new GlobSync(pattern, options)

	  setopts$1(this, pattern, options);

	  if (this.noprocess)
	    return this

	  var n = this.minimatch.set.length;
	  this.matches = new Array(n);
	  for (var i = 0; i < n; i ++) {
	    this._process(this.minimatch.set[i], i, false);
	  }
	  this._finish();
	}

	GlobSync.prototype._finish = function () {
	  assert(this instanceof GlobSync);
	  if (this.realpath) {
	    var self = this;
	    this.matches.forEach(function (matchset, index) {
	      var set = self.matches[index] = Object.create(null);
	      for (var p in matchset) {
	        try {
	          p = self._makeAbs(p);
	          var real = fs_realpath.realpathSync(p, self.realpathCache);
	          set[real] = true;
	        } catch (er) {
	          if (er.syscall === 'stat')
	            set[self._makeAbs(p)] = true;
	          else
	            throw er
	        }
	      }
	    });
	  }
	  common.finish(this);
	};


	GlobSync.prototype._process = function (pattern, index, inGlobStar) {
	  assert(this instanceof GlobSync);

	  // Get the first [n] parts of pattern that are all strings.
	  var n = 0;
	  while (typeof pattern[n] === 'string') {
	    n ++;
	  }
	  // now n is the index of the first one that is *not* a string.

	  // See if there's anything else
	  var prefix;
	  switch (n) {
	    // if not, then this is rather simple
	    case pattern.length:
	      this._processSimple(pattern.join('/'), index);
	      return

	    case 0:
	      // pattern *starts* with some non-trivial item.
	      // going to readdir(cwd), but not include the prefix in matches.
	      prefix = null;
	      break

	    default:
	      // pattern has some string bits in the front.
	      // whatever it starts with, whether that's 'absolute' like /foo/bar,
	      // or 'relative' like '../baz'
	      prefix = pattern.slice(0, n).join('/');
	      break
	  }

	  var remain = pattern.slice(n);

	  // get the list of entries.
	  var read;
	  if (prefix === null)
	    read = '.';
	  else if (pathIsAbsolute(prefix) || pathIsAbsolute(pattern.join('/'))) {
	    if (!prefix || !pathIsAbsolute(prefix))
	      prefix = '/' + prefix;
	    read = prefix;
	  } else
	    read = prefix;

	  var abs = this._makeAbs(read);

	  //if ignored, skip processing
	  if (childrenIgnored$1(this, read))
	    return

	  var isGlobStar = remain[0] === minimatch_1.GLOBSTAR;
	  if (isGlobStar)
	    this._processGlobStar(prefix, read, abs, remain, index, inGlobStar);
	  else
	    this._processReaddir(prefix, read, abs, remain, index, inGlobStar);
	};


	GlobSync.prototype._processReaddir = function (prefix, read, abs, remain, index, inGlobStar) {
	  var entries = this._readdir(abs, inGlobStar);

	  // if the abs isn't a dir, then nothing can match!
	  if (!entries)
	    return

	  // It will only match dot entries if it starts with a dot, or if
	  // dot is set.  Stuff like @(.foo|.bar) isn't allowed.
	  var pn = remain[0];
	  var negate = !!this.minimatch.negate;
	  var rawGlob = pn._glob;
	  var dotOk = this.dot || rawGlob.charAt(0) === '.';

	  var matchedEntries = [];
	  for (var i = 0; i < entries.length; i++) {
	    var e = entries[i];
	    if (e.charAt(0) !== '.' || dotOk) {
	      var m;
	      if (negate && !prefix) {
	        m = !e.match(pn);
	      } else {
	        m = e.match(pn);
	      }
	      if (m)
	        matchedEntries.push(e);
	    }
	  }

	  var len = matchedEntries.length;
	  // If there are no matched entries, then nothing matches.
	  if (len === 0)
	    return

	  // if this is the last remaining pattern bit, then no need for
	  // an additional stat *unless* the user has specified mark or
	  // stat explicitly.  We know they exist, since readdir returned
	  // them.

	  if (remain.length === 1 && !this.mark && !this.stat) {
	    if (!this.matches[index])
	      this.matches[index] = Object.create(null);

	    for (var i = 0; i < len; i ++) {
	      var e = matchedEntries[i];
	      if (prefix) {
	        if (prefix.slice(-1) !== '/')
	          e = prefix + '/' + e;
	        else
	          e = prefix + e;
	      }

	      if (e.charAt(0) === '/' && !this.nomount) {
	        e = pathModule.join(this.root, e);
	      }
	      this._emitMatch(index, e);
	    }
	    // This was the last one, and no stats were needed
	    return
	  }

	  // now test all matched entries as stand-ins for that part
	  // of the pattern.
	  remain.shift();
	  for (var i = 0; i < len; i ++) {
	    var e = matchedEntries[i];
	    var newPattern;
	    if (prefix)
	      newPattern = [prefix, e];
	    else
	      newPattern = [e];
	    this._process(newPattern.concat(remain), index, inGlobStar);
	  }
	};


	GlobSync.prototype._emitMatch = function (index, e) {
	  if (isIgnored$1(this, e))
	    return

	  var abs = this._makeAbs(e);

	  if (this.mark)
	    e = this._mark(e);

	  if (this.absolute) {
	    e = abs;
	  }

	  if (this.matches[index][e])
	    return

	  if (this.nodir) {
	    var c = this.cache[abs];
	    if (c === 'DIR' || Array.isArray(c))
	      return
	  }

	  this.matches[index][e] = true;

	  if (this.stat)
	    this._stat(e);
	};


	GlobSync.prototype._readdirInGlobStar = function (abs) {
	  // follow all symlinked directories forever
	  // just proceed as if this is a non-globstar situation
	  if (this.follow)
	    return this._readdir(abs, false)

	  var entries;
	  var lstat;
	  try {
	    lstat = fs.lstatSync(abs);
	  } catch (er) {
	    if (er.code === 'ENOENT') {
	      // lstat failed, doesn't exist
	      return null
	    }
	  }

	  var isSym = lstat && lstat.isSymbolicLink();
	  this.symlinks[abs] = isSym;

	  // If it's not a symlink or a dir, then it's definitely a regular file.
	  // don't bother doing a readdir in that case.
	  if (!isSym && lstat && !lstat.isDirectory())
	    this.cache[abs] = 'FILE';
	  else
	    entries = this._readdir(abs, false);

	  return entries
	};

	GlobSync.prototype._readdir = function (abs, inGlobStar) {

	  if (inGlobStar && !ownProp$1(this.symlinks, abs))
	    return this._readdirInGlobStar(abs)

	  if (ownProp$1(this.cache, abs)) {
	    var c = this.cache[abs];
	    if (!c || c === 'FILE')
	      return null

	    if (Array.isArray(c))
	      return c
	  }

	  try {
	    return this._readdirEntries(abs, fs.readdirSync(abs))
	  } catch (er) {
	    this._readdirError(abs, er);
	    return null
	  }
	};

	GlobSync.prototype._readdirEntries = function (abs, entries) {
	  // if we haven't asked to stat everything, then just
	  // assume that everything in there exists, so we can avoid
	  // having to stat it a second time.
	  if (!this.mark && !this.stat) {
	    for (var i = 0; i < entries.length; i ++) {
	      var e = entries[i];
	      if (abs === '/')
	        e = abs + e;
	      else
	        e = abs + '/' + e;
	      this.cache[e] = true;
	    }
	  }

	  this.cache[abs] = entries;

	  // mark and cache dir-ness
	  return entries
	};

	GlobSync.prototype._readdirError = function (f, er) {
	  // handle errors, and cache the information
	  switch (er.code) {
	    case 'ENOTSUP': // https://github.com/isaacs/node-glob/issues/205
	    case 'ENOTDIR': // totally normal. means it *does* exist.
	      var abs = this._makeAbs(f);
	      this.cache[abs] = 'FILE';
	      if (abs === this.cwdAbs) {
	        var error = new Error(er.code + ' invalid cwd ' + this.cwd);
	        error.path = this.cwd;
	        error.code = er.code;
	        throw error
	      }
	      break

	    case 'ENOENT': // not terribly unusual
	    case 'ELOOP':
	    case 'ENAMETOOLONG':
	    case 'UNKNOWN':
	      this.cache[this._makeAbs(f)] = false;
	      break

	    default: // some unusual error.  Treat as failure.
	      this.cache[this._makeAbs(f)] = false;
	      if (this.strict)
	        throw er
	      if (!this.silent)
	        console.error('glob error', er);
	      break
	  }
	};

	GlobSync.prototype._processGlobStar = function (prefix, read, abs, remain, index, inGlobStar) {

	  var entries = this._readdir(abs, inGlobStar);

	  // no entries means not a dir, so it can never have matches
	  // foo.txt/** doesn't match foo.txt
	  if (!entries)
	    return

	  // test without the globstar, and with every child both below
	  // and replacing the globstar.
	  var remainWithoutGlobStar = remain.slice(1);
	  var gspref = prefix ? [ prefix ] : [];
	  var noGlobStar = gspref.concat(remainWithoutGlobStar);

	  // the noGlobStar pattern exits the inGlobStar state
	  this._process(noGlobStar, index, false);

	  var len = entries.length;
	  var isSym = this.symlinks[abs];

	  // If it's a symlink, and we're in a globstar, then stop
	  if (isSym && inGlobStar)
	    return

	  for (var i = 0; i < len; i++) {
	    var e = entries[i];
	    if (e.charAt(0) === '.' && !this.dot)
	      continue

	    // these two cases enter the inGlobStar state
	    var instead = gspref.concat(entries[i], remainWithoutGlobStar);
	    this._process(instead, index, true);

	    var below = gspref.concat(entries[i], remain);
	    this._process(below, index, true);
	  }
	};

	GlobSync.prototype._processSimple = function (prefix, index) {
	  // XXX review this.  Shouldn't it be doing the mounting etc
	  // before doing stat?  kinda weird?
	  var exists = this._stat(prefix);

	  if (!this.matches[index])
	    this.matches[index] = Object.create(null);

	  // If it doesn't exist, then just mark the lack of results
	  if (!exists)
	    return

	  if (prefix && pathIsAbsolute(prefix) && !this.nomount) {
	    var trail = /[\/\\]$/.test(prefix);
	    if (prefix.charAt(0) === '/') {
	      prefix = pathModule.join(this.root, prefix);
	    } else {
	      prefix = pathModule.resolve(this.root, prefix);
	      if (trail)
	        prefix += '/';
	    }
	  }

	  if (process.platform === 'win32')
	    prefix = prefix.replace(/\\/g, '/');

	  // Mark this as a match
	  this._emitMatch(index, prefix);
	};

	// Returns either 'DIR', 'FILE', or false
	GlobSync.prototype._stat = function (f) {
	  var abs = this._makeAbs(f);
	  var needDir = f.slice(-1) === '/';

	  if (f.length > this.maxLength)
	    return false

	  if (!this.stat && ownProp$1(this.cache, abs)) {
	    var c = this.cache[abs];

	    if (Array.isArray(c))
	      c = 'DIR';

	    // It exists, but maybe not how we need it
	    if (!needDir || c === 'DIR')
	      return c

	    if (needDir && c === 'FILE')
	      return false

	    // otherwise we have to stat, because maybe c=true
	    // if we know it exists, but not what it is.
	  }
	  var stat = this.statCache[abs];
	  if (!stat) {
	    var lstat;
	    try {
	      lstat = fs.lstatSync(abs);
	    } catch (er) {
	      if (er && (er.code === 'ENOENT' || er.code === 'ENOTDIR')) {
	        this.statCache[abs] = false;
	        return false
	      }
	    }

	    if (lstat && lstat.isSymbolicLink()) {
	      try {
	        stat = fs.statSync(abs);
	      } catch (er) {
	        stat = lstat;
	      }
	    } else {
	      stat = lstat;
	    }
	  }

	  this.statCache[abs] = stat;

	  var c = true;
	  if (stat)
	    c = stat.isDirectory() ? 'DIR' : 'FILE';

	  this.cache[abs] = this.cache[abs] || c;

	  if (needDir && c === 'FILE')
	    return false

	  return c
	};

	GlobSync.prototype._mark = function (p) {
	  return common.mark(this, p)
	};

	GlobSync.prototype._makeAbs = function (f) {
	  return common.makeAbs(this, f)
	};

	// Returns a wrapper function that returns a wrapped callback
	// The wrapper function should do some stuff, and return a
	// presumably different callback function.
	// This makes sure that own properties are retained, so that
	// decorations and such are not lost along the way.
	var wrappy_1 = wrappy;
	function wrappy (fn, cb) {
	  if (fn && cb) return wrappy(fn)(cb)

	  if (typeof fn !== 'function')
	    throw new TypeError('need wrapper function')

	  Object.keys(fn).forEach(function (k) {
	    wrapper[k] = fn[k];
	  });

	  return wrapper

	  function wrapper() {
	    var args = new Array(arguments.length);
	    for (var i = 0; i < args.length; i++) {
	      args[i] = arguments[i];
	    }
	    var ret = fn.apply(this, args);
	    var cb = args[args.length-1];
	    if (typeof ret === 'function' && ret !== cb) {
	      Object.keys(cb).forEach(function (k) {
	        ret[k] = cb[k];
	      });
	    }
	    return ret
	  }
	}

	var once_1 = wrappy_1(once);
	var strict = wrappy_1(onceStrict);

	once.proto = once(function () {
	  Object.defineProperty(Function.prototype, 'once', {
	    value: function () {
	      return once(this)
	    },
	    configurable: true
	  });

	  Object.defineProperty(Function.prototype, 'onceStrict', {
	    value: function () {
	      return onceStrict(this)
	    },
	    configurable: true
	  });
	});

	function once (fn) {
	  var f = function () {
	    if (f.called) return f.value
	    f.called = true;
	    return f.value = fn.apply(this, arguments)
	  };
	  f.called = false;
	  return f
	}

	function onceStrict (fn) {
	  var f = function () {
	    if (f.called)
	      throw new Error(f.onceError)
	    f.called = true;
	    return f.value = fn.apply(this, arguments)
	  };
	  var name = fn.name || 'Function wrapped with `once`';
	  f.onceError = name + " shouldn't be called more than once";
	  f.called = false;
	  return f
	}
	once_1.strict = strict;

	var reqs = Object.create(null);


	var inflight_1 = wrappy_1(inflight);

	function inflight (key, cb) {
	  if (reqs[key]) {
	    reqs[key].push(cb);
	    return null
	  } else {
	    reqs[key] = [cb];
	    return makeres(key)
	  }
	}

	function makeres (key) {
	  return once_1(function RES () {
	    var cbs = reqs[key];
	    var len = cbs.length;
	    var args = slice(arguments);

	    // XXX It's somewhat ambiguous whether a new callback added in this
	    // pass should be queued for later execution if something in the
	    // list of callbacks throws, or if it should just be discarded.
	    // However, it's such an edge case that it hardly matters, and either
	    // choice is likely as surprising as the other.
	    // As it happens, we do go ahead and schedule it for later execution.
	    try {
	      for (var i = 0; i < len; i++) {
	        cbs[i].apply(null, args);
	      }
	    } finally {
	      if (cbs.length > len) {
	        // added more in the interim.
	        // de-zalgo, just in case, but don't call again.
	        cbs.splice(0, len);
	        process.nextTick(function () {
	          RES.apply(null, args);
	        });
	      } else {
	        delete reqs[key];
	      }
	    }
	  })
	}

	function slice (args) {
	  var length = args.length;
	  var array = [];

	  for (var i = 0; i < length; i++) array[i] = args[i];
	  return array
	}

	// Approach:
	//
	// 1. Get the minimatch set
	// 2. For each pattern in the set, PROCESS(pattern, false)
	// 3. Store matches per-set, then uniq them
	//
	// PROCESS(pattern, inGlobStar)
	// Get the first [n] items from pattern that are all strings
	// Join these together.  This is PREFIX.
	//   If there is no more remaining, then stat(PREFIX) and
	//   add to matches if it succeeds.  END.
	//
	// If inGlobStar and PREFIX is symlink and points to dir
	//   set ENTRIES = []
	// else readdir(PREFIX) as ENTRIES
	//   If fail, END
	//
	// with ENTRIES
	//   If pattern[n] is GLOBSTAR
	//     // handle the case where the globstar match is empty
	//     // by pruning it out, and testing the resulting pattern
	//     PROCESS(pattern[0..n] + pattern[n+1 .. $], false)
	//     // handle other cases.
	//     for ENTRY in ENTRIES (not dotfiles)
	//       // attach globstar + tail onto the entry
	//       // Mark that this entry is a globstar match
	//       PROCESS(pattern[0..n] + ENTRY + pattern[n .. $], true)
	//
	//   else // not globstar
	//     for ENTRY in ENTRIES (not dotfiles, unless pattern[n] is dot)
	//       Test ENTRY against pattern[n]
	//       If fails, continue
	//       If passes, PROCESS(pattern[0..n] + item + pattern[n+1 .. $])
	//
	// Caveat:
	//   Cache all stats and readdirs results to minimize syscall.  Since all
	//   we ever care about is existence and directory-ness, we can just keep
	//   `true` for files, and [children,...] for directories, or `false` for
	//   things that don't exist.

	var glob_1 = glob;

	var EE = events.EventEmitter;
	var setopts$2 = common.setopts;
	var ownProp$2 = common.ownProp;


	var childrenIgnored$2 = common.childrenIgnored;
	var isIgnored$2 = common.isIgnored;



	function glob (pattern, options, cb) {
	  if (typeof options === 'function') cb = options, options = {};
	  if (!options) options = {};

	  if (options.sync) {
	    if (cb)
	      throw new TypeError('callback provided to sync glob')
	    return sync(pattern, options)
	  }

	  return new Glob$1(pattern, options, cb)
	}

	glob.sync = sync;
	var GlobSync$1 = glob.GlobSync = sync.GlobSync;

	// old api surface
	glob.glob = glob;

	function extend (origin, add) {
	  if (add === null || typeof add !== 'object') {
	    return origin
	  }

	  var keys = Object.keys(add);
	  var i = keys.length;
	  while (i--) {
	    origin[keys[i]] = add[keys[i]];
	  }
	  return origin
	}

	glob.hasMagic = function (pattern, options_) {
	  var options = extend({}, options_);
	  options.noprocess = true;

	  var g = new Glob$1(pattern, options);
	  var set = g.minimatch.set;

	  if (!pattern)
	    return false

	  if (set.length > 1)
	    return true

	  for (var j = 0; j < set[0].length; j++) {
	    if (typeof set[0][j] !== 'string')
	      return true
	  }

	  return false
	};

	glob.Glob = Glob$1;
	inherits(Glob$1, EE);
	function Glob$1 (pattern, options, cb) {
	  if (typeof options === 'function') {
	    cb = options;
	    options = null;
	  }

	  if (options && options.sync) {
	    if (cb)
	      throw new TypeError('callback provided to sync glob')
	    return new GlobSync$1(pattern, options)
	  }

	  if (!(this instanceof Glob$1))
	    return new Glob$1(pattern, options, cb)

	  setopts$2(this, pattern, options);
	  this._didRealPath = false;

	  // process each pattern in the minimatch set
	  var n = this.minimatch.set.length;

	  // The matches are stored as {<filename>: true,...} so that
	  // duplicates are automagically pruned.
	  // Later, we do an Object.keys() on these.
	  // Keep them as a list so we can fill in when nonull is set.
	  this.matches = new Array(n);

	  if (typeof cb === 'function') {
	    cb = once_1(cb);
	    this.on('error', cb);
	    this.on('end', function (matches) {
	      cb(null, matches);
	    });
	  }

	  var self = this;
	  this._processing = 0;

	  this._emitQueue = [];
	  this._processQueue = [];
	  this.paused = false;

	  if (this.noprocess)
	    return this

	  if (n === 0)
	    return done()

	  var sync$$1 = true;
	  for (var i = 0; i < n; i ++) {
	    this._process(this.minimatch.set[i], i, false, done);
	  }
	  sync$$1 = false;

	  function done () {
	    --self._processing;
	    if (self._processing <= 0) {
	      if (sync$$1) {
	        process.nextTick(function () {
	          self._finish();
	        });
	      } else {
	        self._finish();
	      }
	    }
	  }
	}

	Glob$1.prototype._finish = function () {
	  assert(this instanceof Glob$1);
	  if (this.aborted)
	    return

	  if (this.realpath && !this._didRealpath)
	    return this._realpath()

	  common.finish(this);
	  this.emit('end', this.found);
	};

	Glob$1.prototype._realpath = function () {
	  if (this._didRealpath)
	    return

	  this._didRealpath = true;

	  var n = this.matches.length;
	  if (n === 0)
	    return this._finish()

	  var self = this;
	  for (var i = 0; i < this.matches.length; i++)
	    this._realpathSet(i, next);

	  function next () {
	    if (--n === 0)
	      self._finish();
	  }
	};

	Glob$1.prototype._realpathSet = function (index, cb) {
	  var matchset = this.matches[index];
	  if (!matchset)
	    return cb()

	  var found = Object.keys(matchset);
	  var self = this;
	  var n = found.length;

	  if (n === 0)
	    return cb()

	  var set = this.matches[index] = Object.create(null);
	  found.forEach(function (p, i) {
	    // If there's a problem with the stat, then it means that
	    // one or more of the links in the realpath couldn't be
	    // resolved.  just return the abs value in that case.
	    p = self._makeAbs(p);
	    fs_realpath.realpath(p, self.realpathCache, function (er, real) {
	      if (!er)
	        set[real] = true;
	      else if (er.syscall === 'stat')
	        set[p] = true;
	      else
	        self.emit('error', er); // srsly wtf right here

	      if (--n === 0) {
	        self.matches[index] = set;
	        cb();
	      }
	    });
	  });
	};

	Glob$1.prototype._mark = function (p) {
	  return common.mark(this, p)
	};

	Glob$1.prototype._makeAbs = function (f) {
	  return common.makeAbs(this, f)
	};

	Glob$1.prototype.abort = function () {
	  this.aborted = true;
	  this.emit('abort');
	};

	Glob$1.prototype.pause = function () {
	  if (!this.paused) {
	    this.paused = true;
	    this.emit('pause');
	  }
	};

	Glob$1.prototype.resume = function () {
	  if (this.paused) {
	    this.emit('resume');
	    this.paused = false;
	    if (this._emitQueue.length) {
	      var eq = this._emitQueue.slice(0);
	      this._emitQueue.length = 0;
	      for (var i = 0; i < eq.length; i ++) {
	        var e = eq[i];
	        this._emitMatch(e[0], e[1]);
	      }
	    }
	    if (this._processQueue.length) {
	      var pq = this._processQueue.slice(0);
	      this._processQueue.length = 0;
	      for (var i = 0; i < pq.length; i ++) {
	        var p = pq[i];
	        this._processing--;
	        this._process(p[0], p[1], p[2], p[3]);
	      }
	    }
	  }
	};

	Glob$1.prototype._process = function (pattern, index, inGlobStar, cb) {
	  assert(this instanceof Glob$1);
	  assert(typeof cb === 'function');

	  if (this.aborted)
	    return

	  this._processing++;
	  if (this.paused) {
	    this._processQueue.push([pattern, index, inGlobStar, cb]);
	    return
	  }

	  //console.error('PROCESS %d', this._processing, pattern)

	  // Get the first [n] parts of pattern that are all strings.
	  var n = 0;
	  while (typeof pattern[n] === 'string') {
	    n ++;
	  }
	  // now n is the index of the first one that is *not* a string.

	  // see if there's anything else
	  var prefix;
	  switch (n) {
	    // if not, then this is rather simple
	    case pattern.length:
	      this._processSimple(pattern.join('/'), index, cb);
	      return

	    case 0:
	      // pattern *starts* with some non-trivial item.
	      // going to readdir(cwd), but not include the prefix in matches.
	      prefix = null;
	      break

	    default:
	      // pattern has some string bits in the front.
	      // whatever it starts with, whether that's 'absolute' like /foo/bar,
	      // or 'relative' like '../baz'
	      prefix = pattern.slice(0, n).join('/');
	      break
	  }

	  var remain = pattern.slice(n);

	  // get the list of entries.
	  var read;
	  if (prefix === null)
	    read = '.';
	  else if (pathIsAbsolute(prefix) || pathIsAbsolute(pattern.join('/'))) {
	    if (!prefix || !pathIsAbsolute(prefix))
	      prefix = '/' + prefix;
	    read = prefix;
	  } else
	    read = prefix;

	  var abs = this._makeAbs(read);

	  //if ignored, skip _processing
	  if (childrenIgnored$2(this, read))
	    return cb()

	  var isGlobStar = remain[0] === minimatch_1.GLOBSTAR;
	  if (isGlobStar)
	    this._processGlobStar(prefix, read, abs, remain, index, inGlobStar, cb);
	  else
	    this._processReaddir(prefix, read, abs, remain, index, inGlobStar, cb);
	};

	Glob$1.prototype._processReaddir = function (prefix, read, abs, remain, index, inGlobStar, cb) {
	  var self = this;
	  this._readdir(abs, inGlobStar, function (er, entries) {
	    return self._processReaddir2(prefix, read, abs, remain, index, inGlobStar, entries, cb)
	  });
	};

	Glob$1.prototype._processReaddir2 = function (prefix, read, abs, remain, index, inGlobStar, entries, cb) {

	  // if the abs isn't a dir, then nothing can match!
	  if (!entries)
	    return cb()

	  // It will only match dot entries if it starts with a dot, or if
	  // dot is set.  Stuff like @(.foo|.bar) isn't allowed.
	  var pn = remain[0];
	  var negate = !!this.minimatch.negate;
	  var rawGlob = pn._glob;
	  var dotOk = this.dot || rawGlob.charAt(0) === '.';

	  var matchedEntries = [];
	  for (var i = 0; i < entries.length; i++) {
	    var e = entries[i];
	    if (e.charAt(0) !== '.' || dotOk) {
	      var m;
	      if (negate && !prefix) {
	        m = !e.match(pn);
	      } else {
	        m = e.match(pn);
	      }
	      if (m)
	        matchedEntries.push(e);
	    }
	  }

	  //console.error('prd2', prefix, entries, remain[0]._glob, matchedEntries)

	  var len = matchedEntries.length;
	  // If there are no matched entries, then nothing matches.
	  if (len === 0)
	    return cb()

	  // if this is the last remaining pattern bit, then no need for
	  // an additional stat *unless* the user has specified mark or
	  // stat explicitly.  We know they exist, since readdir returned
	  // them.

	  if (remain.length === 1 && !this.mark && !this.stat) {
	    if (!this.matches[index])
	      this.matches[index] = Object.create(null);

	    for (var i = 0; i < len; i ++) {
	      var e = matchedEntries[i];
	      if (prefix) {
	        if (prefix !== '/')
	          e = prefix + '/' + e;
	        else
	          e = prefix + e;
	      }

	      if (e.charAt(0) === '/' && !this.nomount) {
	        e = pathModule.join(this.root, e);
	      }
	      this._emitMatch(index, e);
	    }
	    // This was the last one, and no stats were needed
	    return cb()
	  }

	  // now test all matched entries as stand-ins for that part
	  // of the pattern.
	  remain.shift();
	  for (var i = 0; i < len; i ++) {
	    var e = matchedEntries[i];
	    if (prefix) {
	      if (prefix !== '/')
	        e = prefix + '/' + e;
	      else
	        e = prefix + e;
	    }
	    this._process([e].concat(remain), index, inGlobStar, cb);
	  }
	  cb();
	};

	Glob$1.prototype._emitMatch = function (index, e) {
	  if (this.aborted)
	    return

	  if (isIgnored$2(this, e))
	    return

	  if (this.paused) {
	    this._emitQueue.push([index, e]);
	    return
	  }

	  var abs = pathIsAbsolute(e) ? e : this._makeAbs(e);

	  if (this.mark)
	    e = this._mark(e);

	  if (this.absolute)
	    e = abs;

	  if (this.matches[index][e])
	    return

	  if (this.nodir) {
	    var c = this.cache[abs];
	    if (c === 'DIR' || Array.isArray(c))
	      return
	  }

	  this.matches[index][e] = true;

	  var st = this.statCache[abs];
	  if (st)
	    this.emit('stat', e, st);

	  this.emit('match', e);
	};

	Glob$1.prototype._readdirInGlobStar = function (abs, cb) {
	  if (this.aborted)
	    return

	  // follow all symlinked directories forever
	  // just proceed as if this is a non-globstar situation
	  if (this.follow)
	    return this._readdir(abs, false, cb)

	  var lstatkey = 'lstat\0' + abs;
	  var self = this;
	  var lstatcb = inflight_1(lstatkey, lstatcb_);

	  if (lstatcb)
	    fs.lstat(abs, lstatcb);

	  function lstatcb_ (er, lstat) {
	    if (er && er.code === 'ENOENT')
	      return cb()

	    var isSym = lstat && lstat.isSymbolicLink();
	    self.symlinks[abs] = isSym;

	    // If it's not a symlink or a dir, then it's definitely a regular file.
	    // don't bother doing a readdir in that case.
	    if (!isSym && lstat && !lstat.isDirectory()) {
	      self.cache[abs] = 'FILE';
	      cb();
	    } else
	      self._readdir(abs, false, cb);
	  }
	};

	Glob$1.prototype._readdir = function (abs, inGlobStar, cb) {
	  if (this.aborted)
	    return

	  cb = inflight_1('readdir\0'+abs+'\0'+inGlobStar, cb);
	  if (!cb)
	    return

	  //console.error('RD %j %j', +inGlobStar, abs)
	  if (inGlobStar && !ownProp$2(this.symlinks, abs))
	    return this._readdirInGlobStar(abs, cb)

	  if (ownProp$2(this.cache, abs)) {
	    var c = this.cache[abs];
	    if (!c || c === 'FILE')
	      return cb()

	    if (Array.isArray(c))
	      return cb(null, c)
	  }
	  fs.readdir(abs, readdirCb(this, abs, cb));
	};

	function readdirCb (self, abs, cb) {
	  return function (er, entries) {
	    if (er)
	      self._readdirError(abs, er, cb);
	    else
	      self._readdirEntries(abs, entries, cb);
	  }
	}

	Glob$1.prototype._readdirEntries = function (abs, entries, cb) {
	  if (this.aborted)
	    return

	  // if we haven't asked to stat everything, then just
	  // assume that everything in there exists, so we can avoid
	  // having to stat it a second time.
	  if (!this.mark && !this.stat) {
	    for (var i = 0; i < entries.length; i ++) {
	      var e = entries[i];
	      if (abs === '/')
	        e = abs + e;
	      else
	        e = abs + '/' + e;
	      this.cache[e] = true;
	    }
	  }

	  this.cache[abs] = entries;
	  return cb(null, entries)
	};

	Glob$1.prototype._readdirError = function (f, er, cb) {
	  if (this.aborted)
	    return

	  // handle errors, and cache the information
	  switch (er.code) {
	    case 'ENOTSUP': // https://github.com/isaacs/node-glob/issues/205
	    case 'ENOTDIR': // totally normal. means it *does* exist.
	      var abs = this._makeAbs(f);
	      this.cache[abs] = 'FILE';
	      if (abs === this.cwdAbs) {
	        var error = new Error(er.code + ' invalid cwd ' + this.cwd);
	        error.path = this.cwd;
	        error.code = er.code;
	        this.emit('error', error);
	        this.abort();
	      }
	      break

	    case 'ENOENT': // not terribly unusual
	    case 'ELOOP':
	    case 'ENAMETOOLONG':
	    case 'UNKNOWN':
	      this.cache[this._makeAbs(f)] = false;
	      break

	    default: // some unusual error.  Treat as failure.
	      this.cache[this._makeAbs(f)] = false;
	      if (this.strict) {
	        this.emit('error', er);
	        // If the error is handled, then we abort
	        // if not, we threw out of here
	        this.abort();
	      }
	      if (!this.silent)
	        console.error('glob error', er);
	      break
	  }

	  return cb()
	};

	Glob$1.prototype._processGlobStar = function (prefix, read, abs, remain, index, inGlobStar, cb) {
	  var self = this;
	  this._readdir(abs, inGlobStar, function (er, entries) {
	    self._processGlobStar2(prefix, read, abs, remain, index, inGlobStar, entries, cb);
	  });
	};


	Glob$1.prototype._processGlobStar2 = function (prefix, read, abs, remain, index, inGlobStar, entries, cb) {
	  //console.error('pgs2', prefix, remain[0], entries)

	  // no entries means not a dir, so it can never have matches
	  // foo.txt/** doesn't match foo.txt
	  if (!entries)
	    return cb()

	  // test without the globstar, and with every child both below
	  // and replacing the globstar.
	  var remainWithoutGlobStar = remain.slice(1);
	  var gspref = prefix ? [ prefix ] : [];
	  var noGlobStar = gspref.concat(remainWithoutGlobStar);

	  // the noGlobStar pattern exits the inGlobStar state
	  this._process(noGlobStar, index, false, cb);

	  var isSym = this.symlinks[abs];
	  var len = entries.length;

	  // If it's a symlink, and we're in a globstar, then stop
	  if (isSym && inGlobStar)
	    return cb()

	  for (var i = 0; i < len; i++) {
	    var e = entries[i];
	    if (e.charAt(0) === '.' && !this.dot)
	      continue

	    // these two cases enter the inGlobStar state
	    var instead = gspref.concat(entries[i], remainWithoutGlobStar);
	    this._process(instead, index, true, cb);

	    var below = gspref.concat(entries[i], remain);
	    this._process(below, index, true, cb);
	  }

	  cb();
	};

	Glob$1.prototype._processSimple = function (prefix, index, cb) {
	  // XXX review this.  Shouldn't it be doing the mounting etc
	  // before doing stat?  kinda weird?
	  var self = this;
	  this._stat(prefix, function (er, exists) {
	    self._processSimple2(prefix, index, er, exists, cb);
	  });
	};
	Glob$1.prototype._processSimple2 = function (prefix, index, er, exists, cb) {

	  //console.error('ps2', prefix, exists)

	  if (!this.matches[index])
	    this.matches[index] = Object.create(null);

	  // If it doesn't exist, then just mark the lack of results
	  if (!exists)
	    return cb()

	  if (prefix && pathIsAbsolute(prefix) && !this.nomount) {
	    var trail = /[\/\\]$/.test(prefix);
	    if (prefix.charAt(0) === '/') {
	      prefix = pathModule.join(this.root, prefix);
	    } else {
	      prefix = pathModule.resolve(this.root, prefix);
	      if (trail)
	        prefix += '/';
	    }
	  }

	  if (process.platform === 'win32')
	    prefix = prefix.replace(/\\/g, '/');

	  // Mark this as a match
	  this._emitMatch(index, prefix);
	  cb();
	};

	// Returns either 'DIR', 'FILE', or false
	Glob$1.prototype._stat = function (f, cb) {
	  var abs = this._makeAbs(f);
	  var needDir = f.slice(-1) === '/';

	  if (f.length > this.maxLength)
	    return cb()

	  if (!this.stat && ownProp$2(this.cache, abs)) {
	    var c = this.cache[abs];

	    if (Array.isArray(c))
	      c = 'DIR';

	    // It exists, but maybe not how we need it
	    if (!needDir || c === 'DIR')
	      return cb(null, c)

	    if (needDir && c === 'FILE')
	      return cb()

	    // otherwise we have to stat, because maybe c=true
	    // if we know it exists, but not what it is.
	  }
	  var stat = this.statCache[abs];
	  if (stat !== undefined) {
	    if (stat === false)
	      return cb(null, stat)
	    else {
	      var type = stat.isDirectory() ? 'DIR' : 'FILE';
	      if (needDir && type === 'FILE')
	        return cb()
	      else
	        return cb(null, type, stat)
	    }
	  }

	  var self = this;
	  var statcb = inflight_1('stat\0' + abs, lstatcb_);
	  if (statcb)
	    fs.lstat(abs, statcb);

	  function lstatcb_ (er, lstat) {
	    if (lstat && lstat.isSymbolicLink()) {
	      // If it's a symlink, then treat it as the target, unless
	      // the target does not exist, then treat it as a file.
	      return fs.stat(abs, function (er, stat) {
	        if (er)
	          self._stat2(f, abs, null, lstat, cb);
	        else
	          self._stat2(f, abs, er, stat, cb);
	      })
	    } else {
	      self._stat2(f, abs, er, lstat, cb);
	    }
	  }
	};

	Glob$1.prototype._stat2 = function (f, abs, er, stat, cb) {
	  if (er && (er.code === 'ENOENT' || er.code === 'ENOTDIR')) {
	    this.statCache[abs] = false;
	    return cb()
	  }

	  var needDir = f.slice(-1) === '/';
	  this.statCache[abs] = stat;

	  if (abs.slice(-1) === '/' && stat && !stat.isDirectory())
	    return cb(null, false, stat)

	  var c = true;
	  if (stat)
	    c = stat.isDirectory() ? 'DIR' : 'FILE';
	  this.cache[abs] = this.cache[abs] || c;

	  if (needDir && c === 'FILE')
	    return cb()

	  return cb(null, c, stat)
	};

	var rimraf_1 = rimraf;
	rimraf.sync = rimrafSync;





	var _0666 = parseInt('666', 8);

	var defaultGlobOpts = {
	  nosort: true,
	  silent: true
	};

	// for EMFILE handling
	var timeout = 0;

	var isWindows$1 = (process.platform === "win32");

	function defaults$1 (options) {
	  var methods = [
	    'unlink',
	    'chmod',
	    'stat',
	    'lstat',
	    'rmdir',
	    'readdir'
	  ];
	  methods.forEach(function(m) {
	    options[m] = options[m] || fs[m];
	    m = m + 'Sync';
	    options[m] = options[m] || fs[m];
	  });

	  options.maxBusyTries = options.maxBusyTries || 3;
	  options.emfileWait = options.emfileWait || 1000;
	  if (options.glob === false) {
	    options.disableGlob = true;
	  }
	  options.disableGlob = options.disableGlob || false;
	  options.glob = options.glob || defaultGlobOpts;
	}

	function rimraf (p, options, cb) {
	  if (typeof options === 'function') {
	    cb = options;
	    options = {};
	  }

	  assert(p, 'rimraf: missing path');
	  assert.equal(typeof p, 'string', 'rimraf: path should be a string');
	  assert.equal(typeof cb, 'function', 'rimraf: callback function required');
	  assert(options, 'rimraf: invalid options argument provided');
	  assert.equal(typeof options, 'object', 'rimraf: options should be object');

	  defaults$1(options);

	  var busyTries = 0;
	  var errState = null;
	  var n = 0;

	  if (options.disableGlob || !glob_1.hasMagic(p))
	    return afterGlob(null, [p])

	  options.lstat(p, function (er, stat) {
	    if (!er)
	      return afterGlob(null, [p])

	    glob_1(p, options.glob, afterGlob);
	  });

	  function next (er) {
	    errState = errState || er;
	    if (--n === 0)
	      cb(errState);
	  }

	  function afterGlob (er, results) {
	    if (er)
	      return cb(er)

	    n = results.length;
	    if (n === 0)
	      return cb()

	    results.forEach(function (p) {
	      rimraf_(p, options, function CB (er) {
	        if (er) {
	          if ((er.code === "EBUSY" || er.code === "ENOTEMPTY" || er.code === "EPERM") &&
	              busyTries < options.maxBusyTries) {
	            busyTries ++;
	            var time = busyTries * 100;
	            // try again, with the same exact callback as this one.
	            return setTimeout(function () {
	              rimraf_(p, options, CB);
	            }, time)
	          }

	          // this one won't happen if graceful-fs is used.
	          if (er.code === "EMFILE" && timeout < options.emfileWait) {
	            return setTimeout(function () {
	              rimraf_(p, options, CB);
	            }, timeout ++)
	          }

	          // already gone
	          if (er.code === "ENOENT") er = null;
	        }

	        timeout = 0;
	        next(er);
	      });
	    });
	  }
	}

	// Two possible strategies.
	// 1. Assume it's a file.  unlink it, then do the dir stuff on EPERM or EISDIR
	// 2. Assume it's a directory.  readdir, then do the file stuff on ENOTDIR
	//
	// Both result in an extra syscall when you guess wrong.  However, there
	// are likely far more normal files in the world than directories.  This
	// is based on the assumption that a the average number of files per
	// directory is >= 1.
	//
	// If anyone ever complains about this, then I guess the strategy could
	// be made configurable somehow.  But until then, YAGNI.
	function rimraf_ (p, options, cb) {
	  assert(p);
	  assert(options);
	  assert(typeof cb === 'function');

	  // sunos lets the root user unlink directories, which is... weird.
	  // so we have to lstat here and make sure it's not a dir.
	  options.lstat(p, function (er, st) {
	    if (er && er.code === "ENOENT")
	      return cb(null)

	    // Windows can EPERM on stat.  Life is suffering.
	    if (er && er.code === "EPERM" && isWindows$1)
	      fixWinEPERM(p, options, er, cb);

	    if (st && st.isDirectory())
	      return rmdir(p, options, er, cb)

	    options.unlink(p, function (er) {
	      if (er) {
	        if (er.code === "ENOENT")
	          return cb(null)
	        if (er.code === "EPERM")
	          return (isWindows$1)
	            ? fixWinEPERM(p, options, er, cb)
	            : rmdir(p, options, er, cb)
	        if (er.code === "EISDIR")
	          return rmdir(p, options, er, cb)
	      }
	      return cb(er)
	    });
	  });
	}

	function fixWinEPERM (p, options, er, cb) {
	  assert(p);
	  assert(options);
	  assert(typeof cb === 'function');
	  if (er)
	    assert(er instanceof Error);

	  options.chmod(p, _0666, function (er2) {
	    if (er2)
	      cb(er2.code === "ENOENT" ? null : er);
	    else
	      options.stat(p, function(er3, stats) {
	        if (er3)
	          cb(er3.code === "ENOENT" ? null : er);
	        else if (stats.isDirectory())
	          rmdir(p, options, er, cb);
	        else
	          options.unlink(p, cb);
	      });
	  });
	}

	function fixWinEPERMSync (p, options, er) {
	  assert(p);
	  assert(options);
	  if (er)
	    assert(er instanceof Error);

	  try {
	    options.chmodSync(p, _0666);
	  } catch (er2) {
	    if (er2.code === "ENOENT")
	      return
	    else
	      throw er
	  }

	  try {
	    var stats = options.statSync(p);
	  } catch (er3) {
	    if (er3.code === "ENOENT")
	      return
	    else
	      throw er
	  }

	  if (stats.isDirectory())
	    rmdirSync(p, options, er);
	  else
	    options.unlinkSync(p);
	}

	function rmdir (p, options, originalEr, cb) {
	  assert(p);
	  assert(options);
	  if (originalEr)
	    assert(originalEr instanceof Error);
	  assert(typeof cb === 'function');

	  // try to rmdir first, and only readdir on ENOTEMPTY or EEXIST (SunOS)
	  // if we guessed wrong, and it's not a directory, then
	  // raise the original error.
	  options.rmdir(p, function (er) {
	    if (er && (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM"))
	      rmkids(p, options, cb);
	    else if (er && er.code === "ENOTDIR")
	      cb(originalEr);
	    else
	      cb(er);
	  });
	}

	function rmkids(p, options, cb) {
	  assert(p);
	  assert(options);
	  assert(typeof cb === 'function');

	  options.readdir(p, function (er, files) {
	    if (er)
	      return cb(er)
	    var n = files.length;
	    if (n === 0)
	      return options.rmdir(p, cb)
	    var errState;
	    files.forEach(function (f) {
	      rimraf(pathModule.join(p, f), options, function (er) {
	        if (errState)
	          return
	        if (er)
	          return cb(errState = er)
	        if (--n === 0)
	          options.rmdir(p, cb);
	      });
	    });
	  });
	}

	// this looks simpler, and is strictly *faster*, but will
	// tie up the JavaScript thread and fail on excessively
	// deep directory trees.
	function rimrafSync (p, options) {
	  options = options || {};
	  defaults$1(options);

	  assert(p, 'rimraf: missing path');
	  assert.equal(typeof p, 'string', 'rimraf: path should be a string');
	  assert(options, 'rimraf: missing options');
	  assert.equal(typeof options, 'object', 'rimraf: options should be object');

	  var results;

	  if (options.disableGlob || !glob_1.hasMagic(p)) {
	    results = [p];
	  } else {
	    try {
	      options.lstatSync(p);
	      results = [p];
	    } catch (er) {
	      results = glob_1.sync(p, options.glob);
	    }
	  }

	  if (!results.length)
	    return

	  for (var i = 0; i < results.length; i++) {
	    var p = results[i];

	    try {
	      var st = options.lstatSync(p);
	    } catch (er) {
	      if (er.code === "ENOENT")
	        return

	      // Windows can EPERM on stat.  Life is suffering.
	      if (er.code === "EPERM" && isWindows$1)
	        fixWinEPERMSync(p, options, er);
	    }

	    try {
	      // sunos lets the root user unlink directories, which is... weird.
	      if (st && st.isDirectory())
	        rmdirSync(p, options, null);
	      else
	        options.unlinkSync(p);
	    } catch (er) {
	      if (er.code === "ENOENT")
	        return
	      if (er.code === "EPERM")
	        return isWindows$1 ? fixWinEPERMSync(p, options, er) : rmdirSync(p, options, er)
	      if (er.code !== "EISDIR")
	        throw er

	      rmdirSync(p, options, er);
	    }
	  }
	}

	function rmdirSync (p, options, originalEr) {
	  assert(p);
	  assert(options);
	  if (originalEr)
	    assert(originalEr instanceof Error);

	  try {
	    options.rmdirSync(p);
	  } catch (er) {
	    if (er.code === "ENOENT")
	      return
	    if (er.code === "ENOTDIR")
	      throw originalEr
	    if (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM")
	      rmkidsSync(p, options);
	  }
	}

	function rmkidsSync (p, options) {
	  assert(p);
	  assert(options);
	  options.readdirSync(p).forEach(function (f) {
	    rimrafSync(pathModule.join(p, f), options);
	  });

	  // We only end up here once we got ENOTEMPTY at least once, and
	  // at this point, we are guaranteed to have removed all the kids.
	  // So, we know that it won't be ENOENT or ENOTDIR or anything else.
	  // try really hard to delete stuff on windows, because it has a
	  // PROFOUNDLY annoying habit of not closing handles promptly when
	  // files are deleted, resulting in spurious ENOTEMPTY errors.
	  var retries = isWindows$1 ? 100 : 1;
	  var i = 0;
	  do {
	    var threw = true;
	    try {
	      var ret = options.rmdirSync(p, options);
	      threw = false;
	      return ret
	    } finally {
	      if (++i < retries && threw)
	        continue
	    }
	  } while (true)
	}

	const modern = /^v0\.1\d\.\d+/.test(process.version);

	var ncp_1 = ncp;
	ncp.ncp = ncp;

	function ncp (source, dest, options, callback) {
	  var cback = callback;

	  if (!callback) {
	    cback = options;
	    options = {};
	  }

	  var basePath = process.cwd(),
	      currentPath = pathModule.resolve(basePath, source),
	      targetPath = pathModule.resolve(basePath, dest),
	      filter = options.filter,
	      rename = options.rename,
	      transform = options.transform,
	      clobber = options.clobber !== false,
	      modified = options.modified,
	      dereference = options.dereference,
	      errs = null,
	      eventName = modern ? 'finish' : 'close',
	      defer = modern ? setImmediate : process.nextTick,
	      started = 0,
	      finished = 0,
	      running = 0,
	      limit = options.limit || ncp.limit || 16;

	  limit = (limit < 1) ? 1 : (limit > 512) ? 512 : limit;

	  startCopy(currentPath);
	  
	  function startCopy(source) {
	    started++;
	    if (filter) {
	      if (filter instanceof RegExp) {
	        if (!filter.test(source)) {
	          return cb(true);
	        }
	      }
	      else if (typeof filter === 'function') {
	        if (!filter(source)) {
	          return cb(true);
	        }
	      }
	    }
	    return getStats(source);
	  }

	  function getStats(source) {
	    var stat = dereference ? fs.stat : fs.lstat;
	    if (running >= limit) {
	      return defer(function () {
	        getStats(source);
	      });
	    }
	    running++;
	    stat(source, function (err, stats) {
	      var item = {};
	      if (err) {
	        return onError(err);
	      }

	      // We need to get the mode from the stats object and preserve it.
	      item.name = source;
	      item.mode = stats.mode;
	      item.mtime = stats.mtime; //modified time
	      item.atime = stats.atime; //access time

	      if (stats.isDirectory()) {
	        return onDir(item);
	      }
	      else if (stats.isFile()) {
	        return onFile(item);
	      }
	      else if (stats.isSymbolicLink()) {
	        // Symlinks don't really need to know about the mode.
	        return onLink(source);
	      }
	    });
	  }

	  function onFile(file) {
	    var target = file.name.replace(currentPath, targetPath);
	    if(rename) {
	      target =  rename(target);
	    }
	    isWritable(target, function (writable) {
	      if (writable) {
	        return copyFile(file, target);
	      }
	      if(clobber) {
	        rmFile(target, function () {
	          copyFile(file, target);
	        });
	      }
	      if (modified) {
	        var stat = dereference ? fs.stat : fs.lstat;
	        stat(target, function(err, stats) {
	            //if souce modified time greater to target modified time copy file
	            if (file.mtime.getTime()>stats.mtime.getTime())
	                copyFile(file, target);
	            else return cb();
	        });
	      }
	      else {
	        return cb();
	      }
	    });
	  }

	  function copyFile(file, target) {
	    var readStream = fs.createReadStream(file.name),
	        writeStream = fs.createWriteStream(target, { mode: file.mode });
	    
	    readStream.on('error', onError);
	    writeStream.on('error', onError);
	    
	    if(transform) {
	      transform(readStream, writeStream, file);
	    } else {
	      writeStream.on('open', function() {
	        readStream.pipe(writeStream);
	      });
	    }
	    writeStream.once(eventName, function() {
	        if (modified) {
	            //target file modified date sync.
	            fs.utimesSync(target, file.atime, file.mtime);
	            cb();
	        }
	        else cb();
	    });
	  }

	  function rmFile(file, done) {
	    fs.unlink(file, function (err) {
	      if (err) {
	        return onError(err);
	      }
	      return done();
	    });
	  }

	  function onDir(dir) {
	    var target = dir.name.replace(currentPath, targetPath);
	    isWritable(target, function (writable) {
	      if (writable) {
	        return mkDir(dir, target);
	      }
	      copyDir(dir.name);
	    });
	  }

	  function mkDir(dir, target) {
	    fs.mkdir(target, dir.mode, function (err) {
	      if (err) {
	        return onError(err);
	      }
	      copyDir(dir.name);
	    });
	  }

	  function copyDir(dir) {
	    fs.readdir(dir, function (err, items) {
	      if (err) {
	        return onError(err);
	      }
	      items.forEach(function (item) {
	        startCopy(dir + '/' + item);
	      });
	      return cb();
	    });
	  }

	  function onLink(link) {
	    var target = link.replace(currentPath, targetPath);
	    fs.readlink(link, function (err, resolvedPath) {
	      if (err) {
	        return onError(err);
	      }
	      checkLink(resolvedPath, target);
	    });
	  }

	  function checkLink(resolvedPath, target) {
	    if (dereference) {
	      resolvedPath = pathModule.resolve(basePath, resolvedPath);
	    }
	    isWritable(target, function (writable) {
	      if (writable) {
	        return makeLink(resolvedPath, target);
	      }
	      fs.readlink(target, function (err, targetDest) {
	        if (err) {
	          return onError(err);
	        }
	        if (dereference) {
	          targetDest = pathModule.resolve(basePath, targetDest);
	        }
	        if (targetDest === resolvedPath) {
	          return cb();
	        }
	        return rmFile(target, function () {
	          makeLink(resolvedPath, target);
	        });
	      });
	    });
	  }

	  function makeLink(linkPath, target) {
	    fs.symlink(linkPath, target, function (err) {
	      if (err) {
	        return onError(err);
	      }
	      return cb();
	    });
	  }

	  function isWritable(path, done) {
	    fs.lstat(path, function (err) {
	      if (err) {
	        if (err.code === 'ENOENT') return done(true);
	        return done(false);
	      }
	      return done(false);
	    });
	  }

	  function onError(err) {
	    if (options.stopOnError) {
	      return cback(err);
	    }
	    else if (!errs && options.errs) {
	      errs = fs.createWriteStream(options.errs);
	    }
	    else if (!errs) {
	      errs = [];
	    }
	    if (typeof errs.write === 'undefined') {
	      errs.push(err);
	    }
	    else { 
	      errs.write(err.stack + '\n\n');
	    }
	    return cb();
	  }

	  function cb(skipped) {
	    if (!skipped) running--;
	    finished++;
	    if ((started === finished) && (running === 0)) {
	      if (cback !== undefined ) {
	        return errs ? cback(errs) : cback(null);
	      }
	    }
	  }
	}

	var file = createCommonjsModule(function (module, exports) {
	/*
	 * file.js: Simple utilities for working with the file system.
	 *
	 * (C) 2011, Charlie Robbins & the Contributors
	 * MIT LICENSE
	 *
	 */



	exports.readJson = exports.readJSON = function (file, callback) {
	  if (typeof callback !== 'function') {
	    throw new Error('utile.file.readJson needs a callback');
	  }

	  fs.readFile(file, 'utf-8', function (err, data) {
	    if (err) {
	      return callback(err);
	    }

	    try {
	      var json = JSON.parse(data);
	      callback(null, json);
	    }
	    catch (err) {
	      return callback(err);
	    }
	  });
	};

	exports.readJsonSync = exports.readJSONSync = function (file) {
	  return JSON.parse(fs.readFileSync(file, 'utf-8'));
	};
	});
	var file_1 = file.readJson;
	var file_2 = file.readJSON;
	var file_3 = file.readJsonSync;
	var file_4 = file.readJSONSync;

	/*
	 * args.js: function argument parsing helper utility
	 *
	 * (C) 2011, Charlie Robbins & the Contributors
	 * MIT LICENSE
	 *
	 */



	//
	// ### function args(_args)
	// #### _args {Arguments} Original function arguments
	//
	// Top-level method will accept a javascript "arguments" object (the actual keyword
	// "arguments" inside any scope), and attempt to return back an intelligent object
	// representing the functions arguments
	//
	var args = function (_args) {
	  var args = lib$1.rargs(_args),
	      _cb;

	  //
	  // Find and define the first argument
	  //
	  Object.defineProperty(args, 'first', { value: args[0] });

	  //
	  // Find and define any callback
	  //
	  _cb = args[args.length - 1] || args[args.length];
	  if (typeof _cb === "function") {
	    Object.defineProperty(args, 'callback', { value: _cb });
	    Object.defineProperty(args, 'cb', { value: _cb });
	    args.pop();
	  }

	  //
	  // Find and define the last argument
	  //
	  if (args.length) {
	    Object.defineProperty(args, 'last', { value: args[args.length - 1] });
	  }

	  return args;
	};

	var base64_1 = createCommonjsModule(function (module, exports) {
	/*
	 * base64.js: An extremely simple implementation of base64 encoding / decoding using node.js Buffers
	 *
	 * (C) 2010, Charlie Robbins & the Contributors.
	 *
	 */

	var base64 = exports;

	//
	// ### function encode (unencoded)
	// #### @unencoded {string} The string to base64 encode
	// Encodes the specified string to base64 using node.js Buffers.
	//
	base64.encode = function (unencoded) {
	  var encoded;

	  try {
	    encoded = new Buffer(unencoded || '').toString('base64');
	  }
	  catch (ex) {
	    return null;
	  }

	  return encoded;
	};

	//
	// ### function decode (encoded)
	// #### @encoded {string} The string to base64 decode
	// Decodes the specified string from base64 using node.js Buffers.
	//
	base64.decode = function (encoded) {
	  var decoded;

	  try {
	    decoded = new Buffer(encoded || '', 'base64').toString('utf8');
	  }
	  catch (ex) {
	    return null;
	  }

	  return decoded;
	};
	});

	var format = createCommonjsModule(function (module, exports) {
	/*
	 * format.js: `util.format` enhancement to allow custom formatting parameters.
	 *
	 * (C) 2011, Charlie Robbins & the Contributors
	 * MIT LICENSE
	 *
	 */



	exports = module.exports = function(str) {
	  var formats = [].slice.call(arguments, 1, 3);

	  if (!(formats[0] instanceof Array && formats[1] instanceof Array) || arguments.length > 3)
	    return util.format.apply(null, arguments);

	  var replacements = formats.pop(),
	      formats = formats.shift();

	  formats.forEach(function(format, id) {
	    str = str.replace(new RegExp(format), replacements[id]);
	  });

	  return str;
	};
	});

	var lib$1 = createCommonjsModule(function (module) {
	/*
	 * index.js: Top-level include for the `utile` module.
	 *
	 * (C) 2011, Charlie Robbins & the Contributors
	 * MIT LICENSE
	 *
	 */



	var utile = module.exports;

	//
	// Extend the `utile` object with all methods from the
	// core node `util` methods.
	//
	Object.keys(util).forEach(function (key) {
	  utile[key] = util[key];
	});

	Object.defineProperties(utile, {

	  //
	  // ### function async
	  // Simple wrapper to `require('async')`.
	  //
	  'async': {
	    get: function() {
	      return utile.async = async;
	    }
	  },

	  //
	  // ### function inflect
	  // Simple wrapper to `require('i')`.
	  //
	  'inflect': {
	    get: function() {
	      return utile.inflect = inflect();
	    }
	  },

	  //
	  // ### function mkdirp
	  // Simple wrapper to `require('mkdirp')`
	  //
	  'mkdirp': {
	    get: function() {
	      return utile.mkdirp = mkdirp;
	    }
	  },

	  //
	  // ### function deepEqual
	  // Simple wrapper to `require('deep-equal')`
	  // Remark: deepEqual is 4x faster then using assert.deepEqual
	  //         see: https://gist.github.com/2790507
	  //
	  'deepEqual': {
	    get: function() {
	      return utile.deepEqual = deepEqual_1;
	    }
	  },

	  //
	  // ### function rimraf
	  // Simple wrapper to `require('rimraf')`
	  //
	  'rimraf': {
	    get: function() {
	      return utile.rimraf = rimraf_1;
	    }
	  },

	  //
	  // ### function cpr
	  // Simple wrapper to `require('ncp').ncp`
	  //
	  'cpr': {
	    get: function() {
	      return utile.cpr = ncp_1.ncp;
	    }
	  },

	  //
	  // ### @file {Object}
	  // Lazy-loaded `file` module
	  //
	  'file': {
	    get: function() {
	      return utile.file = file;
	    }
	  },

	  //
	  // ### @args {Object}
	  // Lazy-loaded `args` module
	  //
	  'args': {
	    get: function() {
	      return utile.args = args;
	    }
	  },

	  //
	  // ### @base64 {Object}
	  // Lazy-loaded `base64` object
	  //
	  'base64': {
	    get: function() {
	      return utile.base64 = base64_1;
	    }
	  },

	  //
	  // ### @format {Object}
	  // Lazy-loaded `format` object
	  //
	  'format': {
	    get: function() {
	      return utile.format = format;
	    }
	  }

	});


	//
	// ### function rargs(_args)
	// #### _args {Arguments} Original function arguments
	//
	// Top-level method will accept a javascript "arguments" object
	// (the actual keyword "arguments" inside any scope) and return
	// back an Array.
	//
	utile.rargs = function (_args, slice) {
	  if (!slice) {
	    slice = 0;
	  }

	  var len = (_args || []).length,
	      args$$1 = new Array(len - slice),
	      i;

	  //
	  // Convert the raw `_args` to a proper Array.
	  //
	  for (i = slice; i < len; i++) {
	    args$$1[i - slice] = _args[i];
	  }

	  return args$$1;
	};

	//
	// ### function each (obj, iterator)
	// #### @obj {Object} Object to iterate over
	// #### @iterator {function} Continuation to use on each key. `function (value, key, object)`
	// Iterate over the keys of an object.
	//
	utile.each = function (obj, iterator) {
	  Object.keys(obj).forEach(function (key) {
	    iterator(obj[key], key, obj);
	  });
	};

	//
	// ### function find (o)
	//
	//
	utile.find = function (obj, pred) {
	  var value, key;

	  for (key in obj) {
	    value = obj[key];
	    if (pred(value, key)) {
	      return value;
	    }
	  }
	};

	//
	// ### function pad (str, len, chr)
	// ### @str {String} String to pad
	// ### @len {Number} Number of chars to pad str with
	// ### @chr {String} Optional replacement character, defaults to empty space
	// Appends chr to str until it reaches a length of len
	//
	utile.pad = function pad(str, len, chr) {
	  var s;
	  if (!chr) {
	    chr = ' ';
	  }
	  str = str || '';
	  s = str;
	  if (str.length < len) {
	    for (var i = 0; i < (len - str.length); i++) {
	      s += chr;
	    }
	  }
	  return s;
	};

	//
	// ### function path (obj, path, value)
	// ### @obj {Object} Object to insert value into
	// ### @path {Array} List of nested keys to insert value at
	// Retreives a value from given Object, `obj`, located at the
	// nested keys, `path`.
	//
	utile.path = function (obj, path) {
	  var key, i;

	  for (i in path) {
	    if (typeof obj === 'undefined') {
	      return undefined;
	    }

	    key = path[i];
	    obj = obj[key];
	  }

	  return obj;
	};

	//
	// ### function createPath (obj, path, value)
	// ### @obj {Object} Object to insert value into
	// ### @path {Array} List of nested keys to insert value at
	// ### @value {*} Value to insert into the object.
	// Inserts the `value` into the given Object, `obj`, creating
	// any keys in `path` along the way if necessary.
	//
	utile.createPath = function (obj, path, value) {
	  var key, i;

	  for (i in path) {
	    key = path[i];
	    if (!obj[key]) {
	      obj[key] = ((+i + 1 === path.length) ? value : {});
	    }

	    obj = obj[key];
	  }
	};

	//
	// ### function mixin (target [source0, source1, ...])
	// Copies enumerable properties from `source0 ... sourceN`
	// onto `target` and returns the resulting object.
	//
	utile.mixin = function (target) {
	  utile.rargs(arguments, 1).forEach(function (o) {
	    Object.getOwnPropertyNames(o).forEach(function(attr) {
	      var getter = Object.getOwnPropertyDescriptor(o, attr).get,
	          setter = Object.getOwnPropertyDescriptor(o, attr).set;

	      if (!getter && !setter) {
	        target[attr] = o[attr];
	      }
	      else {
	        Object.defineProperty(target, attr, {
	          get: getter,
	          set: setter
	        });
	      }
	    });
	  });

	  return target;
	};


	//
	// ### function capitalize (str)
	// #### @str {string} String to capitalize
	// Capitalizes the specified `str`.
	//
	utile.capitalize = utile.inflect.camelize;

	//
	// ### function escapeRegExp (str)
	// #### @str {string} String to be escaped
	// Escape string for use in Javascript regex
	//
	utile.escapeRegExp = function (str) {
	  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	};

	//
	// ### function randomString (length)
	// #### @length {integer} The number of bits for the random base64 string returned to contain
	// randomString returns a pseude-random ASCII string (subset)
	// the return value is a string of length ⌈bits/6⌉ of characters
	// from the base64 alphabet.
	//
	utile.randomString = function (length) {
	  var chars, rand, i, ret, mod, bits;

	  chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
	  ret = '';
	  // standard 4
	  mod = 4;
	  // default is 16
	  bits = length * mod || 64;

	  // in v8, Math.random() yields 32 pseudo-random bits (in spidermonkey it gives 53)
	  while (bits > 0) {
	    // 32-bit integer
	    rand = Math.floor(Math.random() * 0x100000000);
	    //we use the top bits
	    for (i = 26; i > 0 && bits > 0; i -= mod, bits -= mod) {
	      ret += chars[0x3F & rand >>> i];
	    }
	  }

	  return ret;
	};

	//
	// ### function filter (object, test)
	// #### @obj {Object} Object to iterate over
	// #### @pred {function} Predicate applied to each property. `function (value, key, object)`
	// Returns an object with properties from `obj` which satisfy
	// the predicate `pred`
	//
	utile.filter = function (obj, pred) {
	  var copy;
	  if (Array.isArray(obj)) {
	    copy = [];
	    utile.each(obj, function (val, key) {
	      if (pred(val, key, obj)) {
	        copy.push(val);
	      }
	    });
	  }
	  else {
	    copy = {};
	    utile.each(obj, function (val, key) {
	      if (pred(val, key, obj)) {
	        copy[key] = val;
	      }
	    });
	  }
	  return copy;
	};

	//
	// ### function requireDir (directory)
	// #### @directory {string} Directory to require
	// Requires all files and directories from `directory`, returning an object
	// with keys being filenames (without trailing `.js`) and respective values
	// being return values of `require(filename)`.
	//
	utile.requireDir = function (directory) {
	  var result = {},
	      files = fs.readdirSync(directory);

	  files.forEach(function (file$$1) {
	    if (file$$1.substr(-3) === '.js') {
	      file$$1 = file$$1.substr(0, file$$1.length - 3);
	    }
	    result[file$$1] = commonjsRequire(pathModule.resolve(directory, file$$1));
	  });
	  return result;
	};

	//
	// ### function requireDirLazy (directory)
	// #### @directory {string} Directory to require
	// Lazily requires all files and directories from `directory`, returning an
	// object with keys being filenames (without trailing `.js`) and respective
	// values (getters) being return values of `require(filename)`.
	//
	utile.requireDirLazy = function (directory) {
	  var result = {},
	      files = fs.readdirSync(directory);

	  files.forEach(function (file$$1) {
	    if (file$$1.substr(-3) === '.js') {
	      file$$1 = file$$1.substr(0, file$$1.length - 3);
	    }
	    Object.defineProperty(result, file$$1, {
	      get: function() {
	        return result[file$$1] = commonjsRequire(pathModule.resolve(directory, file$$1));
	      }
	    });
	  });

	  return result;
	};

	//
	// ### function clone (object, filter)
	// #### @object {Object} Object to clone
	// #### @filter {Function} Filter to be used
	// Shallow clones the specified object.
	//
	utile.clone = function (object, filter) {
	  return Object.keys(object).reduce(filter ? function (obj, k) {
	    if (filter(k)) obj[k] = object[k];
	    return obj;
	  } : function (obj, k) {
	    obj[k] = object[k];
	    return obj;
	  }, {});
	};

	//
	// ### function camelToUnderscore (obj)
	// #### @obj {Object} Object to convert keys on.
	// Converts all keys of the type `keyName` to `key_name` on the
	// specified `obj`.
	//
	utile.camelToUnderscore = function (obj) {
	  if (typeof obj !== 'object' || obj === null) {
	    return obj;
	  }

	  if (Array.isArray(obj)) {
	    obj.forEach(utile.camelToUnderscore);
	    return obj;
	  }

	  Object.keys(obj).forEach(function (key) {
	    var k = utile.inflect.underscore(key);
	    if (k !== key) {
	      obj[k] = obj[key];
	      delete obj[key];
	      key = k;
	    }
	    utile.camelToUnderscore(obj[key]);
	  });

	  return obj;
	};

	//
	// ### function underscoreToCamel (obj)
	// #### @obj {Object} Object to convert keys on.
	// Converts all keys of the type `key_name` to `keyName` on the
	// specified `obj`.
	//
	utile.underscoreToCamel = function (obj) {
	  if (typeof obj !== 'object' || obj === null) {
	    return obj;
	  }

	  if (Array.isArray(obj)) {
	    obj.forEach(utile.underscoreToCamel);
	    return obj;
	  }

	  Object.keys(obj).forEach(function (key) {
	    var k = utile.inflect.camelize(key, false);
	    if (k !== key) {
	      obj[k] = obj[key];
	      delete obj[key];
	      key = k;
	    }
	    utile.underscoreToCamel(obj[key]);
	  });

	  return obj;
	};
	});

	var mute = MuteStream;

	// var out = new MuteStream(process.stdout)
	// argument auto-pipes
	function MuteStream (opts) {
	  stream.apply(this);
	  opts = opts || {};
	  this.writable = this.readable = true;
	  this.muted = false;
	  this.on('pipe', this._onpipe);
	  this.replace = opts.replace;

	  // For readline-type situations
	  // This much at the start of a line being redrawn after a ctrl char
	  // is seen (such as backspace) won't be redrawn as the replacement
	  this._prompt = opts.prompt || null;
	  this._hadControl = false;
	}

	MuteStream.prototype = Object.create(stream.prototype);

	Object.defineProperty(MuteStream.prototype, 'constructor', {
	  value: MuteStream,
	  enumerable: false
	});

	MuteStream.prototype.mute = function () {
	  this.muted = true;
	};

	MuteStream.prototype.unmute = function () {
	  this.muted = false;
	};

	Object.defineProperty(MuteStream.prototype, '_onpipe', {
	  value: onPipe,
	  enumerable: false,
	  writable: true,
	  configurable: true
	});

	function onPipe (src) {
	  this._src = src;
	}

	Object.defineProperty(MuteStream.prototype, 'isTTY', {
	  get: getIsTTY,
	  set: setIsTTY,
	  enumerable: true,
	  configurable: true
	});

	function getIsTTY () {
	  return( (this._dest) ? this._dest.isTTY
	        : (this._src) ? this._src.isTTY
	        : false
	        )
	}

	// basically just get replace the getter/setter with a regular value
	function setIsTTY (isTTY) {
	  Object.defineProperty(this, 'isTTY', {
	    value: isTTY,
	    enumerable: true,
	    writable: true,
	    configurable: true
	  });
	}

	Object.defineProperty(MuteStream.prototype, 'rows', {
	  get: function () {
	    return( this._dest ? this._dest.rows
	          : this._src ? this._src.rows
	          : undefined )
	  }, enumerable: true, configurable: true });

	Object.defineProperty(MuteStream.prototype, 'columns', {
	  get: function () {
	    return( this._dest ? this._dest.columns
	          : this._src ? this._src.columns
	          : undefined )
	  }, enumerable: true, configurable: true });


	MuteStream.prototype.pipe = function (dest, options) {
	  this._dest = dest;
	  return stream.prototype.pipe.call(this, dest, options)
	};

	MuteStream.prototype.pause = function () {
	  if (this._src) return this._src.pause()
	};

	MuteStream.prototype.resume = function () {
	  if (this._src) return this._src.resume()
	};

	MuteStream.prototype.write = function (c) {
	  if (this.muted) {
	    if (!this.replace) return true
	    if (c.match(/^\u001b/)) {
	      if(c.indexOf(this._prompt) === 0) {
	        c = c.substr(this._prompt.length);
	        c = c.replace(/./g, this.replace);
	        c = this._prompt + c;
	      }
	      this._hadControl = true;
	      return this.emit('data', c)
	    } else {
	      if (this._prompt && this._hadControl &&
	          c.indexOf(this._prompt) === 0) {
	        this._hadControl = false;
	        this.emit('data', this._prompt);
	        c = c.substr(this._prompt.length);
	      }
	      c = c.toString().replace(/./g, this.replace);
	    }
	  }
	  this.emit('data', c);
	};

	MuteStream.prototype.end = function (c) {
	  if (this.muted) {
	    if (c && this.replace) {
	      c = c.toString().replace(/./g, this.replace);
	    } else {
	      c = null;
	    }
	  }
	  if (c) this.emit('data', c);
	  this.emit('end');
	};

	function proxy (fn) { return function () {
	  var d = this._dest;
	  var s = this._src;
	  if (d && d[fn]) d[fn].apply(d, arguments);
	  if (s && s[fn]) s[fn].apply(s, arguments);
	}}

	MuteStream.prototype.destroy = proxy('destroy');
	MuteStream.prototype.destroySoon = proxy('destroySoon');
	MuteStream.prototype.close = proxy('close');

	var read_1 = read;




	function read (opts, cb) {
	  if (opts.num) {
	    throw new Error('read() no longer accepts a char number limit')
	  }

	  if (typeof opts.default !== 'undefined' &&
	      typeof opts.default !== 'string' &&
	      typeof opts.default !== 'number') {
	    throw new Error('default value must be string or number')
	  }

	  var input = opts.input || process.stdin;
	  var output = opts.output || process.stdout;
	  var prompt = (opts.prompt || '').trim() + ' ';
	  var silent = opts.silent;
	  var editDef = false;
	  var timeout = opts.timeout;

	  var def = opts.default || '';
	  if (def) {
	    if (silent) {
	      prompt += '(<default hidden>) ';
	    } else if (opts.edit) {
	      editDef = true;
	    } else {
	      prompt += '(' + def + ') ';
	    }
	  }
	  var terminal = !!(opts.terminal || output.isTTY);

	  var m = new mute({ replace: opts.replace, prompt: prompt });
	  m.pipe(output, {end: false});
	  output = m;
	  var rlOpts = { input: input, output: output, terminal: terminal };

	  if (process.version.match(/^v0\.6/)) {
	    var rl = readline.createInterface(rlOpts.input, rlOpts.output);
	  } else {
	    var rl = readline.createInterface(rlOpts);
	  }


	  output.unmute();
	  rl.setPrompt(prompt);
	  rl.prompt();
	  if (silent) {
	    output.mute();
	  } else if (editDef) {
	    rl.line = def;
	    rl.cursor = def.length;
	    rl._refreshLine();
	  }

	  var called = false;
	  rl.on('line', onLine);
	  rl.on('error', onError);

	  rl.on('SIGINT', function () {
	    rl.close();
	    onError(new Error('canceled'));
	  });

	  var timer;
	  if (timeout) {
	    timer = setTimeout(function () {
	      onError(new Error('timed out'));
	    }, timeout);
	  }

	  function done () {
	    called = true;
	    rl.close();

	    if (process.version.match(/^v0\.6/)) {
	      rl.input.removeAllListeners('data');
	      rl.input.removeAllListeners('keypress');
	      rl.input.pause();
	    }

	    clearTimeout(timer);
	    output.mute();
	    output.end();
	  }

	  function onError (er) {
	    if (called) return
	    done();
	    return cb(er)
	  }

	  function onLine (line) {
	    if (called) return
	    if (silent && terminal) {
	      output.unmute();
	      output.write('\r\n');
	    }
	    done();
	    // truncate the \n at the end.
	    line = line.replace(/\r?\n$/, '');
	    var isDefault = !!(editDef && line === def);
	    if (def && !line) {
	      isDefault = true;
	      line = def;
	    }
	    cb(null, line, isDefault);
	  }
	}

	var revalidator = createCommonjsModule(function (module) {
	(function (exports) {
	  exports.validate = validate;
	  exports.mixin = mixin;

	  //
	  // ### function validate (object, schema, options)
	  // #### {Object} object the object to validate.
	  // #### {Object} schema (optional) the JSON Schema to validate against.
	  // #### {Object} options (optional) options controlling the validation
	  //      process. See {@link #validate.defaults) for details.
	  // Validate <code>object</code> against a JSON Schema.
	  // If <code>object</code> is self-describing (i.e. has a
	  // <code>$schema</code> property), it will also be validated
	  // against the referenced schema. [TODO]: This behaviour bay be
	  // suppressed by setting the {@link #validate.options.???}
	  // option to <code>???</code>.[/TODO]
	  //
	  // If <code>schema</code> is not specified, and <code>object</code>
	  // is not self-describing, validation always passes.
	  //
	  // <strong>Note:</strong> in order to pass options but no schema,
	  // <code>schema</code> <em>must</em> be specified in the call to
	  // <code>validate()</code>; otherwise, <code>options</code> will
	  // be interpreted as the schema. <code>schema</code> may be passed
	  // as <code>null</code>, <code>undefinded</code>, or the empty object
	  // (<code>{}</code>) in this case.
	  //
	  function validate(object, schema, options) {
	    options = mixin({}, options, validate.defaults);
	    var errors = [];

	    validateObject(object, schema, options, errors);

	    //
	    // TODO: self-described validation
	    // if (! options.selfDescribing) { ... }
	    //

	    return {
	      valid: !(errors.length),
	      errors: errors
	    };
	  }
	  /**
	   * Default validation options. Defaults can be overridden by
	   * passing an 'options' hash to {@link #validate}. They can
	   * also be set globally be changing the values in
	   * <code>validate.defaults</code> directly.
	   */
	  validate.defaults = {
	      /**
	       * <p>
	       * Enforce 'format' constraints.
	       * </p><p>
	       * <em>Default: <code>true</code></em>
	       * </p>
	       */
	      validateFormats: true,
	      /**
	       * <p>
	       * When {@link #validateFormats} is <code>true</code>,
	       * treat unrecognized formats as validation errors.
	       * </p><p>
	       * <em>Default: <code>false</code></em>
	       * </p>
	       *
	       * @see validation.formats for default supported formats.
	       */
	      validateFormatsStrict: false,
	      /**
	       * <p>
	       * When {@link #validateFormats} is <code>true</code>,
	       * also validate formats defined in {@link #validate.formatExtensions}.
	       * </p><p>
	       * <em>Default: <code>true</code></em>
	       * </p>
	       */
	      validateFormatExtensions: true
	  };

	  /**
	   * Default messages to include with validation errors.
	   */
	  validate.messages = {
	      required:         "is required",
	      allowEmpty:       "must not be empty",
	      minLength:        "is too short (minimum is %{expected} characters)",
	      maxLength:        "is too long (maximum is %{expected} characters)",
	      pattern:          "invalid input",
	      minimum:          "must be greater than or equal to %{expected}",
	      maximum:          "must be less than or equal to %{expected}",
	      exclusiveMinimum: "must be greater than %{expected}",
	      exclusiveMaximum: "must be less than %{expected}",
	      divisibleBy:      "must be divisible by %{expected}",
	      minItems:         "must contain more than %{expected} items",
	      maxItems:         "must contain less than %{expected} items",
	      uniqueItems:      "must hold a unique set of values",
	      format:           "is not a valid %{expected}",
	      conform:          "must conform to given constraint",
	      type:             "must be of %{expected} type"
	  };
	  validate.messages['enum'] = "must be present in given enumerator";

	  /**
	   *
	   */
	  validate.formats = {
	    'email':          /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
	    'ip-address':     /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/i,
	    'ipv6':           /^([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}$/,
	    'date-time':      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:.\d{1,3})?Z$/,
	    'date':           /^\d{4}-\d{2}-\d{2}$/,
	    'time':           /^\d{2}:\d{2}:\d{2}$/,
	    'color':          /^#[a-z0-9]{6}|#[a-z0-9]{3}|(?:rgb\(\s*(?:[+-]?\d+%?)\s*,\s*(?:[+-]?\d+%?)\s*,\s*(?:[+-]?\d+%?)\s*\))aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|white|yellow$/i,
	    //'style':        (not supported)
	    //'phone':        (not supported)
	    //'uri':          (not supported)
	    'host-name':      /^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])/,
	    'utc-millisec':   {
	      test: function (value) {
	        return typeof(value) === 'number' && value >= 0;
	      }
	    },
	    'regex':          {
	      test: function (value) {
	        try { }
	        catch (e) { return false }

	        return true;
	      }
	    }
	  };

	  /**
	   *
	   */
	  validate.formatExtensions = {
	    'url': /^(https?|ftp|git):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i
	  };

	  function mixin(obj) {
	    var sources = Array.prototype.slice.call(arguments, 1);
	    while (sources.length) {
	      var source = sources.shift();
	      if (!source) { continue }

	      if (typeof(source) !== 'object') {
	        throw new TypeError('mixin non-object');
	      }

	      for (var p in source) {
	        if (source.hasOwnProperty(p)) {
	          obj[p] = source[p];
	        }
	      }
	    }

	    return obj;
	  }
	  function validateObject(object, schema, options, errors) {
	    var props, allProps = Object.keys(object),
	        visitedProps = [];

	    // see 5.2
	    if (schema.properties) {
	      props = schema.properties;
	      for (var p in props) {
	        if (props.hasOwnProperty(p)) {
	          visitedProps.push(p);
	          validateProperty(object, object[p], p, props[p], options, errors);
	        }
	      }
	    }

	    // see 5.3
	    if (schema.patternProperties) {
	      props = schema.patternProperties;
	      for (var p in props) {
	        if (props.hasOwnProperty(p)) {
	          var re = new RegExp(p);

	          // Find all object properties that are matching `re`
	          for (var k in object) {
	            if (object.hasOwnProperty(k)) {
	              visitedProps.push(k);
	              if (re.exec(k) !== null) {
	                validateProperty(object, object[k], p, props[p], options, errors);
	              }
	            }
	          }
	        }
	      }
	    }

	    // see 5.4
	    if (undefined !== schema.additionalProperties) {
	      var i, l;

	      var unvisitedProps = allProps.filter(function(k){
	        return -1 === visitedProps.indexOf(k);
	      });

	      // Prevent additional properties; each unvisited property is therefore an error
	      if (schema.additionalProperties === false && unvisitedProps.length > 0) {
	        for (i = 0, l = unvisitedProps.length; i < l; i++) {
	          error("additionalProperties", unvisitedProps[i], object[unvisitedProps[i]], false, errors);
	        }
	      }
	      // additionalProperties is a schema and validate unvisited properties against that schema
	      else if (typeof schema.additionalProperties == "object" && unvisitedProps.length > 0) {
	        for (i = 0, l = unvisitedProps.length; i < l; i++) {
	          validateProperty(object, object[unvisitedProps[i]], unvisitedProps[i], schema.unvisitedProperties, options, errors);
	        }
	      }
	    }

	  }
	  function validateProperty(object, value, property, schema, options, errors) {
	    var format,
	        spec;

	    function constrain(name, value, assert$$1) {
	      if (schema[name] !== undefined && !assert$$1(value, schema[name])) {
	        error(name, property, value, schema, errors);
	      }
	    }

	    if (value === undefined) {
	      if (schema.required && schema.type !== 'any') {
	        return error('required', property, undefined, schema, errors);
	      } else {
	        return;
	      }
	    }

	    if (options.cast) {
	      if (('integer' === schema.type || 'number' === schema.type) && value == +value) {
	        value = +value;
	        object[property] = value;
	      }

	      if ('boolean' === schema.type) {
	        if ('true' === value || '1' === value || 1 === value) {
	          value = true;
	          object[property] = value;
	        }

	        if ('false' === value || '0' === value || 0 === value) {
	          value = false;
	          object[property] = value;
	        }
	      }
	    }

	    if (schema.format && options.validateFormats) {
	      format = schema.format;

	      if (options.validateFormatExtensions) { spec = validate.formatExtensions[format]; }
	      if (!spec) { spec = validate.formats[format]; }
	      if (!spec) {
	        if (options.validateFormatsStrict) {
	          return error('format', property, value, schema, errors);
	        }
	      }
	      else {
	        if (!spec.test(value)) {
	          return error('format', property, value, schema, errors);
	        }
	      }
	    }

	    if (schema['enum'] && schema['enum'].indexOf(value) === -1) {
	      error('enum', property, value, schema, errors);
	    }

	    // Dependencies (see 5.8)
	    if (typeof schema.dependencies === 'string' &&
	        object[schema.dependencies] === undefined) {
	      error('dependencies', property, null, schema, errors);
	    }

	    if (isArray(schema.dependencies)) {
	      for (var i = 0, l = schema.dependencies.length; i < l; i++) {
	        if (object[schema.dependencies[i]] === undefined) {
	          error('dependencies', property, null, schema, errors);
	        }
	      }
	    }

	    if (typeof schema.dependencies === 'object') {
	      validateObject(object, schema.dependencies, options, errors);
	    }

	    checkType(value, schema.type, function(err, type) {
	      if (err) return error('type', property, typeof value, schema, errors);

	      constrain('conform', value, function (a, e) { return e(a, object) });

	      switch (type || (isArray(value) ? 'array' : typeof value)) {
	        case 'string':
	          constrain('allowEmpty', value,        function (a, e) { return e ? e : a !== '' });
	          constrain('minLength',  value.length, function (a, e) { return a >= e });
	          constrain('maxLength',  value.length, function (a, e) { return a <= e });
	          constrain('pattern',    value,        function (a, e) {
	            e = typeof e === 'string'
	              ? e = new RegExp(e)
	              : e;
	            return e.test(a)
	          });
	          break;
	        case 'integer':
	        case 'number':
	          constrain('minimum',     value, function (a, e) { return a >= e });
	          constrain('maximum',     value, function (a, e) { return a <= e });
	          constrain('exclusiveMinimum', value, function (a, e) { return a > e });
	          constrain('exclusiveMaximum', value, function (a, e) { return a < e });
	          constrain('divisibleBy', value, function (a, e) {
	            var multiplier = Math.max((a - Math.floor(a)).toString().length - 2, (e - Math.floor(e)).toString().length - 2);
	            multiplier = multiplier > 0 ? Math.pow(10, multiplier) : 1;
	            return (a * multiplier) % (e * multiplier) === 0
	          });
	          break;
	        case 'array':
	          constrain('items', value, function (a, e) {
	            for (var i = 0, l = a.length; i < l; i++) {
	              validateProperty(object, a[i], property, e, options, errors);
	            }
	            return true;
	          });
	          constrain('minItems', value, function (a, e) { return a.length >= e });
	          constrain('maxItems', value, function (a, e) { return a.length <= e });
	          constrain('uniqueItems', value, function (a) {
	            var h = {};

	            for (var i = 0, l = a.length; i < l; i++) {
	              var key = JSON.stringify(a[i]);
	              if (h[key]) return false;
	              h[key] = true;
	            }

	            return true;
	          });
	          break;
	        case 'object':
	          // Recursive validation
	          if (schema.properties || schema.patternProperties || schema.additionalProperties) {
	            validateObject(value, schema, options, errors);
	          }
	          break;
	      }
	    });
	  }
	  function checkType(val, type, callback) {
	    var types = isArray(type) ? type : [type];

	    // No type - no check
	    if (type === undefined) return callback(null, type);

	    // Go through available types
	    // And fine first matching
	    for (var i = 0, l = types.length; i < l; i++) {
	      type = types[i].toLowerCase().trim();
	      if (type === 'string' ? typeof val === 'string' :
	          type === 'array' ? isArray(val) :
	          type === 'object' ? val && typeof val === 'object' &&
	                             !isArray(val) :
	          type === 'number' ? typeof val === 'number' :
	          type === 'integer' ? typeof val === 'number' && ~~val === val :
	          type === 'null' ? val === null :
	          type === 'boolean'? typeof val === 'boolean' :
	          type === 'date' ? isDate(val) :
	          type === 'any' ? typeof val !== 'undefined' : false) {
	        return callback(null, type);
	      }
	    }
	    callback(true);
	  }
	  function error(attribute, property, actual, schema, errors) {
	    var lookup = { expected: schema[attribute], actual: actual, attribute: attribute, property: property };
	    var message = schema.messages && schema.messages[attribute] || schema.message || validate.messages[attribute] || "no default message";
	    message = message.replace(/%\{([a-z]+)\}/ig, function (_, match) { return lookup[match.toLowerCase()] || ''; });
	    errors.push({
	      attribute: attribute,
	      property:  property,
	      expected:  schema[attribute],
	      actual:    actual,
	      message:   message
	    });
	  }
	  function isArray(value) {
	    var s = typeof value;
	    if (s === 'object') {
	      if (value) {
	        if (typeof value.length === 'number' &&
	           !(value.propertyIsEnumerable('length')) &&
	           typeof value.splice === 'function') {
	           return true;
	        }
	      }
	    }
	    return false;
	  }

	  function isDate(value) {
	    var s = typeof value;
	    if (s === 'object') {
	      if (value) {
	        if (typeof value.getTime === 'function') {
	          return true;
	        }
	      }
	    }

	    return false;
	  }

	})(module && module.exports ? module.exports : window);
	});

	var pkginfo_1 = createCommonjsModule(function (module) {
	/*
	 * pkginfo.js: Top-level include for the pkginfo module
	 *
	 * (C) 2011, Charlie Robbins
	 *
	 */
	 


	//
	// ### function pkginfo ([options, 'property', 'property' ..])
	// #### @pmodule {Module} Parent module to read from.
	// #### @options {Object|Array|string} **Optional** Options used when exposing properties.
	// #### @arguments {string...} **Optional** Specified properties to expose.
	// Exposes properties from the package.json file for the parent module on 
	// it's exports. Valid usage:
	//
	// `require('pkginfo')()`
	//
	// `require('pkginfo')('version', 'author');`
	//
	// `require('pkginfo')(['version', 'author']);`
	//
	// `require('pkginfo')({ include: ['version', 'author'] });`
	//
	var pkginfo = module.exports = function (pmodule, options) {
	  var args = [].slice.call(arguments, 2).filter(function (arg) {
	    return typeof arg === 'string';
	  });
	  
	  //
	  // **Parse variable arguments**
	  //
	  if (Array.isArray(options)) {
	    //
	    // If the options passed in is an Array assume that
	    // it is the Array of properties to expose from the
	    // on the package.json file on the parent module.
	    //
	    options = { include: options };
	  }
	  else if (typeof options === 'string') {
	    //
	    // Otherwise if the first argument is a string, then
	    // assume that it is the first property to expose from
	    // the package.json file on the parent module.
	    //
	    options = { include: [options] };
	  }
	  
	  //
	  // **Setup default options**
	  //
	  options = options || {};
	  
	  // ensure that includes have been defined
	  options.include = options.include || [];
	  
	  if (args.length > 0) {
	    //
	    // If additional string arguments have been passed in
	    // then add them to the properties to expose on the 
	    // parent module. 
	    //
	    options.include = options.include.concat(args);
	  }
	  
	  var pkg = pkginfo.read(pmodule, options.dir).package;
	  Object.keys(pkg).forEach(function (key) {
	    if (options.include.length > 0 && !~options.include.indexOf(key)) {
	      return;
	    }
	    
	    if (!pmodule.exports[key]) {
	      pmodule.exports[key] = pkg[key];
	    }
	  });
	  
	  return pkginfo;
	};

	//
	// ### function find (dir)
	// #### @pmodule {Module} Parent module to read from.
	// #### @dir {string} **Optional** Directory to start search from.
	// Searches up the directory tree from `dir` until it finds a directory
	// which contains a `package.json` file. 
	//
	pkginfo.find = function (pmodule, dir) {
	  if (! dir) {
	    dir = pathModule.dirname(pmodule.filename);
	  }
	  
	  var files = fs.readdirSync(dir);
	  
	  if (~files.indexOf('package.json')) {
	    return pathModule.join(dir, 'package.json');
	  }
	  
	  if (dir === '/') {
	    throw new Error('Could not find package.json up from: ' + dir);
	  }
	  else if (!dir || dir === '.') {
	    throw new Error('Cannot find package.json from unspecified directory');
	  }
	  
	  return pkginfo.find(pmodule, pathModule.dirname(dir));
	};

	//
	// ### function read (pmodule, dir)
	// #### @pmodule {Module} Parent module to read from.
	// #### @dir {string} **Optional** Directory to start search from.
	// Searches up the directory tree from `dir` until it finds a directory
	// which contains a `package.json` file and returns the package information.
	//
	pkginfo.read = function (pmodule, dir) { 
	  dir = pkginfo.find(pmodule, dir);
	  
	  var data = fs.readFileSync(dir).toString();
	      
	  return {
	    dir: dir, 
	    package: JSON.parse(data)
	  };
	};

	//
	// Call `pkginfo` on this module and expose version.
	//
	pkginfo(module, {
	  dir: __dirname,
	  include: ['version'],
	  target: pkginfo
	});
	});

	var transports = createCommonjsModule(function (module, exports) {
	/*
	 * transports.js: Set of all transports Winston knows about
	 *
	 * (C) 2010 Charlie Robbins
	 * MIT LICENCE
	 *
	 */



	//
	// Setup all transports as lazy-loaded getters.
	//
	Object.defineProperties(
	  exports,
	  ['Console', 'File', 'Http', 'Memory']
	    .reduce(function (acc, name) {
	      acc[name] = {
	        configurable: true,
	        enumerable: true,
	        get: function () {
	          var fullpath = pathModule.join(__dirname, 'transports', name.toLowerCase());
	          return exports[name] = commonjsRequire(fullpath)[name];
	        }
	      };

	      return acc;
	    }, {})
	);
	});

	var cycle_1 = createCommonjsModule(function (module, exports) {
	/*
	    cycle.js
	    2013-02-19

	    Public Domain.

	    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

	    This code should be minified before deployment.
	    See http://javascript.crockford.com/jsmin.html

	    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
	    NOT CONTROL.
	*/

	/*jslint evil: true, regexp: true */

	/*members $ref, apply, call, decycle, hasOwnProperty, length, prototype, push,
	    retrocycle, stringify, test, toString
	*/

	var cycle = exports;

	cycle.decycle = function decycle(object) {

	// Make a deep copy of an object or array, assuring that there is at most
	// one instance of each object or array in the resulting structure. The
	// duplicate references (which might be forming cycles) are replaced with
	// an object of the form
	//      {$ref: PATH}
	// where the PATH is a JSONPath string that locates the first occurance.
	// So,
	//      var a = [];
	//      a[0] = a;
	//      return JSON.stringify(JSON.decycle(a));
	// produces the string '[{"$ref":"$"}]'.

	// JSONPath is used to locate the unique object. $ indicates the top level of
	// the object or array. [NUMBER] or [STRING] indicates a child member or
	// property.

	    var objects = [],   // Keep a reference to each unique object or array
	        paths = [];     // Keep the path to each unique object or array

	    return (function derez(value, path) {

	// The derez recurses through the object, producing the deep copy.

	        var i,          // The loop counter
	            name,       // Property name
	            nu;         // The new object or array

	// typeof null === 'object', so go on if this value is really an object but not
	// one of the weird builtin objects.

	        if (typeof value === 'object' && value !== null &&
	                !(value instanceof Boolean) &&
	                !(value instanceof Date)    &&
	                !(value instanceof Number)  &&
	                !(value instanceof RegExp)  &&
	                !(value instanceof String)) {

	// If the value is an object or array, look to see if we have already
	// encountered it. If so, return a $ref/path object. This is a hard way,
	// linear search that will get slower as the number of unique objects grows.

	            for (i = 0; i < objects.length; i += 1) {
	                if (objects[i] === value) {
	                    return {$ref: paths[i]};
	                }
	            }

	// Otherwise, accumulate the unique value and its path.

	            objects.push(value);
	            paths.push(path);

	// If it is an array, replicate the array.

	            if (Object.prototype.toString.apply(value) === '[object Array]') {
	                nu = [];
	                for (i = 0; i < value.length; i += 1) {
	                    nu[i] = derez(value[i], path + '[' + i + ']');
	                }
	            } else {

	// If it is an object, replicate the object.

	                nu = {};
	                for (name in value) {
	                    if (Object.prototype.hasOwnProperty.call(value, name)) {
	                        nu[name] = derez(value[name],
	                            path + '[' + JSON.stringify(name) + ']');
	                    }
	                }
	            }
	            return nu;
	        }
	        return value;
	    }(object, '$'));
	};


	cycle.retrocycle = function retrocycle($) {

	// Restore an object that was reduced by decycle. Members whose values are
	// objects of the form
	//      {$ref: PATH}
	// are replaced with references to the value found by the PATH. This will
	// restore cycles. The object will be mutated.

	// The eval function is used to locate the values described by a PATH. The
	// root object is kept in a $ variable. A regular expression is used to
	// assure that the PATH is extremely well formed. The regexp contains nested
	// * quantifiers. That has been known to have extremely bad performance
	// problems on some browsers for very long strings. A PATH is expected to be
	// reasonably short. A PATH is allowed to belong to a very restricted subset of
	// Goessner's JSONPath.

	// So,
	//      var s = '[{"$ref":"$"}]';
	//      return JSON.retrocycle(JSON.parse(s));
	// produces an array containing a single element which is the array itself.

	    var px =
	        /^\$(?:\[(?:\d+|\"(?:[^\\\"\u0000-\u001f]|\\([\\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*\")\])*$/;

	    (function rez(value) {

	// The rez function walks recursively through the object looking for $ref
	// properties. When it finds one that has a value that is a path, then it
	// replaces the $ref object with a reference to the value that is found by
	// the path.

	        var i, item, name, path;

	        if (value && typeof value === 'object') {
	            if (Object.prototype.toString.apply(value) === '[object Array]') {
	                for (i = 0; i < value.length; i += 1) {
	                    item = value[i];
	                    if (item && typeof item === 'object') {
	                        path = item.$ref;
	                        if (typeof path === 'string' && px.test(path)) {
	                            value[i] = eval(path);
	                        } else {
	                            rez(item);
	                        }
	                    }
	                }
	            } else {
	                for (name in value) {
	                    if (typeof value[name] === 'object') {
	                        item = value[name];
	                        if (item) {
	                            path = item.$ref;
	                            if (typeof path === 'string' && px.test(path)) {
	                                value[name] = eval(path);
	                            } else {
	                                rez(item);
	                            }
	                        }
	                    }
	                }
	            }
	        }
	    }($));
	    return $;
	};
	});

	var styles_1 = createCommonjsModule(function (module) {
	/*
	The MIT License (MIT)

	Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.

	*/

	var styles = {};
	module['exports'] = styles;

	var codes = {
	  reset: [0, 0],

	  bold: [1, 22],
	  dim: [2, 22],
	  italic: [3, 23],
	  underline: [4, 24],
	  inverse: [7, 27],
	  hidden: [8, 28],
	  strikethrough: [9, 29],

	  black: [30, 39],
	  red: [31, 39],
	  green: [32, 39],
	  yellow: [33, 39],
	  blue: [34, 39],
	  magenta: [35, 39],
	  cyan: [36, 39],
	  white: [37, 39],
	  gray: [90, 39],
	  grey: [90, 39],

	  bgBlack: [40, 49],
	  bgRed: [41, 49],
	  bgGreen: [42, 49],
	  bgYellow: [43, 49],
	  bgBlue: [44, 49],
	  bgMagenta: [45, 49],
	  bgCyan: [46, 49],
	  bgWhite: [47, 49],

	  // legacy styles for colors pre v1.0.0
	  blackBG: [40, 49],
	  redBG: [41, 49],
	  greenBG: [42, 49],
	  yellowBG: [43, 49],
	  blueBG: [44, 49],
	  magentaBG: [45, 49],
	  cyanBG: [46, 49],
	  whiteBG: [47, 49]

	};

	Object.keys(codes).forEach(function (key) {
	  var val = codes[key];
	  var style = styles[key] = [];
	  style.open = '\u001b[' + val[0] + 'm';
	  style.close = '\u001b[' + val[1] + 'm';
	});
	});

	/*
	The MIT License (MIT)

	Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.

	*/

	var argv = process.argv;

	var supportsColors = (function () {
	  if (argv.indexOf('--no-color') !== -1 ||
	    argv.indexOf('--color=false') !== -1) {
	    return false;
	  }

	  if (argv.indexOf('--color') !== -1 ||
	    argv.indexOf('--color=true') !== -1 ||
	    argv.indexOf('--color=always') !== -1) {
	    return true;
	  }

	  if (process.stdout && !process.stdout.isTTY) {
	    return false;
	  }

	  if (process.platform === 'win32') {
	    return true;
	  }

	  if ('COLORTERM' in process.env) {
	    return true;
	  }

	  if (process.env.TERM === 'dumb') {
	    return false;
	  }

	  if (/^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(process.env.TERM)) {
	    return true;
	  }

	  return false;
	})();

	var trap = createCommonjsModule(function (module) {
	module['exports'] = function runTheTrap (text, options) {
	  var result = "";
	  text = text || "Run the trap, drop the bass";
	  text = text.split('');
	  var trap = {
	    a: ["\u0040", "\u0104", "\u023a", "\u0245", "\u0394", "\u039b", "\u0414"],
	    b: ["\u00df", "\u0181", "\u0243", "\u026e", "\u03b2", "\u0e3f"],
	    c: ["\u00a9", "\u023b", "\u03fe"],
	    d: ["\u00d0", "\u018a", "\u0500" , "\u0501" ,"\u0502", "\u0503"],
	    e: ["\u00cb", "\u0115", "\u018e", "\u0258", "\u03a3", "\u03be", "\u04bc", "\u0a6c"],
	    f: ["\u04fa"],
	    g: ["\u0262"],
	    h: ["\u0126", "\u0195", "\u04a2", "\u04ba", "\u04c7", "\u050a"],
	    i: ["\u0f0f"],
	    j: ["\u0134"],
	    k: ["\u0138", "\u04a0", "\u04c3", "\u051e"],
	    l: ["\u0139"],
	    m: ["\u028d", "\u04cd", "\u04ce", "\u0520", "\u0521", "\u0d69"],
	    n: ["\u00d1", "\u014b", "\u019d", "\u0376", "\u03a0", "\u048a"],
	    o: ["\u00d8", "\u00f5", "\u00f8", "\u01fe", "\u0298", "\u047a", "\u05dd", "\u06dd", "\u0e4f"],
	    p: ["\u01f7", "\u048e"],
	    q: ["\u09cd"],
	    r: ["\u00ae", "\u01a6", "\u0210", "\u024c", "\u0280", "\u042f"],
	    s: ["\u00a7", "\u03de", "\u03df", "\u03e8"],
	    t: ["\u0141", "\u0166", "\u0373"],
	    u: ["\u01b1", "\u054d"],
	    v: ["\u05d8"],
	    w: ["\u0428", "\u0460", "\u047c", "\u0d70"],
	    x: ["\u04b2", "\u04fe", "\u04fc", "\u04fd"],
	    y: ["\u00a5", "\u04b0", "\u04cb"],
	    z: ["\u01b5", "\u0240"]
	  };
	  text.forEach(function(c){
	    c = c.toLowerCase();
	    var chars = trap[c] || [" "];
	    var rand = Math.floor(Math.random() * chars.length);
	    if (typeof trap[c] !== "undefined") {
	      result += trap[c][rand];
	    } else {
	      result += c;
	    }
	  });
	  return result;

	};
	});

	var zalgo = createCommonjsModule(function (module) {
	// please no
	module['exports'] = function zalgo(text, options) {
	  text = text || "   he is here   ";
	  var soul = {
	    "up" : [
	      '̍', '̎', '̄', '̅',
	      '̿', '̑', '̆', '̐',
	      '͒', '͗', '͑', '̇',
	      '̈', '̊', '͂', '̓',
	      '̈', '͊', '͋', '͌',
	      '̃', '̂', '̌', '͐',
	      '̀', '́', '̋', '̏',
	      '̒', '̓', '̔', '̽',
	      '̉', 'ͣ', 'ͤ', 'ͥ',
	      'ͦ', 'ͧ', 'ͨ', 'ͩ',
	      'ͪ', 'ͫ', 'ͬ', 'ͭ',
	      'ͮ', 'ͯ', '̾', '͛',
	      '͆', '̚'
	    ],
	    "down" : [
	      '̖', '̗', '̘', '̙',
	      '̜', '̝', '̞', '̟',
	      '̠', '̤', '̥', '̦',
	      '̩', '̪', '̫', '̬',
	      '̭', '̮', '̯', '̰',
	      '̱', '̲', '̳', '̹',
	      '̺', '̻', '̼', 'ͅ',
	      '͇', '͈', '͉', '͍',
	      '͎', '͓', '͔', '͕',
	      '͖', '͙', '͚', '̣'
	    ],
	    "mid" : [
	      '̕', '̛', '̀', '́',
	      '͘', '̡', '̢', '̧',
	      '̨', '̴', '̵', '̶',
	      '͜', '͝', '͞',
	      '͟', '͠', '͢', '̸',
	      '̷', '͡', ' ҉'
	    ]
	  },
	  all = [].concat(soul.up, soul.down, soul.mid);

	  function randomNumber(range) {
	    var r = Math.floor(Math.random() * range);
	    return r;
	  }

	  function is_char(character) {
	    var bool = false;
	    all.filter(function (i) {
	      bool = (i === character);
	    });
	    return bool;
	  }
	  

	  function heComes(text, options) {
	    var result = '', counts, l;
	    options = options || {};
	    options["up"] = options["up"] || true;
	    options["mid"] = options["mid"] || true;
	    options["down"] = options["down"] || true;
	    options["size"] = options["size"] || "maxi";
	    text = text.split('');
	    for (l in text) {
	      if (is_char(l)) {
	        continue;
	      }
	      result = result + text[l];
	      counts = {"up" : 0, "down" : 0, "mid" : 0};
	      switch (options.size) {
	      case 'mini':
	        counts.up = randomNumber(8);
	        counts.min = randomNumber(2);
	        counts.down = randomNumber(8);
	        break;
	      case 'maxi':
	        counts.up = randomNumber(16) + 3;
	        counts.min = randomNumber(4) + 1;
	        counts.down = randomNumber(64) + 3;
	        break;
	      default:
	        counts.up = randomNumber(8) + 1;
	        counts.mid = randomNumber(6) / 2;
	        counts.down = randomNumber(8) + 1;
	        break;
	      }

	      var arr = ["up", "mid", "down"];
	      for (var d in arr) {
	        var index = arr[d];
	        for (var i = 0 ; i <= counts[index]; i++) {
	          if (options[index]) {
	            result = result + soul[index][randomNumber(soul[index].length)];
	          }
	        }
	      }
	    }
	    return result;
	  }
	  // don't summon him
	  return heComes(text);
	};
	});

	var america = createCommonjsModule(function (module) {
	module['exports'] = (function() {
	  return function (letter, i, exploded) {
	    if(letter === " ") return letter;
	    switch(i%3) {
	      case 0: return colors_1.red(letter);
	      case 1: return colors_1.white(letter)
	      case 2: return colors_1.blue(letter)
	    }
	  }
	})();
	});

	var zebra = createCommonjsModule(function (module) {
	module['exports'] = function (letter, i, exploded) {
	  return i % 2 === 0 ? letter : colors_1.inverse(letter);
	};
	});

	var rainbow = createCommonjsModule(function (module) {
	module['exports'] = (function () {
	  var rainbowColors = ['red', 'yellow', 'green', 'blue', 'magenta']; //RoY G BiV
	  return function (letter, i, exploded) {
	    if (letter === " ") {
	      return letter;
	    } else {
	      return colors_1[rainbowColors[i++ % rainbowColors.length]](letter);
	    }
	  };
	})();
	});

	var random = createCommonjsModule(function (module) {
	module['exports'] = (function () {
	  var available = ['underline', 'inverse', 'grey', 'yellow', 'red', 'green', 'blue', 'white', 'cyan', 'magenta'];
	  return function(letter, i, exploded) {
	    return letter === " " ? letter : colors_1[available[Math.round(Math.random() * (available.length - 1))]](letter);
	  };
	})();
	});

	var colors_1 = createCommonjsModule(function (module) {
	/*

	The MIT License (MIT)

	Original Library 
	  - Copyright (c) Marak Squires

	Additional functionality
	 - Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.

	*/

	var colors = {};
	module['exports'] = colors;

	colors.themes = {};

	var ansiStyles = colors.styles = styles_1;
	var defineProps = Object.defineProperties;

	colors.supportsColor = supportsColors;

	if (typeof colors.enabled === "undefined") {
	  colors.enabled = colors.supportsColor;
	}

	colors.stripColors = colors.strip = function(str){
	  return ("" + str).replace(/\x1B\[\d+m/g, '');
	};


	var stylize = colors.stylize = function stylize (str, style) {
	  return ansiStyles[style].open + str + ansiStyles[style].close;
	};

	var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
	var escapeStringRegexp = function (str) {
	  if (typeof str !== 'string') {
	    throw new TypeError('Expected a string');
	  }
	  return str.replace(matchOperatorsRe,  '\\$&');
	};

	function build(_styles) {
	  var builder = function builder() {
	    return applyStyle.apply(builder, arguments);
	  };
	  builder._styles = _styles;
	  // __proto__ is used because we must return a function, but there is
	  // no way to create a function with a different prototype.
	  builder.__proto__ = proto;
	  return builder;
	}

	var styles = (function () {
	  var ret = {};
	  ansiStyles.grey = ansiStyles.gray;
	  Object.keys(ansiStyles).forEach(function (key) {
	    ansiStyles[key].closeRe = new RegExp(escapeStringRegexp(ansiStyles[key].close), 'g');
	    ret[key] = {
	      get: function () {
	        return build(this._styles.concat(key));
	      }
	    };
	  });
	  return ret;
	})();

	var proto = defineProps(function colors() {}, styles);

	function applyStyle() {
	  var args = arguments;
	  var argsLen = args.length;
	  var str = argsLen !== 0 && String(arguments[0]);
	  if (argsLen > 1) {
	    for (var a = 1; a < argsLen; a++) {
	      str += ' ' + args[a];
	    }
	  }

	  if (!colors.enabled || !str) {
	    return str;
	  }

	  var nestedStyles = this._styles;

	  var i = nestedStyles.length;
	  while (i--) {
	    var code = ansiStyles[nestedStyles[i]];
	    str = code.open + str.replace(code.closeRe, code.open) + code.close;
	  }

	  return str;
	}

	function applyTheme (theme) {
	  for (var style in theme) {
	    (function(style){
	      colors[style] = function(str){
	        return colors[theme[style]](str);
	      };
	    })(style);
	  }
	}

	colors.setTheme = function (theme) {
	  if (typeof theme === 'string') {
	    try {
	      colors.themes[theme] = commonjsRequire(theme);
	      applyTheme(colors.themes[theme]);
	      return colors.themes[theme];
	    } catch (err) {
	      console.log(err);
	      return err;
	    }
	  } else {
	    applyTheme(theme);
	  }
	};

	function init() {
	  var ret = {};
	  Object.keys(styles).forEach(function (name) {
	    ret[name] = {
	      get: function () {
	        return build([name]);
	      }
	    };
	  });
	  return ret;
	}

	var sequencer = function sequencer (map, str) {
	  var exploded = str.split("");
	  exploded = exploded.map(map);
	  return exploded.join("");
	};

	// custom formatter methods
	colors.trap = trap;
	colors.zalgo = zalgo;

	// maps
	colors.maps = {};
	colors.maps.america = america;
	colors.maps.zebra = zebra;
	colors.maps.rainbow = rainbow;
	colors.maps.random = random;

	for (var map in colors.maps) {
	  (function(map){
	    colors[map] = function (str) {
	      return sequencer(colors.maps[map], str);
	    };
	  })(map);
	}

	defineProps(colors, init());
	});

	var safe = createCommonjsModule(function (module) {
	//
	// Remark: Requiring this file will use the "safe" colors API which will not touch String.prototype
	//
	//   var colors = require('colors/safe);
	//   colors.red("foo")
	//
	//

	module['exports'] = colors_1;
	});

	var cliConfig_1 = createCommonjsModule(function (module, exports) {
	/*
	 * cli-config.js: Config that conform to commonly used CLI logging levels.
	 *
	 * (C) 2010 Charlie Robbins
	 * MIT LICENCE
	 *
	 */

	var cliConfig = exports;

	cliConfig.levels = {
	  error: 0,
	  warn: 1,
	  help: 2,
	  data: 3,
	  info: 4,
	  debug: 5,
	  prompt: 6,
	  verbose: 7,
	  input: 8,
	  silly: 9,
	};

	cliConfig.colors = {
	  error: 'red',
	  warn: 'yellow',
	  help: 'cyan',
	  data: 'grey',
	  info: 'green',
	  debug: 'blue',
	  prompt: 'grey',
	  verbose: 'cyan',
	  input: 'grey',
	  silly: 'magenta'
	};
	});

	var npmConfig_1 = createCommonjsModule(function (module, exports) {
	/*
	 * npm-config.js: Config that conform to npm logging levels.
	 *
	 * (C) 2010 Charlie Robbins
	 * MIT LICENCE
	 *
	 */

	var npmConfig = exports;

	npmConfig.levels = {
	  error: 0,
	  warn: 1,
	  info: 2,
	  verbose: 3,
	  debug: 4,
	  silly: 5
	};

	npmConfig.colors = {
	  error: 'red',
	  warn: 'yellow',
	  info: 'green',
	  verbose: 'cyan',
	  debug: 'blue',
	  silly: 'magenta'
	};
	});

	var syslogConfig_1 = createCommonjsModule(function (module, exports) {
	/*
	 * syslog-config.js: Config that conform to syslog logging levels.
	 *
	 * (C) 2010 Charlie Robbins
	 * MIT LICENCE
	 *
	 */

	var syslogConfig = exports;

	syslogConfig.levels = {
	  emerg: 0,
	  alert: 1,
	  crit: 2,
	  error: 3,
	  warning: 4,
	  notice: 5,
	  info: 6,
	  debug: 7
	};

	syslogConfig.colors = {
	  emerg: 'red',
	  alert: 'yellow',
	  crit: 'red',
	  error: 'red',
	  warning: 'red',
	  notice: 'yellow',
	  info: 'green',
	  debug: 'blue'
	};
	});

	var config_1 = createCommonjsModule(function (module, exports) {
	/*
	 * config.js: Default settings for all levels that winston knows about
	 *
	 * (C) 2010 Charlie Robbins
	 * MIT LICENCE
	 *
	 */



	// Fix colors not appearing in non-tty environments
	safe.enabled = true;

	var config = exports,
	    allColors = exports.allColors = {};

	config.addColors = function (colors) {
	  mixin(allColors, colors);
	};

	config.colorize = function (level, message) {
	  if (typeof message === 'undefined') message = level;

	  var colorized = message;
	  if (allColors[level] instanceof Array) {
	    for (var i = 0, l = allColors[level].length; i < l; ++i) {
	      colorized = safe[allColors[level][i]](colorized);
	    }
	  }
	  else if (allColors[level].match(/\s/)) {
	    var colorArr = allColors[level].split(/\s+/);
	    for (var i = 0; i < colorArr.length; ++i) {
	      colorized = safe[colorArr[i]](colorized);
	    }
	    allColors[level] = colorArr;
	  }
	  else {
	    colorized = safe[allColors[level]](colorized);
	  }

	  return colorized;
	};

	//
	// Export config sets
	//
	config.cli    = cliConfig_1;
	config.npm    = npmConfig_1;
	config.syslog = syslogConfig_1;

	//
	// Add colors for pre-defined config sets
	//
	config.addColors(config.cli.colors);
	config.addColors(config.npm.colors);
	config.addColors(config.syslog.colors);

	function mixin (target) {
	  var args = Array.prototype.slice.call(arguments, 1);

	  args.forEach(function (a) {
	    var keys = Object.keys(a);
	    for (var i = 0; i < keys.length; i++) {
	      target[keys[i]] = a[keys[i]];
	    }
	  });
	  return target;
	}});
	var config_2 = config_1.allColors;

	var common$1 = createCommonjsModule(function (module, exports) {
	/*
	 * common.js: Internal helper and utility functions for winston
	 *
	 * (C) 2010 Charlie Robbins
	 * MIT LICENCE
	 *
	 */

	var StringDecoder = string_decoder.StringDecoder,
	    Stream = stream.Stream;

	//
	// ### function setLevels (target, past, current)
	// #### @target {Object} Object on which to set levels.
	// #### @past {Object} Previous levels set on target.
	// #### @current {Object} Current levels to set on target.
	// Create functions on the target objects for each level
	// in current.levels. If past is defined, remove functions
	// for each of those levels.
	//
	exports.setLevels = function (target, past, current, isDefault) {
	  if (past) {
	    Object.keys(past).forEach(function (level) {
	      delete target[level];
	    });
	  }

	  target.levels = current || config_1.npm.levels;
	  if (target.padLevels) {
	    target.levelLength = exports.longestElement(Object.keys(target.levels));
	  }

	  //
	  //  Define prototype methods for each log level
	  //  e.g. target.log('info', msg) <=> target.info(msg)
	  //
	  Object.keys(target.levels).forEach(function (level) {

	    // TODO Refactor logging methods into a different object to avoid name clashes
	    if (level === 'log') {
	      console.warn('Log level named "log" will clash with the method "log". Consider using a different name.');
	      return;
	    }

	    target[level] = function (msg) {
	      // build argument list (level, msg, ... [string interpolate], [{metadata}], [callback])
	      var args = [level].concat(Array.prototype.slice.call(arguments));
	      target.log.apply(target, args);
	    };
	  });

	  return target;
	};

	//
	// ### function longestElement
	// #### @xs {Array} Array to calculate against
	// Returns the longest element in the `xs` array.
	//
	exports.longestElement = function (xs) {
	  return Math.max.apply(
	    null,
	    xs.map(function (x) { return x.length; })
	  );
	};

	//
	// ### function clone (obj)
	// #### @obj {Object} Object to clone.
	// Helper method for deep cloning pure JSON objects
	// i.e. JSON objects that are either literals or objects (no Arrays, etc)
	//
	exports.clone = function (obj) {
	  //
	  // We only need to clone reference types (Object)
	  //
	  var copy = {};

	  if (obj instanceof Error) {
	    // With potential custom Error objects, this might not be exactly correct,
	    // but probably close-enough for purposes of this lib.
	    copy = new Error(obj.message);
	    Object.getOwnPropertyNames(obj).forEach(function (key) {
	      copy[key] = obj[key];
	    });

	    return copy;
	  }
	  else if (!(obj instanceof Object)) {
	    return obj;
	  }
	  else if (obj instanceof Date) {
	    return new Date(obj.getTime());
	  }

	  for (var i in obj) {
	    if (Array.isArray(obj[i])) {
	      copy[i] = obj[i].slice(0);
	    }
	    else if (obj[i] instanceof Buffer) {
	        copy[i] = obj[i].slice(0);
	    }
	    else if (typeof obj[i] != 'function') {
	      copy[i] = obj[i] instanceof Object ? exports.clone(obj[i]) : obj[i];
	    }
	    else if (typeof obj[i] === 'function') {
	      copy[i] = obj[i];
	    }
	  }

	  return copy;
	};

	//
	// ### function log (options)
	// #### @options {Object} All information about the log serialization.
	// Generic logging function for returning timestamped strings
	// with the following options:
	//
	//    {
	//      level:     'level to add to serialized message',
	//      message:   'message to serialize',
	//      meta:      'additional logging metadata to serialize',
	//      colorize:  false, // Colorizes output (only if `.json` is false)
	//      align:     false  // Align message level.
	//      timestamp: true   // Adds a timestamp to the serialized message
	//      label:     'label to prepend the message'
	//    }
	//
	exports.log = function (options) {
	  var timestampFn = typeof options.timestamp === 'function'
	        ? options.timestamp
	        : exports.timestamp,
	      timestamp   = options.timestamp ? timestampFn() : null,
	      showLevel   = options.showLevel === undefined ? true : options.showLevel,
	      meta        = options.meta !== null && options.meta !== undefined && !(options.meta instanceof Error)
	        ? exports.clone(cycle_1.decycle(options.meta))
	        : options.meta || null,
	      output;

	  //
	  // raw mode is intended for outputing winston as streaming JSON to STDOUT
	  //
	  if (options.raw) {
	    if (typeof meta !== 'object' && meta != null) {
	      meta = { meta: meta };
	    }
	    output         = exports.clone(meta) || {};
	    output.level   = options.level;
	    //
	    // Remark (jcrugzz): This used to be output.message = options.message.stripColors.
	    // I do not know why this is, it does not make sense but im handling that
	    // case here as well as handling the case that does make sense which is to
	    // make the `output.message = options.message`
	    //
	    output.message = options.message.stripColors
	      ? options.message.stripColors
	      : options.message;

	    return JSON.stringify(output);
	  }

	  //
	  // json mode is intended for pretty printing multi-line json to the terminal
	  //
	  if (options.json || true === options.logstash) {
	    if (typeof meta !== 'object' && meta != null) {
	      meta = { meta: meta };
	    }

	    output         = exports.clone(meta) || {};
	    output.level   = options.level;
	    output.message = output.message || '';

	    if (options.label) { output.label = options.label; }
	    if (options.message) { output.message = options.message; }
	    if (timestamp) { output.timestamp = timestamp; }

	    if (options.logstash === true) {
	      // use logstash format
	      var logstashOutput = {};
	      if (output.message !== undefined) {
	        logstashOutput['@message'] = output.message;
	        delete output.message;
	      }

	      if (output.timestamp !== undefined) {
	        logstashOutput['@timestamp'] = output.timestamp;
	        delete output.timestamp;
	      }

	      logstashOutput['@fields'] = exports.clone(output);
	      output = logstashOutput;
	    }

	    if (typeof options.stringify === 'function') {
	      return options.stringify(output);
	    }

	    return JSON.stringify(output, function (key, value) {
	      return value instanceof Buffer
	        ? value.toString('base64')
	        : value;
	    });
	  }

	  //
	  // Remark: this should really be a call to `util.format`.
	  //
	  if (typeof options.formatter == 'function') {
	    return String(options.formatter(exports.clone(options)));
	  }

	  output = timestamp ? timestamp + ' - ' : '';
	  if (showLevel) {
	    output += options.colorize === 'all' || options.colorize === 'level' || options.colorize === true
	      ? config_1.colorize(options.level)
	      : options.level;
	  }

	  output += (options.align) ? '\t' : '';
	  output += (timestamp || showLevel) ? ': ' : '';
	  output += options.label ? ('[' + options.label + '] ') : '';
	  output += options.colorize === 'all' || options.colorize === 'message'
	    ? config_1.colorize(options.level, options.message)
	    : options.message;

	  if (meta !== null && meta !== undefined) {
	    if (meta && meta instanceof Error && meta.stack) {
	      meta = meta.stack;
	    }

	    if (typeof meta !== 'object') {
	      output += ' ' + meta;
	    }
	    else if (Object.keys(meta).length > 0) {
	      if (typeof options.prettyPrint === 'function') {
	        output += ' ' + options.prettyPrint(meta);
	      } else if (options.prettyPrint) {
	        output += ' ' + '\n' + util.inspect(meta, false, options.depth || null, options.colorize);
	      } else if (
	        options.humanReadableUnhandledException
	          && Object.keys(meta).length === 5
	          && meta.hasOwnProperty('date')
	          && meta.hasOwnProperty('process')
	          && meta.hasOwnProperty('os')
	          && meta.hasOwnProperty('trace')
	          && meta.hasOwnProperty('stack')) {

	        //
	        // If meta carries unhandled exception data serialize the stack nicely
	        //
	        var stack = meta.stack;
	        delete meta.stack;
	        delete meta.trace;
	        output += ' ' + exports.serialize(meta);
	        output += '\n' + stack.join('\n');
	      } else {
	        output += ' ' + exports.serialize(meta);
	      }
	    }
	  }

	  return output;
	};

	exports.capitalize = function (str) {
	  return str && str[0].toUpperCase() + str.slice(1);
	};

	//
	// ### function hash (str)
	// #### @str {string} String to hash.
	// Utility function for creating unique ids
	// e.g. Profiling incoming HTTP requests on the same tick
	//
	exports.hash = function (str) {
	  return crypto.createHash('sha1').update(str).digest('hex');
	};

	//
	// ### function pad (n)
	// Returns a padded string if `n < 10`.
	//
	exports.pad = function (n) {
	  return n < 10 ? '0' + n.toString(10) : n.toString(10);
	};

	//
	// ### function timestamp ()
	// Returns a timestamp string for the current time.
	//
	exports.timestamp = function () {
	  return new Date().toISOString();
	};

	//
	// ### function serialize (obj, key)
	// #### @obj {Object|literal} Object to serialize
	// #### @key {string} **Optional** Optional key represented by obj in a larger object
	// Performs simple comma-separated, `key=value` serialization for Loggly when
	// logging to non-JSON inputs.
	//
	exports.serialize = function (obj, key) {
	  if (obj === null) {
	    obj = 'null';
	  }
	  else if (obj === undefined) {
	    obj = 'undefined';
	  }
	  else if (obj === false) {
	    obj = 'false';
	  }

	  if (typeof obj !== 'object') {
	    return key ? key + '=' + obj : obj;
	  }

	  if (obj instanceof Buffer) {
	    return key ? key + '=' + obj.toString('base64') : obj.toString('base64');
	  }

	  var msg = '',
	      keys = Object.keys(obj),
	      length = keys.length;

	  for (var i = 0; i < length; i++) {
	    if (Array.isArray(obj[keys[i]])) {
	      msg += keys[i] + '=[';

	      for (var j = 0, l = obj[keys[i]].length; j < l; j++) {
	        msg += exports.serialize(obj[keys[i]][j]);
	        if (j < l - 1) {
	          msg += ', ';
	        }
	      }

	      msg += ']';
	    }
	    else if (obj[keys[i]] instanceof Date) {
	      msg += keys[i] + '=' + obj[keys[i]];
	    }
	    else {
	      msg += exports.serialize(obj[keys[i]], keys[i]);
	    }

	    if (i < length - 1) {
	      msg += ', ';
	    }
	  }

	  return msg;
	};

	//
	// ### function tailFile (options, callback)
	// #### @options {Object} Options for tail.
	// #### @callback {function} Callback to execute on every line.
	// `tail -f` a file. Options must include file.
	//
	exports.tailFile = function(options, callback) {
	  var buffer = new Buffer(64 * 1024)
	    , decode = new StringDecoder('utf8')
	    , stream$$1 = new Stream
	    , buff = ''
	    , pos = 0
	    , row = 0;

	  if (options.start === -1) {
	    delete options.start;
	  }

	  stream$$1.readable = true;
	  stream$$1.destroy = function() {
	    stream$$1.destroyed = true;
	    stream$$1.emit('end');
	    stream$$1.emit('close');
	  };

	  fs.open(options.file, 'a+', '0644', function(err, fd) {
	    if (err) {
	      if (!callback) {
	        stream$$1.emit('error', err);
	      } else {
	        callback(err);
	      }
	      stream$$1.destroy();
	      return;
	    }

	    (function read() {
	      if (stream$$1.destroyed) {
	        fs.close(fd);
	        return;
	      }

	      return fs.read(fd, buffer, 0, buffer.length, pos, function(err, bytes) {
	        if (err) {
	          if (!callback) {
	            stream$$1.emit('error', err);
	          } else {
	            callback(err);
	          }
	          stream$$1.destroy();
	          return;
	        }

	        if (!bytes) {
	          if (buff) {
	            if (options.start == null || row > options.start) {
	              if (!callback) {
	                stream$$1.emit('line', buff);
	              } else {
	                callback(null, buff);
	              }
	            }
	            row++;
	            buff = '';
	          }
	          return setTimeout(read, 1000);
	        }

	        var data = decode.write(buffer.slice(0, bytes));

	        if (!callback) {
	          stream$$1.emit('data', data);
	        }

	        var data = (buff + data).split(/\n+/)
	          , l = data.length - 1
	          , i = 0;

	        for (; i < l; i++) {
	          if (options.start == null || row > options.start) {
	            if (!callback) {
	              stream$$1.emit('line', data[i]);
	            } else {
	              callback(null, data[i]);
	            }
	          }
	          row++;
	        }

	        buff = data[l];

	        pos += bytes;

	        return read();
	      });
	    })();
	  });

	  if (!callback) {
	    return stream$$1;
	  }

	  return stream$$1.destroy;
	};

	//
	// ### function stringArrayToSet (array)
	// #### @strArray {Array} Array of Set-elements as strings.
	// #### @errMsg {string} **Optional** Custom error message thrown on invalid input.
	// Returns a Set-like object with strArray's elements as keys (each with the value true).
	//
	exports.stringArrayToSet = function (strArray, errMsg) {
	  if (typeof errMsg === 'undefined') {
	    errMsg = 'Cannot make set from Array with non-string elements';
	  }
	  return strArray.reduce(function (set, el) {
	    if (!(typeof el === 'string' || el instanceof String)) {
	      throw new Error(errMsg);
	    }
	    set[el] = true;
	    return set;
	  }, Object.create(null));
	};
	});
	var common_1 = common$1.setLevels;
	var common_2 = common$1.longestElement;
	var common_3 = common$1.clone;
	var common_4 = common$1.log;
	var common_5 = common$1.capitalize;
	var common_6 = common$1.hash;
	var common_7 = common$1.pad;
	var common_8 = common$1.timestamp;
	var common_9 = common$1.serialize;
	var common_10 = common$1.tailFile;
	var common_11 = common$1.stringArrayToSet;

	var stackTrace = createCommonjsModule(function (module, exports) {
	exports.get = function(belowFn) {
	  var oldLimit = Error.stackTraceLimit;
	  Error.stackTraceLimit = Infinity;

	  var dummyObject = {};

	  var v8Handler = Error.prepareStackTrace;
	  Error.prepareStackTrace = function(dummyObject, v8StackTrace) {
	    return v8StackTrace;
	  };
	  Error.captureStackTrace(dummyObject, belowFn || exports.get);

	  var v8StackTrace = dummyObject.stack;
	  Error.prepareStackTrace = v8Handler;
	  Error.stackTraceLimit = oldLimit;

	  return v8StackTrace;
	};

	exports.parse = function(err) {
	  if (!err.stack) {
	    return [];
	  }

	  var self = this;
	  var lines = err.stack.split('\n').slice(1);

	  return lines
	    .map(function(line) {
	      if (line.match(/^\s*[-]{4,}$/)) {
	        return self._createParsedCallSite({
	          fileName: line,
	          lineNumber: null,
	          functionName: null,
	          typeName: null,
	          methodName: null,
	          columnNumber: null,
	          'native': null,
	        });
	      }

	      var lineMatch = line.match(/at (?:(.+)\s+\()?(?:(.+?):(\d+)(?::(\d+))?|([^)]+))\)?/);
	      if (!lineMatch) {
	        return;
	      }

	      var object = null;
	      var method = null;
	      var functionName = null;
	      var typeName = null;
	      var methodName = null;
	      var isNative = (lineMatch[5] === 'native');

	      if (lineMatch[1]) {
	        functionName = lineMatch[1];
	        var methodStart = functionName.lastIndexOf('.');
	        if (functionName[methodStart-1] == '.')
	          methodStart--;
	        if (methodStart > 0) {
	          object = functionName.substr(0, methodStart);
	          method = functionName.substr(methodStart + 1);
	          var objectEnd = object.indexOf('.Module');
	          if (objectEnd > 0) {
	            functionName = functionName.substr(objectEnd + 1);
	            object = object.substr(0, objectEnd);
	          }
	        }
	        typeName = null;
	      }

	      if (method) {
	        typeName = object;
	        methodName = method;
	      }

	      if (method === '<anonymous>') {
	        methodName = null;
	        functionName = null;
	      }

	      var properties = {
	        fileName: lineMatch[2] || null,
	        lineNumber: parseInt(lineMatch[3], 10) || null,
	        functionName: functionName,
	        typeName: typeName,
	        methodName: methodName,
	        columnNumber: parseInt(lineMatch[4], 10) || null,
	        'native': isNative,
	      };

	      return self._createParsedCallSite(properties);
	    })
	    .filter(function(callSite) {
	      return !!callSite;
	    });
	};

	function CallSite(properties) {
	  for (var property in properties) {
	    this[property] = properties[property];
	  }
	}

	var strProperties = [
	  'this',
	  'typeName',
	  'functionName',
	  'methodName',
	  'fileName',
	  'lineNumber',
	  'columnNumber',
	  'function',
	  'evalOrigin'
	];
	var boolProperties = [
	  'topLevel',
	  'eval',
	  'native',
	  'constructor'
	];
	strProperties.forEach(function (property) {
	  CallSite.prototype[property] = null;
	  CallSite.prototype['get' + property[0].toUpperCase() + property.substr(1)] = function () {
	    return this[property];
	  };
	});
	boolProperties.forEach(function (property) {
	  CallSite.prototype[property] = false;
	  CallSite.prototype['is' + property[0].toUpperCase() + property.substr(1)] = function () {
	    return this[property];
	  };
	});

	exports._createParsedCallSite = function(properties) {
	  return new CallSite(properties);
	};
	});
	var stackTrace_1 = stackTrace.get;
	var stackTrace_2 = stackTrace.parse;
	var stackTrace_3 = stackTrace._createParsedCallSite;

	var exception_1 = createCommonjsModule(function (module, exports) {
	/*
	 * exception.js: Utility methods for gathing information about uncaughtExceptions.
	 *
	 * (C) 2010 Charlie Robbins
	 * MIT LICENCE
	 *
	 */



	var exception = exports;

	exception.getAllInfo = function (err) {
	  return {
	    date:    new Date().toString(),
	    process: exception.getProcessInfo(),
	    os:      exception.getOsInfo(),
	    trace:   exception.getTrace(err),
	    stack:   err.stack && err.stack.split('\n')
	  };
	};

	exception.getProcessInfo = function () {
	  return {
	    pid:         process.pid,
	    uid:         process.getuid ? process.getuid() : null,
	    gid:         process.getgid ? process.getgid() : null,
	    cwd:         process.cwd(),
	    execPath:    process.execPath,
	    version:     process.version,
	    argv:        process.argv,
	    memoryUsage: process.memoryUsage()
	  };
	};

	exception.getOsInfo = function () {
	  return {
	    loadavg: os.loadavg(),
	    uptime:  os.uptime()
	  };
	};

	exception.getTrace = function (err) {
	  var trace = err ? stackTrace.parse(err) : stackTrace.get();
	  return trace.map(function (site) {
	    return {
	      column:   site.getColumnNumber(),
	      file:     site.getFileName(),
	      function: site.getFunctionName(),
	      line:     site.getLineNumber(),
	      method:   site.getMethodName(),
	      native:   site.isNative(),
	    }
	  });
	};
	});

	var container = createCommonjsModule(function (module, exports) {
	/*
	 * container.js: Inversion of control container for winston logger instances
	 *
	 * (C) 2010 Charlie Robbins
	 * MIT LICENCE
	 *
	 */

	var extend = util._extend;

	//
	// ### function Container (options)
	// #### @options {Object} Default pass-thru options for Loggers
	// Constructor function for the Container object responsible for managing
	// a set of `winston.Logger` instances based on string ids.
	//
	var Container = exports.Container = function (options) {
	  this.loggers = {};
	  this.options = options || {};
	  this.default = {
	    transports: [
	      new winston_1.transports.Console({
	        level: 'silly',
	        colorize: false
	      })
	    ]
	  };
	};

	//
	// ### function get / add (id, options)
	// #### @id {string} Id of the Logger to get
	// #### @options {Object} **Optional** Options for the Logger instance
	// Retreives a `winston.Logger` instance for the specified `id`. If
	// an instance does not exist, one is created.
	//
	Container.prototype.get = Container.prototype.add = function (id, options) {
	  var self = this,
	      existing;

	  if (!this.loggers[id]) {
	    //
	    // Remark: Simple shallow clone for configuration options in case we pass in
	    // instantiated protoypal objects
	    //
	    options = extend({}, options || this.options || this.default);
	    existing = options.transports || this.options.transports;
	    //
	    // Remark: Make sure if we have an array of transports we slice it to make copies
	    // of those references.
	    //
	    options.transports = existing ? existing.slice() : [];

	    if (options.transports.length === 0 && (!options || !options['console'])) {
	      options.transports.push(this.default.transports[0]);
	    }

	    Object.keys(options).forEach(function (key) {
	      if (key === 'transports') {
	        return;
	      }

	      var name = common$1.capitalize(key);

	      if (!winston_1.transports[name]) {
	        throw new Error('Cannot add unknown transport: ' + name);
	      }

	      var namedOptions = options[key];
	      namedOptions.id = id;
	      options.transports.push(new (winston_1.transports[name])(namedOptions));
	    });

	    this.loggers[id] = new winston_1.Logger(options);

	    this.loggers[id].on('close', function () {
	        self._delete(id);
	    });
	  }

	  return this.loggers[id];
	};

	//
	// ### function close (id)
	// #### @id {string} **Optional** Id of the Logger instance to find
	// Returns a boolean value indicating if this instance
	// has a logger with the specified `id`.
	//
	Container.prototype.has = function (id) {
	  return !!this.loggers[id];
	};

	//
	// ### function close (id)
	// #### @id {string} **Optional** Id of the Logger instance to close
	// Closes a `Logger` instance with the specified `id` if it exists.
	// If no `id` is supplied then all Loggers are closed.
	//
	Container.prototype.close = function (id) {
	  var self = this;

	  function _close (id) {
	    if (!self.loggers[id]) {
	      return;
	    }

	    self.loggers[id].close();
	    self._delete(id);
	  }

	  return id ? _close(id) : Object.keys(this.loggers).forEach(function (id) {
	    _close(id);
	  });
	};

	//
	// ### @private function _delete (id)
	// #### @id {string} Id of the Logger instance to delete from container
	// Deletes a `Logger` instance with the specified `id`.
	//
	Container.prototype._delete = function (id) {
	    delete this.loggers[id];
	};
	});
	var container_1 = container.Container;

	var async$1 = createCommonjsModule(function (module) {
	/*!
	 * async
	 * https://github.com/caolan/async
	 *
	 * Copyright 2010-2014 Caolan McMahon
	 * Released under the MIT license
	 */
	(function () {

	    var async = {};
	    var noop = function () {};

	    // global on the server, window in the browser
	    var root, previous_async;

	    if (typeof window == 'object' && this === window) {
	        root = window;
	    }
	    else if (typeof commonjsGlobal == 'object' && this === commonjsGlobal) {
	        root = commonjsGlobal;
	    }
	    else {
	        root = this;
	    }

	    if (root != null) {
	      previous_async = root.async;
	    }

	    async.noConflict = function () {
	        root.async = previous_async;
	        return async;
	    };

	    function only_once(fn) {
	        var called = false;
	        return function() {
	            if (called) throw new Error("Callback was already called.");
	            called = true;
	            fn.apply(root, arguments);
	        };
	    }

	    //// cross-browser compatiblity functions ////

	    var _toString = Object.prototype.toString;

	    var _isArray = Array.isArray || function (obj) {
	        return _toString.call(obj) === '[object Array]';
	    };

	    var _each = function (arr, iterator) {
	      var index = -1,
	          length = arr.length;

	      while (++index < length) {
	        iterator(arr[index], index, arr);
	      }
	    };

	    var _map = function (arr, iterator) {
	      var index = -1,
	          length = arr.length,
	          result = Array(length);

	      while (++index < length) {
	        result[index] = iterator(arr[index], index, arr);
	      }
	      return result;
	    };

	    var _reduce = function (arr, iterator, memo) {
	        _each(arr, function (x, i, a) {
	            memo = iterator(memo, x, i, a);
	        });
	        return memo;
	    };

	    var _forEachOf = function (object, iterator) {
	        _each(_keys(object), function (key) {
	            iterator(object[key], key);
	        });
	    };

	    var _keys = Object.keys || function (obj) {
	        var keys = [];
	        for (var k in obj) {
	            if (obj.hasOwnProperty(k)) {
	                keys.push(k);
	            }
	        }
	        return keys;
	    };

	    var _baseSlice = function (arr, start) {
	        start = start || 0;
	        var index = -1;
	        var length = arr.length;

	        if (start) {
	          length -= start;
	          length = length < 0 ? 0 : length;
	        }
	        var result = Array(length);

	        while (++index < length) {
	          result[index] = arr[index + start];
	        }
	        return result;
	    };

	    //// exported async module functions ////

	    //// nextTick implementation with browser-compatible fallback ////

	    // capture the global reference to guard against fakeTimer mocks
	    var _setImmediate;
	    if (typeof setImmediate === 'function') {
	        _setImmediate = setImmediate;
	    }

	    if (typeof process === 'undefined' || !(process.nextTick)) {
	        if (_setImmediate) {
	            async.nextTick = function (fn) {
	                // not a direct alias for IE10 compatibility
	                _setImmediate(fn);
	            };
	            async.setImmediate = async.nextTick;
	        }
	        else {
	            async.nextTick = function (fn) {
	                setTimeout(fn, 0);
	            };
	            async.setImmediate = async.nextTick;
	        }
	    }
	    else {
	        async.nextTick = process.nextTick;
	        if (_setImmediate) {
	            async.setImmediate = function (fn) {
	              // not a direct alias for IE10 compatibility
	              _setImmediate(fn);
	            };
	        }
	        else {
	            async.setImmediate = async.nextTick;
	        }
	    }

	    async.each = function (arr, iterator, callback) {
	        callback = callback || noop;
	        if (!arr.length) {
	            return callback();
	        }
	        var completed = 0;
	        _each(arr, function (x) {
	            iterator(x, only_once(done) );
	        });
	        function done(err) {
	          if (err) {
	              callback(err);
	              callback = noop;
	          }
	          else {
	              completed += 1;
	              if (completed >= arr.length) {
	                  callback();
	              }
	          }
	        }
	    };
	    async.forEach = async.each;

	    async.eachSeries = function (arr, iterator, callback) {
	        callback = callback || noop;
	        if (!arr.length) {
	            return callback();
	        }
	        var completed = 0;
	        var iterate = function () {
	            iterator(arr[completed], function (err) {
	                if (err) {
	                    callback(err);
	                    callback = noop;
	                }
	                else {
	                    completed += 1;
	                    if (completed >= arr.length) {
	                        callback();
	                    }
	                    else {
	                        iterate();
	                    }
	                }
	            });
	        };
	        iterate();
	    };
	    async.forEachSeries = async.eachSeries;


	    async.eachLimit = function (arr, limit, iterator, callback) {
	        var fn = _eachLimit(limit);
	        fn.apply(null, [arr, iterator, callback]);
	    };
	    async.forEachLimit = async.eachLimit;

	    var _eachLimit = function (limit) {

	        return function (arr, iterator, callback) {
	            callback = callback || noop;
	            if (!arr.length || limit <= 0) {
	                return callback();
	            }
	            var completed = 0;
	            var started = 0;
	            var running = 0;

	            (function replenish () {
	                if (completed >= arr.length) {
	                    return callback();
	                }

	                while (running < limit && started < arr.length) {
	                    started += 1;
	                    running += 1;
	                    iterator(arr[started - 1], function (err) {
	                        if (err) {
	                            callback(err);
	                            callback = noop;
	                        }
	                        else {
	                            completed += 1;
	                            running -= 1;
	                            if (completed >= arr.length) {
	                                callback();
	                            }
	                            else {
	                                replenish();
	                            }
	                        }
	                    });
	                }
	            })();
	        };
	    };



	    async.forEachOf = async.eachOf = function (object, iterator, callback) {
	        callback = callback || function () {};
	        var size = object.length || _keys(object).length;
	        var completed = 0;
	        if (!size) {
	            return callback();
	        }
	        _forEachOf(object, function (value, key) {
	            iterator(object[key], key, function (err) {
	                if (err) {
	                    callback(err);
	                    callback = function () {};
	                } else {
	                    completed += 1;
	                    if (completed === size) {
	                        callback(null);
	                    }
	                }
	            });
	        });
	    };

	    async.forEachOfSeries = async.eachOfSeries = function (obj, iterator, callback) {
	        callback = callback || function () {};
	        var keys = _keys(obj);
	        var size = keys.length;
	        if (!size) {
	            return callback();
	        }
	        var completed = 0;
	        var iterate = function () {
	            var sync = true;
	            var key = keys[completed];
	            iterator(obj[key], key, function (err) {
	                if (err) {
	                    callback(err);
	                    callback = function () {};
	                }
	                else {
	                    completed += 1;
	                    if (completed >= size) {
	                        callback(null);
	                    }
	                    else {
	                        if (sync) {
	                            async.nextTick(iterate);
	                        }
	                        else {
	                            iterate();
	                        }
	                    }
	                }
	            });
	            sync = false;
	        };
	        iterate();
	    };



	    async.forEachOfLimit = async.eachOfLimit = function (obj, limit, iterator, callback) {
	        _forEachOfLimit(limit)(obj, iterator, callback);
	    };

	    var _forEachOfLimit = function (limit) {

	        return function (obj, iterator, callback) {
	            callback = callback || function () {};
	            var keys = _keys(obj);
	            var size = keys.length;
	            if (!size || limit <= 0) {
	                return callback();
	            }
	            var completed = 0;
	            var started = 0;
	            var running = 0;

	            (function replenish () {
	                if (completed >= size) {
	                    return callback();
	                }

	                while (running < limit && started < size) {
	                    started += 1;
	                    running += 1;
	                    var key = keys[started - 1];
	                    iterator(obj[key], key, function (err) {
	                        if (err) {
	                            callback(err);
	                            callback = function () {};
	                        }
	                        else {
	                            completed += 1;
	                            running -= 1;
	                            if (completed >= size) {
	                                callback();
	                            }
	                            else {
	                                replenish();
	                            }
	                        }
	                    });
	                }
	            })();
	        };
	    };


	    var doParallel = function (fn) {
	        return function () {
	            var args = _baseSlice(arguments);
	            return fn.apply(null, [async.each].concat(args));
	        };
	    };
	    var doParallelLimit = function(limit, fn) {
	        return function () {
	            var args = _baseSlice(arguments);
	            return fn.apply(null, [_eachLimit(limit)].concat(args));
	        };
	    };
	    var doSeries = function (fn) {
	        return function () {
	            var args = _baseSlice(arguments);
	            return fn.apply(null, [async.eachSeries].concat(args));
	        };
	    };


	    var _asyncMap = function (eachfn, arr, iterator, callback) {
	        arr = _map(arr, function (x, i) {
	            return {index: i, value: x};
	        });
	        if (!callback) {
	            eachfn(arr, function (x, callback) {
	                iterator(x.value, function (err) {
	                    callback(err);
	                });
	            });
	        } else {
	            var results = [];
	            eachfn(arr, function (x, callback) {
	                iterator(x.value, function (err, v) {
	                    results[x.index] = v;
	                    callback(err);
	                });
	            }, function (err) {
	                callback(err, results);
	            });
	        }
	    };
	    async.map = doParallel(_asyncMap);
	    async.mapSeries = doSeries(_asyncMap);
	    async.mapLimit = function (arr, limit, iterator, callback) {
	        return _mapLimit(limit)(arr, iterator, callback);
	    };

	    var _mapLimit = function(limit) {
	        return doParallelLimit(limit, _asyncMap);
	    };

	    // reduce only has a series version, as doing reduce in parallel won't
	    // work in many situations.
	    async.reduce = function (arr, memo, iterator, callback) {
	        async.eachSeries(arr, function (x, callback) {
	            iterator(memo, x, function (err, v) {
	                memo = v;
	                callback(err);
	            });
	        }, function (err) {
	            callback(err, memo);
	        });
	    };
	    // inject alias
	    async.inject = async.reduce;
	    // foldl alias
	    async.foldl = async.reduce;

	    async.reduceRight = function (arr, memo, iterator, callback) {
	        var reversed = _map(arr, function (x) {
	            return x;
	        }).reverse();
	        async.reduce(reversed, memo, iterator, callback);
	    };
	    // foldr alias
	    async.foldr = async.reduceRight;

	    var _filter = function (eachfn, arr, iterator, callback) {
	        var results = [];
	        arr = _map(arr, function (x, i) {
	            return {index: i, value: x};
	        });
	        eachfn(arr, function (x, callback) {
	            iterator(x.value, function (v) {
	                if (v) {
	                    results.push(x);
	                }
	                callback();
	            });
	        }, function (err) {
	            callback(_map(results.sort(function (a, b) {
	                return a.index - b.index;
	            }), function (x) {
	                return x.value;
	            }));
	        });
	    };
	    async.filter = doParallel(_filter);
	    async.filterSeries = doSeries(_filter);
	    // select alias
	    async.select = async.filter;
	    async.selectSeries = async.filterSeries;

	    var _reject = function (eachfn, arr, iterator, callback) {
	        var results = [];
	        arr = _map(arr, function (x, i) {
	            return {index: i, value: x};
	        });
	        eachfn(arr, function (x, callback) {
	            iterator(x.value, function (v) {
	                if (!v) {
	                    results.push(x);
	                }
	                callback();
	            });
	        }, function (err) {
	            callback(_map(results.sort(function (a, b) {
	                return a.index - b.index;
	            }), function (x) {
	                return x.value;
	            }));
	        });
	    };
	    async.reject = doParallel(_reject);
	    async.rejectSeries = doSeries(_reject);

	    var _detect = function (eachfn, arr, iterator, main_callback) {
	        eachfn(arr, function (x, callback) {
	            iterator(x, function (result) {
	                if (result) {
	                    main_callback(x);
	                    main_callback = noop;
	                }
	                else {
	                    callback();
	                }
	            });
	        }, function (err) {
	            main_callback();
	        });
	    };
	    async.detect = doParallel(_detect);
	    async.detectSeries = doSeries(_detect);

	    async.some = function (arr, iterator, main_callback) {
	        async.each(arr, function (x, callback) {
	            iterator(x, function (v) {
	                if (v) {
	                    main_callback(true);
	                    main_callback = noop;
	                }
	                callback();
	            });
	        }, function (err) {
	            main_callback(false);
	        });
	    };
	    // any alias
	    async.any = async.some;

	    async.every = function (arr, iterator, main_callback) {
	        async.each(arr, function (x, callback) {
	            iterator(x, function (v) {
	                if (!v) {
	                    main_callback(false);
	                    main_callback = noop;
	                }
	                callback();
	            });
	        }, function (err) {
	            main_callback(true);
	        });
	    };
	    // all alias
	    async.all = async.every;

	    async.sortBy = function (arr, iterator, callback) {
	        async.map(arr, function (x, callback) {
	            iterator(x, function (err, criteria) {
	                if (err) {
	                    callback(err);
	                }
	                else {
	                    callback(null, {value: x, criteria: criteria});
	                }
	            });
	        }, function (err, results) {
	            if (err) {
	                return callback(err);
	            }
	            else {
	                var fn = function (left, right) {
	                    var a = left.criteria, b = right.criteria;
	                    return a < b ? -1 : a > b ? 1 : 0;
	                };
	                callback(null, _map(results.sort(fn), function (x) {
	                    return x.value;
	                }));
	            }
	        });
	    };

	    async.auto = function (tasks, callback) {
	        callback = callback || noop;
	        var keys = _keys(tasks);
	        var remainingTasks = keys.length;
	        if (!remainingTasks) {
	            return callback();
	        }

	        var results = {};

	        var listeners = [];
	        var addListener = function (fn) {
	            listeners.unshift(fn);
	        };
	        var removeListener = function (fn) {
	            for (var i = 0; i < listeners.length; i += 1) {
	                if (listeners[i] === fn) {
	                    listeners.splice(i, 1);
	                    return;
	                }
	            }
	        };
	        var taskComplete = function () {
	            remainingTasks--;
	            _each(listeners.slice(0), function (fn) {
	                fn();
	            });
	        };

	        addListener(function () {
	            if (!remainingTasks) {
	                var theCallback = callback;
	                // prevent final callback from calling itself if it errors
	                callback = noop;

	                theCallback(null, results);
	            }
	        });

	        _each(keys, function (k) {
	            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
	            var taskCallback = function (err) {
	                var args = _baseSlice(arguments, 1);
	                if (args.length <= 1) {
	                    args = args[0];
	                }
	                if (err) {
	                    var safeResults = {};
	                    _each(_keys(results), function(rkey) {
	                        safeResults[rkey] = results[rkey];
	                    });
	                    safeResults[k] = args;
	                    callback(err, safeResults);
	                    // stop subsequent errors hitting callback multiple times
	                    callback = noop;
	                }
	                else {
	                    results[k] = args;
	                    async.setImmediate(taskComplete);
	                }
	            };
	            var requires = task.slice(0, Math.abs(task.length - 1)) || [];
	            // prevent dead-locks
	            var len = requires.length;
	            var dep;
	            while (len--) {
	                if (!(dep = tasks[requires[len]])) {
	                    throw new Error('Has inexistant dependency');
	                }
	                if (_isArray(dep) && !!~dep.indexOf(k)) {
	                    throw new Error('Has cyclic dependencies');
	                }
	            }
	            var ready = function () {
	                return _reduce(requires, function (a, x) {
	                    return (a && results.hasOwnProperty(x));
	                }, true) && !results.hasOwnProperty(k);
	            };
	            if (ready()) {
	                task[task.length - 1](taskCallback, results);
	            }
	            else {
	                var listener = function () {
	                    if (ready()) {
	                        removeListener(listener);
	                        task[task.length - 1](taskCallback, results);
	                    }
	                };
	                addListener(listener);
	            }
	        });
	    };

	    async.retry = function(times, task, callback) {
	        var DEFAULT_TIMES = 5;
	        var attempts = [];
	        // Use defaults if times not passed
	        if (typeof times === 'function') {
	            callback = task;
	            task = times;
	            times = DEFAULT_TIMES;
	        }
	        // Make sure times is a number
	        times = parseInt(times, 10) || DEFAULT_TIMES;
	        var wrappedTask = function(wrappedCallback, wrappedResults) {
	            var retryAttempt = function(task, finalAttempt) {
	                return function(seriesCallback) {
	                    task(function(err, result){
	                        seriesCallback(!err || finalAttempt, {err: err, result: result});
	                    }, wrappedResults);
	                };
	            };
	            while (times) {
	                attempts.push(retryAttempt(task, !(times-=1)));
	            }
	            async.series(attempts, function(done, data){
	                data = data[data.length - 1];
	                (wrappedCallback || callback)(data.err, data.result);
	            });
	        };
	        // If a callback is passed, run this as a controll flow
	        return callback ? wrappedTask() : wrappedTask;
	    };

	    async.waterfall = function (tasks, callback) {
	        callback = callback || noop;
	        if (!_isArray(tasks)) {
	          var err = new Error('First argument to waterfall must be an array of functions');
	          return callback(err);
	        }
	        if (!tasks.length) {
	            return callback();
	        }
	        var wrapIterator = function (iterator) {
	            return function (err) {
	                if (err) {
	                    callback.apply(null, arguments);
	                    callback = noop;
	                }
	                else {
	                    var args = _baseSlice(arguments, 1);
	                    var next = iterator.next();
	                    if (next) {
	                        args.push(wrapIterator(next));
	                    }
	                    else {
	                        args.push(callback);
	                    }
	                    async.setImmediate(function () {
	                        iterator.apply(null, args);
	                    });
	                }
	            };
	        };
	        wrapIterator(async.iterator(tasks))();
	    };

	    var _parallel = function(eachfn, tasks, callback) {
	        callback = callback || noop;
	        if (_isArray(tasks)) {
	            eachfn.map(tasks, function (fn, callback) {
	                if (fn) {
	                    fn(function (err) {
	                        var args = _baseSlice(arguments, 1);
	                        if (args.length <= 1) {
	                            args = args[0];
	                        }
	                        callback.call(null, err, args);
	                    });
	                }
	            }, callback);
	        }
	        else {
	            var results = {};
	            eachfn.each(_keys(tasks), function (k, callback) {
	                tasks[k](function (err) {
	                    var args = _baseSlice(arguments, 1);
	                    if (args.length <= 1) {
	                        args = args[0];
	                    }
	                    results[k] = args;
	                    callback(err);
	                });
	            }, function (err) {
	                callback(err, results);
	            });
	        }
	    };

	    async.parallel = function (tasks, callback) {
	        _parallel({ map: async.map, each: async.each }, tasks, callback);
	    };

	    async.parallelLimit = function(tasks, limit, callback) {
	        _parallel({ map: _mapLimit(limit), each: _eachLimit(limit) }, tasks, callback);
	    };

	    async.series = function (tasks, callback) {
	        callback = callback || noop;
	        if (_isArray(tasks)) {
	            async.mapSeries(tasks, function (fn, callback) {
	                if (fn) {
	                    fn(function (err) {
	                        var args = _baseSlice(arguments, 1);
	                        if (args.length <= 1) {
	                            args = args[0];
	                        }
	                        callback.call(null, err, args);
	                    });
	                }
	            }, callback);
	        }
	        else {
	            var results = {};
	            async.eachSeries(_keys(tasks), function (k, callback) {
	                tasks[k](function (err) {
	                    var args = _baseSlice(arguments, 1);
	                    if (args.length <= 1) {
	                        args = args[0];
	                    }
	                    results[k] = args;
	                    callback(err);
	                });
	            }, function (err) {
	                callback(err, results);
	            });
	        }
	    };

	    async.iterator = function (tasks) {
	        var makeCallback = function (index) {
	            var fn = function () {
	                if (tasks.length) {
	                    tasks[index].apply(null, arguments);
	                }
	                return fn.next();
	            };
	            fn.next = function () {
	                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
	            };
	            return fn;
	        };
	        return makeCallback(0);
	    };

	    async.apply = function (fn) {
	        var args = _baseSlice(arguments, 1);
	        return function () {
	            return fn.apply(
	                null, args.concat(_baseSlice(arguments))
	            );
	        };
	    };

	    var _concat = function (eachfn, arr, fn, callback) {
	        var r = [];
	        eachfn(arr, function (x, cb) {
	            fn(x, function (err, y) {
	                r = r.concat(y || []);
	                cb(err);
	            });
	        }, function (err) {
	            callback(err, r);
	        });
	    };
	    async.concat = doParallel(_concat);
	    async.concatSeries = doSeries(_concat);

	    async.whilst = function (test, iterator, callback) {
	        if (test()) {
	            iterator(function (err) {
	                if (err) {
	                    return callback(err);
	                }
	                async.whilst(test, iterator, callback);
	            });
	        }
	        else {
	            callback();
	        }
	    };

	    async.doWhilst = function (iterator, test, callback) {
	        iterator(function (err) {
	            if (err) {
	                return callback(err);
	            }
	            var args = _baseSlice(arguments, 1);
	            if (test.apply(null, args)) {
	                async.doWhilst(iterator, test, callback);
	            }
	            else {
	                callback();
	            }
	        });
	    };

	    async.until = function (test, iterator, callback) {
	        if (!test()) {
	            iterator(function (err) {
	                if (err) {
	                    return callback(err);
	                }
	                async.until(test, iterator, callback);
	            });
	        }
	        else {
	            callback();
	        }
	    };

	    async.doUntil = function (iterator, test, callback) {
	        iterator(function (err) {
	            if (err) {
	                return callback(err);
	            }
	            var args = _baseSlice(arguments, 1);
	            if (!test.apply(null, args)) {
	                async.doUntil(iterator, test, callback);
	            }
	            else {
	                callback();
	            }
	        });
	    };

	    async.queue = function (worker, concurrency) {
	        if (concurrency === undefined) {
	            concurrency = 1;
	        }
	        else if(concurrency === 0) {
	            throw new Error('Concurrency must not be zero');
	        }
	        function _insert(q, data, pos, callback) {
	          if (!q.started){
	            q.started = true;
	          }
	          if (!_isArray(data)) {
	              data = [data];
	          }
	          if(data.length === 0) {
	             // call drain immediately if there are no tasks
	             return async.setImmediate(function() {
	                 if (q.drain) {
	                     q.drain();
	                 }
	             });
	          }
	          _each(data, function(task) {
	              var item = {
	                  data: task,
	                  callback: typeof callback === 'function' ? callback : null
	              };

	              if (pos) {
	                q.tasks.unshift(item);
	              } else {
	                q.tasks.push(item);
	              }

	              if (q.saturated && q.tasks.length === q.concurrency) {
	                  q.saturated();
	              }
	              async.setImmediate(q.process);
	          });
	        }

	        var workers = 0;
	        var q = {
	            tasks: [],
	            concurrency: concurrency,
	            saturated: null,
	            empty: null,
	            drain: null,
	            started: false,
	            paused: false,
	            push: function (data, callback) {
	              _insert(q, data, false, callback);
	            },
	            kill: function () {
	              q.drain = null;
	              q.tasks = [];
	            },
	            unshift: function (data, callback) {
	              _insert(q, data, true, callback);
	            },
	            process: function () {
	                if (!q.paused && workers < q.concurrency && q.tasks.length) {
	                    var task = q.tasks.shift();
	                    if (q.empty && q.tasks.length === 0) {
	                        q.empty();
	                    }
	                    workers += 1;
	                    var next = function () {
	                        workers -= 1;
	                        if (task.callback) {
	                            task.callback.apply(task, arguments);
	                        }
	                        if (q.drain && q.tasks.length + workers === 0) {
	                            q.drain();
	                        }
	                        q.process();
	                    };
	                    var cb = only_once(next);
	                    worker(task.data, cb);
	                }
	            },
	            length: function () {
	                return q.tasks.length;
	            },
	            running: function () {
	                return workers;
	            },
	            idle: function() {
	                return q.tasks.length + workers === 0;
	            },
	            pause: function () {
	                if (q.paused === true) { return; }
	                q.paused = true;
	            },
	            resume: function () {
	                if (q.paused === false) { return; }
	                q.paused = false;
	                var resumeCount = Math.min(q.concurrency, q.tasks.length);
	                // Need to call q.process once per concurrent
	                // worker to preserve full concurrency after pause
	                for (var w = 1; w <= resumeCount; w++) {
	                    async.setImmediate(q.process);
	                }
	            }
	        };
	        return q;
	    };

	    async.priorityQueue = function (worker, concurrency) {

	        function _compareTasks(a, b){
	          return a.priority - b.priority;
	        }

	        function _binarySearch(sequence, item, compare) {
	          var beg = -1,
	              end = sequence.length - 1;
	          while (beg < end) {
	            var mid = beg + ((end - beg + 1) >>> 1);
	            if (compare(item, sequence[mid]) >= 0) {
	              beg = mid;
	            } else {
	              end = mid - 1;
	            }
	          }
	          return beg;
	        }

	        function _insert(q, data, priority, callback) {
	          if (!q.started){
	            q.started = true;
	          }
	          if (!_isArray(data)) {
	              data = [data];
	          }
	          if(data.length === 0) {
	             // call drain immediately if there are no tasks
	             return async.setImmediate(function() {
	                 if (q.drain) {
	                     q.drain();
	                 }
	             });
	          }
	          _each(data, function(task) {
	              var item = {
	                  data: task,
	                  priority: priority,
	                  callback: typeof callback === 'function' ? callback : null
	              };

	              q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

	              if (q.saturated && q.tasks.length === q.concurrency) {
	                  q.saturated();
	              }
	              async.setImmediate(q.process);
	          });
	        }

	        // Start with a normal queue
	        var q = async.queue(worker, concurrency);

	        // Override push to accept second parameter representing priority
	        q.push = function (data, priority, callback) {
	          _insert(q, data, priority, callback);
	        };

	        // Remove unshift function
	        delete q.unshift;

	        return q;
	    };

	    async.cargo = function (worker, payload) {
	        var working     = false,
	            tasks       = [];

	        var cargo = {
	            tasks: tasks,
	            payload: payload,
	            saturated: null,
	            empty: null,
	            drain: null,
	            drained: true,
	            push: function (data, callback) {
	                if (!_isArray(data)) {
	                    data = [data];
	                }
	                _each(data, function(task) {
	                    tasks.push({
	                        data: task,
	                        callback: typeof callback === 'function' ? callback : null
	                    });
	                    cargo.drained = false;
	                    if (cargo.saturated && tasks.length === payload) {
	                        cargo.saturated();
	                    }
	                });
	                async.setImmediate(cargo.process);
	            },
	            process: function process() {
	                if (working) return;
	                if (tasks.length === 0) {
	                    if(cargo.drain && !cargo.drained) cargo.drain();
	                    cargo.drained = true;
	                    return;
	                }

	                var ts = typeof payload === 'number' ?
	                    tasks.splice(0, payload) :
	                    tasks.splice(0, tasks.length);

	                var ds = _map(ts, function (task) {
	                    return task.data;
	                });

	                if(cargo.empty) cargo.empty();
	                working = true;
	                worker(ds, function () {
	                    working = false;

	                    var args = arguments;
	                    _each(ts, function (data) {
	                        if (data.callback) {
	                            data.callback.apply(null, args);
	                        }
	                    });

	                    process();
	                });
	            },
	            length: function () {
	                return tasks.length;
	            },
	            running: function () {
	                return working;
	            }
	        };
	        return cargo;
	    };

	    var _console_fn = function (name) {
	        return function (fn) {
	            var args = _baseSlice(arguments, 1);
	            fn.apply(null, args.concat([function (err) {
	                var args = _baseSlice(arguments, 1);
	                if (typeof console !== 'undefined') {
	                    if (err) {
	                        if (console.error) {
	                            console.error(err);
	                        }
	                    }
	                    else if (console[name]) {
	                        _each(args, function (x) {
	                            console[name](x);
	                        });
	                    }
	                }
	            }]));
	        };
	    };
	    async.log = _console_fn('log');
	    async.dir = _console_fn('dir');
	    /*async.info = _console_fn('info');
	    async.warn = _console_fn('warn');
	    async.error = _console_fn('error');*/

	    async.memoize = function (fn, hasher) {
	        var memo = {};
	        var queues = {};
	        hasher = hasher || function (x) {
	            return x;
	        };
	        var memoized = function () {
	            var args = _baseSlice(arguments);
	            var callback = args.pop();
	            var key = hasher.apply(null, args);
	            if (key in memo) {
	                async.nextTick(function () {
	                    callback.apply(null, memo[key]);
	                });
	            }
	            else if (key in queues) {
	                queues[key].push(callback);
	            }
	            else {
	                queues[key] = [callback];
	                fn.apply(null, args.concat([function () {
	                    memo[key] = _baseSlice(arguments);
	                    var q = queues[key];
	                    delete queues[key];
	                    for (var i = 0, l = q.length; i < l; i++) {
	                      q[i].apply(null, arguments);
	                    }
	                }]));
	            }
	        };
	        memoized.memo = memo;
	        memoized.unmemoized = fn;
	        return memoized;
	    };

	    async.unmemoize = function (fn) {
	      return function () {
	        return (fn.unmemoized || fn).apply(null, arguments);
	      };
	    };

	    async.times = function (count, iterator, callback) {
	        var counter = [];
	        for (var i = 0; i < count; i++) {
	            counter.push(i);
	        }
	        return async.map(counter, iterator, callback);
	    };

	    async.timesSeries = function (count, iterator, callback) {
	        var counter = [];
	        for (var i = 0; i < count; i++) {
	            counter.push(i);
	        }
	        return async.mapSeries(counter, iterator, callback);
	    };

	    async.seq = function (/* functions... */) {
	        var fns = arguments;
	        return function () {
	            var that = this;
	            var args = _baseSlice(arguments);
	            var callback = args.pop();
	            async.reduce(fns, args, function (newargs, fn, cb) {
	                fn.apply(that, newargs.concat([function () {
	                    var err = arguments[0];
	                    var nextargs = _baseSlice(arguments, 1);
	                    cb(err, nextargs);
	                }]));
	            },
	            function (err, results) {
	                callback.apply(that, [err].concat(results));
	            });
	        };
	    };

	    async.compose = function (/* functions... */) {
	      return async.seq.apply(null, Array.prototype.reverse.call(arguments));
	    };

	    var _applyEach = function (eachfn, fns /*args...*/) {
	        var go = function () {
	            var that = this;
	            var args = _baseSlice(arguments);
	            var callback = args.pop();
	            return eachfn(fns, function (fn, cb) {
	                fn.apply(that, args.concat([cb]));
	            },
	            callback);
	        };
	        if (arguments.length > 2) {
	            var args = _baseSlice(arguments, 2);
	            return go.apply(this, args);
	        }
	        else {
	            return go;
	        }
	    };
	    async.applyEach = doParallel(_applyEach);
	    async.applyEachSeries = doSeries(_applyEach);

	    async.forever = function (fn, callback) {
	        function next(err) {
	            if (err) {
	                if (callback) {
	                    return callback(err);
	                }
	                throw err;
	            }
	            fn(next);
	        }
	        next();
	    };

	    // Node.js
	    if (module.exports) {
	        module.exports = async;
	    }
	    // AMD / RequireJS
	    else {
	        root.async = async;
	    }

	}());
	});

	var logger$1 = createCommonjsModule(function (module, exports) {
	/*
	 * logger.js: Core logger object used by winston.
	 *
	 * (C) 2010 Charlie Robbins
	 * MIT LICENCE
	 *
	 */

	var Stream = stream.Stream;

	const formatRegExp = /%[sdj%]/g;

	//
	// ### function Logger (options)
	// #### @options {Object} Options for this instance.
	// Constructor function for the Logger object responsible
	// for persisting log messages and metadata to one or more transports.
	//
	var Logger = exports.Logger = function (options) {
	  events.EventEmitter.call(this);
	  this.configure(options);
	};

	//
	// Inherit from `events.EventEmitter`.
	//
	util.inherits(Logger, events.EventEmitter);

	//
	// ### function configure (options)
	// This will wholesale reconfigure this instance by:
	// 1. Resetting all transports. Older transports will be removed implicitly.
	// 2. Set all other options including levels, colors, rewriters, filters,
	//    exceptionHandlers, etc.
	//
	Logger.prototype.configure = function (options) {
	  var self = this;

	  //
	  // If we have already been setup with transports
	  // then remove them before proceeding.
	  //
	  if (Array.isArray(this._names) && this._names.length) {
	    this.clear();
	  }

	  options = options || {};
	  this.transports = {};
	  this._names     = [];

	  if (options.transports) {
	    options.transports.forEach(function (transport) {
	      self.add(transport, null, true);
	    });
	  }

	  //
	  // Set Levels and default logging level
	  //
	  this.padLevels = options.padLevels || false;
	  this.setLevels(options.levels);
	  if (options.colors) {
	    config_1.addColors(options.colors);
	  }

	  //
	  // Hoist other options onto this instance.
	  //
	  this.level       = options.level || 'info';
	  this.emitErrs    = options.emitErrs || false;
	  this.stripColors = options.stripColors || false;
	  this.exitOnError = typeof options.exitOnError !== 'undefined'
	    ? options.exitOnError
	    : true;

	  //
	  // Setup internal state as empty Objects even though it is
	  // defined lazily later to ensure a strong existential API contract.
	  //
	  this.exceptionHandlers = {};
	  this.profilers         = {};

	  ['rewriters', 'filters'].forEach(function (kind) {
	    self[kind] = Array.isArray(options[kind])
	      ? options[kind]
	      : [];
	  });

	  if (options.exceptionHandlers) {
	    this.handleExceptions(options.exceptionHandlers);
	  }
	};

	//
	// ### function log (level, msg, [meta], callback)
	// #### @level {string} Level at which to log the message.
	// #### @msg {string} Message to log
	// #### @meta {Object} **Optional** Additional metadata to attach
	// #### @callback {function} Continuation to respond to when complete.
	// Core logging method exposed to Winston. Metadata is optional.
	//
	Logger.prototype.log = function (level) {
	  var args = Array.prototype.slice.call(arguments, 1),
	      self = this;

	  while (args[args.length - 1] === null) {
	    args.pop();
	  }

	  //
	  // Determining what is `meta` and what are arguments for string interpolation
	  // turns out to be VERY tricky. e.g. in the cases like this:
	  //
	  //    logger.info('No interpolation symbols', 'ok', 'why', { meta: 'is-this' });
	  //
	  var callback  = typeof args[args.length - 1] === 'function'
	    ? args.pop()
	    : null;

	  //
	  // Handle errors appropriately.
	  //
	  function onError(err) {
	    if (callback) {
	      callback(err);
	    }
	    else if (self.emitErrs) {
	      self.emit('error', err);
	    }
	  }

	  if (this._names.length === 0) {
	    return onError(new Error('Cannot log with no transports.'));
	  }
	  else if (typeof self.levels[level] === 'undefined') {
	    return onError(new Error('Unknown log level: ' + level));
	  }

	  //
	  // If there are no transports that match the level
	  // then be eager and return. This could potentially be calculated
	  // during `setLevels` for more performance gains.
	  //
	  var targets = this._names.filter(function (name) {
	    var transport = self.transports[name];
	    return (transport.level && self.levels[transport.level] >= self.levels[level])
	      || (!transport.level && self.levels[self.level] >= self.levels[level]);
	  });

	  if (!targets.length) {
	    if (callback) { callback(); }
	    return;
	  }

	  //
	  // Determining what is `meta` and what are arguments for string interpolation
	  // turns out to be VERY tricky. e.g. in the cases like this:
	  //
	  //    logger.info('No interpolation symbols', 'ok', 'why', { meta: 'is-this' });
	  //
	  var metaType  = Object.prototype.toString.call(args[args.length - 1]),
	      fmtMatch  = args[0] && args[0].match && args[0].match(formatRegExp),
	      isFormat  = fmtMatch && fmtMatch.length,
	      validMeta = !isFormat
	        ? metaType === '[object Object]' || metaType === '[object Error]' || metaType === '[object Array]'
	        : metaType === '[object Object]',
	      meta = validMeta ? args.pop() : {},
	      msg  = util.format.apply(null, args);

	  //
	  // Respond to the callback.
	  //
	  function finish(err) {
	    if (callback) {
	      if (err) return callback(err);
	      callback(null, level, msg, meta);
	    }

	    callback = null;
	    if (!err) {
	      self.emit('logged', level, msg, meta);
	    }
	  }

	  // If we should pad for levels, do so
	  if (this.padLevels) {
	    msg = new Array(this.levelLength - level.length + 1).join(' ') + msg;
	  }

	  this.rewriters.forEach(function (rewriter) {
	    meta = rewriter(level, msg, meta, self);
	  });

	  this.filters.forEach(function(filter) {
	    var filtered = filter(level, msg, meta, self);
	    if (typeof filtered === 'string')
	      msg = filtered;
	    else {
	      msg = filtered.msg;
	      meta = filtered.meta;
	    }
	  });

	  //
	  // For consideration of terminal 'color" programs like colors.js,
	  // which can add ANSI escape color codes to strings, we destyle the
	  // ANSI color escape codes when `this.stripColors` is set.
	  //
	  // see: http://en.wikipedia.org/wiki/ANSI_escape_code
	  //
	  if (this.stripColors) {
	    var code = /\u001b\[(\d+(;\d+)*)?m/g;
	    msg = ('' + msg).replace(code, '');
	  }

	  //
	  // Log for each transport and emit 'logging' event
	  //
	  function transportLog(name, next) {
	    var transport = self.transports[name];
	    transport.log(level, msg, meta, function (err) {
	      if (err) {
	        err.transport = transport;
	        finish(err);
	        return next();
	      }

	      self.emit('logging', transport, level, msg, meta);
	      next();
	    });
	  }

	  async$1.forEach(targets, transportLog, finish);
	  return this;
	};

	//
	// ### function query (options, callback)
	// #### @options {Object} Query options for this instance.
	// #### @callback {function} Continuation to respond to when complete.
	// Queries the all transports for this instance with the specified `options`.
	// This will aggregate each transport's results into one object containing
	// a property per transport.
	//
	Logger.prototype.query = function (options, callback) {
	  if (typeof options === 'function') {
	    callback = options;
	    options = {};
	  }

	  var self = this,
	      options = options || {},
	      results = {},
	      query = common$1.clone(options.query) || {},
	      transports;

	  //
	  // Helper function to query a single transport
	  //
	  function queryTransport(transport, next) {
	    if (options.query) {
	      options.query = transport.formatQuery(query);
	    }

	    transport.query(options, function (err, results) {
	      if (err) {
	        return next(err);
	      }

	      next(null, transport.formatResults(results, options.format));
	    });
	  }

	  //
	  // Helper function to accumulate the results from
	  // `queryTransport` into the `results`.
	  //
	  function addResults(transport, next) {
	    queryTransport(transport, function (err, result) {
	      //
	      // queryTransport could potentially invoke the callback
	      // multiple times since Transport code can be unpredictable.
	      //
	      if (next) {
	        result = err || result;
	        if (result) {
	          results[transport.name] = result;
	        }

	        next();
	      }

	      next = null;
	    });
	  }

	  //
	  // If an explicit transport is being queried then
	  // respond with the results from only that transport
	  //
	  if (options.transport) {
	    options.transport = options.transport.toLowerCase();
	    return queryTransport(this.transports[options.transport], callback);
	  }

	  //
	  // Create a list of all transports for this instance.
	  //
	  transports = this._names.map(function (name) {
	    return self.transports[name];
	  }).filter(function (transport) {
	    return !!transport.query;
	  });

	  //
	  // Iterate over the transports in parallel setting the
	  // appropriate key in the `results`
	  //
	  async$1.forEach(transports, addResults, function () {
	    callback(null, results);
	  });
	};

	//
	// ### function stream (options)
	// #### @options {Object} Stream options for this instance.
	// Returns a log stream for all transports. Options object is optional.
	//
	Logger.prototype.stream = function (options) {
	  var self = this,
	      options = options || {},
	      out = new Stream,
	      streams = [],
	      transports;

	  if (options.transport) {
	    var transport = this.transports[options.transport];
	    delete options.transport;
	    if (transport && transport.stream) {
	      return transport.stream(options);
	    }
	  }

	  out._streams = streams;
	  out.destroy = function () {
	    var i = streams.length;
	    while (i--) streams[i].destroy();
	  };

	  //
	  // Create a list of all transports for this instance.
	  //
	  transports = this._names.map(function (name) {
	    return self.transports[name];
	  }).filter(function (transport) {
	    return !!transport.stream;
	  });

	  transports.forEach(function (transport) {
	    var stream$$1 = transport.stream(options);
	    if (!stream$$1) return;

	    streams.push(stream$$1);

	    stream$$1.on('log', function (log) {
	      log.transport = log.transport || [];
	      log.transport.push(transport.name);
	      out.emit('log', log);
	    });

	    stream$$1.on('error', function (err) {
	      err.transport = err.transport || [];
	      err.transport.push(transport.name);
	      out.emit('error', err);
	    });
	  });

	  return out;
	};

	//
	// ### function close ()
	// Cleans up resources (streams, event listeners) for all
	// transports associated with this instance (if necessary).
	//
	Logger.prototype.close = function () {
	  var self = this;

	  this._names.forEach(function (name) {
	    var transport = self.transports[name];
	    if (transport && transport.close) {
	      transport.close();
	    }
	  });

	  this.emit('close');
	};

	//
	// ### function handleExceptions ([tr0, tr1...] || tr0, tr1, ...)
	// Handles `uncaughtException` events for the current process by
	// ADDING any handlers passed in.
	//
	Logger.prototype.handleExceptions = function () {
	  var args = Array.prototype.slice.call(arguments),
	      handlers = [],
	      self = this;

	  args.forEach(function (a) {
	    if (Array.isArray(a)) {
	      handlers = handlers.concat(a);
	    }
	    else {
	      handlers.push(a);
	    }
	  });

	  this.exceptionHandlers = this.exceptionHandlers || {};
	  handlers.forEach(function (handler) {
	    self.exceptionHandlers[handler.name] = handler;
	  });

	  this._hnames = Object.keys(self.exceptionHandlers);

	  if (!this.catchExceptions) {
	    this.catchExceptions = this._uncaughtException.bind(this);
	    process.on('uncaughtException', this.catchExceptions);
	  }
	};

	//
	// ### function unhandleExceptions ()
	// Removes any handlers to `uncaughtException` events
	// for the current process
	//
	Logger.prototype.unhandleExceptions = function () {
	  var self = this;

	  if (this.catchExceptions) {
	    Object.keys(this.exceptionHandlers).forEach(function (name) {
	      var handler = self.exceptionHandlers[name];
	      if (handler.close) {
	        handler.close();
	      }
	    });

	    this.exceptionHandlers = {};
	    Object.keys(this.transports).forEach(function (name) {
	      var transport = self.transports[name];
	      if (transport.handleExceptions) {
	        transport.handleExceptions = false;
	      }
	    });

	    process.removeListener('uncaughtException', this.catchExceptions);
	    this.catchExceptions = false;
	  }
	};

	//
	// ### function add (transport, [options])
	// #### @transport {Transport} Prototype of the Transport object to add.
	// #### @options {Object} **Optional** Options for the Transport to add.
	// #### @instance {Boolean} **Optional** Value indicating if `transport` is already instantiated.
	// Adds a transport of the specified type to this instance.
	//
	Logger.prototype.add = function (transport, options, created) {
	  var instance = created ? transport : (new (transport)(options));

	  if (!instance.name && !instance.log) {
	    throw new Error('Unknown transport with no log() method');
	  }
	  else if (this.transports[instance.name]) {
	    throw new Error('Transport already attached: ' + instance.name);
	  }

	  this.transports[instance.name] = instance;
	  this._names = Object.keys(this.transports);

	  //
	  // Listen for the `error` event on the new Transport
	  //
	  instance._onError = this._onError.bind(this, instance);
	  if (!created) {
	    instance.on('error', instance._onError);
	  }

	  //
	  // If this transport has `handleExceptions` set to `true`
	  // and we are not already handling exceptions, do so.
	  //
	  if (instance.handleExceptions && !this.catchExceptions) {
	    this.handleExceptions();
	  }

	  return this;
	};

	//
	// ### function clear ()
	// Remove all transports from this instance
	//
	Logger.prototype.clear = function () {
	  Object.keys(this.transports).forEach(function (name) {
	    this.remove({ name: name });
	  }, this);
	};

	//
	// ### function remove (transport)
	// #### @transport {Transport|String} Transport or Name to remove.
	// Removes a transport of the specified type from this instance.
	//
	Logger.prototype.remove = function (transport) {
	  var name = typeof transport !== 'string'
	    ? transport.name || transport.prototype.name
	    : transport;

	  if (!this.transports[name]) {
	    throw new Error('Transport ' + name + ' not attached to this instance');
	  }

	  var instance = this.transports[name];
	  delete this.transports[name];
	  this._names = Object.keys(this.transports);

	  if (instance.close) {
	    instance.close();
	  }

	  if (instance._onError) {
	    instance.removeListener('error', instance._onError);
	  }
	  return this;
	};

	//
	// ### function startTimer ()
	// Returns an object corresponding to a specific timing. When done
	// is called the timer will finish and log the duration. e.g.:
	//
	//    timer = winston.startTimer()
	//    setTimeout(function(){
	//      timer.done("Logging message");
	//    }, 1000);
	//
	Logger.prototype.startTimer = function () {
	  return new ProfileHandler(this);
	};

	//
	// ### function profile (id, [msg, meta, callback])
	// #### @id {string} Unique id of the profiler
	// #### @msg {string} **Optional** Message to log
	// #### @meta {Object} **Optional** Additional metadata to attach
	// #### @callback {function} **Optional** Continuation to respond to when complete.
	// Tracks the time inbetween subsequent calls to this method
	// with the same `id` parameter. The second call to this method
	// will log the difference in milliseconds along with the message.
	//
	Logger.prototype.profile = function (id) {
	  var now = Date.now(), then, args,
	      msg, meta, callback;

	  if (this.profilers[id]) {
	    then = this.profilers[id];
	    delete this.profilers[id];

	    // Support variable arguments: msg, meta, callback
	    args     = Array.prototype.slice.call(arguments);
	    callback = typeof args[args.length - 1] === 'function' ? args.pop() : null;
	    meta     = typeof args[args.length - 1] === 'object' ? args.pop() : {};
	    msg      = args.length === 2 ? args[1] : id;

	    // Set the duration property of the metadata
	    meta.durationMs = now - then;
	    return this.info(msg, meta, callback);
	  }
	  else {
	    this.profilers[id] = now;
	  }

	  return this;
	};

	//
	// ### function setLevels (target)
	// #### @target {Object} Target levels to use on this instance
	// Sets the `target` levels specified on this instance.
	//
	Logger.prototype.setLevels = function (target) {
	  return common$1.setLevels(this, this.levels, target);
	};

	//
	// ### function cli ()
	// Configures this instance to have the default
	// settings for command-line interfaces: no timestamp,
	// colors enabled, padded output, and additional levels.
	//
	Logger.prototype.cli = function () {
	  this.padLevels = true;
	  this.setLevels(config_1.cli.levels);
	  config_1.addColors(config_1.cli.colors);

	  if (this.transports.console) {
	    this.transports.console.colorize = this.transports.console.colorize || true;
	    this.transports.console.timestamp = this.transports.console.timestamp || false;
	  }

	  return this;
	};

	//
	// ### @private function _uncaughtException (err)
	// #### @err {Error} Error to handle
	// Logs all relevant information around the `err` and
	// exits the current process.
	//
	Logger.prototype._uncaughtException = function (err) {
	  var responded = false,
	      info = exception_1.getAllInfo(err),
	      handlers = this._getExceptionHandlers(),
	      timeout,
	      doExit;

	  //
	  // Calculate if we should exit on this error
	  //
	  doExit = typeof this.exitOnError === 'function'
	    ? this.exitOnError(err)
	    : this.exitOnError;

	  function logAndWait(transport, next) {
	    transport.logException('uncaughtException: ' + (err.message || err), info, next, err);
	  }

	  function gracefulExit() {
	    if (doExit && !responded) {
	      //
	      // Remark: Currently ignoring any exceptions from transports
	      //         when catching uncaught exceptions.
	      //
	      clearTimeout(timeout);
	      responded = true;
	      process.exit(1);
	    }
	  }

	  if (!handlers || handlers.length === 0) {
	    return gracefulExit();
	  }

	  //
	  // Log to all transports and allow the operation to take
	  // only up to `3000ms`.
	  //
	  async$1.forEach(handlers, logAndWait, gracefulExit);
	  if (doExit) {
	    timeout = setTimeout(gracefulExit, 3000);
	  }
	};

	//
	// ### @private function _getExceptionHandlers ()
	// Returns the list of transports and exceptionHandlers
	// for this instance.
	//
	Logger.prototype._getExceptionHandlers = function () {
	  var self = this;

	  return this._hnames.map(function (name) {
	    return self.exceptionHandlers[name];
	  }).concat(this._names.map(function (name) {
	    return self.transports[name].handleExceptions && self.transports[name];
	  })).filter(Boolean);
	};

	//
	// ### @private function _onError (transport, err)
	// #### @transport {Object} Transport on which the error occured
	// #### @err {Error} Error that occurred on the transport
	// Bubbles the error, `err`, that occured on the specified `transport`
	// up from this instance if `emitErrs` has been set.
	//
	Logger.prototype._onError = function (transport, err) {
	  if (this.emitErrs) {
	    this.emit('error', err, transport);
	  }
	};

	//
	// ### @private ProfileHandler
	// Constructor function for the ProfileHandler instance used by
	// `Logger.prototype.startTimer`. When done is called the timer
	// will finish and log the duration.
	//
	function ProfileHandler(logger) {
	  this.logger = logger;
	  this.start = Date.now();
	}

	//
	// ### function done (msg)
	// Ends the current timer (i.e. ProfileHandler) instance and
	// logs the `msg` along with the duration since creation.
	//
	ProfileHandler.prototype.done = function (msg) {
	  var args     = Array.prototype.slice.call(arguments),
	      callback = typeof args[args.length - 1] === 'function' ? args.pop() : null,
	      meta     = typeof args[args.length - 1] === 'object' ? args.pop() : {};

	  meta.duration = (Date.now()) - this.start + 'ms';
	  return this.logger.info(msg, meta, callback);
	};
	});
	var logger_1$1 = logger$1.Logger;

	var transport = createCommonjsModule(function (module, exports) {
	/*
	 * transport.js: Base Transport object for all Winston transports.
	 *
	 * (C) 2010 Charlie Robbins
	 * MIT LICENCE
	 *
	 */



	//
	// ### function Transport (options)
	// #### @options {Object} Options for this instance.
	// Constructor function for the Tranport object responsible
	// base functionality for all winston transports.
	//
	var Transport = exports.Transport = function (options) {
	  events.EventEmitter.call(this);

	  options        = options        || {};
	  this.silent    = options.silent || false;
	  this.raw       = options.raw    || false;
	  this.name      = options.name   || this.name;
	  this.formatter = options.formatter;

	  //
	  // Do not set a default level. When `level` is falsey on any
	  // `Transport` instance, any `Logger` instance uses the
	  // configured level (instead of the Transport level)
	  //
	  this.level = options.level;

	  this.handleExceptions = options.handleExceptions || false;
	  this.exceptionsLevel  = options.exceptionsLevel || 'error';
	  this.humanReadableUnhandledException = options.humanReadableUnhandledException || false;
	};

	//
	// Inherit from `events.EventEmitter`.
	//
	util.inherits(Transport, events.EventEmitter);

	//
	// ### function formatQuery (query)
	// #### @query {string|Object} Query to format
	// Formats the specified `query` Object (or string) to conform
	// with the underlying implementation of this transport.
	//
	Transport.prototype.formatQuery = function (query) {
	  return query;
	};

	//
	// ### function normalizeQuery (query)
	// #### @options {string|Object} Query to normalize
	// Normalize options for query
	//
	Transport.prototype.normalizeQuery = function (options) {
	  //
	  // Use options similar to loggly.
	  // [See Loggly Search API](http://wiki.loggly.com/retrieve_events#optional)
	  //

	  options = options || {};

	  // limit
	  options.rows = options.rows || options.limit || 10;

	  // starting row offset
	  options.start = options.start || 0;

	  // now
	  options.until = options.until || new Date;
	  if (typeof options.until !== 'object') {
	    options.until = new Date(options.until);
	  }

	  // now - 24
	  options.from = options.from || (options.until - (24 * 60 * 60 * 1000));
	  if (typeof options.from !== 'object') {
	    options.from = new Date(options.from);
	  }


	  // 'asc' or 'desc'
	  options.order = options.order || 'desc';

	  // which fields to select
	  options.fields = options.fields;

	  return options;
	};

	//
	// ### function formatResults (results, options)
	// #### @results {Object|Array} Results returned from `.query`.
	// #### @options {Object} **Optional** Formatting options
	// Formats the specified `results` with the given `options` accordinging
	// to the implementation of this transport.
	//
	Transport.prototype.formatResults = function (results, options) {
	  return results;
	};

	//
	// ### function logException (msg, meta, callback)
	// #### @msg {string} Message to log
	// #### @meta {Object} **Optional** Additional metadata to attach
	// #### @callback {function} Continuation to respond to when complete.
	// Logs the specified `msg`, `meta` and responds to the callback once the log
	// operation is complete to ensure that the event loop will not exit before
	// all logging has completed.
	//
	Transport.prototype.logException = function (msg, meta, callback) {
	  var self = this,
	      called;

	  if (this.silent) {
	    return callback();
	  }

	  function onComplete () {
	    if (!called) {
	      called = true;
	      self.removeListener('logged', onComplete);
	      self.removeListener('error', onComplete);
	      callback();
	    }
	  }

	  this.once('logged', onComplete);
	  this.once('error', onComplete);
	  this.log(self.exceptionsLevel, msg, meta, function () { });
	};
	});
	var transport_1 = transport.Transport;

	var winston_1 = createCommonjsModule(function (module, exports) {
	/*
	 * winston.js: Top-level include defining Winston.
	 *
	 * (C) 2010 Charlie Robbins
	 * MIT LICENCE
	 *
	 */

	var winston = exports;

	//
	// Expose version using `pkginfo`
	//
	pkginfo_1(module, 'version');

	//
	// Include transports defined by default by winston
	//
	winston.transports = transports;

	//
	// Expose utility methods
	//

	winston.hash           = common$1.hash;
	winston.clone          = common$1.clone;
	winston.longestElement = common$1.longestElement;
	winston.exception      = exception_1;
	winston.config         = config_1;
	winston.addColors      = winston.config.addColors;

	//
	// Expose core Logging-related prototypes.
	//
	winston.Container      = container.Container;
	winston.Logger         = logger$1.Logger;
	winston.Transport      = transport.Transport;

	//
	// We create and expose a default `Container` to `winston.loggers` so that the
	// programmer may manage multiple `winston.Logger` instances without any additional overhead.
	//
	// ### some-file1.js
	//
	//     var logger = require('winston').loggers.get('something');
	//
	// ### some-file2.js
	//
	//     var logger = require('winston').loggers.get('something');
	//
	winston.loggers = new winston.Container();

	//
	// We create and expose a 'defaultLogger' so that the programmer may do the
	// following without the need to create an instance of winston.Logger directly:
	//
	//     var winston = require('winston');
	//     winston.log('info', 'some message');
	//     winston.error('some error');
	//
	var defaultLogger = new winston.Logger({
	  transports: [new winston.transports.Console()]
	});

	//
	// Pass through the target methods onto `winston.
	//
	var methods = [
	  'log',
	  'query',
	  'stream',
	  'add',
	  'remove',
	  'clear',
	  'profile',
	  'startTimer',
	  'extend',
	  'cli',
	  'handleExceptions',
	  'unhandleExceptions',
	  'addRewriter',
	  'addFilter'
	];
	common$1.setLevels(winston, null, defaultLogger.levels);
	methods.forEach(function (method) {
	  winston[method] = function () {
	    return defaultLogger[method].apply(defaultLogger, arguments);
	  };
	});

	//
	// ### function cli ()
	// Configures the default winston logger to have the
	// settings for command-line interfaces: no timestamp,
	// colors enabled, padded output, and additional levels.
	//
	winston.cli = function () {
	  winston.padLevels = true;
	  common$1.setLevels(winston, defaultLogger.levels, winston.config.cli.levels);
	  defaultLogger.setLevels(winston.config.cli.levels);
	  winston.config.addColors(winston.config.cli.colors);

	  if (defaultLogger.transports.console) {
	    defaultLogger.transports.console.colorize = true;
	    defaultLogger.transports.console.timestamp = false;
	  }

	  return winston;
	};

	//
	// ### function setLevels (target)
	// #### @target {Object} Target levels to use
	// Sets the `target` levels specified on the default winston logger.
	//
	winston.setLevels = function (target) {
	  common$1.setLevels(winston, defaultLogger.levels, target);
	  defaultLogger.setLevels(target);
	};

	//
	// Define getter / setter for the default logger level
	// which need to be exposed by winston.
	//
	Object.defineProperty(winston, 'level', {
	  get: function () {
	    return defaultLogger.level;
	  },
	  set: function (val) {
	    defaultLogger.level = val;

	    Object.keys(defaultLogger.transports).forEach(function(key) {
	      defaultLogger.transports[key].level = val;
	    });
	  }
	});

	//
	// Define getters / setters for appropriate properties of the
	// default logger which need to be exposed by winston.
	//
	['emitErrs', 'exitOnError', 'padLevels', 'levelLength', 'stripColors'].forEach(function (prop) {
	  Object.defineProperty(winston, prop, {
	    get: function () {
	      return defaultLogger[prop];
	    },
	    set: function (val) {
	      defaultLogger[prop] = val;
	    }
	  });
	});

	//
	// @default {Object}
	// The default transports and exceptionHandlers for
	// the default winston logger.
	//
	Object.defineProperty(winston, 'default', {
	  get: function () {
	    return {
	      transports: defaultLogger.transports,
	      exceptionHandlers: defaultLogger.exceptionHandlers
	    };
	  }
	});
	});

	var styles_1$1 = createCommonjsModule(function (module) {
	/*
	The MIT License (MIT)

	Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.

	*/

	var styles = {};
	module['exports'] = styles;

	var codes = {
	  reset: [0, 0],

	  bold: [1, 22],
	  dim: [2, 22],
	  italic: [3, 23],
	  underline: [4, 24],
	  inverse: [7, 27],
	  hidden: [8, 28],
	  strikethrough: [9, 29],

	  black: [30, 39],
	  red: [31, 39],
	  green: [32, 39],
	  yellow: [33, 39],
	  blue: [34, 39],
	  magenta: [35, 39],
	  cyan: [36, 39],
	  white: [37, 39],
	  gray: [90, 39],
	  grey: [90, 39],

	  bgBlack: [40, 49],
	  bgRed: [41, 49],
	  bgGreen: [42, 49],
	  bgYellow: [43, 49],
	  bgBlue: [44, 49],
	  bgMagenta: [45, 49],
	  bgCyan: [46, 49],
	  bgWhite: [47, 49],

	  // legacy styles for colors pre v1.0.0
	  blackBG: [40, 49],
	  redBG: [41, 49],
	  greenBG: [42, 49],
	  yellowBG: [43, 49],
	  blueBG: [44, 49],
	  magentaBG: [45, 49],
	  cyanBG: [46, 49],
	  whiteBG: [47, 49],

	};

	Object.keys(codes).forEach(function(key) {
	  var val = codes[key];
	  var style = styles[key] = [];
	  style.open = '\u001b[' + val[0] + 'm';
	  style.close = '\u001b[' + val[1] + 'm';
	});
	});

	/*
	MIT License

	Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

	Permission is hereby granted, free of charge, to any person obtaining a copy of
	this software and associated documentation files (the "Software"), to deal in
	the Software without restriction, including without limitation the rights to
	use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
	of the Software, and to permit persons to whom the Software is furnished to do
	so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
	*/

	var hasFlag = function(flag, argv) {
	  argv = argv || process.argv;

	  var terminatorPos = argv.indexOf('--');
	  var prefix = /^-{1,2}/.test(flag) ? '' : '--';
	  var pos = argv.indexOf(prefix + flag);

	  return pos !== -1 && (terminatorPos === -1 ? true : pos < terminatorPos);
	};

	var env = process.env;

	var forceColor = void 0;
	if (hasFlag('no-color') || hasFlag('no-colors') || hasFlag('color=false')) {
	  forceColor = false;
	} else if (hasFlag('color') || hasFlag('colors') || hasFlag('color=true')
	           || hasFlag('color=always')) {
	  forceColor = true;
	}
	if ('FORCE_COLOR' in env) {
	  forceColor = env.FORCE_COLOR.length === 0
	    || parseInt(env.FORCE_COLOR, 10) !== 0;
	}

	function translateLevel(level) {
	  if (level === 0) {
	    return false;
	  }

	  return {
	    level: level,
	    hasBasic: true,
	    has256: level >= 2,
	    has16m: level >= 3,
	  };
	}

	function supportsColor(stream$$1) {
	  if (forceColor === false) {
	    return 0;
	  }

	  if (hasFlag('color=16m') || hasFlag('color=full')
	      || hasFlag('color=truecolor')) {
	    return 3;
	  }

	  if (hasFlag('color=256')) {
	    return 2;
	  }

	  if (stream$$1 && !stream$$1.isTTY && forceColor !== true) {
	    return 0;
	  }

	  var min = forceColor ? 1 : 0;

	  if (process.platform === 'win32') {
	    // Node.js 7.5.0 is the first version of Node.js to include a patch to
	    // libuv that enables 256 color output on Windows. Anything earlier and it
	    // won't work. However, here we target Node.js 8 at minimum as it is an LTS
	    // release, and Node.js 7 is not. Windows 10 build 10586 is the first
	    // Windows release that supports 256 colors. Windows 10 build 14931 is the
	    // first release that supports 16m/TrueColor.
	    var osRelease = os.release().split('.');
	    if (Number(process.versions.node.split('.')[0]) >= 8
	        && Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
	      return Number(osRelease[2]) >= 14931 ? 3 : 2;
	    }

	    return 1;
	  }

	  if ('CI' in env) {
	    if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI'].some(function(sign) {
	      return sign in env;
	    }) || env.CI_NAME === 'codeship') {
	      return 1;
	    }

	    return min;
	  }

	  if ('TEAMCITY_VERSION' in env) {
	    return (/^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0
	    );
	  }

	  if ('TERM_PROGRAM' in env) {
	    var version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

	    switch (env.TERM_PROGRAM) {
	      case 'iTerm.app':
	        return version >= 3 ? 3 : 2;
	      case 'Hyper':
	        return 3;
	      case 'Apple_Terminal':
	        return 2;
	      // No default
	    }
	  }

	  if (/-256(color)?$/i.test(env.TERM)) {
	    return 2;
	  }

	  if (/^screen|^xterm|^vt100|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
	    return 1;
	  }

	  if ('COLORTERM' in env) {
	    return 1;
	  }

	  if (env.TERM === 'dumb') {
	    return min;
	  }

	  return min;
	}

	function getSupportLevel(stream$$1) {
	  var level = supportsColor(stream$$1);
	  return translateLevel(level);
	}

	var supportsColors$1 = {
	  supportsColor: getSupportLevel,
	  stdout: getSupportLevel(process.stdout),
	  stderr: getSupportLevel(process.stderr),
	};

	var trap$1 = createCommonjsModule(function (module) {
	module['exports'] = function runTheTrap(text, options) {
	  var result = '';
	  text = text || 'Run the trap, drop the bass';
	  text = text.split('');
	  var trap = {
	    a: ['\u0040', '\u0104', '\u023a', '\u0245', '\u0394', '\u039b', '\u0414'],
	    b: ['\u00df', '\u0181', '\u0243', '\u026e', '\u03b2', '\u0e3f'],
	    c: ['\u00a9', '\u023b', '\u03fe'],
	    d: ['\u00d0', '\u018a', '\u0500', '\u0501', '\u0502', '\u0503'],
	    e: ['\u00cb', '\u0115', '\u018e', '\u0258', '\u03a3', '\u03be', '\u04bc',
	         '\u0a6c'],
	    f: ['\u04fa'],
	    g: ['\u0262'],
	    h: ['\u0126', '\u0195', '\u04a2', '\u04ba', '\u04c7', '\u050a'],
	    i: ['\u0f0f'],
	    j: ['\u0134'],
	    k: ['\u0138', '\u04a0', '\u04c3', '\u051e'],
	    l: ['\u0139'],
	    m: ['\u028d', '\u04cd', '\u04ce', '\u0520', '\u0521', '\u0d69'],
	    n: ['\u00d1', '\u014b', '\u019d', '\u0376', '\u03a0', '\u048a'],
	    o: ['\u00d8', '\u00f5', '\u00f8', '\u01fe', '\u0298', '\u047a', '\u05dd',
	         '\u06dd', '\u0e4f'],
	    p: ['\u01f7', '\u048e'],
	    q: ['\u09cd'],
	    r: ['\u00ae', '\u01a6', '\u0210', '\u024c', '\u0280', '\u042f'],
	    s: ['\u00a7', '\u03de', '\u03df', '\u03e8'],
	    t: ['\u0141', '\u0166', '\u0373'],
	    u: ['\u01b1', '\u054d'],
	    v: ['\u05d8'],
	    w: ['\u0428', '\u0460', '\u047c', '\u0d70'],
	    x: ['\u04b2', '\u04fe', '\u04fc', '\u04fd'],
	    y: ['\u00a5', '\u04b0', '\u04cb'],
	    z: ['\u01b5', '\u0240'],
	  };
	  text.forEach(function(c) {
	    c = c.toLowerCase();
	    var chars = trap[c] || [' '];
	    var rand = Math.floor(Math.random() * chars.length);
	    if (typeof trap[c] !== 'undefined') {
	      result += trap[c][rand];
	    } else {
	      result += c;
	    }
	  });
	  return result;
	};
	});

	var zalgo$1 = createCommonjsModule(function (module) {
	// please no
	module['exports'] = function zalgo(text, options) {
	  text = text || '   he is here   ';
	  var soul = {
	    'up': [
	      '̍', '̎', '̄', '̅',
	      '̿', '̑', '̆', '̐',
	      '͒', '͗', '͑', '̇',
	      '̈', '̊', '͂', '̓',
	      '̈', '͊', '͋', '͌',
	      '̃', '̂', '̌', '͐',
	      '̀', '́', '̋', '̏',
	      '̒', '̓', '̔', '̽',
	      '̉', 'ͣ', 'ͤ', 'ͥ',
	      'ͦ', 'ͧ', 'ͨ', 'ͩ',
	      'ͪ', 'ͫ', 'ͬ', 'ͭ',
	      'ͮ', 'ͯ', '̾', '͛',
	      '͆', '̚',
	    ],
	    'down': [
	      '̖', '̗', '̘', '̙',
	      '̜', '̝', '̞', '̟',
	      '̠', '̤', '̥', '̦',
	      '̩', '̪', '̫', '̬',
	      '̭', '̮', '̯', '̰',
	      '̱', '̲', '̳', '̹',
	      '̺', '̻', '̼', 'ͅ',
	      '͇', '͈', '͉', '͍',
	      '͎', '͓', '͔', '͕',
	      '͖', '͙', '͚', '̣',
	    ],
	    'mid': [
	      '̕', '̛', '̀', '́',
	      '͘', '̡', '̢', '̧',
	      '̨', '̴', '̵', '̶',
	      '͜', '͝', '͞',
	      '͟', '͠', '͢', '̸',
	      '̷', '͡', ' ҉',
	    ],
	  };
	  var all = [].concat(soul.up, soul.down, soul.mid);

	  function randomNumber(range) {
	    var r = Math.floor(Math.random() * range);
	    return r;
	  }

	  function isChar(character) {
	    var bool = false;
	    all.filter(function(i) {
	      bool = (i === character);
	    });
	    return bool;
	  }


	  function heComes(text, options) {
	    var result = '';
	    var counts;
	    var l;
	    options = options || {};
	    options['up'] =
	      typeof options['up'] !== 'undefined' ? options['up'] : true;
	    options['mid'] =
	      typeof options['mid'] !== 'undefined' ? options['mid'] : true;
	    options['down'] =
	      typeof options['down'] !== 'undefined' ? options['down'] : true;
	    options['size'] =
	      typeof options['size'] !== 'undefined' ? options['size'] : 'maxi';
	    text = text.split('');
	    for (l in text) {
	      if (isChar(l)) {
	        continue;
	      }
	      result = result + text[l];
	      counts = {'up': 0, 'down': 0, 'mid': 0};
	      switch (options.size) {
	      case 'mini':
	        counts.up = randomNumber(8);
	        counts.mid = randomNumber(2);
	        counts.down = randomNumber(8);
	        break;
	      case 'maxi':
	        counts.up = randomNumber(16) + 3;
	        counts.mid = randomNumber(4) + 1;
	        counts.down = randomNumber(64) + 3;
	        break;
	      default:
	        counts.up = randomNumber(8) + 1;
	        counts.mid = randomNumber(6) / 2;
	        counts.down = randomNumber(8) + 1;
	        break;
	      }

	      var arr = ['up', 'mid', 'down'];
	      for (var d in arr) {
	        var index = arr[d];
	        for (var i = 0; i <= counts[index]; i++) {
	          if (options[index]) {
	            result = result + soul[index][randomNumber(soul[index].length)];
	          }
	        }
	      }
	    }
	    return result;
	  }
	  // don't summon him
	  return heComes(text, options);
	};
	});

	var america$1 = createCommonjsModule(function (module) {
	module['exports'] = function(colors) {
	  return function(letter, i, exploded) {
	    if (letter === ' ') return letter;
	    switch (i%3) {
	      case 0: return colors.red(letter);
	      case 1: return colors.white(letter);
	      case 2: return colors.blue(letter);
	    }
	  };
	};
	});

	var zebra$1 = createCommonjsModule(function (module) {
	module['exports'] = function(colors) {
	  return function(letter, i, exploded) {
	    return i % 2 === 0 ? letter : colors.inverse(letter);
	  };
	};
	});

	var rainbow$1 = createCommonjsModule(function (module) {
	module['exports'] = function(colors) {
	  // RoY G BiV
	  var rainbowColors = ['red', 'yellow', 'green', 'blue', 'magenta'];
	  return function(letter, i, exploded) {
	    if (letter === ' ') {
	      return letter;
	    } else {
	      return colors[rainbowColors[i++ % rainbowColors.length]](letter);
	    }
	  };
	};
	});

	var random$1 = createCommonjsModule(function (module) {
	module['exports'] = function(colors) {
	  var available = ['underline', 'inverse', 'grey', 'yellow', 'red', 'green',
	    'blue', 'white', 'cyan', 'magenta'];
	  return function(letter, i, exploded) {
	    return letter === ' ' ? letter :
	      colors[
	        available[Math.round(Math.random() * (available.length - 2))]
	      ](letter);
	  };
	};
	});

	var colors_1$1 = createCommonjsModule(function (module) {
	/*

	The MIT License (MIT)

	Original Library
	  - Copyright (c) Marak Squires

	Additional functionality
	 - Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.

	*/

	var colors = {};
	module['exports'] = colors;

	colors.themes = {};


	var ansiStyles = colors.styles = styles_1$1;
	var defineProps = Object.defineProperties;
	var newLineRegex = new RegExp(/[\r\n]+/g);

	colors.supportsColor = supportsColors$1.supportsColor;

	if (typeof colors.enabled === 'undefined') {
	  colors.enabled = colors.supportsColor() !== false;
	}

	colors.enable = function() {
	  colors.enabled = true;
	};

	colors.disable = function() {
	  colors.enabled = false;
	};

	colors.stripColors = colors.strip = function(str) {
	  return ('' + str).replace(/\x1B\[\d+m/g, '');
	};

	// eslint-disable-next-line no-unused-vars
	var stylize = colors.stylize = function stylize(str, style) {
	  if (!colors.enabled) {
	    return str+'';
	  }

	  return ansiStyles[style].open + str + ansiStyles[style].close;
	};

	var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
	var escapeStringRegexp = function(str) {
	  if (typeof str !== 'string') {
	    throw new TypeError('Expected a string');
	  }
	  return str.replace(matchOperatorsRe, '\\$&');
	};

	function build(_styles) {
	  var builder = function builder() {
	    return applyStyle.apply(builder, arguments);
	  };
	  builder._styles = _styles;
	  // __proto__ is used because we must return a function, but there is
	  // no way to create a function with a different prototype.
	  builder.__proto__ = proto;
	  return builder;
	}

	var styles = (function() {
	  var ret = {};
	  ansiStyles.grey = ansiStyles.gray;
	  Object.keys(ansiStyles).forEach(function(key) {
	    ansiStyles[key].closeRe =
	      new RegExp(escapeStringRegexp(ansiStyles[key].close), 'g');
	    ret[key] = {
	      get: function() {
	        return build(this._styles.concat(key));
	      },
	    };
	  });
	  return ret;
	})();

	var proto = defineProps(function colors() {}, styles);

	function applyStyle() {
	  var args = Array.prototype.slice.call(arguments);

	  var str = args.map(function(arg) {
	    if (arg != undefined && arg.constructor === String) {
	      return arg;
	    } else {
	      return util.inspect(arg);
	    }
	  }).join(' ');

	  if (!colors.enabled || !str) {
	    return str;
	  }

	  var newLinesPresent = str.indexOf('\n') != -1;

	  var nestedStyles = this._styles;

	  var i = nestedStyles.length;
	  while (i--) {
	    var code = ansiStyles[nestedStyles[i]];
	    str = code.open + str.replace(code.closeRe, code.open) + code.close;
	    if (newLinesPresent) {
	      str = str.replace(newLineRegex, function(match) {
	        return code.close + match + code.open;
	      });
	    }
	  }

	  return str;
	}

	colors.setTheme = function(theme) {
	  if (typeof theme === 'string') {
	    console.log('colors.setTheme now only accepts an object, not a string.  ' +
	      'If you are trying to set a theme from a file, it is now your (the ' +
	      'caller\'s) responsibility to require the file.  The old syntax ' +
	      'looked like colors.setTheme(__dirname + ' +
	      '\'/../themes/generic-logging.js\'); The new syntax looks like '+
	      'colors.setTheme(require(__dirname + ' +
	      '\'/../themes/generic-logging.js\'));');
	    return;
	  }
	  for (var style in theme) {
	    (function(style) {
	      colors[style] = function(str) {
	        if (typeof theme[style] === 'object') {
	          var out = str;
	          for (var i in theme[style]) {
	            out = colors[theme[style][i]](out);
	          }
	          return out;
	        }
	        return colors[theme[style]](str);
	      };
	    })(style);
	  }
	};

	function init() {
	  var ret = {};
	  Object.keys(styles).forEach(function(name) {
	    ret[name] = {
	      get: function() {
	        return build([name]);
	      },
	    };
	  });
	  return ret;
	}

	var sequencer = function sequencer(map, str) {
	  var exploded = str.split('');
	  exploded = exploded.map(map);
	  return exploded.join('');
	};

	// custom formatter methods
	colors.trap = trap$1;
	colors.zalgo = zalgo$1;

	// maps
	colors.maps = {};
	colors.maps.america = america$1(colors);
	colors.maps.zebra = zebra$1(colors);
	colors.maps.rainbow = rainbow$1(colors);
	colors.maps.random = random$1(colors);

	for (var map in colors.maps) {
	  (function(map) {
	    colors[map] = function(str) {
	      return sequencer(colors.maps[map], str);
	    };
	  })(map);
	}

	defineProps(colors, init());
	});

	var safe$1 = createCommonjsModule(function (module) {
	//
	// Remark: Requiring this file will use the "safe" colors API,
	// which will not touch String.prototype.
	//
	//   var colors = require('colors/safe');
	//   colors.red("foo")
	//
	//

	module['exports'] = colors_1$1;
	});

	var pkginfo_1$1 = createCommonjsModule(function (module) {
	/*
	 * pkginfo.js: Top-level include for the pkginfo module
	 *
	 * (C) 2011, Charlie Robbins
	 *
	 */



	//
	// ### function pkginfo ([options, 'property', 'property' ..])
	// #### @pmodule {Module} Parent module to read from.
	// #### @options {Object|Array|string} **Optional** Options used when exposing properties.
	// #### @arguments {string...} **Optional** Specified properties to expose.
	// Exposes properties from the package.json file for the parent module on
	// it's exports. Valid usage:
	//
	// `require('pkginfo')()`
	//
	// `require('pkginfo')('version', 'author');`
	//
	// `require('pkginfo')(['version', 'author']);`
	//
	// `require('pkginfo')({ include: ['version', 'author'] });`
	//
	var pkginfo = module.exports = function (pmodule, options) {
	  var args = [].slice.call(arguments, 2).filter(function (arg) {
	    return typeof arg === 'string';
	  });

	  //
	  // **Parse variable arguments**
	  //
	  if (Array.isArray(options)) {
	    //
	    // If the options passed in is an Array assume that
	    // it is the Array of properties to expose from the
	    // on the package.json file on the parent module.
	    //
	    options = { include: options };
	  }
	  else if (typeof options === 'string') {
	    //
	    // Otherwise if the first argument is a string, then
	    // assume that it is the first property to expose from
	    // the package.json file on the parent module.
	    //
	    options = { include: [options] };
	  }

	  //
	  // **Setup default options**
	  //
	  options = options || {};

	  // ensure that includes have been defined
	  options.include = options.include || [];

	  if (args.length > 0) {
	    //
	    // If additional string arguments have been passed in
	    // then add them to the properties to expose on the
	    // parent module.
	    //
	    options.include = options.include.concat(args);
	  }

	  var pkg = pkginfo.read(pmodule, options.dir).package;
	  Object.keys(pkg).forEach(function (key) {
	    if (options.include.length > 0 && !~options.include.indexOf(key)) {
	      return;
	    }

	    if (!pmodule.exports[key]) {
	      pmodule.exports[key] = pkg[key];
	    }
	  });

	  return pkginfo;
	};

	//
	// ### function find (dir)
	// #### @pmodule {Module} Parent module to read from.
	// #### @dir {string} **Optional** Directory to start search from.
	// Searches up the directory tree from `dir` until it finds a directory
	// which contains a `package.json` file.
	//
	pkginfo.find = function (pmodule, dir) {
	  if (! dir) {
	    dir = pathModule.dirname(pmodule.filename || pmodule.id);
	  }

	  if (dir === pathModule.dirname(dir)) {
	    throw new Error('Could not find package.json up from ' +
	                (pmodule.filename || pmodule.id));
	  }
	  else if (!dir || dir === '.') {
	    throw new Error('Cannot find package.json from unspecified directory');
	  }

	  var contents;
	  try {
	    contents = commonjsRequire(dir + '/package.json');
	  } catch (error) {}

	  if (contents) return contents;

	  return pkginfo.find(pmodule, pathModule.dirname(dir));
	};

	//
	// ### function read (pmodule, dir)
	// #### @pmodule {Module} Parent module to read from.
	// #### @dir {string} **Optional** Directory to start search from.
	// Searches up the directory tree from `dir` until it finds a directory
	// which contains a `package.json` file and returns the package information.
	//
	pkginfo.read = function (pmodule, dir) {
	  return {
	    dir: dir,
	    package: pkginfo.find(pmodule, dir),
	  };
	};

	//
	// Call `pkginfo` on this module and expose version.
	//
	pkginfo(module, {
	  dir: __dirname,
	  include: ['version'],
	  target: pkginfo
	});
	});

	var prompt_1 = createCommonjsModule(function (module) {
	/*
	 * prompt.js: Simple prompt for prompting information from the command line
	 *
	 * (C) 2010, Nodejitsu Inc.
	 *
	 */

	var async = lib$1.async,
	    validate = revalidator.validate;

	//
	// Monkey-punch readline.Interface to work-around
	// https://github.com/joyent/node/issues/3860
	//
	readline.Interface.prototype.setPrompt = function(prompt, length) {
	  this._prompt = prompt;
	  if (length) {
	    this._promptLength = length;
	  } else {
	    var lines = prompt.split(/[\r\n]/);
	    var lastLine = lines[lines.length - 1];
	    this._promptLength = lastLine.replace(/\u001b\[(\d+(;\d+)*)?m/g, '').length;
	  }
	};

	//
	// Expose version using `pkginfo`
	//
	pkginfo_1$1(module, 'version');

	var stdin, stdout, history = [];
	var prompt = module.exports = Object.create(events.EventEmitter.prototype);
	var logger = prompt.logger = new winston_1.Logger({
	  transports: [new (winston_1.transports.Console)()]
	});

	prompt.started    = false;
	prompt.paused     = false;
	prompt.stopped    = true;
	prompt.allowEmpty = false;
	prompt.message    = 'prompt';
	prompt.delimiter  = ': ';
	prompt.colors     = true;

	//
	// Create an empty object for the properties
	// known to `prompt`
	//
	prompt.properties = {};

	//
	// Setup the default winston logger to use
	// the `cli` levels and colors.
	//
	logger.cli();

	//
	// ### function start (options)
	// #### @options {Object} **Optional** Options to consume by prompt
	// Starts the prompt by listening to the appropriate events on `options.stdin`
	// and `options.stdout`. If no streams are supplied, then `process.stdin`
	// and `process.stdout` are used, respectively.
	//
	prompt.start = function (options) {
	  if (prompt.started) {
	    return;
	  }

	  options = options        || {};
	  stdin   = options.stdin  || process.stdin;
	  stdout  = options.stdout || process.stdout;

	  //
	  // By default: Remember the last `10` prompt property /
	  // answer pairs and don't allow empty responses globally.
	  //
	  prompt.memory     = options.memory     || 10;
	  prompt.allowEmpty = options.allowEmpty || false;
	  prompt.message    = options.message    || prompt.message;
	  prompt.delimiter  = options.delimiter  || prompt.delimiter;
	  prompt.colors     = options.colors     || prompt.colors;

	  if (process.platform !== 'win32') {
	    // windows falls apart trying to deal with SIGINT
	    process.on('SIGINT', function () {
	      stdout.write('\n');
	      process.exit(1);
	    });
	  }

	  prompt.emit('start');
	  prompt.started = true;
	  prompt.stopped = false;
	  return prompt;
	};

	//
	// ### function pause ()
	// Pauses input coming in from stdin
	//
	prompt.pause = function () {
	  if (!prompt.started || prompt.stopped || prompt.paused) {
	    return;
	  }

	  stdin.pause();
	  prompt.emit('pause');
	  prompt.paused = true;
	  return prompt;
	};

	//
	// ### function stop ()
	// Stops input coming in from stdin
	//
	prompt.stop = function () {
	    if (prompt.stopped || !prompt.started) {
	        return;
	    }
	    
	    stdin.destroy();
	    prompt.emit('stop');
	    prompt.stopped = true;
	    prompt.started = false;
	    prompt.paused = false;
	    return prompt;
	};

	//
	// ### function resume ()
	// Resumes input coming in from stdin
	//
	prompt.resume = function () {
	  if (!prompt.started || !prompt.paused) {
	    return;
	  }

	  stdin.resume();
	  prompt.emit('resume');
	  prompt.paused = false;
	  return prompt;
	};

	//
	// ### function history (search)
	// #### @search {Number|string} Index or property name to find.
	// Returns the `property:value` pair from within the prompts
	// `history` array.
	//
	prompt.history = function (search) {
	  if (typeof search === 'number') {
	    return history[search] || {};
	  }

	  var names = history.map(function (pair) {
	    return typeof pair.property === 'string'
	      ? pair.property
	      : pair.property.name;
	  });

	  if (!~names.indexOf(search)) {
	    return null;
	  }

	  return history.filter(function (pair) {
	    return typeof pair.property === 'string'
	      ? pair.property === search
	      : pair.property.name === search;
	  })[0];
	};

	//
	// ### function get (schema, callback)
	// #### @schema {Array|Object|string} Set of variables to get input for.
	// #### @callback {function} Continuation to pass control to when complete.
	// Gets input from the user via stdin for the specified message(s) `msg`.
	//
	prompt.get = function (schema, callback) {
	  //
	  // Transforms a full JSON-schema into an array describing path and sub-schemas.
	  // Used for iteration purposes.
	  //
	  function untangle(schema, path) {
	    var results = [];
	    path = path || [];

	    if (schema.properties) {
	      //
	      // Iterate over the properties in the schema and use recursion
	      // to process sub-properties.
	      //
	      Object.keys(schema.properties).forEach(function (key) {
	        var obj = {};
	        obj[key] = schema.properties[key];

	        //
	        // Concat a sub-untangling to the results.
	        //
	        results = results.concat(untangle(obj[key], path.concat(key)));
	      });

	      // Return the results.
	      return results;
	    }

	    //
	    // This is a schema "leaf".
	    //
	    return {
	      path: path,
	      schema: schema
	    };
	  }

	  //
	  // Iterate over the values in the schema, represented as
	  // a legit single-property object subschemas. Accepts `schema`
	  // of the forms:
	  //
	  //    'prop-name'
	  //
	  //    ['string-name', { path: ['or-well-formed-subschema'], properties: ... }]
	  //
	  //    { path: ['or-well-formed-subschema'], properties: ... ] }
	  //
	  //    { properties: { 'schema-with-no-path' } }
	  //
	  // And transforms them all into
	  //
	  //    { path: ['path', 'to', 'property'], properties: { path: { to: ...} } }
	  //
	  function iterate(schema, get, done) {
	    var iterator = [],
	        result = {};

	    if (typeof schema === 'string') {
	      //
	      // We can iterate over a single string.
	      //
	      iterator.push({
	        path: [schema],
	        schema: prompt.properties[schema.toLowerCase()] || {}
	      });
	    }
	    else if (Array.isArray(schema)) {
	      //
	      // An array of strings and/or single-prop schema and/or no-prop schema.
	      //
	      iterator = schema.map(function (element) {
	        if (typeof element === 'string') {
	          return {
	            path: [element],
	            schema: prompt.properties[element.toLowerCase()] || {}
	          };
	        }
	        else if (element.properties) {
	          return {
	            path: [Object.keys(element.properties)[0]],
	            schema: element.properties[Object.keys(element.properties)[0]]
	          };
	        }
	        else if (element.path && element.schema) {
	          return element;
	        }
	        else {
	          return {
	            path: [element.name || 'question'],
	            schema: element
	          };
	        }
	      });
	    }
	    else if (schema.properties) {
	      //
	      // Or a complete schema `untangle` it for use.
	      //
	      iterator = untangle(schema);
	    }
	    else {
	      //
	      // Or a partial schema and path.
	      // TODO: Evaluate need for this option.
	      //
	      iterator = [{
	        schema: schema.schema ? schema.schema : schema,
	        path: schema.path || [schema.name || 'question']
	      }];
	    }

	    //
	    // Now, iterate and assemble the result.
	    //
	    async.forEachSeries(iterator, function (branch, next) {
	      get(branch, function assembler(err, line) {
	        if (err) {
	          return next(err);
	        }

	        function build(path, line) {
	          var obj = {};
	          if (path.length) {
	            obj[path[0]] = build(path.slice(1), line);
	            return obj;
	          }

	          return line;
	        }

	        function attach(obj, attr) {
	          var keys;
	          if (typeof attr !== 'object' || attr instanceof Array) {
	            return attr;
	          }

	          keys = Object.keys(attr);
	          if (keys.length) {
	            if (!obj[keys[0]]) {
	              obj[keys[0]] = {};
	            }
	            obj[keys[0]] = attach(obj[keys[0]], attr[keys[0]]);
	          }

	          return obj;
	        }

	        result = attach(result, build(branch.path, line));
	        next();
	      });
	    }, function (err) {
	      return err ? done(err) : done(null, result);
	    });
	  }

	  iterate(schema, function get(target, next) {
	    prompt.getInput(target, function (err, line) {
	      return err ? next(err) : next(null, line);
	    });
	  }, callback);

	  return prompt;
	};

	//
	// ### function confirm (msg, callback)
	// #### @msg {Array|Object|string} set of message to confirm
	// #### @callback {function} Continuation to pass control to when complete.
	// Confirms a single or series of messages by prompting the user for a Y/N response.
	// Returns `true` if ALL messages are answered in the affirmative, otherwise `false`
	//
	// `msg` can be a string, or object (or array of strings/objects).
	// An object may have the following properties:
	//
	//    {
	//      description: 'yes/no' // message to prompt user
	//      pattern: /^[yntf]{1}/i // optional - regex defining acceptable responses
	//      yes: /^[yt]{1}/i // optional - regex defining `affirmative` responses
	//      message: 'yes/no' // optional - message to display for invalid responses
	//    }
	//
	prompt.confirm = function (/* msg, options, callback */) {
	  var args     = Array.prototype.slice.call(arguments),
	      msg      = args.shift(),
	      callback = args.pop(),
	      opts     = args.shift(),
	      vars     = !Array.isArray(msg) ? [msg] : msg,
	      RX_Y     = /^[yt]{1}/i,
	      RX_YN    = /^[yntf]{1}/i;

	  function confirm(target, next) {
	    var yes = target.yes || RX_Y,
	      options = lib$1.mixin({
	        description: typeof target === 'string' ? target : target.description||'yes/no',
	        pattern: target.pattern || RX_YN,
	        name: 'confirm',
	        message: target.message || 'yes/no'
	      }, opts || {});


	    prompt.get([options], function (err, result) {
	      next(err ? false : yes.test(result[options.name]));
	    });
	  }

	  async.rejectSeries(vars, confirm, function(result) {
	    callback(null, result.length===0);
	  });
	};


	// Variables needed outside of getInput for multiline arrays.
	var tmp = [];


	// ### function getInput (prop, callback)
	// #### @prop {Object|string} Variable to get input for.
	// #### @callback {function} Continuation to pass control to when complete.
	// Gets input from the user via stdin for the specified message `msg`.
	//
	prompt.getInput = function (prop, callback) {
	  var schema = prop.schema || prop,
	      propName = prop.path && prop.path.join(':') || prop,
	      storedSchema = prompt.properties[propName.toLowerCase()],
	      delim = prompt.delimiter,
	      defaultLine,
	      length,
	      name,
	      raw,
	      msg;

	  //
	  // If there is a stored schema for `propName` in `propmpt.properties`
	  // then use it.
	  //
	  if (schema instanceof Object && !Object.keys(schema).length &&
	    typeof storedSchema !== 'undefined') {
	    schema = storedSchema;
	  }

	  //
	  // Build a proper validation schema if we just have a string
	  // and no `storedSchema`.
	  //
	  if (typeof prop === 'string' && !storedSchema) {
	    schema = {};
	  }

	  schema = convert(schema);
	  defaultLine = schema.default;
	  name = prop.description || schema.description || propName;
	  raw = prompt.colors
	    ? [safe$1.grey(name), safe$1.grey(delim)]
	    : [name, delim];

	  if (prompt.message)
	    raw.unshift(prompt.message, delim);

	  prop = {
	    schema: schema,
	    path: propName.split(':')
	  };

	  //
	  // If the schema has no `properties` value then set
	  // it to an object containing the current schema
	  // for `propName`.
	  //
	  if (!schema.properties) {
	    schema = (function () {
	      var obj = { properties: {} };
	      obj.properties[propName] = schema;
	      return obj;
	    })();
	  }

	  //
	  // Handle overrides here.
	  // TODO: Make overrides nestable
	  //
	  if (prompt.override && prompt.override[propName]) {
	    if (prompt._performValidation(name, prop, prompt.override, schema, -1, callback)) {
	      return callback(null, prompt.override[propName]);
	    }

	    delete prompt.override[propName];
	  }

	  //
	  // Check if we should skip this prompt
	  //
	  if (typeof prop.schema.ask === 'function' &&
	    !prop.schema.ask()) {
	    return callback(null, prop.schema.default || '');
	  }

	  var type = (schema.properties && schema.properties[propName] &&
	              schema.properties[propName].type || '').toLowerCase().trim(),
	      wait = type === 'array';

	  if (type === 'array') {
	    length = prop.schema.maxItems;
	    if (length) {
	      msg = (tmp.length + 1).toString() + '/' + length.toString();
	    }
	    else {
	      msg = (tmp.length + 1).toString();
	    }
	    msg += delim;
	    raw.push(prompt.colors ? msg.grey : msg);
	  }

	  //
	  // Calculate the raw length and colorize the prompt
	  //
	  length = raw.join('').length;
	  raw[0] = raw[0];
	  msg = raw.join('');

	  if (schema.help) {
	    schema.help.forEach(function (line) {
	      logger.help(line);
	    });
	  }

	  //
	  // Emit a "prompting" event
	  //
	  prompt.emit('prompt', prop);

	  //
	  // If there is no default line, set it to an empty string
	  //
	  if(typeof defaultLine === 'undefined') {
	    defaultLine = '';
	  }

	  //
	  // set to string for readline ( will not accept Numbers )
	  //
	  defaultLine = defaultLine.toString();

	  //
	  // Make the actual read
	  //
	  read_1({
	    prompt: msg,
	    silent: prop.schema && prop.schema.hidden,
	    replace: prop.schema && prop.schema.replace,
	    default: defaultLine,
	    input: stdin,
	    output: stdout
	  }, function (err, line) {
	    if (err && wait === false) {
	      return callback(err);
	    }

	    var against = {},
	        isValid;

	    if (line !== '') {

	      if (schema.properties[propName]) {
	        var type = (schema.properties[propName].type || '').toLowerCase().trim() || undefined;

	        //
	        // If type is some sort of numeric create a Number object to pass to revalidator
	        //
	        if (type === 'number' || type === 'integer') {
	          line = Number(line);
	        }

	        //
	        // Attempt to parse input as a boolean if the schema expects a boolean
	        //
	        if (type == 'boolean') {
	          if(line.toLowerCase() === "true" || line.toLowerCase() === 't') {
	            line = true;
	          } else if(line.toLowerCase() === "false" || line.toLowerCase() === 'f') {
	            line = false;
	          }
	        }

	        //
	        // If the type is an array, wait for the end. Fixes #54
	        //
	        if (type == 'array') {
	          var length = prop.schema.maxItems;
	          if (err) {
	            if (err.message == 'canceled') {
	              wait = false;
	              stdout.write('\n');
	            }
	          }
	          else {
	            if (length) {
	              if (tmp.length + 1 < length) {
	                isValid = false;
	                wait = true;
	              }
	              else {
	                isValid = true;
	                wait = false;
	              }
	            }
	            else {
	              isValid = false;
	              wait = true;
	            }
	            tmp.push(line);
	          }
	          line = tmp;
	        }
	      }

	      against[propName] = line;
	    }

	    if (prop && prop.schema.before) {
	      line = prop.schema.before(line);
	    }

	    // Validate
	    if (isValid === undefined) isValid = prompt._performValidation(name, prop, against, schema, line, callback);

	    if (!isValid) {
	      return prompt.getInput(prop, callback);
	    }

	    //
	    // Log the resulting line, append this `property:value`
	    // pair to the history for `prompt` and respond to
	    // the callback.
	    //
	    logger.input(line.yellow);
	    prompt._remember(propName, line);
	    callback(null, line);

	    // Make sure `tmp` is emptied
	    tmp = [];
	  });
	};

	//
	// ### function performValidation (name, prop, against, schema, line, callback)
	// #### @name {Object} Variable name
	// #### @prop {Object|string} Variable to get input for.
	// #### @against {Object} Input
	// #### @schema {Object} Validation schema
	// #### @line {String|Boolean} Input line
	// #### @callback {function} Continuation to pass control to when complete.
	// Perfoms user input validation, print errors if needed and returns value according to validation
	//
	prompt._performValidation = function (name, prop, against, schema, line, callback) {
	  var valid, msg;
	  try {
	    valid = validate(against, schema);
	  }
	  catch (err) {
	    return (line !== -1) ? callback(err) : false;
	  }

	  if (!valid.valid) {
	    if (prop.schema.message) {
	      logger.error(prop.schema.message);
	    } else {
	      msg = line !== -1 ? 'Invalid input for ' : 'Invalid command-line input for ';

	      if (prompt.colors) {
	        logger.error(msg + name.grey);
	      }
	      else {
	        logger.error(msg + name);
	      }
	    }

	    prompt.emit('invalid', prop, line);
	  }

	  return valid.valid;
	};

	//
	// ### function addProperties (obj, properties, callback)
	// #### @obj {Object} Object to add properties to
	// #### @properties {Array} List of properties to get values for
	// #### @callback {function} Continuation to pass control to when complete.
	// Prompts the user for values each of the `properties` if `obj` does not already
	// have a value for the property. Responds with the modified object.
	//
	prompt.addProperties = function (obj, properties, callback) {
	  properties = properties.filter(function (prop) {
	    return typeof obj[prop] === 'undefined';
	  });

	  if (properties.length === 0) {
	    return callback(obj);
	  }

	  prompt.get(properties, function (err, results) {
	    if (err) {
	      return callback(err);
	    }
	    else if (!results) {
	      return callback(null, obj);
	    }

	    function putNested (obj, path, value) {
	      var last = obj, key;

	      while (path.length > 1) {
	        key = path.shift();
	        if (!last[key]) {
	          last[key] = {};
	        }

	        last = last[key];
	      }

	      last[path.shift()] = value;
	    }

	    Object.keys(results).forEach(function (key) {
	      putNested(obj, key.split('.'), results[key]);
	    });

	    callback(null, obj);
	  });

	  return prompt;
	};

	//
	// ### @private function _remember (property, value)
	// #### @property {Object|string} Property that the value is in response to.
	// #### @value {string} User input captured by `prompt`.
	// Prepends the `property:value` pair into the private `history` Array
	// for `prompt` so that it can be accessed later.
	//
	prompt._remember = function (property, value) {
	  history.unshift({
	    property: property,
	    value: value
	  });

	  //
	  // If the length of the `history` Array
	  // has exceeded the specified length to remember,
	  // `prompt.memory`, truncate it.
	  //
	  if (history.length > prompt.memory) {
	    history.splice(prompt.memory, history.length - prompt.memory);
	  }
	};

	//
	// ### @private function convert (schema)
	// #### @schema {Object} Schema for a property
	// Converts the schema into new format if it is in old format
	//
	function convert(schema) {
	  var newProps = Object.keys(validate.messages),
	      newSchema = false,
	      key;

	  newProps = newProps.concat(['description', 'dependencies']);

	  for (key in schema) {
	    if (newProps.indexOf(key) > 0) {
	      newSchema = true;
	      break;
	    }
	  }

	  if (!newSchema || schema.validator || schema.warning || typeof schema.empty !== 'undefined') {
	    schema.description = schema.message;
	    schema.message = schema.warning;

	    if (typeof schema.validator === 'function') {
	      schema.conform = schema.validator;
	    } else {
	      schema.pattern = schema.validator;
	    }

	    if (typeof schema.empty !== 'undefined') {
	      schema.required = !(schema.empty);
	    }

	    delete schema.warning;
	    delete schema.validator;
	    delete schema.empty;
	  }

	  return schema;
	}
	});

	function getConfig() {
	    const schema = {
	      properties: {
	        themeName: {
	          description: `Please enter the name for your theme`,
	          required: true
	        },
	        port: {
	          description: `Under which port should ghost be available on your computer? `,
	          required: true
	        },
	        output: {
	          description: `Where should the files be generated to? `,
	          default: 'output',
	        }
	      }
	  };

	  return new Promise((res, rej) => {
	      prompt_1.start();
	      prompt_1.get(schema, function (err, result) {
	        if(err){
	          rej(err); 
	        }
	        res(result);
	    });
	  })

	}

	async function main(){
	  try {
	    const config = await getConfig();
	    await compileFilesInDir(`${__dirname}/input`, config);
	    log$2('All done. Go to the output directory and start the docker container with `docker-compose up -d`. Then active the theme in Ghost and start developing on the theme files in the `src` directory. For more information head over to Documentation.');
	  } catch(e) {
	    log$2(e);
	  }
	}

	main();

}(fs,pathModule,util,assert,events,stream,readline,crypto,string_decoder,os));
//# sourceMappingURL=bundle.js.map
