import $ from "jquery";
import ko from "knockout";
import system from "./system";
import viewLocator from "./viewLocator";
import binder from "./binder";
import viewEngine from "./viewEngine";
import activator from "./activator";

/**
 * The composition module encapsulates all functionality related to visual composition.
 * @module composition
 * @requires jquery
 * @requires knockout
 * @requires system
 * @requires viewLocator
 * @requires binder
 * @requires viewEngine
 * @requires activator
 */
function CompositionModule() {
    const dummyModel = {};
    const activeViewAttributeName = "data-active-view";
    let composition;
    let compositionCompleteCallbacks = [];
    let compositionCount = 0;
    const compositionDataKey = "durandal-composition-data";
    const partAttributeName = "data-part";
    const bindableSettings = ["model", "view", "transition", "area", "strategy", "activationData", "onError"];
    const visibilityKey = "durandal-visibility-data";
    const composeBindings = ["compose:"];

    function onError(context, error, element) {
        try {
            if (context.onError) {
                try {
                    context.onError(error, element);
                } catch (e) {
                    system.error(e);
                }
            } else {
                system.error(error);
            }
        } finally {
            endComposition(context, element, true);
        }
    }

    function getHostState(parent) {
        const elements = [];
        const state = {
            childElements: elements,
            activeView: null,
        };

        let child = ko.virtualElements.firstChild(parent);

        while (child) {
            if (child.nodeType == 1) {
                elements.push(child);
                if (child.getAttribute(activeViewAttributeName)) {
                    state.activeView = child;
                }
            }

            child = ko.virtualElements.nextSibling(child);
        }

        if (!state.activeView) {
            // eslint-disable-next-line prefer-destructuring
            state.activeView = elements[0];
        }

        return state;
    }

    function endComposition(context, element, error) {
        compositionCount -= 1;

        if (compositionCount === 0) {
            const callBacks = compositionCompleteCallbacks;
            compositionCompleteCallbacks = [];

            if (!error) {
                setTimeout(function () {
                    let i = callBacks.length;

                    while (i--) {
                        try {
                            callBacks[i]();
                        } catch (e) {
                            onError(context, e, element);
                        }
                    }
                }, 1);
            }
        }

        cleanUp(context);
    }

    function cleanUp(context) {
        delete context.activeView;
        delete context.viewElements;
    }

    function tryActivate(context, successCallback, skipActivation, element) {
        if (skipActivation) {
            successCallback();
        } else if (context.activate && context.model && context.model.activate) {
            let result;

            try {
                if (system.isArray(context.activationData)) {
                    result = context.model.activate.apply(context.model, context.activationData);
                } else {
                    result = context.model.activate(context.activationData);
                }

                if (result && result.then) {
                    result.then(successCallback, function (reason) {
                        onError(context, reason, element);
                        successCallback();
                    });
                } else if (result || result === undefined) {
                    successCallback();
                } else {
                    endComposition(context, element);
                }
            } catch (e) {
                onError(context, e, element);
            }
        } else {
            successCallback();
        }
    }

    function triggerAttach(context, element) {
        // The passed in context would be the same as "this". It's useful for the functions that use triggerAttach to visualise what the context that is being "passed in"
        // eslint-disable-next-line no-var, no-redeclare
        var context = this;

        if (context.activeView) {
            context.activeView.removeAttribute(activeViewAttributeName);
        }

        if (context.child) {
            try {
                if (context.model && context.model.attached) {
                    if (context.composingNewView || context.alwaysTriggerAttach) {
                        context.model.attached(context.child, context.parent, context);
                    }
                }

                if (context.attached) {
                    context.attached(context.child, context.parent, context);
                }

                context.child.setAttribute(activeViewAttributeName, true);

                if (context.composingNewView && context.model && context.model.detached) {
                    ko.utils.domNodeDisposal.addDisposeCallback(context.child, function () {
                        try {
                            context.model.detached(context.child, context.parent, context);
                        } catch (e2) {
                            onError(context, e2, element);
                        }
                    });
                }
            } catch (e) {
                onError(context, e, element);
            }
        }

        context.triggerAttach = system.noop;
    }

    function shouldTransition(context) {
        if (system.isString(context.transition) || system.isFunction(context.transition)) {
            if (context.activeView) {
                if (context.activeView == context.child) {
                    return false;
                }

                if (!context.child) {
                    return true;
                }

                if (context.skipTransitionOnSameViewId) {
                    const currentViewId = context.activeView.getAttribute("data-view");
                    const newViewId = context.child.getAttribute("data-view");
                    return currentViewId != newViewId;
                }
            }

            return true;
        }

        return false;
    }

    function cloneNodes(nodesArray) {
        const newNodesArray = [];
        for (let i = 0, j = nodesArray.length; i < j; i += 1) {
            const clonedNode = nodesArray[i].cloneNode(true);
            newNodesArray.push(clonedNode);
        }
        return newNodesArray;
    }

    function replaceParts(context) {
        const parts = cloneNodes(context.parts);
        const replacementParts = composition.getParts(parts);
        const standardParts = composition.getParts(context.child);

        for (const partId in replacementParts) {
            let toReplace = standardParts[partId];
            if (!toReplace) {
                toReplace = $(`[data-part="${partId}"]`, context.child).get(0);
                if (!toReplace) {
                    system.log(`Could not find part to override: ${partId}`);
                    continue;
                }
            }

            toReplace.parentNode.replaceChild(replacementParts[partId], toReplace);
        }
    }

    function removePreviousView(context) {
        let children = ko.virtualElements.childNodes(context.parent);
        let i;
        let len;

        if (!system.isArray(children)) {
            const arrayChildren = [];
            for (i = 0, len = children.length; i < len; i += 1) {
                arrayChildren[i] = children[i];
            }
            children = arrayChildren;
        }

        for (i = 1, len = children.length; i < len; i += 1) {
            ko.removeNode(children[i]);
        }
    }

    function hide(view) {
        ko.utils.domData.set(view, visibilityKey, view.style.display);
        view.style.display = "none";
    }

    function show(view) {
        const displayStyle = ko.utils.domData.get(view, visibilityKey);
        view.style.display = displayStyle === "none" ? "block" : displayStyle;
    }

    function hasComposition(element) {
        const dataBind = element.getAttribute("data-bind");
        if (!dataBind) {
            return false;
        }

        for (let i = 0, { length } = composeBindings; i < length; i += 1) {
            if (dataBind.indexOf(composeBindings[i]) > -1) {
                return true;
            }
        }

        return false;
    }

    /**
     * @class CompositionTransaction
     * @static
     */
    const compositionTransaction = {
        /**
         * Registers a callback which will be invoked when the current composition transaction has completed. The transaction includes all parent and children compositions.
         * @method complete
         * @param {function} callback The callback to be invoked when composition is complete.
         */
        complete(callback) {
            compositionCompleteCallbacks.push(callback);
        },
    };

    /**
     * @class CompositionModule
     * @static
     */
    composition = {
        /**
         * An array of all the binding handler names (includeing :) that trigger a composition.
         * @property {string} composeBindings
         * @default ['compose:']
         */
        composeBindings,
        /**
         * Converts a transition name to its moduleId.
         * @method convertTransitionToModule
         * @param {string} name The name of the transtion.
         * @return {string} The moduleId.
         */
        convertTransitionToModule(name) {
            let transition;

            switch (name) {
                case "fadeIn":
                    transition = function fadeIn() {
                        return import("../transitions/fadeIn");
                    };
                    break;
                case "entrance":
                    transition = function entrance() {
                        return import("../transitions/entrance");
                    };
                    break;
                default:
                    system.error(
                        `The transition ${name} is not in the list of registered transitions. Update the composition.convertTransitionToModule to include this transition.`
                    );
            }

            return transition;
        },
        /**
         * The name of the transition to use in all compositions.
         * @property {string} defaultTransitionName
         * @default null
         */
        defaultTransitionName: null,
        /**
         * Represents the currently executing composition transaction.
         * @property {CompositionTransaction} current
         */
        current: compositionTransaction,
        /**
         * Registers a binding handler that will be invoked when the current composition transaction is complete.
         * @method addBindingHandler
         * @param {string} name The name of the binding handler.
         * @param {object} [config] The binding handler instance. If none is provided, the name will be used to look up an existing handler which will then be converted to a composition handler.
         * @param {function} [initOptionsFactory] If the registered binding needs to return options from its init call back to knockout, this function will server as a factory for those options. It will receive the same parameters that the init function does.
         */
        addBindingHandler(name, config = ko.bindingHandlers[name], initOptionsFactory) {
            const dataKey = `composition-handler-${name}`;
            let handler;

            initOptionsFactory =
                initOptionsFactory ||
                function () {
                    return undefined;
                };

            handler = ko.bindingHandlers[name] = {
                init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    if (compositionCount > 0) {
                        const data = {
                            trigger: ko.observable(null),
                        };

                        composition.current.complete(function () {
                            if (config.init) {
                                config.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
                            }

                            if (config.update) {
                                ko.utils.domData.set(element, dataKey, config);
                                data.trigger("trigger");
                            }
                        });

                        ko.utils.domData.set(element, dataKey, data);
                    } else {
                        ko.utils.domData.set(element, dataKey, config);

                        if (config.init) {
                            config.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
                        }
                    }

                    return initOptionsFactory(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
                },
                update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    const data = ko.utils.domData.get(element, dataKey);

                    if (data.update) {
                        return data.update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
                    }

                    if (data.trigger) {
                        data.trigger();
                    }
                },
            };

            for (const key in config) {
                if (key !== "init" && key !== "update") {
                    handler[key] = config[key];
                }
            }
        },
        /**
         * Gets an object keyed with all the elements that are replacable parts, found within the supplied elements. The key will be the part name and the value will be the element itself.
         * @method getParts
         * @param {DOMElement\DOMElement[]} elements The element(s) to search for parts.
         * @return {object} An object keyed by part.
         */
        getParts(elements, parts = {}) {
            if (!elements) {
                return parts;
            }

            if (elements.length === undefined) {
                elements = [elements];
            }

            for (let i = 0, { length } = elements; i < length; i += 1) {
                const element = elements[i];
                let id;

                if (element.getAttribute) {
                    id = element.getAttribute(partAttributeName);
                    if (id) {
                        parts[id] = element;
                    }

                    if (element.hasChildNodes() && !hasComposition(element)) {
                        composition.getParts(element.childNodes, parts);
                    }
                }
            }

            return parts;
        },
        cloneNodes,
        finalize(context, element) {
            if (context.transition === undefined) {
                context.transition = this.defaultTransitionName;
            }

            if (!context.child && !context.activeView) {
                if (!context.cacheViews) {
                    ko.virtualElements.emptyNode(context.parent);
                }

                context.triggerAttach(context, element);
                endComposition(context, element);
            } else if (shouldTransition(context)) {
                let transitionModule;
                if (typeof context.transition === "string") {
                    // Reference for the "builtin" transitions
                    transitionModule = this.convertTransitionToModule(context.transition);
                } else {
                    // Assume if it's not a string we've been passed the transition to resolve
                    transitionModule = context.transition;
                }

                system
                    .acquire(transitionModule)
                    .then(function (transition) {
                        transition = system.checkForDefaultExport(transition);
                        context.transition = transition;

                        transition(context).then(function () {
                            if (!context.cacheViews) {
                                if (!context.child) {
                                    ko.virtualElements.emptyNode(context.parent);
                                } else {
                                    removePreviousView(context);
                                }
                            } else if (context.activeView) {
                                const instruction = binder.getBindingInstruction(context.activeView);
                                if (instruction && instruction.cacheViews != undefined && !instruction.cacheViews) {
                                    ko.removeNode(context.activeView);
                                } else {
                                    hide(context.activeView);
                                }
                            }

                            if (context.child) {
                                show(context.child);
                            }

                            context.triggerAttach(context, element);
                            endComposition(context, element);
                        });
                    })
                    .catch(function (err) {
                        onError(
                            context,
                            `Failed to load transition (${transitionModule}). Details: ${err.message}`,
                            element
                        );
                    });
            } else {
                if (context.child != context.activeView) {
                    if (context.cacheViews && context.activeView) {
                        const instruction = binder.getBindingInstruction(context.activeView);
                        if (!instruction || (instruction.cacheViews != undefined && !instruction.cacheViews)) {
                            ko.removeNode(context.activeView);
                        } else {
                            hide(context.activeView);
                        }
                    }

                    if (!context.child) {
                        if (!context.cacheViews) {
                            ko.virtualElements.emptyNode(context.parent);
                        }
                    } else {
                        if (!context.cacheViews) {
                            removePreviousView(context);
                        }

                        show(context.child);
                    }
                }

                context.triggerAttach(context, element);
                endComposition(context, element);
            }
        },
        bindAndShow(child, element, context, skipActivation) {
            context.child = child;
            context.parent.__composition_context = context;

            if (context.cacheViews) {
                context.composingNewView = ko.utils.arrayIndexOf(context.viewElements, child) == -1;
            } else {
                context.composingNewView = true;
            }

            ko.ignoreDependencies(tryActivate, null, [
                context,
                function () {
                    if (context.parent.__composition_context == context) {
                        try {
                            delete context.parent.__composition_context;
                        } catch (e) {
                            context.parent.__composition_context = undefined;
                        }

                        if (context.binding) {
                            context.binding(context.child, context.parent, context);
                        }

                        if (context.preserveContext && context.bindingContext) {
                            if (context.composingNewView) {
                                if (context.parts) {
                                    replaceParts(context);
                                }

                                hide(child);
                                ko.virtualElements.prepend(context.parent, child);

                                binder.bindContext(context.bindingContext, child, context.model, context.as);
                            }
                        } else if (child) {
                            const modelToBind = context.model || dummyModel;
                            const currentModel = ko.dataFor(child);

                            if (currentModel != modelToBind) {
                                if (!context.composingNewView) {
                                    ko.removeNode(child);
                                    Promise.resolve(viewEngine.createView("", child.getAttribute("data-view"))).then(
                                        function (recreatedView) {
                                            composition.bindAndShow(recreatedView, element, context, true);
                                        }
                                    );
                                    return;
                                }

                                if (context.parts) {
                                    replaceParts(context);
                                }

                                hide(child);
                                ko.virtualElements.prepend(context.parent, child);

                                binder.bind(modelToBind, child);
                            }
                        }

                        composition.finalize(context, element);
                    } else {
                        endComposition(context, element);
                    }
                },
                skipActivation,
                element,
            ]);
        },
        /**
         * Eecutes the default view location strategy.
         * @method defaultStrategy
         * @param {object} context The composition context containing the model and possibly existing viewElements.
         * @return {promise} A promise for the view.
         */
        defaultStrategy(context) {
            return viewLocator.locateViewForObject(context.model, context.viewElements);
        },
        getSettings(valueAccessor, element) {
            const valueToResolve = valueAccessor();

            return Promise.resolve(valueToResolve).then((value) => {
                let settingsToResolve = ko.utils.unwrapObservable(value) || {};
                let activatorPresent = activator.isActivator(value);

                return Promise.resolve(settingsToResolve).then((settings) => {
                    if (system.isString(settings)) {
                        if (settings.trim().charAt(0) === "<") {
                            settings = settings.trim();
                            settings = {
                                view: viewEngine.processMarkup(settings),
                            };
                        } else if (viewEngine.isViewUrl(settings)) {
                            system.error(
                                "Passing in a viewUrl is no longer supported. If wanting to reference a .html template just import and provide it directly."
                            );
                        } else {
                            system.error("Passed a string that was not valid HTML.");
                        }

                        return settings;
                    }

                    if (!activatorPresent && settings.model) {
                        activatorPresent = activator.isActivator(settings.model);
                    }

                    for (const attrName in settings) {
                        if (ko.utils.arrayIndexOf(bindableSettings, attrName) != -1) {
                            settings[attrName] = ko.utils.unwrapObservable(settings[attrName]);
                        } else {
                            settings[attrName] = settings[attrName];
                        }
                    }

                    if (activatorPresent) {
                        settings.activate = false;
                    } else if (settings.activate === undefined) {
                        settings.activate = true;
                    }

                    return settings;
                });
            });
        },
        executeStrategy(context, element) {
            context.strategy(context).then(function (child) {
                composition.bindAndShow(child, element, context);
            });
        },
        inject(context, element) {
            if (!context.model) {
                this.bindAndShow(null, element, context);
                return;
            }

            if (context.view) {
                viewLocator.locateView(context.view, context.viewElements).then(function (child) {
                    composition.bindAndShow(child, element, context);
                });
                return;
            }

            if (!context.strategy) {
                context.strategy = this.defaultStrategy;
            }

            this.executeStrategy(context, element);
        },
        /**
         * Initiates a composition.
         * @method compose
         * @param {DOMElement} element The DOMElement or knockout virtual element that serves as the parent for the composition.
         * @param {object} settings The composition settings.
         * @param {object} [bindingContext] The current binding context.
         */
        compose(element, settings, bindingContext, fromBinding) {
            if (!fromBinding) {
                settings = composition.getSettings(function () {
                    return settings;
                }, element);
            }

            Promise.resolve(settings).then((resolvedSettings) => {
                settings = resolvedSettings;
                if (settings.model && typeof settings.model === "string") {
                    system.error(
                        "You've passed a string for a model, check that you are not using deprecated RequireJS behaviour."
                    );
                }

                if (system.isFunction(settings)) {
                    settings.model = settings;
                }

                // If we have a model passed in we will use it's context
                if (settings.model) {
                    settings.model = system.resolveObject(settings.model);
                }

                compositionCount += 1;

                if (settings.compositionComplete) {
                    compositionCompleteCallbacks.push(function () {
                        settings.compositionComplete(settings.child, settings.parent, settings);
                    });
                }

                compositionCompleteCallbacks.push(function () {
                    if (settings.composingNewView && settings.model && settings.model.compositionComplete) {
                        settings.model.compositionComplete(settings.child, settings.parent, settings);
                    }
                });

                const hostState = getHostState(element);

                settings.activeView = hostState.activeView;
                settings.parent = element;
                settings.triggerAttach = triggerAttach;
                settings.bindingContext = bindingContext;

                if (settings.cacheViews && !settings.viewElements) {
                    settings.viewElements = hostState.childElements;
                }

                if (!settings.model) {
                    if (!settings.view) {
                        this.bindAndShow(null, element, settings);
                    } else {
                        settings.area = settings.area || "partial";
                        settings.preserveContext = true;

                        viewLocator.locateView(settings.view, settings.viewElements).then(function (child) {
                            composition.bindAndShow(child, element, settings);
                        });
                    }
                } else if (system.isPromise(settings.model)) {
                    system
                        .acquire(settings.model)
                        .then(function (module) {
                            settings.model = system.resolveObject(module);
                            composition.inject(settings, element);
                        })
                        .catch(function (err) {
                            onError(
                                settings,
                                `Failed to load composed module (${settings.model}). Details: ${err.message}`,
                                element
                            );
                        });
                } else {
                    composition.inject(settings, element);
                }
            });
        },
    };

    ko.bindingHandlers.compose = {
        init() {
            return { controlsDescendantBindings: true };
        },
        update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            composition.getSettings(valueAccessor, element).then((settings) => {
                if (settings.mode) {
                    let data = ko.utils.domData.get(element, compositionDataKey);
                    if (!data) {
                        const childNodes = ko.virtualElements.childNodes(element);
                        data = {};

                        if (settings.mode === "inline") {
                            data.view = viewEngine.ensureSingleElement(childNodes);
                        } else if (settings.mode === "templated") {
                            data.parts = cloneNodes(childNodes);
                        }

                        ko.virtualElements.emptyNode(element);
                        ko.utils.domData.set(element, compositionDataKey, data);
                    }

                    if (settings.mode === "inline") {
                        settings.view = data.view.cloneNode(true);
                    } else if (settings.mode === "templated") {
                        settings.parts = data.parts;
                    }

                    settings.preserveContext = true;
                }

                composition.compose(element, settings, bindingContext, true);
            });
        },
    };

    ko.virtualElements.allowedBindings.compose = true;

    return composition;
}

export default CompositionModule();
