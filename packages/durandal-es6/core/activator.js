import ko from "knockout";
import system from "./system";

/**
 * The activator module encapsulates all logic related to screen/component activation.
 * An activator is essentially an asynchronous state machine that understands a particular state transition protocol.
 * The protocol ensures that the following series of events always occur: `canDeactivate` (previous state), `canActivate` (new state), `deactivate` (previous state), `activate` (new state).
 * Each of the _can_ callbacks may return a boolean, affirmative value or promise for one of those. If either of the _can_ functions yields a false result, then activation halts.
 * @module activator
 * @requires knockout
 * @requires system
 */
function ActivatorModule() {
    let activator;
    const defaultOptions = {
        canDeactivate: true,
    };

    function ensureSettings(receivedSettings) {
        let settings = receivedSettings;

        if (settings == undefined) {
            settings = {};
        }

        if (!system.isBoolean(settings.closeOnDeactivate)) {
            settings.closeOnDeactivate = activator.defaults.closeOnDeactivate;
        }

        if (!settings.beforeActivate) {
            settings.beforeActivate = activator.defaults.beforeActivate;
        }

        if (!settings.afterDeactivate) {
            settings.afterDeactivate = activator.defaults.afterDeactivate;
        }

        if (!settings.affirmations) {
            settings.affirmations = activator.defaults.affirmations;
        }

        if (!settings.interpretResponse) {
            settings.interpretResponse = activator.defaults.interpretResponse;
        }

        if (!settings.areSameItem) {
            settings.areSameItem = activator.defaults.areSameItem;
        }

        if (!settings.findChildActivator) {
            settings.findChildActivator = activator.defaults.findChildActivator;
        }

        return settings;
    }

    function invoke(target, method, data) {
        if (system.isArray(data)) {
            return target[method].apply(target, data);
        }

        return target[method](data);
    }

    function deactivate(item, close, settings, dfd, setter) {
        if (item && item.deactivate) {
            system.log("Deactivating", item);

            let result;
            try {
                result = item.deactivate(close);
            } catch (error) {
                system.log(`ERROR: ${error.message}`, error);
                dfd.resolve(false);
                return;
            }

            if (result && result.then) {
                result.then(
                    function () {
                        settings.afterDeactivate(item, close, setter);
                        dfd.resolve(true);
                    },
                    function (reason) {
                        if (reason) {
                            system.log(reason);
                        }

                        dfd.resolve(false);
                    }
                );
            } else {
                settings.afterDeactivate(item, close, setter);
                dfd.resolve(true);
            }
        } else {
            if (item) {
                settings.afterDeactivate(item, close, setter);
            }

            dfd.resolve(true);
        }
    }

    function activate(newItem, activeItem, callback, activationData) {
        let result;

        if (newItem && newItem.activate) {
            system.log("Activating", newItem);

            try {
                result = invoke(newItem, "activate", activationData);
            } catch (error) {
                system.log(`ERROR: ${error.message}`, error);
                callback(false);
                return;
            }
        }

        if (result && result.then) {
            result.then(
                function () {
                    activeItem(newItem);
                    callback(true);
                },
                function (reason) {
                    if (reason) {
                        system.log(`ERROR: ${reason.message}`, reason);
                    }

                    callback(false);
                }
            );
        } else {
            activeItem(newItem);
            callback(true);
        }
    }

    function canDeactivateItem(item, close, receivedSettings, receivedOptions) {
        const options = system.extend({}, defaultOptions, receivedOptions);
        const settings = receivedSettings;
        settings.lifecycleData = null;

        return system
            .defer(function (dfd) {
                function continueCanDeactivate() {
                    if (item && item.canDeactivate && options.canDeactivate) {
                        let resultOrPromise;
                        try {
                            resultOrPromise = item.canDeactivate(close);
                        } catch (error) {
                            system.log(`ERROR: ${error.message}`, error);
                            dfd.resolve(false);
                            return;
                        }

                        if (resultOrPromise.then) {
                            resultOrPromise.then(
                                function (result) {
                                    settings.lifecycleData = result;
                                    dfd.resolve(settings.interpretResponse(result));
                                },
                                function (reason) {
                                    if (reason) {
                                        system.log(`ERROR: ${reason.message}`, reason);
                                    }

                                    dfd.resolve(false);
                                }
                            );
                        } else {
                            settings.lifecycleData = resultOrPromise;
                            dfd.resolve(settings.interpretResponse(resultOrPromise));
                        }
                    } else {
                        dfd.resolve(true);
                    }
                }

                const childActivator = settings.findChildActivator(item);
                if (childActivator) {
                    childActivator.canDeactivate().then(function (result) {
                        if (result) {
                            continueCanDeactivate();
                        } else {
                            dfd.resolve(false);
                        }
                    });
                } else {
                    continueCanDeactivate();
                }
            })
            .promise();
    }

    function canActivateItem(newItem, activeItem, receivedSettings, activeData, newActivationData) {
        const settings = receivedSettings;
        settings.lifecycleData = null;

        return system
            .defer(function (dfd) {
                if (settings.areSameItem(activeItem(), newItem, activeData, newActivationData)) {
                    dfd.resolve(true);
                    return;
                }

                if (newItem && newItem.canActivate) {
                    let resultOrPromise;
                    try {
                        resultOrPromise = invoke(newItem, "canActivate", newActivationData);
                    } catch (error) {
                        system.log(`ERROR: ${error.message}`, error);
                        dfd.resolve(false);
                        return;
                    }

                    if (resultOrPromise.then) {
                        resultOrPromise.then(
                            function (result) {
                                settings.lifecycleData = result;
                                dfd.resolve(settings.interpretResponse(result));
                            },
                            function (reason) {
                                if (reason) {
                                    system.log(`ERROR: ${reason.message}`, reason);
                                }

                                dfd.resolve(false);
                            }
                        );
                    } else {
                        settings.lifecycleData = resultOrPromise;
                        dfd.resolve(settings.interpretResponse(resultOrPromise));
                    }
                } else {
                    dfd.resolve(true);
                }
            })
            .promise();
    }

    /**
     * An activator is a read/write computed observable that enforces the activation lifecycle whenever changing values.
     * @class Activator
     */
    function createActivator(initialActiveItem, receivedSettings) {
        const activeItem = ko.observable(null);
        let activeData;

        const settings = ensureSettings(receivedSettings);

        const computed = ko.computed({
            read() {
                return activeItem();
            },
            write(newValue) {
                computed.viaSetter = true;
                computed.activateItem(newValue);
            },
        });

        computed.__activator__ = true;

        /**
         * The settings for this activator.
         * @property {ActivatorSettings} settings
         */
        computed.settings = settings;
        settings.activator = computed;

        /**
         * An observable which indicates whether or not the activator is currently in the process of activating an instance.
         * @method isActivating
         * @return {boolean}
         */
        computed.isActivating = ko.observable(false);

        computed.forceActiveItem = function (item) {
            activeItem(item);
        };

        /**
         * Determines whether or not the specified item can be deactivated.
         * @method canDeactivateItem
         * @param {object} item The item to check.
         * @param {boolean} close Whether or not to check if close is possible.
         * @param {object} options Options for controlling the activation process.
         * @return {promise}
         */
        computed.canDeactivateItem = function (item, close, options) {
            return canDeactivateItem(item, close, settings, options);
        };

        /**
         * Deactivates the specified item.
         * @method deactivateItem
         * @param {object} item The item to deactivate.
         * @param {boolean} close Whether or not to close the item.
         * @return {promise}
         */
        computed.deactivateItem = function (item, close) {
            return system
                .defer(function (dfd) {
                    computed.canDeactivateItem(item, close).then(function (canDeactivate) {
                        if (canDeactivate) {
                            deactivate(item, close, settings, dfd, activeItem);
                        } else {
                            computed.notifySubscribers();
                            dfd.resolve(false);
                        }
                    });
                })
                .promise();
        };

        /**
         * Determines whether or not the specified item can be activated.
         * @method canActivateItem
         * @param {object} item The item to check.
         * @param {object} activationData Data associated with the activation.
         * @return {promise}
         */
        computed.canActivateItem = function (newItem, activationData) {
            return canActivateItem(newItem, activeItem, settings, activeData, activationData);
        };

        /**
         * Activates the specified item.
         * @method activateItem
         * @param {object} newItem The item to activate.
         * @param {object} newActivationData Data associated with the activation.
         * @param {object} options Options for controlling the activation process.
         * @return {promise}
         */
        computed.activateItem = function (newItem, newActivationData, options) {
            const { viaSetter } = computed;
            computed.viaSetter = false;

            return system
                .defer(function (dfd) {
                    if (computed.isActivating()) {
                        dfd.resolve(false);
                        return;
                    }

                    computed.isActivating(true);

                    const currentItem = activeItem();
                    if (settings.areSameItem(currentItem, newItem, activeData, newActivationData)) {
                        computed.isActivating(false);
                        dfd.resolve(true);
                        return;
                    }

                    computed
                        .canDeactivateItem(currentItem, settings.closeOnDeactivate, options)
                        .then(function (canDeactivate) {
                            if (canDeactivate) {
                                computed.canActivateItem(newItem, newActivationData).then(function (canActivate) {
                                    if (canActivate) {
                                        system
                                            .defer(function (dfd2) {
                                                deactivate(currentItem, settings.closeOnDeactivate, settings, dfd2);
                                            })
                                            .promise()
                                            .then(function () {
                                                newItem = settings.beforeActivate(newItem, newActivationData);
                                                activate(
                                                    newItem,
                                                    activeItem,
                                                    function (result) {
                                                        activeData = newActivationData;
                                                        computed.isActivating(false);
                                                        dfd.resolve(result);
                                                    },
                                                    newActivationData
                                                );
                                            });
                                    } else {
                                        if (viaSetter) {
                                            computed.notifySubscribers();
                                        }

                                        computed.isActivating(false);
                                        dfd.resolve(false);
                                    }
                                });
                            } else {
                                if (viaSetter) {
                                    computed.notifySubscribers();
                                }

                                computed.isActivating(false);
                                dfd.resolve(false);
                            }
                        });
                })
                .promise();
        };

        /**
         * Determines whether or not the activator, in its current state, can be activated.
         * @method canActivate
         * @return {promise}
         */
        computed.canActivate = function () {
            let toCheck;

            if (initialActiveItem) {
                toCheck = initialActiveItem;
                initialActiveItem = false;
            } else {
                toCheck = computed();
            }

            return computed.canActivateItem(toCheck);
        };

        /**
         * Activates the activator, in its current state.
         * @method activate
         * @return {promise}
         */
        computed.activate = function () {
            let toActivate;

            if (initialActiveItem) {
                toActivate = initialActiveItem;
                initialActiveItem = false;
            } else {
                toActivate = computed();
            }

            return computed.activateItem(toActivate);
        };

        /**
         * Determines whether or not the activator, in its current state, can be deactivated.
         * @method canDeactivate
         * @return {promise}
         */
        computed.canDeactivate = function (close) {
            return computed.canDeactivateItem(computed(), close);
        };

        /**
         * Deactivates the activator, in its current state.
         * @method deactivate
         * @return {promise}
         */
        computed.deactivate = function (close) {
            return computed.deactivateItem(computed(), close);
        };

        computed.includeIn = function (includeIn) {
            includeIn.canActivate = function () {
                return computed.canActivate();
            };

            includeIn.activate = function () {
                return computed.activate();
            };

            includeIn.canDeactivate = function (close) {
                return computed.canDeactivate(close);
            };

            includeIn.deactivate = function (close) {
                return computed.deactivate(close);
            };
        };

        if (settings.includeIn) {
            computed.includeIn(settings.includeIn);
        } else if (initialActiveItem) {
            computed.activate();
        }

        computed.forItems = function (items) {
            settings.closeOnDeactivate = false;

            settings.determineNextItemToActivate = function (list, lastIndex) {
                const toRemoveAt = lastIndex - 1;

                if (toRemoveAt == -1 && list.length > 1) {
                    return list[1];
                }

                if (toRemoveAt > -1 && toRemoveAt < list.length - 1) {
                    return list[toRemoveAt];
                }

                return null;
            };

            settings.beforeActivate = function (receivedNewItem) {
                const currentItem = computed();
                let newItem = receivedNewItem;

                if (!newItem) {
                    newItem = settings.determineNextItemToActivate(items, currentItem ? items.indexOf(currentItem) : 0);
                } else {
                    const index = items.indexOf(newItem);

                    if (index == -1) {
                        items.push(newItem);
                    } else {
                        newItem = items()[index];
                    }
                }

                return newItem;
            };

            settings.afterDeactivate = function (oldItem, close) {
                if (close) {
                    items.remove(oldItem);
                }
            };

            const originalCanDeactivate = computed.canDeactivate;
            computed.canDeactivate = function (close) {
                if (close) {
                    return system
                        .defer(function (dfd) {
                            const list = items();
                            const results = [];

                            function finish() {
                                for (let j = 0; j < results.length; j += 1) {
                                    if (!results[j]) {
                                        dfd.resolve(false);
                                        return;
                                    }
                                }

                                dfd.resolve(true);
                            }

                            for (let i = 0; i < list.length; i += 1) {
                                computed.canDeactivateItem(list[i], close).then(function (result) {
                                    results.push(result);
                                    if (results.length == list.length) {
                                        finish();
                                    }
                                });
                            }
                        })
                        .promise();
                }
                return originalCanDeactivate();
            };

            const originalDeactivate = computed.deactivate;
            computed.deactivate = function (close) {
                if (close) {
                    return system
                        .defer(function (dfd) {
                            const list = items();
                            let results = 0;
                            const listLength = list.length;

                            function doDeactivate(item) {
                                setTimeout(function () {
                                    computed.deactivateItem(item, close).then(function () {
                                        results += 1;
                                        items.remove(item);
                                        if (results == listLength) {
                                            dfd.resolve();
                                        }
                                    });
                                }, 1);
                            }

                            for (let i = 0; i < listLength; i += 1) {
                                doDeactivate(list[i]);
                            }
                        })
                        .promise();
                }
                return originalDeactivate();
            };

            return computed;
        };

        return computed;
    }

    /**
     * @class ActivatorSettings
     * @static
     */
    const activatorSettings = {
        /**
         * The default value passed to an object's deactivate function as its close parameter.
         * @property {boolean} closeOnDeactivate
         * @default true
         */
        closeOnDeactivate: true,
        /**
         * Lower-cased words which represent a truthy value.
         * @property {string[]} affirmations
         * @default ['yes', 'ok', 'true']
         */
        affirmations: ["yes", "ok", "true"],
        /**
         * Interprets the response of a `canActivate` or `canDeactivate` call using the known affirmative values in the `affirmations` array.
         * @method interpretResponse
         * @param {object} value
         * @return {boolean}
         */
        interpretResponse(receivedValue) {
            let value = receivedValue;

            if (system.isObject(value)) {
                value = value.can || false;
            }

            if (system.isString(value)) {
                return ko.utils.arrayIndexOf(this.affirmations, value.toLowerCase()) !== -1;
            }

            return value;
        },
        /**
         * Determines whether or not the current item and the new item are the same.
         * @method areSameItem
         * @param {object} currentItem
         * @param {object} newItem
         * @param {object} currentActivationData
         * @param {object} newActivationData
         * @return {boolean}
         */
        areSameItem(currentItem, newItem, currentActivationData, newActivationData) {
            return currentItem == newItem;
        },
        /**
         * Called immediately before the new item is activated.
         * @method beforeActivate
         * @param {object} newItem
         */
        beforeActivate(newItem) {
            return newItem;
        },
        /**
         * Called immediately after the old item is deactivated.
         * @method afterDeactivate
         * @param {object} oldItem The previous item.
         * @param {boolean} close Whether or not the previous item was closed.
         * @param {function} setter The activate item setter function.
         */
        afterDeactivate(oldItem, close, setter) {
            if (close && setter) {
                setter(null);
            }
        },
        findChildActivator(item) {
            return null;
        },
    };

    /**
     * @class ActivatorModule
     * @static
     */
    activator = {
        /**
         * The default settings used by activators.
         * @property {ActivatorSettings} defaults
         */
        defaults: activatorSettings,
        /**
         * Creates a new activator.
         * @method create
         * @param {object} [initialActiveItem] The item which should be immediately activated upon creation of the ativator.
         * @param {ActivatorSettings} [settings] Per activator overrides of the default activator settings.
         * @return {Activator} The created activator.
         */
        create: createActivator,
        /**
         * Determines whether or not the provided object is an activator or not.
         * @method isActivator
         * @param {object} object Any object you wish to verify as an activator or not.
         * @return {boolean} True if the object is an activator; false otherwise.
         */
        isActivator(object) {
            return object && object.__activator__;
        },
    };

    return activator;
}

export default new ActivatorModule();
