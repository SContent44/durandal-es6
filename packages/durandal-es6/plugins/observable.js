/* eslint-disable eqeqeq */
/* eslint-disable no-cond-assign */
/* eslint-disable prefer-rest-params */
/* eslint-disable no-param-reassign */
/* eslint-disable no-use-before-define */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
/* eslint-disable no-shadow */
import ko from "knockout";
import system from "../core/system";
import binder from "../core/binder";

/**
 * Enables automatic observability of plain javascript object for ES5 compatible browsers. Also, converts promise properties into observables that are updated when the promise resolves.
 * @module observable
 * @requires system
 * @requires binder
 * @requires knockout
 */
function ObservableModule() {
    let observableModule;
    const { toString } = Object.prototype;
    const nonObservableTypes = [
        "[object Function]",
        "[object String]",
        "[object Boolean]",
        "[object Number]",
        "[object Date]",
        "[object RegExp]",
    ];
    const observableArrayMethods = ["remove", "removeAll", "destroy", "destroyAll", "replace"];
    const arrayMethods = ["pop", "reverse", "sort", "shift", "slice"];
    const additiveArrayFunctions = ["push", "unshift"];
    const es5Functions = ["filter", "map", "reduce", "reduceRight", "forEach", "every", "some"];
    const arrayProto = Array.prototype;
    const observableArrayFunctions = ko.observableArray.fn;
    let logConversion = false;
    let changeDetectionMethod;
    let skipPromises = false;
    let shouldIgnorePropertyName;

    /**
     * You can call observable(obj, propertyName) to get the observable function for the specified property on the object.
     * @class ObservableModule
     */

    if (!("getPropertyDescriptor" in Object)) {
        const { getOwnPropertyDescriptor } = Object;
        const { getPrototypeOf } = Object;

        Object.getPropertyDescriptor = function (o, name) {
            let proto = o;
            let descriptor;

            while (proto && !(descriptor = getOwnPropertyDescriptor(proto, name))) {
                proto = getPrototypeOf(proto);
            }

            return descriptor;
        };
    }

    function defaultShouldIgnorePropertyName(propertyName) {
        const first = propertyName[0];
        return first === "_" || first === "$" || (changeDetectionMethod && propertyName === changeDetectionMethod);
    }

    function isNode(obj) {
        return !!(obj && obj.nodeType !== undefined && system.isNumber(obj.nodeType));
    }

    function canConvertType(value) {
        if (!value || isNode(value) || value.ko === ko || value.jquery) {
            return false;
        }

        const type = toString.call(value);

        return nonObservableTypes.indexOf(type) == -1 && !(value === true || value === false);
    }

    function createLookup(obj) {
        const value = {};

        Object.defineProperty(obj, "__observable__", {
            enumerable: false,
            configurable: false,
            writable: false,
            // eslint-disable-next-line object-shorthand
            value: value,
        });

        return value;
    }

    function makeObservableArray(original, observable, hasChanged) {
        let lookup = original.__observable__;
        let notify = true;

        if (lookup && lookup.__full__) {
            return;
        }

        lookup = lookup || createLookup(original);
        lookup.__full__ = true;

        es5Functions.forEach(function (methodName) {
            observable[methodName] = function () {
                return arrayProto[methodName].apply(original, arguments);
            };
        });

        observableArrayMethods.forEach(function (methodName) {
            original[methodName] = function () {
                notify = false;
                const methodCallResult = observableArrayFunctions[methodName].apply(observable, arguments);
                notify = true;
                return methodCallResult;
            };
        });

        arrayMethods.forEach(function (methodName) {
            original[methodName] = function () {
                if (notify) {
                    observable.valueWillMutate();
                }

                const methodCallResult = arrayProto[methodName].apply(original, arguments);

                if (notify) {
                    observable.valueHasMutated();
                }

                return methodCallResult;
            };
        });

        additiveArrayFunctions.forEach(function (methodName) {
            original[methodName] = function () {
                for (let i = 0, len = arguments.length; i < len; i += 1) {
                    convertObject(arguments[i], hasChanged);
                }

                if (notify) {
                    observable.valueWillMutate();
                }

                const methodCallResult = arrayProto[methodName].apply(original, arguments);

                if (notify) {
                    observable.valueHasMutated();
                }

                return methodCallResult;
            };
        });

        original.splice = function () {
            for (let i = 2, len = arguments.length; i < len; i += 1) {
                convertObject(arguments[i], hasChanged);
            }

            if (notify) {
                observable.valueWillMutate();
            }

            const methodCallResult = arrayProto.splice.apply(original, arguments);

            if (notify) {
                observable.valueHasMutated();
            }

            return methodCallResult;
        };

        for (let i = 0, len = original.length; i < len; i += 1) {
            convertObject(original[i], hasChanged);
        }
    }

    /**
     * Converts an entire object into an observable object by re-writing its attributes using ES5 getters and setters. Attributes beginning with '_' or '$' are ignored.
     * @method convertObject
     * @param {object} obj The target object to convert.
     */
    function convertObject(obj, hasChanged) {
        let lookup;
        let value;

        if (changeDetectionMethod) {
            if (obj && obj[changeDetectionMethod]) {
                if (hasChanged) {
                    hasChanged = hasChanged.slice(0);
                } else {
                    hasChanged = [];
                }
                hasChanged.push(obj[changeDetectionMethod]);
            }
        }

        if (!canConvertType(obj)) {
            return;
        }

        lookup = obj.__observable__;

        if (lookup && lookup.__full__) {
            return;
        }

        lookup = lookup || createLookup(obj);
        lookup.__full__ = true;

        if (system.isArray(obj)) {
            const observable = ko.observableArray(obj);
            makeObservableArray(obj, observable, hasChanged);
        } else {
            for (const propertyName in obj) {
                if (shouldIgnorePropertyName(propertyName)) {
                    continue;
                }

                if (!lookup[propertyName]) {
                    const descriptor = Object.getPropertyDescriptor(obj, propertyName);
                    if (descriptor && (descriptor.get || descriptor.set)) {
                        defineProperty(obj, propertyName, {
                            get: descriptor.get,
                            set: descriptor.set,
                        });
                    } else {
                        value = obj[propertyName];

                        if (!system.isFunction(value)) {
                            convertProperty(obj, propertyName, value, hasChanged);
                        }
                    }
                }
            }
        }

        if (logConversion) {
            system.log("Converted", obj);
        }
    }

    function innerSetter(observable, newValue, isArray) {
        // if this was originally an observableArray, then always check to see if we need to add/replace the array methods (if newValue was an entirely new array)
        if (isArray) {
            if (!newValue) {
                // don't allow null, force to an empty array
                newValue = [];
                makeObservableArray(newValue, observable);
            } else if (!newValue.destroyAll) {
                makeObservableArray(newValue, observable);
            }
        } else {
            convertObject(newValue);
        }

        // call the update to the observable after the array as been updated.
        observable(newValue);
    }

    /**
     * Converts a normal property into an observable property using ES5 getters and setters.
     * @method convertProperty
     * @param {object} obj The target object on which the property to convert lives.
     * @param {string} propertyName The name of the property to convert.
     * @param {object} [original] The original value of the property. If not specified, it will be retrieved from the object.
     * @return {KnockoutObservable} The underlying observable.
     */
    function convertProperty(obj, propertyName, original, hasChanged) {
        let observable;
        let isArray;
        const lookup = obj.__observable__ || createLookup(obj);

        if (original === undefined) {
            original = obj[propertyName];
        }

        if (system.isArray(original)) {
            observable = ko.observableArray(original);
            makeObservableArray(original, observable, hasChanged);
            isArray = true;
        } else if (typeof original == "function") {
            if (ko.isObservable(original)) {
                observable = original;
            } else {
                return null;
            }
        } else if (!skipPromises && system.isPromise(original)) {
            observable = ko.observable();

            original.then(function (result) {
                if (system.isArray(result)) {
                    const oa = ko.observableArray(result);
                    makeObservableArray(result, oa, hasChanged);
                    result = oa;
                }

                observable(result);
            });
        } else {
            observable = ko.observable(original);
            convertObject(original, hasChanged);
        }

        if (hasChanged && hasChanged.length > 0) {
            hasChanged.forEach(function (func) {
                if (system.isArray(original)) {
                    observable.subscribe(
                        function (arrayChanges) {
                            func(obj, propertyName, null, arrayChanges);
                        },
                        null,
                        "arrayChange"
                    );
                } else {
                    observable.subscribe(function (newValue) {
                        func(obj, propertyName, newValue, null);
                    });
                }
            });
        }

        Object.defineProperty(obj, propertyName, {
            configurable: true,
            enumerable: true,
            get: observable,
            set: ko.isWriteableObservable(observable)
                ? function (newValue) {
                      if (newValue && system.isPromise(newValue) && !skipPromises) {
                          newValue.then(function (result) {
                              innerSetter(observable, result, system.isArray(result));
                          });
                      } else {
                          innerSetter(observable, newValue, isArray);
                      }
                  }
                : undefined,
        });

        lookup[propertyName] = observable;
        return observable;
    }

    /**
     * Defines a computed property using ES5 getters and setters.
     * @method defineProperty
     * @param {object} obj The target object on which to create the property.
     * @param {string} propertyName The name of the property to define.
     * @param {function|object} evaluatorOrOptions The Knockout computed function or computed options object.
     * @return {KnockoutObservable} The underlying computed observable.
     */
    function defineProperty(obj, propertyName, evaluatorOrOptions) {
        const computedOptions = { owner: obj, deferEvaluation: true };

        if (typeof evaluatorOrOptions === "function") {
            computedOptions.read = evaluatorOrOptions;
        } else {
            if ("value" in evaluatorOrOptions) {
                system.error(
                    'For defineProperty, you must not specify a "value" for the property. You must provide a "get" function.'
                );
            }

            if (typeof evaluatorOrOptions.get !== "function" && typeof evaluatorOrOptions.read !== "function") {
                system.error(
                    'For defineProperty, the third parameter must be either an evaluator function, or an options object containing a function called "get".'
                );
            }

            computedOptions.read = evaluatorOrOptions.get || evaluatorOrOptions.read;
            computedOptions.write = evaluatorOrOptions.set || evaluatorOrOptions.write;
        }

        const computed = ko.computed(computedOptions);

        Object.defineProperty(obj, propertyName, {
            configurable: true,
            enumerable: true,
            value: computed,
        });

        return convertProperty(obj, propertyName, computed);
    }

    // eslint-disable-next-line prefer-const
    observableModule = function (obj, propertyName) {
        let lookup;
        let observable;
        let value;

        if (!obj) {
            return null;
        }

        // eslint-disable-next-line prefer-const
        lookup = obj.__observable__;
        if (lookup) {
            observable = lookup[propertyName];
            if (observable) {
                return observable;
            }
        }

        // eslint-disable-next-line prefer-const
        value = obj[propertyName];

        if (ko.isObservable(value)) {
            return value;
        }

        return convertProperty(obj, propertyName, value);
    };

    observableModule.defineProperty = defineProperty;
    observableModule.convertProperty = convertProperty;
    observableModule.convertObject = convertObject;

    /**
     * Installs the plugin into the view model binder's `beforeBind` hook so that objects are automatically converted before being bound.
     * @method install
     */
    observableModule.install = function (options) {
        const original = binder.binding;

        binder.binding = function (obj, view, instruction) {
            if (instruction.applyBindings && !instruction.skipConversion) {
                convertObject(obj);
            }

            original(obj, view);
        };

        logConversion = options.logConversion;
        if (options.changeDetection) {
            changeDetectionMethod = options.changeDetection;
        }

        skipPromises = options.skipPromises;
        shouldIgnorePropertyName = options.shouldIgnorePropertyName || defaultShouldIgnorePropertyName;
    };

    return observableModule;
}

export default new ObservableModule();
