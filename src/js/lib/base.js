/*!
---
前半部分为Mootools的Core工程 以及Cookie
目的是用来弥补jQuery在基于对象编程方面的不足 并包含jQuery没有内置的Cookie接口
后半部分则为一些扩展 方便网站项目的管理和支持
如有任何疑问请咨询：smilelegend@smilelegend.com || lovemoon@yeah.net
---
*/

/*
---
MooTools: the javascript framework

web build:
 - http://mootools.net/core/5705f6d80db0513db53d3be95b13e523

packager build:
 - packager build Core/Object Core/Class Core/Class.Extras Core/Cookie Core/JSON

provides: 
 - [Core, MooTools, Type, typeOf, instanceOf, Native]
---
*/


(function() {

	this.MooTools = {
		version: '1.4.5',
		build: 'ab8ea8824dc3b24b6666867a2c4ed58ebb762cf0'
	};

	// typeOf, instanceOf
	var typeOf = this.typeOf = function(item) {
		if (item == null) return 'null';
		if (item.$family != null) return item.$family();

		if (item.nodeName) {
			if (item.nodeType == 1) return 'element';
			if (item.nodeType == 3) return (/\S/).test(item.nodeValue) ? 'textnode' : 'whitespace';
		} else if (typeof item.length == 'number') {
			if (item.callee) return 'arguments';
			if ('item' in item) return 'collection';
		}

		return typeof item;
	};

	var instanceOf = this.instanceOf = function(item, object) {
		if (item == null) return false;
		var constructor = item.$constructor || item.constructor;
		while (constructor) {
			if (constructor === object) return true;
			constructor = constructor.parent;
		} /*<ltIE8>*/
		if (!item.hasOwnProperty) return false; /*</ltIE8>*/
		return item instanceof object;
	};

	// Function overloading
	var Function = this.Function;

	var enumerables = true;
	for (var i in {
		toString: 1
	}) enumerables = null;
	if (enumerables) enumerables = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'constructor'];

	Function.prototype.overloadSetter = function(usePlural) {
		var self = this;
		return function(a, b) {
			if (a == null) return this;
			if (usePlural || typeof a != 'string') {
				for (var k in a) self.call(this, k, a[k]);
				if (enumerables)
					for (var i = enumerables.length; i--;) {
						k = enumerables[i];
						if (a.hasOwnProperty(k)) self.call(this, k, a[k]);
					}
			} else {
				self.call(this, a, b);
			}
			return this;
		};
	};

	Function.prototype.overloadGetter = function(usePlural) {
		var self = this;
		return function(a) {
			var args, result;
			if (typeof a != 'string') args = a;
			else if (arguments.length > 1) args = arguments;
			else if (usePlural) args = [a];
			if (args) {
				result = {};
				for (var i = 0; i < args.length; i++) result[args[i]] = self.call(this, args[i]);
			} else {
				result = self.call(this, a);
			}
			return result;
		};
	};

	Function.prototype.extend = function(key, value) {
		this[key] = value;
	}.overloadSetter();

	Function.prototype.implement = function(key, value) {
		this.prototype[key] = value;
	}.overloadSetter();

	// From
	var slice = Array.prototype.slice;

	Function.from = function(item) {
		return (typeOf(item) == 'function') ? item : function() {
			return item;
		};
	};

	Array.from = function(item) {
		if (item == null) return [];
		return (Type.isEnumerable(item) && typeof item != 'string') ? (typeOf(item) == 'array') ? item : slice.call(item) : [item];
	};

	Number.from = function(item) {
		var number = parseFloat(item);
		return isFinite(number) ? number : null;
	};

	String.from = function(item) {
		return item + '';
	};

	// hide, protect
	Function.implement({

		hide: function() {
			this.$hidden = true;
			return this;
		},

		protect: function() {
			this.$protected = true;
			return this;
		}

	});

	// Type
	var Type = this.Type = function(name, object) {
		if (name) {
			var lower = name.toLowerCase();
			var typeCheck = function(item) {
				return (typeOf(item) == lower);
			};

			Type['is' + name] = typeCheck;
			if (object != null) {
				object.prototype.$family = (function() {
					return lower;
				}).hide();

			}
		}

		if (object == null) return null;

		object.extend(this);
		object.$constructor = Type;
		object.prototype.$constructor = object;

		return object;
	};

	var toString = Object.prototype.toString;

	Type.isEnumerable = function(item) {
		return (item != null && typeof item.length == 'number' && toString.call(item) != '[object Function]');
	};

	var hooks = {};

	var hooksOf = function(object) {
		var type = typeOf(object.prototype);
		return hooks[type] || (hooks[type] = []);
	};

	var implement = function(name, method) {
		if (method && method.$hidden) return;

		var hooks = hooksOf(this);

		for (var i = 0; i < hooks.length; i++) {
			var hook = hooks[i];
			if (typeOf(hook) == 'type') implement.call(hook, name, method);
			else hook.call(this, name, method);
		}

		var previous = this.prototype[name];
		if (previous == null || !previous.$protected) this.prototype[name] = method;

		if (this[name] == null && typeOf(method) == 'function') extend.call(this, name, function(item) {
			return method.apply(item, slice.call(arguments, 1));
		});
	};

	var extend = function(name, method) {
		if (method && method.$hidden) return;
		var previous = this[name];
		if (previous == null || !previous.$protected) this[name] = method;
	};

	Type.implement({

		implement: implement.overloadSetter(),

		extend: extend.overloadSetter(),

		alias: function(name, existing) {
			implement.call(this, name, this.prototype[existing]);
		}.overloadSetter(),

		mirror: function(hook) {
			hooksOf(this).push(hook);
			return this;
		}

	});

	new Type('Type', Type);

	// Default Types
	var force = function(name, object, methods) {
		var isType = (object != Object),
			prototype = object.prototype;

		if (isType) object = new Type(name, object);

		for (var i = 0, l = methods.length; i < l; i++) {
			var key = methods[i],
				generic = object[key],
				proto = prototype[key];

			if (generic) generic.protect();
			if (isType && proto) object.implement(key, proto.protect());
		}

		if (isType) {
			var methodsEnumerable = prototype.propertyIsEnumerable(methods[0]);
			object.forEachMethod = function(fn) {
				if (!methodsEnumerable)
					for (var i = 0, l = methods.length; i < l; i++) {
						fn.call(prototype, prototype[methods[i]], methods[i]);
					}
				for (var key in prototype) fn.call(prototype, prototype[key], key);
			};
		}

		return force;
	};

	force('String', String, ['charAt', 'charCodeAt', 'concat', 'indexOf', 'lastIndexOf', 'match', 'quote', 'replace', 'search', 'slice', 'split', 'substr', 'substring', 'trim', 'toLowerCase', 'toUpperCase'])('Array', Array, ['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift', 'concat', 'join', 'slice', 'indexOf', 'lastIndexOf', 'filter', 'forEach', 'every', 'map', 'some', 'reduce', 'reduceRight'])('Number', Number, ['toExponential', 'toFixed', 'toLocaleString', 'toPrecision'])('Function', Function, ['apply', 'call', 'bind'])('RegExp', RegExp, ['exec', 'test'])('Object', Object, ['create', 'defineProperty', 'defineProperties', 'keys', 'getPrototypeOf', 'getOwnPropertyDescriptor', 'getOwnPropertyNames', 'preventExtensions', 'isExtensible', 'seal', 'isSealed', 'freeze', 'isFrozen'])('Date', Date, ['now']);

	Object.extend = extend.overloadSetter();

	Date.extend('now', function() {
		return +(new Date());
	});

	new Type('Boolean', Boolean);

	// fixes NaN returning as Number
	Number.prototype.$family = function() {
		return isFinite(this) ? 'number' : 'null';
	}.hide();

	// Number.random
	Number.extend('random', function(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	});

	// forEach, each
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	Object.extend('forEach', function(object, fn, bind) {
		for (var key in object) {
			if (hasOwnProperty.call(object, key)) fn.call(bind, object[key], key, object);
		}
	});

	Object.each = Object.forEach;

	Array.implement({

		forEach: function(fn, bind) {
			for (var i = 0, l = this.length; i < l; i++) {
				if (i in this) fn.call(bind, this[i], i, this);
			}
		},

		each: function(fn, bind) {
			Array.forEach(this, fn, bind);
			return this;
		}

	});

	// Array & Object cloning, Object merging and appending
	var cloneOf = function(item) {
		switch (typeOf(item)) {
			case 'array':
				return item.clone();
			case 'object':
				return Object.clone(item);
			default:
				return item;
		}
	};

	Array.implement('clone', function() {
		var i = this.length,
			clone = new Array(i);
		while (i--) clone[i] = cloneOf(this[i]);
		return clone;
	});

	var mergeOne = function(source, key, current) {
		switch (typeOf(current)) {
			case 'object':
				if (typeOf(source[key]) == 'object') Object.merge(source[key], current);
				else source[key] = Object.clone(current);
				break;
			case 'array':
				source[key] = current.clone();
				break;
			default:
				source[key] = current;
		}
		return source;
	};

	Object.extend({

		merge: function(source, k, v) {
			if (typeOf(k) == 'string') return mergeOne(source, k, v);
			for (var i = 1, l = arguments.length; i < l; i++) {
				var object = arguments[i];
				for (var key in object) mergeOne(source, key, object[key]);
			}
			return source;
		},

		clone: function(object) {
			var clone = {};
			for (var key in object) clone[key] = cloneOf(object[key]);
			return clone;
		},

		append: function(original) {
			for (var i = 1, l = arguments.length; i < l; i++) {
				var extended = arguments[i] || {};
				for (var key in extended) original[key] = extended[key];
			}
			return original;
		}

	});

	// Object-less types
	['Object', 'WhiteSpace', 'TextNode', 'Collection', 'Arguments'].each(function(name) {
		new Type(name);
	});

	// Unique ID
	var UID = Date.now();

	String.extend('uniqueID', function() {
		return (UID++).toString(36);
	});


})();


/*
	---

	name: Object

	description: Object generic methods

	license: MIT-style license.

	requires: Type

	provides: [Object, Hash]

	...
	*/

(function() {

	var hasOwnProperty = Object.prototype.hasOwnProperty;

	Object.extend({

		subset: function(object, keys) {
			var results = {};
			for (var i = 0, l = keys.length; i < l; i++) {
				var k = keys[i];
				if (k in object) results[k] = object[k];
			}
			return results;
		},

		map: function(object, fn, bind) {
			var results = {};
			for (var key in object) {
				if (hasOwnProperty.call(object, key)) results[key] = fn.call(bind, object[key], key, object);
			}
			return results;
		},

		filter: function(object, fn, bind) {
			var results = {};
			for (var key in object) {
				var value = object[key];
				if (hasOwnProperty.call(object, key) && fn.call(bind, value, key, object)) results[key] = value;
			}
			return results;
		},

		every: function(object, fn, bind) {
			for (var key in object) {
				if (hasOwnProperty.call(object, key) && !fn.call(bind, object[key], key)) return false;
			}
			return true;
		},

		some: function(object, fn, bind) {
			for (var key in object) {
				if (hasOwnProperty.call(object, key) && fn.call(bind, object[key], key)) return true;
			}
			return false;
		},

		keys: function(object) {
			var keys = [];
			for (var key in object) {
				if (hasOwnProperty.call(object, key)) keys.push(key);
			}
			return keys;
		},

		values: function(object) {
			var values = [];
			for (var key in object) {
				if (hasOwnProperty.call(object, key)) values.push(object[key]);
			}
			return values;
		},

		getLength: function(object) {
			return Object.keys(object).length;
		},

		keyOf: function(object, value) {
			for (var key in object) {
				if (hasOwnProperty.call(object, key) && object[key] === value) return key;
			}
			return null;
		},

		contains: function(object, value) {
			return Object.keyOf(object, value) != null;
		},

		toQueryString: function(object, base) {
			var queryString = [];

			Object.each(object, function(value, key) {
				if (base) key = base + '[' + key + ']';
				var result;
				switch (typeOf(value)) {
					case 'object':
						result = Object.toQueryString(value, key);
						break;
					case 'array':
						var qs = {};
						value.each(function(val, i) {
							qs[i] = val;
						});
						result = Object.toQueryString(qs, key);
						break;
					default:
						result = key + '=' + encodeURIComponent(value);
				}
				if (value != null) queryString.push(result);
			});

			return queryString.join('&');
		}

	});

})();


/*
	---

	name: Array

	description: Contains Array Prototypes like each, contains, and erase.

	license: MIT-style license.

	requires: Type

	provides: Array

	...
	*/

Array.implement({

	/*<!ES5>*/
	every: function(fn, bind) {
		for (var i = 0, l = this.length >>> 0; i < l; i++) {
			if ((i in this) && !fn.call(bind, this[i], i, this)) return false;
		}
		return true;
	},

	filter: function(fn, bind) {
		var results = [];
		for (var value, i = 0, l = this.length >>> 0; i < l; i++)
			if (i in this) {
				value = this[i];
				if (fn.call(bind, value, i, this)) results.push(value);
			}
		return results;
	},

	indexOf: function(item, from) {
		var length = this.length >>> 0;
		for (var i = (from < 0) ? Math.max(0, length + from) : from || 0; i < length; i++) {
			if (this[i] === item) return i;
		}
		return -1;
	},

	map: function(fn, bind) {
		var length = this.length >>> 0,
			results = Array(length);
		for (var i = 0; i < length; i++) {
			if (i in this) results[i] = fn.call(bind, this[i], i, this);
		}
		return results;
	},

	some: function(fn, bind) {
		for (var i = 0, l = this.length >>> 0; i < l; i++) {
			if ((i in this) && fn.call(bind, this[i], i, this)) return true;
		}
		return false;
	},
	/*</!ES5>*/

	clean: function() {
		return this.filter(function(item) {
			return item;
		});
	},

	unique: function() {
		var map = {};
		return this.clean().filter(function(item) {
			if (map[item]) {
				return false;
			} else {
				map[item] = true;
				return true;
			}
		});
	},

	invoke: function(methodName) {
		var args = Array.slice(arguments, 1);
		return this.map(function(item) {
			return item[methodName].apply(item, args);
		});
	},

	associate: function(keys) {
		var obj = {},
			length = Math.min(this.length, keys.length);
		for (var i = 0; i < length; i++) obj[keys[i]] = this[i];
		return obj;
	},

	link: function(object) {
		var result = {};
		for (var i = 0, l = this.length; i < l; i++) {
			for (var key in object) {
				if (object[key](this[i])) {
					result[key] = this[i];
					delete object[key];
					break;
				}
			}
		}
		return result;
	},

	contains: function(item, from) {
		return this.indexOf(item, from) != -1;
	},

	append: function(array) {
		this.push.apply(this, array);
		return this;
	},

	getLast: function() {
		return (this.length) ? this[this.length - 1] : null;
	},

	getRandom: function() {
		return (this.length) ? this[Number.random(0, this.length - 1)] : null;
	},

	include: function(item) {
		if (!this.contains(item)) this.push(item);
		return this;
	},

	combine: function(array) {
		for (var i = 0, l = array.length; i < l; i++) this.include(array[i]);
		return this;
	},

	erase: function(item) {
		for (var i = this.length; i--;) {
			if (this[i] === item) this.splice(i, 1);
		}
		return this;
	},

	empty: function() {
		this.length = 0;
		return this;
	},

	flatten: function() {
		var array = [];
		for (var i = 0, l = this.length; i < l; i++) {
			var type = typeOf(this[i]);
			if (type == 'null') continue;
			array = array.concat((type == 'array' || type == 'collection' || type == 'arguments' || instanceOf(this[i], Array)) ? Array.flatten(this[i]) : this[i]);
		}
		return array;
	},

	pick: function() {
		for (var i = 0, l = this.length; i < l; i++) {
			if (this[i] != null) return this[i];
		}
		return null;
	},

	hexToRgb: function(array) {
		if (this.length != 3) return null;
		var rgb = this.map(function(value) {
			if (value.length == 1) value += value;
			return value.toInt(16);
		});
		return (array) ? rgb : 'rgb(' + rgb + ')';
	},

	rgbToHex: function(array) {
		if (this.length < 3) return null;
		if (this.length == 4 && this[3] === 0 && !array) return 'transparent';
		var hex = [];
		for (var i = 0; i < 3; i++) {
			var bit = (this[i] - 0).toString(16);
			hex.push((bit.length == 1) ? '0' + bit : bit);
		}
		return (array) ? hex : '#' + hex.join('');
	}

});


/*
	---

	name: String

	description: Contains String Prototypes like camelCase, capitalize, test, and toInt.

	license: MIT-style license.

	requires: Type

	provides: String

	...
	*/

String.implement({

	test: function(regex, params) {
		return ((typeOf(regex) == 'regexp') ? regex : new RegExp('' + regex, params)).test(this);
	},

	contains: function(string, separator) {
		return (separator) ? (separator + this + separator).indexOf(separator + string + separator) > -1 : String(this).indexOf(string) > -1;
	},

	trim: function() {
		return String(this).replace(/^\s+|\s+$/g, '');
	},

	clean: function() {
		return String(this).replace(/\s+/g, ' ').trim();
	},

	camelCase: function() {
		return String(this).replace(/-\D/g, function(match) {
			return match.charAt(1).toUpperCase();
		});
	},

	hyphenate: function() {
		return String(this).replace(/[A-Z]/g, function(match) {
			return ('-' + match.charAt(0).toLowerCase());
		});
	},

	capitalize: function() {
		return String(this).replace(/\b[a-z]/g, function(match) {
			return match.toUpperCase();
		});
	},

	escapeRegExp: function() {
		return String(this).replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1');
	},

	toInt: function(base) {
		return parseInt(this, base || 10);
	},

	toFloat: function() {
		return parseFloat(this);
	},

	hexToRgb: function(array) {
		var hex = String(this).match(/^#?(\w{1,2})(\w{1,2})(\w{1,2})$/);
		return (hex) ? hex.slice(1).hexToRgb(array) : null;
	},

	rgbToHex: function(array) {
		var rgb = String(this).match(/\d{1,3}/g);
		return (rgb) ? rgb.rgbToHex(array) : null;
	},

	substitute: function(object, regexp) {
		return String(this).replace(regexp || (/\\?\{([^{}]+)\}/g), function(match, name) {
			if (match.charAt(0) == '\\') return match.slice(1);
			return (object[name] != null) ? object[name] : '';
		});
	}

});


/*
	---

	name: Function

	description: Contains Function Prototypes like create, bind, pass, and delay.

	license: MIT-style license.

	requires: Type

	provides: Function

	...
	*/

Function.extend({

	attempt: function() {
		for (var i = 0, l = arguments.length; i < l; i++) {
			try {
				return arguments[i]();
			} catch (e) {}
		}
		return null;
	}

});

Function.implement({

	attempt: function(args, bind) {
		try {
			return this.apply(bind, Array.from(args));
		} catch (e) {}

		return null;
	},

	/*<!ES5-bind>*/
	bind: function(that) {
		var self = this,
			args = arguments.length > 1 ? Array.slice(arguments, 1) : null,
			F = function() {};

		var bound = function() {
			var context = that,
				length = arguments.length;
			if (this instanceof bound) {
				F.prototype = self.prototype;
				context = new F();
			}
			var result = (!args && !length) ? self.call(context) : self.apply(context, args && length ? args.concat(Array.slice(arguments)) : args || arguments);
			return context == that ? result : context;
		};
		return bound;
	},
	/*</!ES5-bind>*/

	pass: function(args, bind) {
		var self = this;
		if (args != null) args = Array.from(args);
		return function() {
			return self.apply(bind, args || arguments);
		};
	},

	delay: function(delay, bind, args) {
		return setTimeout(this.pass((args == null ? [] : args), bind), delay);
	},

	periodical: function(periodical, bind, args) {
		return setInterval(this.pass((args == null ? [] : args), bind), periodical);
	}

});


/*
	---

	name: Number

	description: Contains Number Prototypes like limit, round, times, and ceil.

	license: MIT-style license.

	requires: Type

	provides: Number

	...
	*/

Number.implement({

	limit: function(min, max) {
		return Math.min(max, Math.max(min, this));
	},

	round: function(precision) {
		precision = Math.pow(10, precision || 0).toFixed(precision < 0 ? -precision : 0);
		return Math.round(this * precision) / precision;
	},

	times: function(fn, bind) {
		for (var i = 0; i < this; i++) fn.call(bind, i, this);
	},

	toFloat: function() {
		return parseFloat(this);
	},

	toInt: function(base) {
		return parseInt(this, base || 10);
	}

});

Number.alias('each', 'times');

(function(math) {
	var methods = {};
	math.each(function(name) {
		if (!Number[name]) methods[name] = function() {
			return Math[name].apply(null, [this].concat(Array.from(arguments)));
		};
	});
	Number.implement(methods);
})(['abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos', 'exp', 'floor', 'log', 'max', 'min', 'pow', 'sin', 'sqrt', 'tan']);


/*
	---

	name: Class

	description: Contains the Class Function for easily creating, extending, and implementing reusable Classes.

	license: MIT-style license.

	requires: [Array, String, Function, Number]

	provides: Class

	...
	*/

(function() {

	var Class = this.Class = new Type('Class', function(params) {
		if (instanceOf(params, Function)) params = {
			initialize: params
		};

		var newClass = function() {
			reset(this);
			if (newClass.$prototyping) return this;
			this.$caller = null;
			var value = (this.initialize) ? this.initialize.apply(this, arguments) : this;
			this.$caller = this.caller = null;
			return value;
		}.extend(this).implement(params);

		newClass.$constructor = Class;
		newClass.prototype.$constructor = newClass;
		newClass.prototype.parent = parent;

		return newClass;
	});

	var parent = function() {
		if (!this.$caller) throw new Error('The method "parent" cannot be called.');
		var name = this.$caller.$name,
			parent = this.$caller.$owner.parent,
			previous = (parent) ? parent.prototype[name] : null;
		if (!previous) throw new Error('The method "' + name + '" has no parent.');
		return previous.apply(this, arguments);
	};

	var reset = function(object) {
		for (var key in object) {
			var value = object[key];
			switch (typeOf(value)) {
				case 'object':
					var F = function() {};
					F.prototype = value;
					object[key] = reset(new F());
					break;
				case 'array':
					object[key] = value.clone();
					break;
			}
		}
		return object;
	};

	var wrap = function(self, key, method) {
		if (method.$origin) method = method.$origin;
		var wrapper = function() {
			if (method.$protected && this.$caller == null) throw new Error('The method "' + key + '" cannot be called.');
			var caller = this.caller,
				current = this.$caller;
			this.caller = current;
			this.$caller = wrapper;
			var result = method.apply(this, arguments);
			this.$caller = current;
			this.caller = caller;
			return result;
		}.extend({
			$owner: self,
			$origin: method,
			$name: key
		});
		return wrapper;
	};

	var implement = function(key, value, retain) {
		if (Class.Mutators.hasOwnProperty(key)) {
			value = Class.Mutators[key].call(this, value);
			if (value == null) return this;
		}

		if (typeOf(value) == 'function') {
			if (value.$hidden) return this;
			this.prototype[key] = (retain) ? value : wrap(this, key, value);
		} else {
			Object.merge(this.prototype, key, value);
		}

		return this;
	};

	var getInstance = function(klass) {
		klass.$prototyping = true;
		var proto = new klass();
		delete klass.$prototyping;
		return proto;
	};

	Class.implement('implement', implement.overloadSetter());

	Class.Mutators = {

		Extends: function(parent) {
			this.parent = parent;
			this.prototype = getInstance(parent);
		},

		Implements: function(items) {
			Array.from(items).each(function(item) {
				var instance = new item();
				for (var key in instance) implement.call(this, key, instance[key], true);
			}, this);
		}
	};

})();


/*
	---

	name: Class.Extras

	description: Contains Utility Classes that can be implemented into your own Classes to ease the execution of many common tasks.

	license: MIT-style license.

	requires: Class

	provides: [Class.Extras, Chain, Events, Options]

	...
	*/

(function() {

	this.Chain = new Class({

		$chain: [],

		chain: function() {
			this.$chain.append(Array.flatten(arguments));
			return this;
		},

		callChain: function() {
			return (this.$chain.length) ? this.$chain.shift().apply(this, arguments) : false;
		},

		clearChain: function() {
			this.$chain.empty();
			return this;
		}

	});

	var removeOn = function(string) {
		return string.replace(/^on([A-Z])/, function(full, first) {
			return first.toLowerCase();
		});
	};

	this.Events = new Class({

		$events: {},

		addEvent: function(type, fn, internal) {
			type = removeOn(type);


			this.$events[type] = (this.$events[type] || []).include(fn);
			if (internal) fn.internal = true;
			return this;
		},

		addEvents: function(events) {
			for (var type in events) this.addEvent(type, events[type]);
			return this;
		},

		fireEvent: function(type, args, delay) {
			type = removeOn(type);
			var events = this.$events[type];
			if (!events) return this;
			args = Array.from(args);
			events.each(function(fn) {
				if (delay) fn.delay(delay, this, args);
				else fn.apply(this, args);
			}, this);
			return this;
		},

		removeEvent: function(type, fn) {
			type = removeOn(type);
			var events = this.$events[type];
			if (events && !fn.internal) {
				var index = events.indexOf(fn);
				if (index != -1) delete events[index];
			}
			return this;
		},

		removeEvents: function(events) {
			var type;
			if (typeOf(events) == 'object') {
				for (type in events) this.removeEvent(type, events[type]);
				return this;
			}
			if (events) events = removeOn(events);
			for (type in this.$events) {
				if (events && events != type) continue;
				var fns = this.$events[type];
				for (var i = fns.length; i--;)
					if (i in fns) {
						this.removeEvent(type, fns[i]);
					}
			}
			return this;
		}

	});

	this.Options = new Class({

		setOptions: function() {
			var options = this.options = Object.merge.apply(null, [{},
				this.options
			].append(arguments));
			if (this.addEvent)
				for (var option in options) {
					if (typeOf(options[option]) != 'function' || !(/^on[A-Z]/).test(option)) continue;
					this.addEvent(option, options[option]);
					delete options[option];
				}
			return this;
		}

	});

})();


/*
	---

	name: Browser

	description: The Browser Object. Contains Browser initialization, Window and Document, and the Browser Hash.

	license: MIT-style license.

	requires: [Array, Function, Number, String]

	provides: [Browser, Window, Document]

	...
	*/

(function() {

	var document = this.document;
	var window = document.window = this;

	var ua = navigator.userAgent.toLowerCase(),
		platform = navigator.platform.toLowerCase(),
		UA = ua.match(/(opera|ie|firefox|chrome|version)[\s\/:]([\w\d\.]+)?.*?(safari|version[\s\/:]([\w\d\.]+)|$)/) || [null, 'unknown', 0],
		mode = UA[1] == 'ie' && document.documentMode;

	var Browser = this.Browser = {

		extend: Function.prototype.extend,

		name: (UA[1] == 'version') ? UA[3] : UA[1],

		version: mode || parseFloat((UA[1] == 'opera' && UA[4]) ? UA[4] : UA[2]),

		Platform: {
			name: ua.match(/ip(?:ad|od|hone)/) ? 'ios' : (ua.match(/(?:webos|android)/) || platform.match(/mac|win|linux/) || ['other'])[0]
		},

		Features: {
			xpath: !! (document.evaluate),
			air: !! (window.runtime),
			query: !! (document.querySelector),
			json: !! (window.JSON)
		},

		Plugins: {}

	};

	Browser[Browser.name] = true;
	Browser[Browser.name + parseInt(Browser.version, 10)] = true;
	Browser.Platform[Browser.Platform.name] = true;

	// Request
	Browser.Request = (function() {

		var XMLHTTP = function() {
			return new XMLHttpRequest();
		};

		var MSXML2 = function() {
			return new ActiveXObject('MSXML2.XMLHTTP');
		};

		var MSXML = function() {
			return new ActiveXObject('Microsoft.XMLHTTP');
		};

		return Function.attempt(function() {
			XMLHTTP();
			return XMLHTTP;
		}, function() {
			MSXML2();
			return MSXML2;
		}, function() {
			MSXML();
			return MSXML;
		});

	})();

	Browser.Features.xhr = !! (Browser.Request);

	// Flash detection
	var version = (Function.attempt(function() {
		return navigator.plugins['Shockwave Flash'].description;
	}, function() {
		return new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version');
	}) || '0 r0').match(/\d+/g);

	Browser.Plugins.Flash = {
		version: Number(version[0] || '0.' + version[1]) || 0,
		build: Number(version[2]) || 0
	};

	// String scripts
	Browser.exec = function(text) {
		if (!text) return text;
		if (window.execScript) {
			window.execScript(text);
		} else {
			var script = document.createElement('script');
			script.setAttribute('type', 'text/javascript');
			script.text = text;
			document.head.appendChild(script);
			document.head.removeChild(script);
		}
		return text;
	};

	String.implement('stripScripts', function(exec) {
		var scripts = '';
		var text = this.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, function(all, code) {
			scripts += code + '\n';
			return '';
		});
		if (exec === true) Browser.exec(scripts);
		else if (typeOf(exec) == 'function') exec(scripts, text);
		return text;
	});

	// Window, Document
	Browser.extend({
		Document: this.Document,
		Window: this.Window,
		Element: this.Element,
		Event: this.Event
	});

	this.Window = this.$constructor = new Type('Window', function() {});

	this.$family = Function.from('window').hide();

	Window.mirror(function(name, method) {
		window[name] = method;
	});

	this.Document = document.$constructor = new Type('Document', function() {});

	document.$family = Function.from('document').hide();

	Document.mirror(function(name, method) {
		document[name] = method;
	});

	document.html = document.documentElement;
	if (!document.head) document.head = document.getElementsByTagName('head')[0];

	if (document.execCommand) try {
		document.execCommand("BackgroundImageCache", false, true);
	} catch (e) {}

	/*<ltIE9>*/
	if (this.attachEvent && !this.addEventListener) {
		var unloadEvent = function() {
			this.detachEvent('onunload', unloadEvent);
			document.head = document.html = document.window = null;
		};
		this.attachEvent('onunload', unloadEvent);
	}

	// IE fails on collections and <select>.options (refers to <select>)
	var arrayFrom = Array.from;
	try {
		arrayFrom(document.html.childNodes);
	} catch (e) {
		Array.from = function(item) {
			if (typeof item != 'string' && Type.isEnumerable(item) && typeOf(item) != 'array') {
				var i = item.length,
					array = new Array(i);
				while (i--) array[i] = item[i];
				return array;
			}
			return arrayFrom(item);
		};

		var prototype = Array.prototype,
			slice = prototype.slice;
		['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift', 'concat', 'join', 'slice'].each(function(name) {
				var method = prototype[name];
				Array[name] = function(item) {
					return method.apply(Array.from(item), slice.call(arguments, 1));
				};
			});
	} /*</ltIE9>*/


})();


/*
	---

	name: Cookie

	description: Class for creating, reading, and deleting browser Cookies.

	license: MIT-style license.

	credits:
		- Based on the functions by Peter-Paul Koch (http://quirksmode.org).

	requires: [Options, Browser]

	provides: Cookie

	...
	*/

this.Cookie = new Class({

	Implements: Options,

	options: {
		path: '/',
		domain: false,
		duration: false,
		secure: false,
		document: document,
		encode: true
	},

	initialize: function(key, options) {
		this.key = key;
		this.setOptions(options);
	},

	write: function(value) {
		if (this.options.encode) value = encodeURIComponent(value);
		if (this.options.domain) value += '; domain=' + this.options.domain;
		if (this.options.path) value += '; path=' + this.options.path;
		if (this.options.duration) {
			var date = new Date();
			date.setTime(date.getTime() + this.options.duration * 24 * 60 * 60 * 1000);
			value += '; expires=' + date.toGMTString();
		}
		if (this.options.secure) value += '; secure';
		this.options.document.cookie = this.key + '=' + value;
		return this;
	},

	read: function() {
		var value = this.options.document.cookie.match('(?:^|;)\\s*' + this.key.escapeRegExp() + '=([^;]*)');
		return (value) ? decodeURIComponent(value[1]) : null;
	},

	dispose: function() {
		new Cookie(this.key, Object.merge({}, this.options, {
			duration: -1
		})).write('');
		return this;
	}

});

Cookie.write = function(key, value, options) {
	return new Cookie(key, options).write(value);
};

Cookie.read = function(key) {
	return new Cookie(key).read();
};

Cookie.dispose = function(key, options) {
	return new Cookie(key, options).dispose();
};


/*
---

name: Hash

description: Contains Hash Prototypes. Provides a means for overcoming the JavaScript practical impossibility of extending native Objects.

license: MIT-style license.

requires:
  - Core/Object
  - /MooTools.More

provides: [Hash]

...
*/

(function() {

	if (this.Hash) return;

	var Hash = this.Hash = new Type('Hash', function(object) {
		if (typeOf(object) == 'hash') object = Object.clone(object.getClean());
		for (var key in object) this[key] = object[key];
		return this;
	});

	this.$H = function(object) {
		return new Hash(object);
	};

	Hash.implement({

		forEach: function(fn, bind) {
			Object.forEach(this, fn, bind);
		},

		getClean: function() {
			var clean = {};
			for (var key in this) {
				if (this.hasOwnProperty(key)) clean[key] = this[key];
			}
			return clean;
		},

		getLength: function() {
			var length = 0;
			for (var key in this) {
				if (this.hasOwnProperty(key)) length++;
			}
			return length;
		}

	});

	Hash.alias('each', 'forEach');

	Hash.implement({

		has: Object.prototype.hasOwnProperty,

		keyOf: function(value) {
			return Object.keyOf(this, value);
		},

		hasValue: function(value) {
			return Object.contains(this, value);
		},

		extend: function(properties) {
			Hash.each(properties || {}, function(value, key) {
				Hash.set(this, key, value);
			}, this);
			return this;
		},

		combine: function(properties) {
			Hash.each(properties || {}, function(value, key) {
				Hash.include(this, key, value);
			}, this);
			return this;
		},

		erase: function(key) {
			if (this.hasOwnProperty(key)) delete this[key];
			return this;
		},

		get: function(key) {
			return (this.hasOwnProperty(key)) ? this[key] : null;
		},

		set: function(key, value) {
			if (!this[key] || this.hasOwnProperty(key)) this[key] = value;
			return this;
		},

		empty: function() {
			Hash.each(this, function(value, key) {
				delete this[key];
			}, this);
			return this;
		},

		include: function(key, value) {
			if (this[key] === undefined) this[key] = value;
			return this;
		},

		map: function(fn, bind) {
			return new Hash(Object.map(this, fn, bind));
		},

		filter: function(fn, bind) {
			return new Hash(Object.filter(this, fn, bind));
		},

		every: function(fn, bind) {
			return Object.every(this, fn, bind);
		},

		some: function(fn, bind) {
			return Object.some(this, fn, bind);
		},

		getKeys: function() {
			return Object.keys(this);
		},

		getValues: function() {
			return Object.values(this);
		},

		toQueryString: function(base) {
			return Object.toQueryString(this, base);
		}

	});

	Hash.alias({
		indexOf: 'keyOf',
		contains: 'hasValue'
	});
})();

/*************************************************Mootools Core包结束********************************************************/

// 设置全局
jQuery.ajaxSetup({
	cache: false,
	timeout: 20000
});

// 全局AJAX请求失败处理
jQuery(document).ajaxError(function(e, xmlhttp, opt) {
	if (xmlhttp.statusText === 'timeout' || xmlhttp.readyState === 4) {
		smallnotes('网络异常，请检查您的网络连接，或稍候再试！');
	}
});


// 全局添加一些正则
RegExp.extend({

	isEmail: function(text) {
		return (/^([\w-])+(\.\w+)*@([\w-])+((\.\w+)+)$/).test(String(text).trim());
	},

	isMobile: function(text) {
		return (/^\d{11}$/).test(String(text).trim());
	},

	isLandline: function(text) {
		return (/^((\d{7,8})|((\d{3,4})-(\d{7,8})(-(\d{1,4}))?)|(\d{7,8})-(\d{1,4}))$/).test(String(text).trim());
	},

	isPhone: function(text) {
		return this.isMobile(text) || this.isLandline(text);
	}
});


// 一些工具方法
var Toolkit = this.Toolkit = {

	// 纵向滚动到指定位置
	scrollTween: function(y, callback) {
		jQuery('html,body').animate({
			scrollTop: (y || 0)
		}, 500, 'easeOutExpo', function() {
			return callback && callback();
		});
	},

	// 取消选中的文本
	clearSelect: function() {
		if (document.selection && document.selection.empty) {
			document.selection.empty();
		} else if (window.getSelection) {
			window.getSelection().removeAllRanges();
		}
	},

	// 计算字符串的字节长度
	countByte: function(str) {
		var size = 0;
		for (var i = 0, l = str.length; i < l; i++) {
			size += str.charCodeAt(i) > 255 ? 2 : 1;
		}

		return size;
	},

	// 根据字节截取长度
	substrByByte: function(str, limit) {
		for (var i = 1, l = str.length + 1; i < l; i++) {
			if (this.countByte(str.substring(0, i)) > limit) {
				return str.substring(0, i - 1);
			}
		}

		return str;
	},

	paramOfUrl: function(url) {
		url = url || location.href;
		var paramSuit = url.substring(url.indexOf('?') + 1).split("&");
		var paramObj = {};
		for (var i = 0; i < paramSuit.length; i++) {
			var param = paramSuit[i].split('=');
			if (param.length == 2) {
				var key = decodeURIComponent(param[0]);
				var val = decodeURIComponent(param[1]);
				if (paramObj.hasOwnProperty(key)) {
					paramObj[key] = jQuery.makeArray(paramObj[key]);
					paramObj[key].push(val);
				} else {
					paramObj[key] = val;
				}
			}
		}
		return paramObj;
	},

	parseDate: function(str) {
		var list = str.split(/[-:\s]/),
			date = new Date();
		date.setFullYear(list[0]);
		date.setMonth(list[1].toInt() - 1);
		date.setDate(list[2].toInt());
		date.setHours(list[3].toInt());
		date.setMinutes(list[4].toInt());
		date.setSeconds(list[5].toInt());

		return date;
	},

	formatDate: function(date) {
		if (typeOf(date) !== 'date') {
			date = this.parseDate(date);
		}

		return date.getFullYear() + '-' + this.formatLenth(date.getMonth() + 1) + '-' + this.formatLenth(date.getDate()) + ' ' + this.formatLenth(date.getHours()) + ':' + this.formatLenth(date.getMinutes()) + ':' + this.formatLenth(date.getSeconds());
	},

	formatLenth: function(x, len) {
		x = '' + x;
		len = len || 2;
		while (x.length < len) {
			x = '0' + x;
		}
		return x;
	},

	stopPropagation: function(e) {
		e.stopPropagation();
	},

	loadTempl: function(url, force) {
		this.templHash = this.templHash || new Hash();

		if (this.templHash.has(url) && !force) {
			return this.templHash.get(url);
		}

		var self = this;
		return jQuery.get(url, function(templ) {
			self.templHash.set(url, templ);
		});
	},

	resizeIframe: function() {
		var frame = jQuery(window.parent.document).find('iframe[name=' + window.name + ']');
		frame.height(jQuery(document).height());
	}
};


// 扩展几个TWEEN
jQuery.extend(jQuery.easing, {

	easeInQuad: function(x, t, b, c, d) {
		return c * (t /= d) * t + b;
	},

	easeOutQuad: function(x, t, b, c, d) {
		return -c * (t /= d) * (t - 2) + b;
	},

	easeOutExpo: function(x, t, b, c, d) {
		return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
	}
});


// 扩展jQuery.support 添加fixed属性 用来检查浏览器是否支持fixed定位 (IE6)
jQuery.support.fixed = !(navigator.appName == 'Microsoft Internet Explorer' && navigator.appVersion.indexOf('MSIE 6') != -1);
jQuery.support.placeholder = 'placeholder' in document.createElement('input');

// 所有由脚本创建的DOM结构都应该放置在这个容器里
// 以便统一DOM树形结构 方便调试
var DOMPanel = this.DOMPanel = (function() {

	var panel = null;

	return {

		append: function(dom) {
			this.getPanel().append(dom);
		},

		prepend: function(dom) {
			this.getPanel().prepend(dom);
		},

		getPanel: function() {
			if (panel === null) {
				panel = jQuery('#domPanel');
				if (panel.size() === 0) {
					panel = jQuery('<div id="domPanel" />').prependTo('body');
				}

				// 点击对话框不会触发给document绑定的点击行为
				panel.click(Toolkit.cancelBubble);
				panel.mousedown(Toolkit.cancelBubble);
			}

			return panel;
		}
	};

})();


// 添加鼠标滚轮事件
(function() {

	var types = ['DOMMouseScroll', 'mousewheel'];

	if (jQuery.event.fixHooks) {
		for (var i = types.length; i;) {
			jQuery.event.fixHooks[types[--i]] = jQuery.event.mouseHooks;
		}
	}

	jQuery.event.special.mousewheel = {
		setup: function() {
			if (this.addEventListener) {
				for (var i = types.length; i;) {
					this.addEventListener(types[--i], handler, false);
				}
			} else {
				this.onmousewheel = handler;
			}
		},

		teardown: function() {
			if (this.removeEventListener) {
				for (var i = types.length; i;) {
					this.removeEventListener(types[--i], handler, false);
				}
			} else {
				this.onmousewheel = null;
			}
		}
	};

	jQuery.fn.extend({
		mousewheel: function(fn) {
			return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
		},
		unmousewheel: function(fn) {
			return this.unbind("mousewheel", fn);
		}

	});


	var handler = function(event) {
		var orgEvent = event || window.event,
			args = [].slice.call(arguments, 1),
			delta = 0,
			deltaX = 0,
			deltaY = 0;
		event = jQuery.event.fix(orgEvent);
		event.type = "mousewheel";

		if (orgEvent.wheelDelta) {
			delta = orgEvent.wheelDelta / 120;
		}
		if (orgEvent.detail) {
			delta = -orgEvent.detail / 3;
		}

		deltaY = delta;

		// Gecko
		if (orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS) {
			deltaY = 0;
			deltaX = -1 * delta;
		}

		// Webkit
		if (orgEvent.wheelDeltaY !== undefined) {
			deltaY = orgEvent.wheelDeltaY / 120;
		}
		if (orgEvent.wheelDeltaX !== undefined) {
			deltaX = -1 * orgEvent.wheelDeltaX / 120;
		}

		args.unshift(event, delta, deltaX, deltaY);

		return (jQuery.event.dispatch || jQuery.event.handle).apply(this, args);
	};
})();


// 光标操作相关扩展
jQuery.fn.extend({

	// 获取光标位置
	getCaret: function() {
		var obj = jQuery(this)[0];
		var caretPos = 0;
		if (document.selection) {
			obj.focus();
			var sel = document.selection.createRange();
			sel.moveStart('character', -obj.value.length);
			caretPos = sel.text.length;
		} else if (obj.selectionStart || obj.selectionStart === 0) {
			caretPos = obj.selectionStart;
		}

		return caretPos;
	},

	// 定位光标到指定位置
	setCaret: function(pos) {
		return jQuery.each(this, function() {
			if (this.setSelectionRange) {
				this.focus();
				this.setSelectionRange(pos, pos);
			} else if (this.createTextRange) {
				var range = this.createTextRange();
				range.collapse(true);
				range.moveEnd('character', pos);
				range.moveStart('character', pos);
				range.select();
			}
		});
	},

	// 在光标位置插入或替换选择文本
	insertAtCaret: function(myValue) {
		var obj = jQuery(this)[0];
		if (document.selection) {
			this.focus();
			var sel = document.selection.createRange();
			sel.text = myValue;
			this.focus();
		} else if (obj.selectionStart || obj.selectionStart === 0) {
			var startPos = obj.selectionStart,
				endPos = obj.selectionEnd,
				scrollTop = obj.scrollTop;
			obj.value = obj.value.substring(0, startPos) + myValue + obj.value.substring(endPos, obj.value.length);
			this.focus();
			obj.selectionStart = startPos + myValue.length;
			obj.selectionEnd = startPos + myValue.length;
			obj.scrollTop = scrollTop;
		} else {
			this.value += myValue;
			this.focus();
		}

		return this;
	},

	selectText: function(start, end) {
		var obj = this[0];
		if (document.selection) {
			if (obj.tagName == 'TEXTAREA') {
				var i = obj.value.indexOf('\r', 0);
				while (i != -1 && i < end) {
					end--;
					if (i < start) {
						start--;
					}
					i = obj.value.indexOf('\r', i + 1);
				}
			}
			var range = obj.createTextRange();
			range.collapse(true);
			range.moveStart('character', start);
			if (end !== undefined) {
				range.moveEnd('character', end - start);
			}
			range.select();
		} else {
			obj.focus();
			obj.selectionStart = start;
			var sel_end = end === undefined ? start : end;
			obj.selectionEnd = Math.min(sel_end, obj.value.length);
		}
		return this;
	},

	// 支持表单的 Ctrl + Enter 快速提交
	ctrlEnter: function() {
		jQuery(this).keydown(function(e) {
			if (!e.shiftKey && !e.altKey && e.ctrlKey && e.keyCode == 13) {
				var obj = jQuery(e.target),
					form = obj.is('form') ? obj : jQuery(obj[0].form);

				form.trigger('submit');
			}
		});
		return this;
	},

	// 判断两个jQuery元素相等
	equals: function(compareTo) {
		if (!compareTo || this.length != compareTo.length) {
			return false;
		}
		for (var i = 0, l = this.length; i < l; i++) {
			if (this[i] !== compareTo[i]) {
				return false;
			}
		}
		return true;
	},

	// 输入控件的长度限制
	// 注意：计算方式是小于255的字符记长0.5 大于记长为 1
	limitLength: function(limit, bytes, fn) {
		return this.each(function() {
			var obj = jQuery(this);
			if (obj.is('input:text') || obj.is('textarea')) {
				var that = this;
				var events = ['keyup', 'focus', 'blur'];
				jQuery.each(events, function(i, type) {
					jQuery(that).bind(type, function() {
						var val = '',
							size = 0,
							obj = jQuery(this);

						if (bytes) {
							val = Toolkit.substrByByte(obj.val(), limit * 2);
							// 将限制放大两倍 因为期望的是按字节截取 
							size = Math.ceil(Toolkit.countByte(val) / 2);
						} else {
							val = obj.val().substring(0, limit);
							size = val.length;
						}
						obj.val(val);
						obj.scrollTop(obj[0].scrollHeight); // 滚动到最底部
						if (fn) {
							fn.call(obj, val, size, limit);
						}
					});
				});
				obj.triggerHandler('blur');
			}
		});
	}
});


// DATASET 扩展
(function() {

	var encode = function(name) {
		return 'data-' + name.hyphenate().toLowerCase();
	};

	var decode = function(name) {
		return name.replace(/^data-/ig, '').toLowerCase().camelCase();
	};

	var autobox = function(val) {
		if (val != null && new RegExp('^' + Number.from(val) + '$').test(val)) {
			return Number.from(val);
		}
		if (/^(true|false)$/i.test(val)) {
			return String(val) === 'true';
		}
		return val != null ? String(val) : null;
	};

	jQuery.fn.datasets = function() {
		var sets = [];
		this.each(function() {
			sets.push(jQuery(this).dataset());
		});
		return sets;
	};

	jQuery.fn.dataset = function(attr, val) {
		// 获取数据集
		var dataset = null;
		if (arguments.length === 0) {
			dataset = {};
			this.eq(0).each(function() {
				var attrs = this.attributes;
				for (var i = 0, l = attrs.length; i < l; i++) {
					var attr = attrs[i];
					if (/^data-/i.test(attr.name)) {
						dataset[decode(encode(attr.name.substring(5)))] = autobox(attr.value);
					}
				}
			});
			return dataset;
		}

		// 返回指定数据
		if (arguments.length == 1 && typeof attr != 'object') {
			return autobox(this.attr(encode(attr)));
		}

		// 设置数据集
		dataset = attr;
		if (typeof attr != 'object') {
			dataset = {};
			dataset[attr] = val;
		}
		var tmp = {};
		jQuery.each(dataset, function(k, v) {
			tmp[encode(k)] = autobox(v);
		});
		return this.attr(tmp);
	};


	jQuery.fn.removeDataset = function(attr) {
		if (typeof attr === 'string') {
			if (attr == '*') {
				attr = [];
				jQuery.each(jQuery(this).dataset(), function(k) {
					attr.push(k);
				});
			} else {
				attr = [attr];
			}
		}
		return this.each(function() {
			var self = this;
			jQuery.each(attr, function(i, n) {
				jQuery(self).removeAttr(encode(n));
			});
		});
	};
})();


// Comet 轮询
// interval是用来设置间隔轮询的 毫秒单位 目的是为了支持当服务器端不支持阻塞响应的时候 设置interval来定时请求
this.CometRequest = new Class({

	Implements: [Events, Options],

	options: {
		url: null,
		method: 'get',
		format: 'json',
		timeout: 60000,
		interval: 0
	},

	initialize: function(options) {
		this.setOptions(options);
	},

	openConnect: function() {
		// 防止手动调用导致生成多个连接
		this.closeConnect();

		var self = this;
		this.request = jQuery.ajax({
			url: this.options.url,
			timeout: this.options.timeout,
			type: this.options.method,
			dataType: this.options.format,
			data: this.options.data,
			cache: false,
			beforeSend: function() {
				self.fireEvent(CommonEvents.START, arguments);
			},
			success: function() {
				self.fireEvent(CommonEvents.SUCCESS, arguments);
			},
			error: function() {
				self.fireEvent(CommonEvents.ERROR, arguments);
			},
			complete: function() {
				// 由于SUCCESS事件会在前执行
				// 检查用户是否在SUCCESS中关掉了轮询
				if (self.request !== null) {
					self.delayTimer = self.openConnect.bind(self).delay(self.options.interval);
				}
			}
		});
	},

	closeConnect: function() {
		// 清理阻塞式请求
		if (this.request && this.request.abort) {
			this.request.abort();
		}
		// 清理延迟式请求
		clearTimeout(this.delayTimer);
		this.request = null;
	}
});


// AJAX队列
this.AjaxQueue = new Class({

	queue: [],

	request: null,

	ajax: function(opt) {
		this.queue.push(opt);
		this.start();

		return this;
	},

	// 内部方法 不要外部调用
	start: function() {
		if (this.queue.length === 0 || this.request !== null) {
			return false;
		}

		var self = this,
			opt = this.queue.shift(),
			temp = opt.complete || jQuery.noop;
		opt.complete = function() {
			temp.apply(this, arguments);
			self.request = null;
			self.start();
		};

		this.request = jQuery.ajax(opt);
	}
});

// 单例请求
this.AjaxOnly = new Class({

	request: null,

	ajax: function(opt) {
		if (this.request !== null) this.request.abort();

		this.request = jQuery.ajax(opt);
		return this.request;
	}
});

// 指定位置Class
var Offset = this.Offset = new Class({

	Implements: [Options, Events],

	options: {
		top: null,
		left: null
	},

	initialize: function(element, options) {
		this.element = jQuery(element);
		this.setOptions(options);
		this.setOffset();
		this.listenResize();
	},

	setOffset: function() {
		var left = this.options.left;
		// 如果LEFT没有指定 那么水平居中
		if (left == null) {
			left = (jQuery(window).width() - this.element.outerWidth()) / 2;
			left = Math.max(0, left);
		}

		var top = this.options.top;
		// 如果TOP没有指定 那么垂直居中
		if (top == null) {
			top = (jQuery(window).height() - this.element.outerHeight()) / 2;
			top = Math.max(0, top);
		}

		// 如果元素不是fixed定位 那么加上滚动条距离
		if (this.element.css('position') != 'fixed') {
			left += jQuery(document).scrollLeft();
			top += jQuery(document).scrollTop();
		}

		this.element.css({
			left: left,
			top: top
		});
	},

	listenResize: function() {
		var self = this;
		var contextProxy = function() {
			// 防止销毁元素后导致内存泄露（因为RESIZE事件是注册在WINDOW对象上 而不是ELEMENT元素上）
			if (self.element.parent().size() === 0) {
				jQuery(window).unbind('resize', contextProxy);
			} else if (self.element.is(':visible') && self.element.css('top').toInt() >= 0) {
				self.setOffset();
			}
		};
		jQuery(window).resize(contextProxy);
	},

	show: function() {
		this.element.show();
		return this;
	},

	hide: function() {
		this.element.hide();
		return this;
	}

});


// 常用事件类型
var CommonEvents = this.CommonEvents = {
	SHOW: 'CommonEvents.SHOW',
	HIDE: 'CommonEvents.HIDE',
	CLOSE: 'CommonEvents.CLOSE',
	MINIMIZE: 'CommonEvents.MINIMIZE',
	REMOVE: 'CommonEvents.REMOVE',
	LOGIN: 'CommonEvents.LOGIN',
	LOGOUT: 'CommonEvents.LOGOUT',
	START: 'CommonEvents.START',
	SUCCESS: 'CommonEvents.SUCCESS',
	ERROR: 'CommonEvents.ERROR',
	COMPLETE: 'CommonEvents.COMPLETE',
	SWITCH: 'CommonEvents.SWITCH',
	CHANGE: 'CommonEvents.CHANGE',
	NORESULT: 'CommonEvents.NORESULT',
	SELECT: 'CommonEvents.SELECT',
	ENTER: 'CommonEvents.ENTER'
};

// 遮罩层
var MaskLayer = this.MaskLayer = {

	element: null,

	getElement: function() {
		if (this.element === null) {
			this.element = jQuery('#masklayer');
			if (this.element.size() === 0) {
				this.element = jQuery('<div id="masklayer" />').appendTo(DOMPanel.getPanel());
			}
		}

		return this.element;
	},

	show: function() {
		this.getElement().show();
	},

	hide: function() {
		this.getElement().hide();
	}
};

// 弹窗单例管理
var DialogManager = this.DialogManager = {

	present: null,

	keepSingle: function(dialog) {
		if (instanceOf(this.present, CommonDialog)) {
			this.present.remove(dialog.options.modal);
		}

		this.present = dialog;

		this.bindEvent();
	},

	escCancel: function(e) {
		if (e.keyCode == 27 && DialogManager.present) {
			var dialog = DialogManager.present,
				element = dialog.element;

			if (element.is(':visible') && element.css('top').toInt() > 0) {
				dialog.hide();
			}
		}
	},

	bindEvent: function() {
		jQuery(document).keydown(this.escCancel);
		this.bindEvent = jQuery.noop;
	}
};

// 弹窗
var CommonDialog = this.CommonDialog = new Class({

	Implements: [Options, Events],

	options: {
		width: 700,
		title: '提示',
		message: '<p class="default-loading"><i class="default-text"></i><span>正在加载，请稍后...</span></p>',
		isFixed: true,
		autohide: false,
		denyEsc: false,
		modal: true,
		minify: false,
		independence: false,
		visible: true,
		noheader: false,
		classes: '',
		prehide: jQuery.noop
	},

	initialize: function(message, options) {
		//  做个参数格式兼容 方便调用
		if (typeof message === 'object') {
			this.setOptions(message);
		} else if (typeof message === 'string') {
			this.options.message = message;
			this.setOptions(options);
		}

		var element = this.element = this.getElement();
		this.bindEvent();

		// 保持单例
		if (this.options.independence !== true) {
			DialogManager.keepSingle(this);
		}

		// 添加到页面
		DOMPanel.append(element);

		// 显示
		if (this.options.visible) {
			this.show();
		}

		// 是否点击遮罩隐藏弹窗
		if (this.options.autohide) {
			element.click(Toolkit.stopPropagation);
			jQuery(document).one('click', this.hide.bind(this));
		}
	},

	getElement: function() {
		var fragment = ['<div class="common-dialog ' + this.options.classes + '">', '<div class="wrapper">', '<header>', '<h3 class="title">', this.options.title, '</h3>', this.options.minify ? '<a class="minify" title="最小">最小</a>' : '', '<a class="close" title="关闭"></a>', '</header>', '<section>', this.options.message, '</section>', '</div>', '</div>'].join('');

		var element = jQuery(fragment);

		if (this.options.noheader === true) {
			element.find('.wrapper > header').remove();
		}

		// 设置样式
		element.css({
			width: this.options.width
		});

		if (this.options.isFixed === true && jQuery.support.fixed) {
			element.css({
				position: 'fixed'
			});
		}

		return element;
	},

	getHeader: function() {
		var header = this.element.find('.wrapper > header');
		if (header.size() === 0 && !this.options.noheader) {
			header = jQuery('<header />').prependTo(this.element.find('.wrapper'));
		}
		return header;
	},

	getBody: function() {
		return this.element.find('.wrapper > section');
	},

	getFooter: function() {
		var footer = this.element.find('.wrapper > footer');
		if (footer.size() === 0) {
			footer = jQuery('<footer />').appendTo(this.element.find('.wrapper'));
		}
		return footer;
	},

	addButton: function(opt) {
		var footer = this.getFooter(),
			button = null;

		if (opt.type === 'anchor') {
			button = jQuery('<a class="' + opt.clazz + '">' + opt.text + '</a>');
		} else {
			button = jQuery('<input type="button" value="' + opt.text + '" class="' + opt.clazz + '" />');
		}

		if (opt.prepend) {
			footer.prepend(button);
		} else {
			footer.append(button);
		}

		button.click((opt.callback || jQuery.noop).bind(this));
		return button;
	},

	show: function() {
		if (this.options.modal === true) {
			MaskLayer.show();
		}
		if (this.offset) {
			this.offset.setOffset();
		} else {
			// 延迟定位是为了能让继承的类可以修改初始化方法改变结构而无需再显示调用show方法
			this.offset = new Offset(this.element, {
				top: this.options.top,
				left: this.options.left
			});
		}

		this.fireEvent(CommonEvents.SHOW, this);
	},

	hide: function() {
		if (this.options.prehide() !== false) {
			MaskLayer.hide();
			this.element.css('top', '-9999px');
			this.fireEvent(CommonEvents.HIDE, this);
		}
	},

	minimize: function() {
		MaskLayer.hide();
		this.element.css('top', '-9999px');
		this.fireEvent(CommonEvents.MINIMIZE, this);
	},

	remove: function(keepMask) {
		if (!keepMask) MaskLayer.hide();
		this.element.remove();
		this.fireEvent(CommonEvents.REMOVE, this);
	},

	find: function(rule) {
		return this.element.find(rule);
	},

	bindEvent: function() {

		var self = this;
		this.find('header .close').click(function() {
			self.hide();
		});
		this.find('.buttonitems .close').click(function() {
			self.hide();
		});
		this.find('header .minify').click(function() {
			self.minimize();
		});
	}
});

// Alert弹窗
// 注: callback为点击确定按钮触发的回调
// 当且仅当callback方法返回false时 弹窗不会触发隐藏事件
var AlertDialog = this.AlertDialog = new Class({

	Extends: CommonDialog,

	options: {
		callback: jQuery.noop,
		disableButton: false,
		warn: false,
		confirmText: '确定'
	},

	initialize: function(message, options) {
		this.parent(message, options);

		var self = this;
		this.button = this.addButton({
			text: this.options.confirmText,
			clazz: 'button input-gray' + (this.options.warn ? ' input-warn' : ''),
			callback: function() {
				if (self.options.callback.call(self) !== false) {
					self.hide();
				}
			}
		});

		if (this.options.disableButton) {
			this.disableButton();
		}

		// 显示
		if (this.options.visible) {
			this.show();
		}
	},

	disableButton: function() {
		this.button.addClass('input-disable').attr('disabled', 'disabled');
	},

	enableButton: function() {
		this.button.removeClass('input-disable').removeAttr('disabled', 'disabled');
	}
});

// Confirm弹窗
var ConfirmDialog = this.ConfirmDialog = new Class({

	Extends: AlertDialog,

	options: {
		cancelText: '取消',
		closure: jQuery.noop
	},

	initialize: function(message, options) {
		this.parent(message, options);

		var self = this;
		this.addButton({
			type: 'anchor',
			text: this.options.cancelText,
			clazz: 'button anchor-cancel',
			callback: function() {
				if (self.options.closure.call(self) !== false) {
					self.hide();
				}
			}
		});
	}
});


// 选项卡效果
jQuery(document).on('click.tabview.data-api', '.tabview [data-tab]', function() {
	var tab = jQuery(this),
		name = tab.dataset('tab'),
		panel = tab.closest('.tabview');

	// switch tabs status
	tab.addClass('active').siblings().removeClass('active');

	// switch views status
	var viewspanel = panel.find('[data-view]:first').parent();
	viewspanel.children('[data-view]').hide().filter('[data-view="' + name + '"]').show();
});


// 下拉菜单
(function() {

	var selector = '[data-toggle="dropdown"]';

	var clearMenus = function() {
		jQuery(selector).each(function() {
			getPanel(this).removeClass('open');
		});
	};

	var getPanel = function(entry) {
		var express = jQuery(entry).dataset('panel');

		if (!express) {
			express = jQuery(entry).attr('href');
			if (express && express.indexOf('#') !== -1) {
				express = express.replace(/.*(?=#[^\s]*$)/, '');
			}
		}

		var panel = null;
		if (express) {
			panel = jQuery(entry).closest(express);
		}

		if (panel && panel.length > 0) {
			return panel;
		}

		return jQuery(entry).parent();
	};

	var toggle = function(e) {
		var entry = jQuery(this);

		if (entry.is('.disabled, :disabled')) {
			return;
		}

		var panel = getPanel(entry),
			isActive = panel.hasClass('open');

		clearMenus();

		if (!isActive) {
			panel.addClass('open');
		}

		return false;
	};


	jQuery(document).on('click', '.dropdown-menu', function(e) {
		if (jQuery(this).dataset('stop')) {
			e.stopPropagation();
		}
	}).on('click.dropdown.data-api', clearMenus).on('click.dropdown.data-api', selector, toggle);
})();


(function() {
	// 阻止冒泡
	// 左侧菜单切换
	jQuery(document).on('click', '#lside .menubar li', function(e) {
		var menu = jQuery(this);
		if (menu.is('.cascade')) {
			menu.toggleClass('open');
		} else {
			menu.closest('.menubar').find('li').removeClass('active');
			// 保持展开一个子菜单
			// menu.closest('.menubar').find('.cascade').removeClass('open');
			menu.closest('.cascade').addClass('open');
			menu.addClass('active');
		}

		// HACK IE outline
		menu.find('a').blur();
		return false;
	});

	// 模块收展效果
	jQuery(document).on('click', '.module .module-head', function() {
		var header = jQuery(this),
			module = header.closest('.module');

		if (header.find('.icon-down').size() > 0) {
			module.toggleClass('module-close');
		}
	});


	jQuery(document).on('click', '#lside .menubar li', function() {
		var name = jQuery(this).dataset('name');
		if (name) {
			jQuery('iframe[name=mainframe]').attr('src', '/works/frames/' + name + '.html?_' + new Date().getTime());
		}
	});
})();


// IFRAME 自动展开高度
(function() {
	if (window !== top) {
		window.onload = Toolkit.resizeIframe;

		// 防止页面加载缓慢 默认执行一次
		Toolkit.resizeIframe();
	}
})();


// 展开会议描述
jQuery(document).on('click', '.meetings .title .name', function() {
	var item = jQuery(this).closest('.item');
	item.find('.information > [data-name]').removeClass('active');
	item.find('.dynamic').children().not('.describe').hide();
	item.find('.dynamic .describe').toggle();
	return false;
});

// 展开相关设置
jQuery(document).on('click', '.meetings .information > [data-name]', function() {
	var obj = jQuery(this),
		name = obj.dataset('name'),
		item = obj.closest('.item'),
		target = '.dynamic .' + name + '-panel';

	obj.toggleClass('active');
	item.find('.dynamic').children().not(target).hide();
	item.find(target).toggle();
	return false;
});

// 高级参数设置
jQuery(document).on('click', '.meeting-dialog .regular .legend .config', function() {
	jQuery(this).closest('.regular').toggleClass('open');
});