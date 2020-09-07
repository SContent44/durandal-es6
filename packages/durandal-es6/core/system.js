import $ from "jquery";

/**
 * The system module encapsulates the most basic features used by other modules.
 * @module system
 * @requires jquery
 */
function SystemModule() {
    let isDebugging = false;
    const nativeKeys = Object.keys;
    const { hasOwnProperty } = Object.prototype;
    const { toString } = Object.prototype;
    let treatAsIE8 = false;
    const nativeIsArray = Array.isArray;
    const { slice } = Array.prototype;

    // polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
    if (!String.prototype.trim) {
        // eslint-disable-next-line no-extend-native
        String.prototype.trim = function () {
            return this.replace(/^\s+|\s+$/g, "");
        };
    }

    // see http://patik.com/blog/complete-cross-browser-console-log/
    // Tell IE9 to use its built-in console
    if (
        Function.prototype.bind &&
        (typeof console === "object" || typeof console === "function") &&
        typeof console.log == "object"
    ) {
        try {
            ["log", "info", "warn", "error", "assert", "dir", "clear", "profile", "profileEnd"].forEach(function (
                method
            ) {
                console[method] = this.call(console[method], console);
            },
            Function.prototype.bind);
        } catch (ex) {
            treatAsIE8 = true;
        }
    }

    const noop = function () {};

    const log = function () {
        try {
            // Modern browsers
            if (typeof console != "undefined" && typeof console.log == "function") {
                // Opera 11
                if (window.opera) {
                    let i = 0;
                    while (i < arguments.length) {
                        console.log(`Item ${i + 1}: ${arguments[i]}`);
                        i += 1;
                    }
                }
                // All other modern browsers
                else if (slice.call(arguments).length == 1 && typeof slice.call(arguments)[0] == "string") {
                    console.log(slice.call(arguments).toString());
                } else {
                    console.log.apply(console, slice.call(arguments));
                }
            }
            // IE8
            else if (
                (!Function.prototype.bind || treatAsIE8) &&
                typeof console != "undefined" &&
                typeof console.log == "object"
            ) {
                Function.prototype.call.call(console.log, console, slice.call(arguments));
            }

            // IE7 and lower, and other old browsers
            // eslint-disable-next-line no-empty
        } catch (ignore) {}
    };

    const logError = function (error, err) {
        let exception;

        if (error instanceof Error) {
            exception = error;
        } else {
            exception = new Error(error);
        }

        exception.innerError = err;

        // Report the error as an error, not as a log
        try {
            // Modern browsers (it's only a single item, no need for argument splitting as in log() above)
            if (typeof console != "undefined" && typeof console.error == "function") {
                console.error(exception);
            }
            // IE8
            else if (
                (!Function.prototype.bind || treatAsIE8) &&
                typeof console != "undefined" &&
                typeof console.error == "object"
            ) {
                Function.prototype.call.call(console.error, console, exception);
            }
            // IE7 and lower, and other old browsers
            // eslint-disable-next-line no-empty
        } catch (ignore) {}

        throw exception;
    };

    /**
     * @class SystemModule
     * @static
     */
    const system = {
        /**
         * Durandal's version.
         * @property {string} version
         */
        version: "3.0.0",
        /**
         * A noop function.
         * @method noop
         */
        noop,
        /**
         * Gets the modelName for the specified object.
         * @method getModelName
         * @param {object} obj The object whose modelName you wish to determine.
         * @return {string} The modelName.
         */
        getModelName(ModelInstance) {
            if (!ModelInstance) {
                return null;
            }

            // Make an instance of the model to access it's modelName property
            if (typeof ModelInstance === "function") {
                return new ModelInstance().modelName;
            }

            if (typeof ModelInstance === "object") {
                return ModelInstance.modelName;
            }

            return null;
        },
        /**
         * Resolves the default object instance for a module. If the module is an object, the module is returned. If the module is a function, that function is called with `new` and it's result is returned.
         * @method resolveObject
         * @param {object} module The module to use to get/create the default object for.
         * @return {object} The default object for the module.
         */
        resolveObject(module) {
            if (system.isFunction(module)) {
                return new module();
            }

            return module;
        },
        /**
         * Gets/Sets whether or not Durandal is in debug mode.
         * @method debug
         * @param {boolean} [enable] Turns on/off debugging.
         * @return {boolean} Whether or not Durandal is current debugging.
         */
        debug(enable) {
            if (arguments.length == 1) {
                isDebugging = enable;
                if (isDebugging) {
                    this.log = log;
                    this.error = logError;
                    this.log("Debug:Enabled");
                } else {
                    this.log("Debug:Disabled");
                    this.log = noop;
                    this.error = noop;
                }
            }

            return isDebugging;
        },
        /**
         * Logs data to the console. Pass any number of parameters to be logged. Log output is not processed if the framework is not running in debug mode.
         * @method log
         * @param {object} info* The objects to log.
         */
        log: noop,
        /**
         * Logs an error.
         * @method error
         * @param {string|Error} obj The error to report.
         */
        error: noop,
        /**
         * Asserts a condition by throwing an error if the condition fails.
         * @method assert
         * @param {boolean} condition The condition to check.
         * @param {string} message The message to report in the error if the condition check fails.
         */
        assert(condition, message) {
            if (!condition) {
                system.error(new Error(message || "Assert:Failed"));
            }
        },
        /**
         * Creates a deferred object which can be used to create a promise. Optionally pass a function action to perform which will be passed an object used in resolving the promise.
         * @method defer
         * @param {function} [action] The action to defer. You will be passed the deferred object as a paramter.
         * @return {Deferred} The deferred object.
         */
        defer(action) {
            return $.Deferred(action);
        },
        /**
         * Creates a simple V4 UUID. This should not be used as a PK in your database. It can be used to generate internal, unique ids. For a more robust solution see [node-uuid](https://github.com/broofa/node-uuid).
         * @method guid
         * @return {string} The guid.
         */
        guid() {
            let d = new Date().getTime();
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
                const r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == "x" ? r : (r & 0x7) | 0x8).toString(16);
            });
        },
        /**
         * Replaces the original acquire functionality of Durandal which used Require.js.
         * We now pass the module we wish to load directly to the acquire function. We'
         * @method acquire
         * @param {object|function|Promise<object|function>} module The module to load
         * @return {Promise} A promise for the loaded module.
         */
        acquire(moduleToResolve) {
            if (system.isPromise(moduleToResolve)) {
                return moduleToResolve;
            }

            if (system.isFunction(moduleToResolve)) {
                return Promise.resolve(moduleToResolve());
            }
            return system.error(
                "You are not using the durandal-es6 behaviour. Pass in a function that will resolve to return either a function, object, or a promise<functon|object>."
            );
        },
        /**
         * Extends the first object with the properties of the following objects.
         * @method extend
         * @param {object} obj The target object to extend.
         * @param {object} extension* Uses to extend the target object.
         */
        extend(obj) {
            const rest = slice.call(arguments, 1);

            for (let i = 0; i < rest.length; i += 1) {
                const source = rest[i];

                if (source) {
                    for (const prop in source) {
                        obj[prop] = source[prop];
                    }
                }
            }

            return obj;
        },
        /**
         * Uses a setTimeout to wait the specified milliseconds.
         * @method wait
         * @param {number} milliseconds The number of milliseconds to wait.
         * @return {Promise}
         */
        wait(milliseconds) {
            return system
                .defer(function (dfd) {
                    setTimeout(dfd.resolve, milliseconds);
                })
                .promise();
        },
    };

    /**
     * Gets all the owned keys of the specified object.
     * @method keys
     * @param {object} object The object whose owned keys should be returned.
     * @return {string[]} The keys.
     */
    system.keys =
        nativeKeys ||
        function (obj) {
            if (obj !== Object(obj)) {
                throw new TypeError("Invalid object");
            }

            const keys = [];

            for (const key in obj) {
                if (hasOwnProperty.call(obj, key)) {
                    keys[keys.length] = key;
                }
            }

            return keys;
        };

    /**
     * Determines if the specified object is an html element.
     * @method isElement
     * @param {object} object The object to check.
     * @return {boolean} True if matches the type, false otherwise.
     */
    system.isElement = function (obj) {
        return !!(obj && obj.nodeType === 1);
    };

    /**
     * Determines if the specified object is an array.
     * @method isArray
     * @param {object} object The object to check.
     * @return {boolean} True if matches the type, false otherwise.
     */
    system.isArray =
        nativeIsArray ||
        function (obj) {
            return toString.call(obj) == "[object Array]";
        };

    /**
     * Determines if the specified object is...an object. ie. Not an array, string, etc.
     * @method isObject
     * @param {object} object The object to check.
     * @return {boolean} True if matches the type, false otherwise.
     */
    system.isObject = function (obj) {
        return obj === Object(obj);
    };

    /**
     * Determines if the specified object is a boolean.
     * @method isBoolean
     * @param {object} object The object to check.
     * @return {boolean} True if matches the type, false otherwise.
     */
    system.isBoolean = function (obj) {
        return typeof obj === "boolean";
    };

    /**
     * Determines if the specified object is a promise.
     * @method isPromise
     * @param {object} object The object to check.
     * @return {boolean} True if matches the type, false otherwise.
     */
    system.isPromise = function (obj) {
        return obj && system.isFunction(obj.then);
    };

    /**
     * Determines if the specified object is a function arguments object.
     * @method isArguments
     * @param {object} object The object to check.
     * @return {boolean} True if matches the type, false otherwise.
     */

    /**
     * Determines if the specified object is a function.
     * @method isFunction
     * @param {object} object The object to check.
     * @return {boolean} True if matches the type, false otherwise.
     */

    /**
     * Determines if the specified object is a string.
     * @method isString
     * @param {object} object The object to check.
     * @return {boolean} True if matches the type, false otherwise.
     */

    /**
     * Determines if the specified object is a number.
     * @method isNumber
     * @param {object} object The object to check.
     * @return {boolean} True if matches the type, false otherwise.
     */

    /**
     * Determines if the specified object is a date.
     * @method isDate
     * @param {object} object The object to check.
     * @return {boolean} True if matches the type, false otherwise.
     */

    /**
     * Determines if the specified object is a boolean.
     * @method isBoolean
     * @param {object} object The object to check.
     * @return {boolean} True if matches the type, false otherwise.
     */

    // isArguments, isFunction, isString, isNumber, isDate, isRegExp.
    const isChecks = ["Arguments", "Function", "String", "Number", "Date", "RegExp"];

    function makeIsFunction(name) {
        const value = `[object ${name}]`;
        system[`is${name}`] = function (obj) {
            return toString.call(obj) == value;
        };
    }

    for (let i = 0; i < isChecks.length; i += 1) {
        makeIsFunction(isChecks[i]);
    }

    return system;
}

export default SystemModule();
