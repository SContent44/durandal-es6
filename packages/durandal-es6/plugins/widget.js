/* eslint-disable func-names */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
import ko from "knockout";
import system from "../core/system";
import composition from "../core/composition";

/**
 * Layers the widget sugar on top of the composition system.
 * @module widget
 * @requires knockout
 * @requires system
 * @requires composition
 */
function WidgetModule() {
    const kindModuleMaps = {};
    const bindableSettings = ["model", "view", "kind"];
    const widgetDataKey = "durandal-widget-data";

    function extractParts(element, settings) {
        let data = ko.utils.domData.get(element, widgetDataKey);

        if (!data) {
            data = {
                parts: composition.cloneNodes(ko.virtualElements.childNodes(element)),
            };

            ko.virtualElements.emptyNode(element);
            ko.utils.domData.set(element, widgetDataKey, data);
        }

        settings.parts = data.parts;
    }

    /**
     * @class WidgetModule
     * @static
     */
    const widget = {
        getSettings(valueAccessor) {
            const settings = ko.utils.unwrapObservable(valueAccessor()) || {};

            if (system.isString(settings)) {
                return { kind: settings };
            }

            // eslint-disable-next-line no-restricted-syntax
            for (const attrName in settings) {
                if (ko.utils.arrayIndexOf(bindableSettings, attrName) !== -1) {
                    settings[attrName] = ko.utils.unwrapObservable(settings[attrName]);
                } else {
                    // eslint-disable-next-line no-self-assign
                    settings[attrName] = settings[attrName];
                }
            }

            return settings;
        },
        /**
         * Creates a ko binding handler for the specified kind.
         * @method registerKind
         * @param {string} kind The kind to create a custom binding handler for.
         */
        registerKind(kind) {
            system.acquire(kind).then(function (module) {
                module = system.checkForDefaultExport(module);

                const kindName = system.getModuleName(module);

                kindModuleMaps[kindName] = module;

                ko.bindingHandlers[kindName] = {
                    init() {
                        return { controlsDescendantBindings: true };
                    },
                    update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                        const settings = widget.getSettings(valueAccessor);
                        settings.kind = kindName;
                        extractParts(element, settings);
                        widget.create(element, settings, bindingContext, true);
                    },
                };

                ko.virtualElements.allowedBindings[kindName] = true;
                composition.composeBindings.push(`${kindName}:`);
            });
        },
        /**
         * Maps a kind name to it's module id. First it looks up a custom mapped kind, then falls back to `convertKindToModulePath`.
         * @method mapKindToModuleId
         * @param {string} kind The kind name.
         * @return {string} The module id.
         */
        mapKindToModule(kind) {
            const module = kindModuleMaps[kind];
            if (!module) {
                system.error(`Missing or invalid widget requested: ${kind}`);
            }
            return module;
        },
        createCompositionSettings(element, settings) {
            if (!settings.model) {
                settings.model = this.mapKindToModule(settings.kind);
            }

            settings.preserveContext = true;
            settings.activate = true;
            settings.activationData = settings;
            settings.mode = "templated";

            return settings;
        },
        /**
         * Creates a widget.
         * @method create
         * @param {DOMElement} element The DOMElement or knockout virtual element that serves as the target element for the widget.
         * @param {object} settings The widget settings.
         * @param {object} [bindingContext] The current binding context.
         */
        create(element, settings, bindingContext, fromBinding) {
            if (!fromBinding) {
                settings = widget.getSettings(function () {
                    return settings;
                }, element);
            }

            const compositionSettings = widget.createCompositionSettings(element, settings);

            composition.compose(element, compositionSettings, bindingContext);
        },
        /**
         * Installs the widget module by adding the widget binding handler and optionally registering kinds.
         * @method install
         * @param {object} config The module config. Add a `kinds` array with the names of widgets to automatically register. You can also specify a `bindingName` if you wish to use another name for the widget binding, such as "control" for example.
         */
        install(config) {
            config.bindingName = config.bindingName || "widget";

            if (config.kinds) {
                const toRegister = config.kinds;

                for (let i = 0; i < toRegister.length; i += 1) {
                    const moduleToRegister = toRegister[i];

                    widget.registerKind(moduleToRegister);
                }
            }

            ko.bindingHandlers[config.bindingName] = {
                init() {
                    return { controlsDescendantBindings: true };
                },
                update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    const settings = widget.getSettings(valueAccessor);
                    extractParts(element, settings);
                    widget.create(element, settings, bindingContext, true);
                },
            };

            composition.composeBindings.push(`${config.bindingName}:`);
            ko.virtualElements.allowedBindings[config.bindingName] = true;
        },
    };

    return widget;
}

export default new WidgetModule();
